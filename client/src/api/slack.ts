import api from './api';

// Description: Add a note for tomorrow's stand-up via Slack command
// Endpoint: POST /api/slack/daily-update
// Request: { note: string }
// Response: { message: string }
export const addDailyUpdate = async (note: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: '✓ Added to tomorrow\'s stand-up',
      });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/slack/daily-update', { note });
  // } catch (error: any) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};