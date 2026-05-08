import axios from 'axios';
import { URLS, BASE_URL } from '../constants/urls';
import { REQUEST_HEADERS, REQUEST_DELAY_MS } from '../constants/config';

const client = axios.create({
  timeout: 60000,
  headers: REQUEST_HEADERS,
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const getText = async (url) => {
  console.log(`[SCRAPER] Requesting: ${url}`);
  try {
    await delay(REQUEST_DELAY_MS);
    const response = await client.get(url);
    return response.data;
  } catch (e) {
    console.error(`[SCRAPER] Axios Error: ${e.message}`);
    throw e;
  }
};

const stripTags = (html) => 
  (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const decodeEntities = (str) =>
  (str || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

// ─── Search (REWRITTEN FOR SEARCH PAGE SPECIFICALLY) ────────────────────────

export const searchNovels = async (query, page = 1) => {
  const html = await getText(URLS.search(query, page));
  
  // 1. Identify where each search result starts. 
  // On RR Search, they are wrapped in <tr> tags inside a table OR <div> items.
  // We split by both to be safe.
  const blocks = html.split(/class="[^"]*fiction-list-item[^"]*"|class="[^"]*fiction-item[^"]*"/gi);
  blocks.shift(); // Remove content before first result

  const results = [];
  for (const block of blocks) {
    // 2. Extract ID and Full Href from the first fiction link found
    const linkMatch = block.match(/href=["']([^"']*?\/fiction\/(\d+)[^"']*)["']/i);
    if (!linkMatch) continue;

    const href = linkMatch[1];
    const id = linkMatch[2];

    // 3. Extract Title
    // On Search page, Title is often in a <a> inside a <h4> or <h2>
    const titleMatch = block.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i) || 
                       block.match(/class=["']title["'][^>]*>([\s\S]*?)<\/a>/i);
    const title = titleMatch ? decodeEntities(stripTags(titleMatch[1])) : 'Unknown Title';

    // 4. Extract Author
    const authorMatch = block.match(/class=["']author["'][^>]*>([\s\S]*?)<\//i) || 
                        block.match(/by\s*<a[^>]*>([\s\S]*?)<\/a>/i);
    const author = authorMatch ? decodeEntities(stripTags(authorMatch[1])) : 'Unknown Author';

    // 5. Extract Cover
    const coverMatch = block.match(/src=["']([^"']+\.(?:jpg|png|jpeg|webp)[^"']*)["']/i);
    const cover_url = coverMatch ? coverMatch[1] : '';

    // 6. Extract Description
    const descMatch = block.match(/class=["'](?:fiction-)?description["'][^>]*>([\s\S]*?)<\/div>/i);
    const description = descMatch ? decodeEntities(stripTags(descMatch[1])) : '';

    results.push({
      id,
      href: href.startsWith('http') ? href : `${BASE_URL}${href}`,
      title,
      author,
      cover_url,
      description,
      tags: [],
      status: '',
    });
  }

  console.log(`[SCRAPER] Search returned ${results.length} results`);
  return results;
};

// ─── Novel Detail (Keep your working code) ───────────────────────────────────

export const fetchNovelDetail = async (id, href) => {
  const url = href ? (href.startsWith('http') ? href : `${BASE_URL}${href}`) : `${BASE_URL}/fiction/${id}`;
  const html = await getText(url);

  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? decodeEntities(stripTags(titleMatch[1])) : 'Unknown';
  
  const cover = html.match(/class="cover-art-container">[\s\S]*?src=["']([^"']+)["']/i)?.[1] || 
                html.match(/property="og:image" content=["']([^"']+)["']/i)?.[1];

  // Tags
  const tags = [];
  const tagRegex = /<a[^>]+class=["'][^"']*label[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  let tMatch;
  while ((tMatch = tagRegex.exec(html)) !== null) {
    const tagName = stripTags(tMatch[1]);
    if (tagName.length > 2 && tagName.length < 30 && !/follow|rss|report/i.test(tagName)) {
        tags.push(decodeEntities(tagName));
    }
  }

  // Chapters
  const chapters = [];
  const seen = new Set();
  const chRegex = /href=["']([^"']*?\/chapter\/(\d+)[^"']*?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  
  let m;
  while ((m = chRegex.exec(html)) !== null) {
    const chUrl = m[1];
    const chId = m[2];
    const chTitle = decodeEntities(stripTags(m[3]));

    if (!seen.has(chId) && chTitle.length > 0 && !chTitle.toLowerCase().includes('rss')) {
      seen.add(chId);
      chapters.push({
        id: `${id}_${chId}`,
        novel_id: id,
        title: chTitle,
        url: chUrl,
        order: chapters.length,
      });
    }
  }

  return {
    id, title,
    author: decodeEntities(stripTags(html.match(/class="author-name">([\s\S]*?)<\/a>/i)?.[1] || '')),
    description: decodeEntities(stripTags(html.match(/class="description">([\s\S]*?)<\/div>/i)?.[1] || '')),
    href,
    cover_url: cover,
    tags, 
    status: '',
    total_chapters: chapters.length,
    chapters,
  };
};

// ─── Chapter Content ──────────────────────────────────────────────────────────

export const fetchChapterContent = async (chapterUrl) => {
  const url = chapterUrl.startsWith('http') ? chapterUrl : `${BASE_URL}${chapterUrl}`;
  const html = await getText(url);
  const contentMatch = html.match(/<div[^>]+class="[^"]*chapter-inner[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!contentMatch) throw new Error('Chapter content not found');
  return { html: contentMatch[1], wordCount: 0 };
};