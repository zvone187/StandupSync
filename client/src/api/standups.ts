import api from './api';
import { Standup } from '../types/standup';

// Description: Get all stand-ups for current user
// Endpoint: GET /api/standups/my
// Request: {}
// Response: { standups: Array<Standup> }
export const getMyStandups = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockStandups = [
        {
          _id: '1',
          userId: '1',
          date: '2024-01-15',
          yesterday: 'Completed API integration\nReviewed pull requests',
          today: 'Working on dashboard UI\nTeam meeting at 2 PM',
          blockers: 'Waiting for design approval',
          isSubmitted: true,
          createdAt: '2024-01-15T08:30:00Z',
          updatedAt: '2024-01-15T08:30:00Z',
        },
        {
          _id: '2',
          userId: '1',
          date: '2024-01-14',
          yesterday: 'Fixed login bug\nUpdated documentation',
          today: 'API integration\nCode review',
          blockers: '',
          isSubmitted: true,
          createdAt: '2024-01-14T08:15:00Z',
          updatedAt: '2024-01-14T08:15:00Z',
        },
        {
          _id: '3',
          userId: '1',
          date: '2024-01-13',
          yesterday: 'Sprint planning\nSetup development environment',
          today: 'Start working on authentication',
          blockers: 'Need access to staging server',
          isSubmitted: true,
          createdAt: '2024-01-13T09:00:00Z',
          updatedAt: '2024-01-13T09:00:00Z',
        },
      ];
      resolve({ standups: mockStandups });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/standups/my');
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get stand-ups for a specific user (limited to current and previous week)
// Endpoint: GET /api/standups/user/:userId
// Request: { userId: string, startDate?: string, endDate?: string }
// Response: { standups: Array<Standup> }
export const getUserStandups = async (userId: string, startDate?: string, endDate?: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockStandups = [
        {
          _id: '4',
          userId: userId,
          date: '2024-01-15',
          yesterday: 'Database optimization\nBug fixes',
          today: 'Feature development\nTesting',
          blockers: '',
          isSubmitted: true,
          createdAt: '2024-01-15T08:30:00Z',
          updatedAt: '2024-01-15T08:30:00Z',
        },
        {
          _id: '5',
          userId: userId,
          date: '2024-01-14',
          yesterday: 'Code review\nMeeting with client',
          today: 'Database optimization',
          blockers: 'Blocked by infrastructure team',
          isSubmitted: true,
          createdAt: '2024-01-14T08:15:00Z',
          updatedAt: '2024-01-14T08:15:00Z',
        },
      ];
      resolve({ standups: mockStandups });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const params = new URLSearchParams();
  //   if (startDate) params.append('startDate', startDate);
  //   if (endDate) params.append('endDate', endDate);
  //   return await api.get(`/api/standups/user/${userId}?${params.toString()}`);
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new stand-up
// Endpoint: POST /api/standups
// Request: { date: string, yesterday: string, today: string, blockers: string }
// Response: { standup: Standup, message: string }
export const createStandup = async (data: { date: string; yesterday: string; today: string; blockers: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        standup: {
          _id: Date.now().toString(),
          userId: '1',
          ...data,
          isSubmitted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message: 'Stand-up created successfully',
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/standups', data);
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update an existing stand-up
// Endpoint: PUT /api/standups/:id
// Request: { yesterday: string, today: string, blockers: string }
// Response: { standup: Standup, message: string }
export const updateStandup = async (id: string, data: { yesterday: string; today: string; blockers: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        standup: {
          _id: id,
          userId: '1',
          date: new Date().toISOString().split('T')[0],
          ...data,
          isSubmitted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message: 'Stand-up updated successfully',
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/standups/${id}`, data);
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get tomorrow's pre-populated notes from Slack commands
// Endpoint: GET /api/standups/tomorrow-notes
// Request: {}
// Response: { notes: string }
export const getTomorrowNotes = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        notes: '- Completed API integration\n- Reviewed pull requests\n- Fixed responsive design issues',
      });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/standups/tomorrow-notes');
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};