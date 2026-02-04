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
import { getAuthToken, clearTokens } from '@/lib/api/tokens';
import { FavoritesService } from '@/lib/api/services/FavoritesService';

const USER_DATA_KEY = 'userData';

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

      // Check localStorage for user data
      const storedUser = localStorage.getItem(USER_DATA_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsLoading(false);

        // Try to refresh user data in the background (don't logout on failure)
        try {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentUser));
        } catch (refreshError) {
          console.warn('Failed to refresh user data:', refreshError);
          // Don't logout - keep using cached user data
        }
        return;
      }

      // No stored user - must fetch from API
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentUser));
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      clearTokens();
      localStorage.removeItem(USER_DATA_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    const response = await AuthService.login(data);
    setUser(response.user);
    setIsAuthenticated(true);

    // Save to localStorage for WebView persistence
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));

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
    const response = await AuthService.register(data);
    setUser(response.user);
    setIsAuthenticated(true);

    // Save to localStorage for WebView persistence
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      localStorage.removeItem(USER_DATA_KEY);
      setUser(null);
      setIsAuthenticated(false);

      // Clear favorites cache on logout
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.removeQueries({ queryKey: ['favorites'] });
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Save to localStorage for WebView persistence
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      // Save to localStorage for WebView persistence
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentUser));
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
