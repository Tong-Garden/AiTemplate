import { api } from './api';

const refreshToken = async (): Promise<boolean> => {
  const result = await api.post('/v1/auth/refresh-token');

  const statusCode = result.data.statusCode;

  if (statusCode === 200) {
    window.localStorage.setItem('isAuthenticated', 'true');
    return true;
  } else if (statusCode === 498) {
    window.localStorage.removeItem('isAuthenticated');
    return false;
  }

  return false;
};

export default refreshToken;
