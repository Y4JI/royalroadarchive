export const BASE_URL = 'https://www.royalroad.com';

export const URLS = {
  // Search for fictions by title
  search: (query, page = 1) =>
    `${BASE_URL}/fictions/search?title=${encodeURIComponent(query)}&page=${page}`,

  // Fiction detail page — uses full path if slug provided
  fiction: (id, slug = '') =>
    slug
      ? `${BASE_URL}/fiction/${id}/${slug}`
      : `${BASE_URL}/fiction/${id}/redirect`,

  // Individual chapter
  chapter: (path) =>
    path.startsWith('http') ? path : `${BASE_URL}${path}`,

  // Popular / latest listings
  latest: (page = 1) =>
    `${BASE_URL}/fictions/latest-updates?page=${page}`,

  popular: (page = 1) =>
    `${BASE_URL}/fictions/best-rated?page=${page}`,
};