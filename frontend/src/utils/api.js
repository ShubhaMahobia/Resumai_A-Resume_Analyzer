/**
 * API utility file to manage API connections
 */

// Get the base URL from environment variables
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Get the full URL for an API endpoint
 * @param {string} endpoint - The API endpoint (e.g., '/login')
 * @returns {string} The full URL
 */
export const getApiUrl = (endpoint) => {
  // Make sure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

/**
 * Get common headers for API requests
 * @param {boolean} includeAuth - Whether to include the auth token
 * @returns {Object} Headers object
 */
export const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Helper for multipart/form-data requests (file uploads)
 * @param {boolean} includeAuth - Whether to include the auth token
 * @returns {Object} Headers object for file uploads
 */
export const getUploadHeaders = (includeAuth = true) => {
  const headers = {};

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getHeaders,
  getUploadHeaders
}; 