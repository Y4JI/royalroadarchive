import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, Text, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NovelCard from '../components/NovelCard';
import { getAllNovels, deleteNovel, getProgress } from '../services/database';
import { COLORS } from '../constants/config';

export default function LibraryScreen({ navigation }) {
  const [novels, setNovels] = useState([]);

  const loadNovels = useCallback(() => {
    const fetch = async () => {
      const data = await getAllNovels();
      setNovels(data);
    };
    fetch();
  }, []);

  // Reload whenever screen comes into focus (e.g. after returning from Detail)
  useFocusEffect(loadNovels);

  const handleOpen = async (novel) => {
    // Resume from last read chapter if available
    const progress = await getProgress(novel.id);
    navigation.navigate('NovelDetail', {
      novelId: novel.id,
      title: novel.title,
      resumeChapterId: progress?.chapter_id,
    });
  };

  const handleLongPress = (novel) => {
    Alert.alert(
      'Remove Novel',
      `Remove "${novel.title}" from your library? Downloaded chapters will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteNovel(novel.id);
            loadNovels();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {novels.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptySubtitle}>
            Search for novels to download them for offline reading.
          </Text>
        </View>
      ) : (
        <FlatList
          data={novels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NovelCard
              novel={item}
              onPress={() => handleOpen(item)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Search FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋ Search</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});