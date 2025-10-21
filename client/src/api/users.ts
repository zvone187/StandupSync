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
        user: { _id: '1', email: 'john@example.com', name: 'John Doe', role: 'user' },
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