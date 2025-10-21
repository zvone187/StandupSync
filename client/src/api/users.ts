import api from './api';

// Description: Get list of all team members
// Endpoint: GET /api/users/team
// Request: {}
// Response: { users: Array<{ _id: string, email: string, name: string, role: string }> }
export const getTeamMembers = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: [
          { _id: '1', email: 'john@example.com', name: 'John Doe', role: 'user' },
          { _id: '2', email: 'jane@example.com', name: 'Jane Smith', role: 'user' },
          { _id: '3', email: 'bob@example.com', name: 'Bob Johnson', role: 'user' },
          { _id: '4', email: 'alice@example.com', name: 'Alice Williams', role: 'user' },
        ],
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/users/team');
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get current user profile
// Endpoint: GET /api/users/me
// Request: {}
// Response: { user: { _id: string, email: string, name: string, role: string } }
export const getCurrentUser = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: { _id: '1', email: 'john@example.com', name: 'John Doe', role: 'admin' },
      });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/users/me');
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get all users (admin only)
// Endpoint: GET /api/users
// Request: {}
// Response: { users: Array<{ _id: string, email: string, name: string, role: string, isActive: boolean, createdAt: string, lastLoginAt: string }> }
export const getAllUsers = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: [
          { _id: '1', email: 'john@example.com', name: 'John Doe', role: 'admin', isActive: true, createdAt: '2024-01-01T00:00:00Z', lastLoginAt: '2024-01-15T08:30:00Z' },
          { _id: '2', email: 'jane@example.com', name: 'Jane Smith', role: 'user', isActive: true, createdAt: '2024-01-02T00:00:00Z', lastLoginAt: '2024-01-15T09:00:00Z' },
          { _id: '3', email: 'bob@example.com', name: 'Bob Johnson', role: 'user', isActive: true, createdAt: '2024-01-03T00:00:00Z', lastLoginAt: '2024-01-14T10:00:00Z' },
          { _id: '4', email: 'alice@example.com', name: 'Alice Williams', role: 'user', isActive: false, createdAt: '2024-01-04T00:00:00Z', lastLoginAt: '2024-01-10T11:00:00Z' },
        ],
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/users');
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update user (admin only)
// Endpoint: PUT /api/users/:userId
// Request: { role?: string, isActive?: boolean }
// Response: { user: { _id: string, email: string, name: string, role: string, isActive: boolean }, message: string }
export const updateUser = async (userId: string, data: { role?: string; isActive?: boolean }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: { _id: userId, email: 'user@example.com', name: 'User Name', role: data.role || 'user', isActive: data.isActive !== undefined ? data.isActive : true },
        message: 'User updated successfully',
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/users/${userId}`, data);
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Delete user (admin only)
// Endpoint: DELETE /api/users/:userId
// Request: {}
// Response: { message: string }
export const deleteUser = async (userId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: 'User deleted successfully',
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/users/${userId}`);
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};