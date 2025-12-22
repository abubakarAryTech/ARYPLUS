/**
 * Title-Tagline mappings for sections and breadcrumbs
 * Used across home sections and breadcrumb components
 */

export const TITLE_TAGLINES = {
  // Categories
  'dramas': 'Har episode ka power dhamaka.',
  'telefilms': 'ARY PLUS ka Khaas tohfa. Sirf aap ke liye.',
  'tv shows': 'Saara fun, ek jaga. Abhi dekho.',
  'shows': 'Your favorite shows, all in one place',
  'live streaming': 'Live action. No rukawat ka plan.',
  'streams': 'Live action. No rukawat ka plan.',
  'snips': 'Quick entertainment bites',
  'shorts': 'Quick entertainment bites',
  'sports': 'Har wicket, har chhakka. Sirf yahan!',
  
  // Content Types
  'ost': 'Original soundtracks from your favorite shows',
  'podcasts': 'Kahaani suno. Earphone lagao.',
  'exclusive': 'Infinite Aura',
  'tvod exclusives': 'Infinite Aura',
  'ary zap exclusive': 'Infinite Aura',
  
  // Popular Sections
  'trending': 'What everyone is watching right now',
  'popular': 'Sab dekh rahy hai. Aap kab shuru kroge?',
  'most popular in your region': 'Sab dekh rahy hai. Aap kab shuru kroge?',
  'featured': 'Handpicked content for you',
  'recommended': 'Personalized picks just for you',
  'continue watching': 'Pick up where you left off',
  'my list': 'Your personal collection',
  'my library': 'Wait nahin, Bs play karo',
  'watchlist': 'Your saved content',
  'continue watching': 'Wait nahin, Bs play karo',
  'asia cup 2025': 'Har wicket, har chhakka. Sirf yahan!',
  'top 10 picks': 'Yeh hai best. Miss na karna.',
  'islamic': 'Har Din Ek Nayi Seekh.',
  'religious': 'Har Din Ek Nayi Seekh.',

  // Special Sections
  'new releases': 'Fresh content added recently',
  'coming soon': 'Exciting content on the way',
  'top rated': 'Highest rated by viewers',
  'editor picks': 'Curated by our editorial team',
  'staff picks': 'Curated by our editorial team',
  
  // Search & Discovery
  'search results': 'Find what you are looking for',
  'all': 'Everything in one place',
  'top cast': 'Aap ke favourites. Ek click par!',
  'casts': 'Aap ke favourites. Ek click par!',
  
  // Account & Settings
  'billing': 'Manage your subscription and payments',
  'account': 'Manage your profile and preferences',
  'settings': 'Customize your experience',
  'watch analytics': 'Your viewing insights and statistics'
};

/**
 * Get tagline for a given title
 * @param {string} title - The title to get tagline for
 * @returns {string} - The tagline or empty string if not found
 */
export const getTaglineByTitle = (title) => {
  if (!title) return '';
  
  const normalizedTitle = title.toLowerCase().trim();
  return TITLE_TAGLINES[normalizedTitle] || '';
};

/**
 * Get formatted title with tagline
 * @param {string} title - The title
 * @returns {object} - Object with title and tagline
 */
export const getTitleWithTagline = (title) => {
  return {
    title: title,
    tagline: getTaglineByTitle(title)
  };
};