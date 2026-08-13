import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Organization, AuthResponse } from '../types/crm';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    setUser(null);
    setOrganization(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');
      const savedOrg = localStorage.getItem('organization');

      if (!token || !savedUser) {
        // No token — not authenticated
        setIsLoading(false);
        return;
      }

      // Optimistically restore state from localStorage for fast first paint
      try {
        const parsedUser = JSON.parse(savedUser);
        const parsedOrg = savedOrg ? JSON.parse(savedOrg) : null;
        setUser(parsedUser);
        setOrganization(parsedOrg);
      } catch {
        clearAuth();
        setIsLoading(false);
        return;
      }

      // Then verify the token is still valid against the server
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user || res.data);
        if (res.data.organization) {
          setOrganization(res.data.organization);
          localStorage.setItem('organization', JSON.stringify(res.data.organization));
        }
      } catch (err: any) {
        // If token is invalid (401), try refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const { default: axios } = await import('axios');
            const refreshRes = await axios.post('/api/v1/auth/refresh', { refreshToken });
            localStorage.setItem('accessToken', refreshRes.data.accessToken);
            localStorage.setItem('refreshToken', refreshRes.data.refreshToken);
            setUser(refreshRes.data.user);
            setOrganization(refreshRes.data.organization);
            localStorage.setItem('user', JSON.stringify(refreshRes.data.user));
            localStorage.setItem('organization', JSON.stringify(refreshRes.data.organization));
          } catch {
            // Refresh failed — clear everything and force re-login
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clearAuth]);

  const login = (authData: AuthResponse) => {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    localStorage.setItem('organization', JSON.stringify(authData.organization));
    setUser(authData.user);
    setOrganization(authData.organization);
  };

  const logout = useCallback(() => {
    clearAuth();
    window.location.href = '/login';
  }, [clearAuth]);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
