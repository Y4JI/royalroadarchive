import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, DEFAULT_FONT_SIZE } from '../constants/config';

const { width } = Dimensions.get('window');

// Wrap raw Royal Road chapter HTML in a full reading page
const buildHtml = (content, fontSize) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=${width}, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${COLORS.readerBg};
      color: ${COLORS.readerText};
      font-family: Georgia, serif;
      font-size: ${fontSize}px;
      line-height: 1.8;
      padding: 24px 20px 80px;
      word-break: break-word;
    }
    p { margin-bottom: 1em; }
    em { font-style: italic; }
    strong { font-weight: bold; }
    hr { border: none; border-top: 1px solid #333; margin: 2em 0; }
    /* Suppress any RR leftover styles */
    .ads, .portlet { display: none !important; }
  </style>
</head>
<body>${content}</body>
</html>
`;

export default function ReaderView({ content, fontSize = DEFAULT_FONT_SIZE, onScroll }) {
  const webviewRef = useRef(null);

  // Intercept scroll events from inside the WebView
  const injectedJS = `
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = max > 0 ? y / max : 0;
      if (Math.abs(y - lastY) > 50) {
        lastY = y;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scroll', pct }));
      }
    });
    true;
  `;

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'scroll') onScroll?.(msg.pct);
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html: buildHtml(content, fontSize) }}
        style={styles.webview}
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
        // Block all external network requests — offline only
        onShouldStartLoadWithRequest={(req) => req.url === 'about:blank'}
        originWhitelist={['*']}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        allowsBackForwardNavigationGestures={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.readerBg,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.readerBg,
  },
});
