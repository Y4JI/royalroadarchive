import React, { useState } from 'react';
import {
  View, TextInput, FlatList, Text, Image,
  TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { searchNovels } from '../services/scraper';
import { COLORS } from '../constants/config';

export default function SearchScreen({ navigation }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchNovels(q);
      setResults(data);
      if (data.length === 0) setError('No results found.');
    } catch (e) {
      setError('Search failed. Check your internet connection.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (novel) => {
    navigation.navigate('NovelDetail', {
      novelId: novel.id,
      title: novel.title,
      novelMeta: novel,  // includes href
    });
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder="Search Royal Road…"
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.searchBtnText}>Go</Text>
          }
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.result}
            onPress={() => handleSelect(item)}
            activeOpacity={0.75}
          >
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Text style={styles.coverInitial}>{item.title?.[0]}</Text>
              </View>
            )}
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.resultAuthor} numberOfLines={1}>
                {item.author}
              </Text>
              <Text style={styles.resultDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.tagRow}>
                {item.tags?.slice(0, 3).map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  searchRow:    { flexDirection: 'row', padding: 12, gap: 8 },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
    padding: 12,
  },
  list:         { paddingBottom: 40 },
  result: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  cover:        { width: 70, height: 100, borderRadius: 6 },
  coverPlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitial: { color: COLORS.accent, fontSize: 28, fontWeight: '700' },
  resultInfo:   { flex: 1, marginLeft: 12 },
  resultTitle:  { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  resultAuthor: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  resultDesc:   { color: COLORS.textMuted, fontSize: 12, marginTop: 4, lineHeight: 18 },
  tagRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag:          { backgroundColor: COLORS.surfaceAlt, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagText:      { color: COLORS.textMuted, fontSize: 10 },
});