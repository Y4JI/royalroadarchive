import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { downloadNovel, syncNovel } from '../services/downloader';
import { COLORS } from '../constants/config';

export default function DownloadButton({ novel, onComplete }) {
  const [status, setStatus]     = useState(null);   // null | 'downloading' | 'done' | 'error'
  const [progress, setProgress] = useState(null);   // { downloaded, total, currentTitle }

  const isDownloaded =
    novel.total_chapters > 0 &&
    novel.downloaded_chapters >= novel.total_chapters;

  const handlePress = async () => {
    if (status === 'downloading') return;

    const fn = isDownloaded ? syncNovel : downloadNovel;
    setStatus('downloading');

    const result = await fn(novel.id, (p) => {
      setProgress(p);
      if (p.status === 'done' || p.status === 'error') {
        setStatus(p.status);
        onComplete?.();
      }
    });

    if (!result.success) setStatus('error');
  };

  if (status === 'downloading' && progress) {
    const pct =
      progress.total > 0
        ? Math.round((progress.downloaded / progress.total) * 100)
        : 0;

    return (
      <View style={styles.progressBox}>
        <ActivityIndicator color={COLORS.accent} size="small" />
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {progress.status === 'fetching_metadata'
              ? 'Fetching chapter list…'
              : `${pct}% — ${progress.currentTitle || ''}`}
          </Text>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        status === 'error' && styles.btnError,
        isDownloaded && styles.btnSync,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.btnText}>
        {status === 'error'
          ? 'Retry Download'
          : status === 'done'
          ? 'Downloaded ✓'
          : isDownloaded
          ? 'Sync New Chapters'
          : 'Download All Chapters'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  btnSync: {
    backgroundColor: COLORS.surfaceAlt,
  },
  btnError: {
    backgroundColor: COLORS.danger,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  progressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    gap: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  bar: {
    height: 4,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
});
