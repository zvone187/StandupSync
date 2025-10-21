import api from './api';
import { Standup } from '../types/standup';

// Description: Get standups for current user or specific date
// Endpoint: GET /api/standups
// Request: { date?: string, userId?: string }
// Response: { standups: Array<Standup> }
export const getStandups = async (params?: { date?: string; userId?: string }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.userId) queryParams.append('userId', params.userId);

    const response = await api.get(`/api/standups?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get standups for a date range
// Endpoint: GET /api/standups/range
// Request: { startDate: string, endDate: string, userId?: string }
// Response: { standups: Array<Standup> }
export const getStandupsRange = async (params: { startDate: string; endDate: string; userId?: string }) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    if (params.userId) queryParams.append('userId', params.userId);

    const response = await api.get(`/api/standups/range?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get team standups for a specific date
// Endpoint: GET /api/standups/team/:date
// Request: {}
// Response: { standups: Array<Standup> }
export const getTeamStandups = async (date: string) => {
  try {
    const response = await api.get(`/api/standups/team/${date}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new standup
// Endpoint: POST /api/standups
// Request: { date: string, yesterdayWork: string[], todayPlan: string[], blockers: string[] }
// Response: { standup: Standup }
export const createStandup = async (data: {
  date: string;
  yesterdayWork: string[];
  todayPlan: string[];
  blockers: string[]
}) => {
  try {
    const response = await api.post('/api/standups', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update an existing standup
// Endpoint: PUT /api/standups/:id
// Request: { yesterdayWork?: string[], todayPlan?: string[], blockers?: string[] }
// Response: { standup: Standup }
export const updateStandup = async (
  id: string,
  data: {
    yesterdayWork?: string[];
    todayPlan?: string[];
    blockers?: string[]
  }
) => {
  try {
    const response = await api.put(`/api/standups/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a standup
// Endpoint: DELETE /api/standups/:id
// Request: {}
// Response: { message: string }
export const deleteStandup = async (id: string) => {
  try {
    const response = await api.delete(`/api/standups/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};
