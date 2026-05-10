import apiClient from './client';
import { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  return res.data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/register', { name, email, password });
  return res.data;
}
