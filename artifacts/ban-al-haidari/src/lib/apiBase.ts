const configuredApiOrigin = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");

/**
 * Use the Replit API artifact during local preview and the configured
 * deployment origin for Netlify/production builds.
 */
export const API_BASE = configuredApiOrigin ? `${configuredApiOrigin}/api` : "/api";