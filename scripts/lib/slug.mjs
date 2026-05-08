/**
 * Convert a problem title to a URL-safe slug.
 * "Two Sum"                         → "two-sum"
 * "Best Time to Buy and Sell Stock" → "best-time-to-buy-and-sell-stock"
 * "3Sum"                            → "3sum"
 * "N-Queens II"                     → "n-queens-ii"
 */
export function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[''""]/g, '')          // remove smart quotes
    .replace(/[^a-z0-9\s-]/g, ' ')  // special chars → space
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
}
