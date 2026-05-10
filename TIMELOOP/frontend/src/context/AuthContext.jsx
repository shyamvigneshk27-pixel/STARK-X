import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await usersAPI.getMe();
      if (data.success) {
        const u = data.data;
        setUser({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          city: u.city,
          country: u.country,
          bio: u.bio,
          avatarUrl: u.avatarUrl,
          role: u.role,
          tripCount: u._count?.trips || 0,
          createdAt: u.createdAt,
        });
      }
    } catch (err) {
      console.error('Session expired or invalid', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const register = async (firstName, lastName, email, password) => {
    try {
      const { data } = await authAPI.register({ firstName, lastName, email, password });
      if (data.success) {
        localStorage.setItem('token', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setToken(data.data.accessToken);
        const u = data.data.user;
        setUser({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          avatarUrl: u.avatarUrl,
          role: u.role,
        });
        return { success: true };
      }
      return { success: false, msg: data.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, msg: err.response?.data?.message || 'Registration failed. Please try again.' };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('token', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setToken(data.data.accessToken);
        const u = data.data.user;
        setUser({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          city: u.city,
          country: u.country,
          bio: u.bio,
          avatarUrl: u.avatarUrl,
          role: u.role,
        });
        return { success: true };
      }
      return { success: false, msg: data.message || 'Login failed.' };
    } catch (err) {
      return { success: false, msg: err.response?.data?.message || 'Invalid email or password.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
