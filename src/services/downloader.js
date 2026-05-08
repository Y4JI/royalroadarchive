import * as FileSystem from 'expo-file-system/legacy';
import { fetchNovelDetail, fetchChapterContent } from './scraper';
import {
  saveNovel,
  saveChapters,
  saveChapterContent,
  getChaptersByNovel,
  updateNovelDownloadCount,
  updateNovelCoverLocal,
} from './database';
import { REQUEST_DELAY_MS } from '../constants/config';

// ─── Types ───────────────────────────────────────────────────────────────────
// onProgress({ downloaded, total, currentTitle, status })
// status: 'fetching_metadata' | 'downloading' | 'done' | 'error'

// ─── Cover image ─────────────────────────────────────────────────────────────

const downloadCover = async (novelId, coverUrl) => {
  if (!coverUrl) return null;
  try {
    const dir = `${FileSystem.documentDirectory}covers/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    const localUri = `${dir}${novelId}.jpg`;
    const existing = await FileSystem.getInfoAsync(localUri);
    if (existing.exists) return localUri;

    await FileSystem.downloadAsync(coverUrl, localUri);
    return localUri;
  } catch (e) {
    console.warn('Cover download failed:', e.message);
    return null;
  }
};

// ─── Individual Chapter Download ─────────────────────────────────────────────

export const downloadSingleChapter = async (novelId, chapter, onProgress) => {
  try {
    onProgress?.({ status: 'downloading' });

    // 1. Fetch content from web
    const { html, wordCount } = await fetchChapterContent(chapter.url);

    // 2. Save to database
    await saveChapterContent(chapter.id, html, wordCount);

    // 3. Update the novel's total download count in the UI
    await updateNovelDownloadCount(novelId);

    onProgress?.({ status: 'done' });
    return { success: true };
  } catch (err) {
    console.error(`Download failed for ${chapter.title}:`, err.message);
    onProgress?.({ status: 'error', error: err.message });
    return { success: false };
  }
};

// ─── Main download function ───────────────────────────────────────────────────

export const downloadNovel = async (novelId, onProgress) => {
  try {
    onProgress?.({ status: 'fetching_metadata', downloaded: 0, total: 0 });

    const detail = await fetchNovelDetail(novelId);

    await saveNovel(detail);
    await saveChapters(detail.chapters);

    // Download cover in background (non-blocking)
    downloadCover(novelId, detail.cover_url).then((localPath) => {
      if (localPath) updateNovelCoverLocal(novelId, localPath);
    });

    const total = detail.chapters.length;
    let downloaded = 0;

    // Step 2: download each chapter sequentially
    for (const chapter of detail.chapters) {
      try {
        onProgress?.({
          status: 'downloading',
          downloaded,
          total,
          currentTitle: chapter.title,
        });

        const { html, wordCount } = await fetchChapterContent(chapter.url);
        await saveChapterContent(chapter.id, html, wordCount);
        downloaded++;

        await updateNovelDownloadCount(novelId);
      } catch (chapterErr) {
        console.warn(`Failed to download chapter "${chapter.title}":`, chapterErr.message);
        // Continue with next chapter rather than aborting
      }
    }

    onProgress?.({ status: 'done', downloaded, total });
    return { success: true, downloaded, total };
  } catch (err) {
    onProgress?.({ status: 'error', error: err.message });
    return { success: false, error: err.message };
  }
};

// ─── Sync new chapters for an already-saved novel ────────────────────────────

export const syncNovel = async (novelId, onProgress) => {
  try {
    onProgress?.({ status: 'fetching_metadata' });

    const [detail, existingChapters] = await Promise.all([
      fetchNovelDetail(novelId),
      getChaptersByNovel(novelId),
    ]);

    const existingIds = new Set(existingChapters.map((c) => c.id));
    const newChapters = detail.chapters.filter((c) => !existingIds.has(c.id));

    if (newChapters.length === 0) {
      onProgress?.({ status: 'done', downloaded: 0, total: 0 });
      return { success: true, newChapters: 0 };
    }

    await saveChapters(newChapters);

    let downloaded = 0;
    for (const chapter of newChapters) {
      try {
        onProgress?.({
          status: 'downloading',
          downloaded,
          total: newChapters.length,
          currentTitle: chapter.title,
        });
        const { html, wordCount } = await fetchChapterContent(chapter.url);
        await saveChapterContent(chapter.id, html, wordCount);
        downloaded++;
        await updateNovelDownloadCount(novelId);
      } catch (e) {
        console.warn(`Sync: failed chapter "${chapter.title}":`, e.message);
      }
    }

    onProgress?.({ status: 'done', downloaded, total: newChapters.length });
    return { success: true, newChapters: downloaded };
  } catch (err) {
    onProgress?.({ status: 'error', error: err.message });
    return { success: false, error: err.message };
  }
};
