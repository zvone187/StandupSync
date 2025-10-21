import api from './api';

// Description: Get Slack settings for the team
// Endpoint: GET /api/slack/settings
// Request: {}
// Response: { settings: TeamSettings | null }
export const getSlackSettings = async () => {
  try {
    const response = await api.get('/api/slack/settings');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Configure Slack integration
// Endpoint: POST /api/slack/configure
// Request: { accessToken: string, channelId: string, channelName: string }
// Response: { settings: TeamSettings, message: string }
export const configureSlack = async (data: {
  accessToken: string;
  channelId: string;
  channelName: string
}) => {
  try {
    const response = await api.post('/api/slack/configure', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get available Slack channels
// Endpoint: POST /api/slack/channels
// Request: { accessToken: string }
// Response: { channels: Array<{ id: string, name: string }> }
export const getSlackChannels = async (accessToken: string) => {
  try {
    const response = await api.post('/api/slack/channels', { accessToken });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Disconnect Slack integration
// Endpoint: POST /api/slack/disconnect
// Request: {}
// Response: { message: string }
export const disconnectSlack = async () => {
  try {
    const response = await api.post('/api/slack/disconnect');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};
