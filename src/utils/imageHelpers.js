/**
 * Helper functions for handling images
 */

/**
 * Get a placeholder image URL with a custom text
 * @param {number} width - Width of placeholder
 * @param {number} height - Height of placeholder (defaults to width if not provided)
 * @param {string} text - Text to display in placeholder
 * @param {string} color - Background color (hex code without #)
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (width = 400, height = null, text = 'Image', color = '6C5DD3') => {
  const h = height || width;
  return `https://placehold.co/${width}x${h}/${color}/FFF?text=${encodeURIComponent(text)}`;
};

/**
 * Handles an image error by replacing with a placeholder
 * @param {Event} e - Error event
 * @param {string} placeholderText - Text to show in placeholder
 */
export const handleImageError = (e, placeholderText = 'Image Not Found') => {
  e.target.onerror = null; // Prevent infinite loop
  const size = Math.max(e.target.width || 400, e.target.height || 400);
  e.target.src = getPlaceholderImage(size, size, placeholderText, '6C5DD3');
};

/**
 * Creates an array of reliable image URLs to try
 * @param {string} originalUrl - The original image URL
 * @param {string} fallbackText - Fallback text for placeholder
 * @param {number} width - Width for placeholder
 * @param {number} height - Height for placeholder
 * @returns {string[]} Array of image URLs to try
 */
export const getImageFallbacks = (originalUrl, fallbackText = 'Image', width = 400, height = null) => {
  // Always return the original URL first
  const urls = [originalUrl];
  
  // If it's an Unsplash URL, we can try some variations
  if (originalUrl && originalUrl.includes('unsplash.com')) {
    // Add a size parameter if it doesn't already have one
    if (!originalUrl.includes('&w=') && !originalUrl.includes('?w=')) {
      const separator = originalUrl.includes('?') ? '&' : '?';
      urls.push(`${originalUrl}${separator}w=${width}&fit=crop`);
    }
  }
  
  // Always add a placeholder as the final fallback
  urls.push(getPlaceholderImage(width, height, fallbackText, '6C5DD3'));
  
  return urls;
};