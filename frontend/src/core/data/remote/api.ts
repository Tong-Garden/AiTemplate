import axios from 'axios';
import refreshToken from './refresh-token';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    // Unwrap API response format: {"status": "success", "data": result}
    if (response.data && typeof response.data === 'object' && 'status' in response.data) {
      return {
        ...response,
        data: response.data.data, // Extract data from wrapped response
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Token expired - handle 401
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        await refreshToken();
        return api(originalRequest);
      }

      // Handle 409 - Unique constraint failed
      if (
        error.response.status === 409 &&
        error.response.data.message.includes('Unique constraint failed')
      ) {
        const fieldName = error.response.data.message.split(':')[1]?.trim();
        return Promise.reject(new Error(`A record with the same ${fieldName} already exists.`));
      }

      // Catch all other errors
      const errorMessage = `${error.response.data.message || error.response.statusText}`;

      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error);
  },
);
