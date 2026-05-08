import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/config';

export default function NovelCard({ novel, onPress }) {
  const coverSource = novel.cover_local
    ? { uri: novel.cover_local }
    : novel.cover_url
    ? { uri: novel.cover_url }
    : null;

  const downloadProgress =
    novel.total_chapters > 0
      ? Math.round((novel.downloaded_chapters / novel.total_chapters) * 100)
      : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.coverContainer}>
        {coverSource ? (
          <Image source={coverSource} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderText}>
              {novel.title?.[0] ?? '?'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{novel.title}</Text>
        <Text style={styles.author} numberOfLines={1}>
          {novel.author || 'Unknown Author'}
        </Text>

        {/* Download progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${downloadProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {novel.downloaded_chapters ?? 0} / {novel.total_chapters ?? '?'} chapters
        </Text>

        {/* Tags */}
        {novel.tags?.length > 0 && (
          <View style={styles.tags}>
            {novel.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  coverContainer: {
    width: 90,
    height: 130,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    color: COLORS.accent,
    fontSize: 32,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  author: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    height: 3,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tag: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
});
