import NodeCache from 'node-cache';

// Standard cache for RSS feeds (10 minutes)
export const rssCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// API Response cache (2 minutes)
export const apiCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

// Health stats cache (Persists longer to track failures)
export const healthCache = new NodeCache({ stdTTL: 3600 * 24 });

export const getCacheKey = (...parts: string[]) => parts.join(':');
