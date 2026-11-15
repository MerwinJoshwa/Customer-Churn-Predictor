import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(authService.getCurrentUser());
      setIsAuthenticated(authService.isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (name: string, email: string, password: string, role: string = 'ANALYST') => {
    const data = await authService.register(name, email, password, role);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout
  };
}
