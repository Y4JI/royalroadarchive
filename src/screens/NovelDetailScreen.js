import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DownloadButton from '../components/DownloadButton';
import ChapterItem    from '../components/ChapterItem';
import {
  getNovelById,
  getChaptersByNovel,
  getProgress,
  saveNovel,
  saveChapters,
} from '../services/database';
import { fetchNovelDetail } from '../services/scraper';
import { COLORS } from '../constants/config';

export default function NovelDetailScreen({ route, navigation }) {
  const { novelId, novelMeta } = route.params;

  const [novel, setNovel]       = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading]   = useState(true);

  // The 'load' function refreshes both metadata and the chapter list
  const load = useCallback(() => {
    const fetch = async () => {
      setLoading(true);

      // 1. Check local database first
      let localNovel = await getNovelById(novelId);
      let localChapters = await getChaptersByNovel(novelId);

      // 2. Fetch from web if novel is missing or has no chapters
      if (!localNovel || localChapters.length === 0) {
        try {
          console.log(`[UI] Novel/Chapters missing. Scraping: ${novelId}`);
          const detail = await fetchNovelDetail(novelId, novelMeta?.href);
          
          await saveNovel(detail);
          if (detail.chapters && detail.chapters.length > 0) {
            await saveChapters(detail.chapters);
          }

          // Re-fetch updated data from DB
          localNovel = await getNovelById(novelId);
          localChapters = await getChaptersByNovel(novelId);
        } catch (e) {
          console.error('Failed web fetch:', e);
          if (!localNovel && novelMeta) {
             localNovel = { ...novelMeta, tags: novelMeta.tags || [] };
          }
        }
      }

      // 3. Get latest reading progress
      const prog = await getProgress(novelId);

      setNovel(localNovel);
      setChapters(localChapters);
      setProgress(prog);
      setLoading(false);
    };
    fetch();
  }, [novelId, novelMeta]);

  // Refreshes data whenever screen is focused (useful for download status updates)
  useFocusEffect(load);

  const openChapter = (chapter) => {
    navigation.navigate('Reader', {
      chapterId:    chapter.id,
      chapterTitle: chapter.title,
      novelId,
      chapterOrder: chapter.chapter_order,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const coverSource = novel?.cover_local
    ? { uri: novel.cover_local }
    : novel?.cover_url
    ? { uri: novel.cover_url }
    : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Header Section */}
        <View style={styles.header}>
          {coverSource && (
            <Image source={coverSource} style={styles.cover} resizeMode="cover" />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{novel?.title}</Text>
            <Text style={styles.author}>{novel?.author || 'Unknown Author'}</Text>
            <Text style={styles.chapterCount}>
              {novel?.total_chapters || chapters.length} chapters •{' '}
              {novel?.downloaded_chapters || 0} downloaded
            </Text>
          </View>
        </View>

        {/* Description Section */}
        {novel?.description ? (
          <Text style={styles.description} numberOfLines={6}>
            {novel.description}
          </Text>
        ) : null}

        {/* Tags Section (Now restored via scraper update) */}
        {novel?.tags && novel.tags.length > 0 && (
          <View style={styles.tagRow}>
            {novel.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons (Bulk Download) */}
        {novel && (
          <View style={styles.actions}>
            <DownloadButton novel={novel} onComplete={load} />
          </View>
        )}

        {/* Chapter List Header */}
        <Text style={styles.sectionHeader}>
          Chapters ({chapters.length})
        </Text>

        {/* Render Chapters with Individual Download Support */}
        {chapters.length > 0 ? (
          chapters.map((ch) => (
            <ChapterItem
              key={ch.id}
              chapter={ch}
              novelId={novelId} // Required for individual downloads
              isRead={progress?.chapter_id === ch.id}
              onPress={() => openChapter(ch)}
              onDownloadComplete={load} // Refreshes UI when download finishes
            />
          ))
        ) : (
          <View style={styles.noChapters}>
            <Text style={styles.noChaptersText}>No chapters found for this novel.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:        { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  cover: {
    width: 100,
    height: 145,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  headerInfo:    { flex: 1, justifyContent: 'center' },
  title:         { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', lineHeight: 24 },
  author:        { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  chapterCount:  { color: COLORS.textMuted, fontSize: 12, marginTop: 6 },
  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 16,
  },
  tag:           { backgroundColor: COLORS.surfaceAlt, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:       { color: COLORS.textMuted, fontSize: 11 },
  actions:       { marginBottom: 20 },
  sectionHeader: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noChapters: {
    padding: 30,
    alignItems: 'center',
  },
  noChaptersText: {
    color: COLORS.textMuted,
    fontSize: 14,
  }
});