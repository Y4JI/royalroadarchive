import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { downloadSingleChapter } from '../services/downloader';
import { COLORS } from '../constants/config';

export default function ChapterItem({ chapter, novelId, isRead, onPress, onDownloadComplete }) {
  const [downloading, setDownloading] = useState(false);

  // Convert SQLite 0/1 to strict boolean
  const isDownloaded = !!chapter.downloaded;

  const handleDownload = async () => {
    // Safety check to prevent double-clicking
    if (isDownloaded || downloading) return;
    
    setDownloading(true);
    const result = await downloadSingleChapter(novelId, chapter);
    setDownloading(false);
    
    if (result.success) {
      onDownloadComplete?.(); // Refresh the list in the NovelDetailScreen
    }
  };

  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.content}>
        <Text style={[styles.title, isRead && styles.readText]}>
          {chapter.title}
        </Text>
        <Text style={styles.meta}>
          {isDownloaded ? '✓ Offline' : 'Pending'} 
          {chapter.word_count > 0 && ` • ${chapter.word_count} words`}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.downloadBtn} 
        onPress={handleDownload}
        // FIX: Force to strict boolean to avoid Double to Boolean cast error
        disabled={isDownloaded || downloading ? true : false}
      >
        {downloading ? (
          <ActivityIndicator size="small" color={COLORS.accent} />
        ) : (
          <Text style={[
            styles.downloadIcon, 
            isDownloaded && { color: COLORS.success }
          ]}>
            {isDownloaded ? '●' : '↓'}
          </Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
    alignItems: 'center',
  },
  content: { flex: 1 },
  title: { color: COLORS.textPrimary, fontSize: 14, marginBottom: 4 },
  readText: { color: COLORS.textMuted },
  meta: { color: COLORS.textMuted, fontSize: 11 },
  downloadBtn: { 
    padding: 10, 
    minWidth: 44, 
    minHeight: 44, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  downloadIcon: { color: COLORS.textMuted, fontSize: 18, fontWeight: 'bold' },
});