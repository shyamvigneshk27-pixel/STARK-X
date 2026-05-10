import apiClient from './client';
import { Activity, Stop } from '../types';

export async function createActivity(data: Partial<Activity>): Promise<Activity> {
  const res = await apiClient.post<Activity>('/api/activities', data);
  return res.data;
}

export async function deleteActivity(id: string): Promise<void> {
  await apiClient.delete(`/api/activities/${id}`);
}

export async function createStop(data: Partial<Stop>): Promise<Stop> {
  const res = await apiClient.post<Stop>('/api/stops', data);
  return res.data;
}

export async function deleteStop(id: string): Promise<void> {
  await apiClient.delete(`/api/stops/${id}`);
}

export async function searchCities(query: string) {
  return apiClient.get(`/api/cities?q=${encodeURIComponent(query)}`);
}
