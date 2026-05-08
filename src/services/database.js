import * as SQLite from 'expo-sqlite';
import { DB_NAME, TABLES } from '../constants/config';

let db = null;

// ─── Open / Init ─────────────────────────────────────────────────────────────

export const openDatabase = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS ${TABLES.novels} (
      id                  TEXT PRIMARY KEY,
      title               TEXT NOT NULL,
      author              TEXT,
      cover_url           TEXT,
      cover_local         TEXT,
      description         TEXT,
      tags                TEXT,
      status              TEXT,
      total_chapters      INTEGER DEFAULT 0,
      downloaded_chapters INTEGER DEFAULT 0,
      last_updated        TEXT,
      added_at            TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${TABLES.chapters} (
      id            TEXT PRIMARY KEY,
      novel_id      TEXT NOT NULL,
      title         TEXT NOT NULL,
      url           TEXT NOT NULL,
      chapter_order INTEGER NOT NULL,
      content       TEXT,
      word_count    INTEGER DEFAULT 0,
      downloaded    INTEGER DEFAULT 0,
      downloaded_at TEXT,
      FOREIGN KEY (novel_id) REFERENCES ${TABLES.novels}(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ${TABLES.progress} (
      novel_id        TEXT PRIMARY KEY,
      chapter_id      TEXT,
      scroll_position REAL DEFAULT 0,
      last_read       TEXT,
      FOREIGN KEY (novel_id) REFERENCES ${TABLES.novels}(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chapters_novel
      ON ${TABLES.chapters}(novel_id, chapter_order);
  `);

  return db;
};

// ─── Novels ───────────────────────────────────────────────────────────────────

export const saveNovel = async (novel) => {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO ${TABLES.novels}
      (id, title, author, cover_url, description, tags, status,
       total_chapters, added_at, last_updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    novel.id,
    novel.title,
    novel.author || '',
    novel.cover_url || '',
    novel.description || '',
    JSON.stringify(novel.tags || []),
    novel.status || 'ongoing',
    novel.total_chapters || 0,
    new Date().toISOString(),
    new Date().toISOString(),
  );
};

export const getAllNovels = async () => {
  const db = await openDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM ${TABLES.novels} ORDER BY added_at DESC`
  );
  return rows.map(parseNovel);
};

export const getNovelById = async (id) => {
  const db = await openDatabase();
  const row = await db.getFirstAsync(
    `SELECT * FROM ${TABLES.novels} WHERE id = ?`, id
  );
  return row ? parseNovel(row) : null;
};

export const deleteNovel = async (id) => {
  const db = await openDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.novels} WHERE id = ?`, id);
};

export const updateNovelCoverLocal = async (id, localPath) => {
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.novels} SET cover_local = ? WHERE id = ?`, localPath, id
  );
};

export const updateNovelDownloadCount = async (id) => {
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.novels}
     SET downloaded_chapters = (
       SELECT COUNT(*) FROM ${TABLES.chapters}
       WHERE novel_id = ? AND downloaded = 1
     ), last_updated = ?
     WHERE id = ?`,
    id, new Date().toISOString(), id
  );
};

const parseNovel = (row) => ({ ...row, tags: JSON.parse(row.tags || '[]') });

// ─── Chapters ─────────────────────────────────────────────────────────────────

export const saveChapters = async (chapters) => {
  const db = await openDatabase();
  await db.withTransactionAsync(async () => {
    for (const ch of chapters) {
      await db.runAsync(
        `INSERT OR IGNORE INTO ${TABLES.chapters}
          (id, novel_id, title, url, chapter_order, downloaded)
         VALUES (?, ?, ?, ?, ?, 0)`,
        ch.id, ch.novel_id, ch.title, ch.url, ch.order
      );
    }
  });
};

export const saveChapterContent = async (chapterId, content, wordCount) => {
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.chapters}
     SET content = ?, word_count = ?, downloaded = 1, downloaded_at = ?
     WHERE id = ?`,
    content, wordCount, new Date().toISOString(), chapterId
  );
};

export const getChaptersByNovel = async (novelId) => {
  const db = await openDatabase();
  return db.getAllAsync(
    `SELECT * FROM ${TABLES.chapters} WHERE novel_id = ? ORDER BY chapter_order ASC`,
    novelId
  );
};

export const getChapterContent = async (chapterId) => {
  const db = await openDatabase();
  return db.getFirstAsync(
    `SELECT * FROM ${TABLES.chapters} WHERE id = ?`, chapterId
  );
};

export const getNextChapter = async (novelId, currentOrder) => {
  const db = await openDatabase();
  return db.getFirstAsync(
    `SELECT * FROM ${TABLES.chapters}
     WHERE novel_id = ? AND chapter_order > ? AND downloaded = 1
     ORDER BY chapter_order ASC LIMIT 1`,
    novelId, currentOrder
  );
};

export const getPrevChapter = async (novelId, currentOrder) => {
  const db = await openDatabase();
  return db.getFirstAsync(
    `SELECT * FROM ${TABLES.chapters}
     WHERE novel_id = ? AND chapter_order < ? AND downloaded = 1
     ORDER BY chapter_order DESC LIMIT 1`,
    novelId, currentOrder
  );
};

// ─── Read Progress ────────────────────────────────────────────────────────────

export const saveProgress = async (novelId, chapterId, scrollPosition = 0) => {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO ${TABLES.progress}
      (novel_id, chapter_id, scroll_position, last_read)
     VALUES (?, ?, ?, ?)`,
    novelId, chapterId, scrollPosition, new Date().toISOString()
  );
};

export const getProgress = async (novelId) => {
  const db = await openDatabase();
  return db.getFirstAsync(
    `SELECT * FROM ${TABLES.progress} WHERE novel_id = ?`, novelId
  );
};