export const getConfig = () => ({
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  imageUrl: import.meta.env.VITE_APP_IMAGE_PATH || '/images/',
  // Add other config values as needed
});