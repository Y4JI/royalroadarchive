// Delay between HTTP requests in milliseconds.
// Be polite to Royal Road's servers — don't remove this.
export const REQUEST_DELAY_MS = 1500;

// How many chapters to download in parallel (keep low to avoid bans)
export const DOWNLOAD_CONCURRENCY = 1;

// SQLite database filename
export const DB_NAME = 'royalroad.db';

// SQLite table names
export const TABLES = {
  novels:   'novels',
  chapters: 'chapters',
  progress: 'read_progress',
};

// Axios request headers — mimic a real browser to reduce Cloudflare blocks
export const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'identity',
};

// Reader font size options (pt)
export const FONT_SIZES = [14, 16, 18, 20, 22];
export const DEFAULT_FONT_SIZE = 16;

// Colors
export const COLORS = {
  background:     '#1a1a2e',
  surface:        '#16213e',
  surfaceAlt:     '#0f3460',
  accent:         '#e94560',
  accentLight:    '#ff6b81',
  textPrimary:    '#e0e0e0',
  textSecondary:  '#a0a0b0',
  textMuted:      '#606080',
  success:        '#4caf50',
  warning:        '#ff9800',
  danger:         '#f44336',
  readerBg:       '#121212',
  readerText:     '#d4d4d4',
};
