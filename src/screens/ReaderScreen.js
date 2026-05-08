import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Platform, Pressable
} from 'react-native';
import { getChapterContent } from '../services/database';
import { COLORS, DEFAULT_FONT_SIZE } from '../constants/config';

// Apple-style font stack
const FONT_STYLES = {
  SANS: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  SERIF: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  MONO: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export default function ReaderScreen({ route, navigation }) {
  const { chapterId, chapterTitle } = route.params;
  
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE || 18);
  const [fontFamily, setFontFamily] = useState(FONT_STYLES.SANS);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      const data = await getChapterContent(chapterId);
      if (data && data.content) {
        setContent(parseHtml(data.content));
      }
      setLoading(false);
    };
    loadContent();
    navigation.setOptions({ title: '' }); // Keep header clean
  }, [chapterId]);

  const parseHtml = (html) => {
    return html
      .split(/<\/?p[^>]*>/gi)
      .map(p => p.replace(/<[^>]*>/g, '').trim())
      .filter(p => p.length > 0)
      .map(p => p.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"'));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ScrollView is now the ROOT to ensure scrolling always works */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Pressing the text area toggles settings without blocking scroll */}
        <Pressable onPress={() => setShowSettings(!showSettings)}>
          <Text style={styles.headerTitle}>{chapterTitle}</Text>
          
          {content.map((para, index) => (
            <Text 
              key={index} 
              style={[
                styles.paragraph, 
                { 
                  fontSize: fontSize, 
                  fontFamily: fontFamily, 
                  lineHeight: fontSize * 1.6,
                  textAlign: 'justify' // <--- JUSTIFIED TEXT
                }
              ]}
            >
              {para}
            </Text>
          ))}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>End of Chapter</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Settings Overlay (Absolute Positioned) */}
      {showSettings && (
        <View style={styles.settingsBar}>
          <View style={styles.settingsRow}>
            <Text style={styles.settingLabel}>Size</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))} style={styles.toolBtn}>
                <Text style={styles.toolBtnText}>A-</Text>
              </TouchableOpacity>
              <Text style={styles.sizeDisplay}>{fontSize}</Text>
              <TouchableOpacity onPress={() => setFontSize(Math.min(34, fontSize + 2))} style={styles.toolBtn}>
                <Text style={styles.toolBtnText}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingsRow}>
            <Text style={styles.settingLabel}>Font</Text>
            <View style={styles.buttonGroup}>
              {Object.keys(FONT_STYLES).map((key) => (
                <TouchableOpacity 
                  key={key}
                  onPress={() => setFontFamily(FONT_STYLES[key])} 
                  style={[styles.toolBtn, fontFamily === FONT_STYLES[key] && styles.activeBtn]}
                >
                  <Text style={styles.toolBtnText}>{key.charAt(0) + key.slice(1).toLowerCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.readerBg 
  },
  center: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollView: { 
    flex: 1 
  },
  contentContainer: { 
    paddingHorizontal: 25, // Wider margins for justified text
    paddingTop: 30,
    paddingBottom: 120 
  },
  headerTitle: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  paragraph: {
    color: COLORS.readerText,
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  footer: { 
    marginTop: 60, 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: COLORS.surfaceAlt, 
    paddingTop: 30 
  },
  footerText: { 
    color: COLORS.textMuted, 
    fontStyle: 'italic' 
  },
  
  // Settings UI
  settingsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  buttonGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolBtn: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  activeBtn: { backgroundColor: COLORS.accent },
  toolBtnText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 13 },
  sizeDisplay: { color: COLORS.textPrimary, minWidth: 30, textAlign: 'center', fontWeight: 'bold' },
});