import api from './api';

// Description: Get list of all team members
// Endpoint: GET /api/users/team
// Request: {}
// Response: { users: Array<{ _id: string, email: string, name: string, role: string }> }
export const getTeamMembers = async () => {
  try {
    const response = await api.get('/api/users/team');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get current user profile
// Endpoint: GET /api/users/me
// Request: {}
// Response: { user: { _id: string, email: string, name: string, role: string } }
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/users/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all users (admin only)
// Endpoint: GET /api/users
// Request: {}
// Response: { users: Array<{ _id: string, email: string, name: string, role: string, isActive: boolean, createdAt: string, lastLoginAt: string }> }
export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Invite a new user (admin only)
// Endpoint: POST /api/users/invite
// Request: { email: string, name?: string, role?: string }
// Response: { user: User, message: string }
export const inviteUser = async (data: { email: string; name?: string; role?: string }) => {
  try {
    const response = await api.post('/api/users/invite', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user role (admin only)
// Endpoint: PUT /api/users/:userId/role
// Request: { role: string }
// Response: { user: User }
export const updateUserRole = async (userId: string, role: string) => {
  try {
    const response = await api.put(`/api/users/${userId}/role`, { role });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user status (admin only)
// Endpoint: PUT /api/users/:userId/status
// Request: { isActive: boolean }
// Response: { user: User }
export const updateUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const response = await api.put(`/api/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete user (admin only)
// Endpoint: DELETE /api/users/:userId
// Request: {}
// Response: { message: string }
export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};
