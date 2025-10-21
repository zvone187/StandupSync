import api from './api';
import { getLoginMockData } from './loginMock'; // pythagora_mocked_data - remove when the backend is being implemented

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: User fields spread at root level + { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
    return getLoginMockData(email); // pythagora_mocked_data - remove when the backend is being implemented
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { email: string }
export const register = async (email: string, password: string) => {
  try {
    return { email: 'jake@example.com' }; // pythagora_mocked_data - remove when the backend is being implemented
    const response = await api.post('/api/auth/register', {email, password});
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/api/auth/logout');
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};
