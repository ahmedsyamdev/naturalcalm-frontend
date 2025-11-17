/**
 * Auth Context
 * Manages authentication state and provides auth methods to the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';
import { AdminUser } from '@/types/admin';
import { LoginData, RegisterData } from '@/types/auth';
import AuthService from '@/lib/api/services/AuthService';
import { getAuthToken, clearTokens, setRememberMe, getRememberMe } from '@/lib/api/tokens';
import { FavoritesService } from '@/lib/api/services/FavoritesService';

const USER_DATA_KEY = 'userData';

/**
 * Gets the appropriate storage for user data based on Remember Me preference
 */
function getUserStorage(): Storage {
  return getRememberMe() ? localStorage : sessionStorage;
}

interface AuthContextType {
  user: (User & Partial<AdminUser>) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<(User & Partial<AdminUser>) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check both storages for user data
      const storedUser = sessionStorage.getItem(USER_DATA_KEY) || localStorage.getItem(USER_DATA_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }

      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);

      // Save to appropriate storage based on Remember Me preference
      const storage = getUserStorage();
      storage.setItem(USER_DATA_KEY, JSON.stringify(currentUser));
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      clearTokens();
      localStorage.removeItem(USER_DATA_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    // Set Remember Me preference BEFORE calling AuthService
    // This ensures tokens are saved to the correct storage
    setRememberMe(data.rememberMe || false);

    const response = await AuthService.login(data);
    setUser(response.user);
    setIsAuthenticated(true);

    // Save user data to appropriate storage based on Remember Me preference
    const storage = getUserStorage();
    storage.setItem(USER_DATA_KEY, JSON.stringify(response.user));

    // Prefetch favorites after successful login
    queryClient.prefetchQuery({
      queryKey: ['favorites', 'tracks'],
      queryFn: () => FavoritesService.getFavoriteTracks(),
    });
    queryClient.prefetchQuery({
      queryKey: ['favorites', 'programs'],
      queryFn: () => FavoritesService.getFavoritePrograms(),
    });
  };

  const register = async (data: RegisterData) => {
    // For registration, default to Remember Me = false (require explicit login with Remember Me)
    setRememberMe(false);

    const response = await AuthService.register(data);
    setUser(response.user);
    setIsAuthenticated(true);

    // Save to sessionStorage for new registrations
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      // Clear user data from both storages
      localStorage.removeItem(USER_DATA_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
      setUser(null);
      setIsAuthenticated(false);

      // Clear favorites cache on logout
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.removeQueries({ queryKey: ['favorites'] });
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update in the appropriate storage based on Remember Me preference
    const storage = getUserStorage();
    storage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      // Save to appropriate storage based on Remember Me preference
      const storage = getUserStorage();
      storage.setItem(USER_DATA_KEY, JSON.stringify(currentUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
