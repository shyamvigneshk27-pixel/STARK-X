import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Mock User
        setUser({ id: 1, name: 'Alex Explorer', email: 'alex@traveloop.com' });
      } catch (err) {
        console.error('Error loading user', err);
        // Fallback for UI demo
        setUser({ id: 1, name: 'Alex Explorer', email: 'alex@traveloop.com' });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const register = async (name, email, password) => {
    // Mock registration for UI Template
    const mockToken = 'mock-jwt-token-123';
    const mockUser = { id: 1, name, email };
    localStorage.setItem('token', mockToken);
    setToken(mockToken);
    setUser(mockUser);
    return { success: true };
  };

  const login = async (email, password) => {
    // Mock login for UI Template
    const mockToken = 'mock-jwt-token-123';
    const mockUser = { id: 1, name: 'Alex Explorer', email };
    localStorage.setItem('token', mockToken);
    setToken(mockToken);
    setUser(mockUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
