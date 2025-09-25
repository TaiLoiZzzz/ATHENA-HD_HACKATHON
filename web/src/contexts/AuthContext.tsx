'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { apiService, User } from '@/lib/api';
import { sovTokenService } from '@/services/sovTokenService';

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        isAuthenticated: true,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case 'LOGOUT':
      return {
        ...initialState,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  register: (userData: any) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<{ success: boolean }>;
  updateProfile: (profileData: any) => Promise<{ success: boolean; error?: any }>;
  upgradeToAthenaPrime: () => Promise<{ success: boolean; error?: any }>;
  refreshUser: () => Promise<{ success: boolean; error?: any }>;
  clearError: () => void;

  // Utilities
  hasAthenaPrime: () => boolean;
  isVerified: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from cookies
  useEffect(() => {
    const initializeAuth = () => {
      const token = Cookies.get('authToken');
      const userData = Cookies.get('userData');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          Cookies.remove('authToken');
          Cookies.remove('userData');
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiService.login(email, password);
      const { user, token } = response;

      // Initialize SOV wallet for user if not exists
      const existingWallet = sovTokenService.getWallet();
      if (existingWallet.balance === 0) {
        sovTokenService.initializeWallet(user.id);
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.fullName}!`);

      return { success: true };
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Login failed',
      });

      toast.error(error.message || 'Login failed');

      return { success: false, error };
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiService.register(userData);
      const { user, token } = response;

      // Initialize SOV wallet for new user
      sovTokenService.initializeWallet(user.id);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome to ATHENA, ${user.fullName}! You received welcome SOV tokens!`);

      return { success: true };
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Registration failed',
      });

      toast.error(error.message || 'Registration failed');

      return { success: false, error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await apiService.logout();
      
      dispatch({ type: 'LOGOUT' });

      toast.success('Logged out successfully');

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if API call fails
      dispatch({ type: 'LOGOUT' });
      
      return { success: true };
    }
  };

  // Update user profile
  const updateProfile = async (profileData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiService.updateUserProfile(profileData);
      
      // Update user data in context
      dispatch({
        type: 'UPDATE_USER',
        payload: response.user,
      });

      // Update stored user data
      const updatedUserData = { ...state.user, ...response.user };
      Cookies.set('userData', JSON.stringify(updatedUserData), { expires: 7 });

      toast.success('Profile updated successfully');

      dispatch({ type: 'SET_LOADING', payload: false });

      return { success: true };
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });

      toast.error(error.message || 'Failed to update profile');

      return { success: false, error };
    }
  };

  // Upgrade to ATHENA Prime
  const upgradeToAthenaPrime = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiService.upgradeToAthenaPrime();
      
      // Update user's ATHENA Prime status
      dispatch({
        type: 'UPDATE_USER',
        payload: { athenaPrime: true },
      });

      // Update stored user data
      const updatedUserData = { ...state.user, athenaPrime: true };
      Cookies.set('userData', JSON.stringify(updatedUserData), { expires: 7 });

      toast.success('ATHENA Prime activated! Enjoy 1.5x token earning rate!');

      dispatch({ type: 'SET_LOADING', payload: false });

      return { success: true, benefits: response.benefits };
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });

      toast.error(error.message || 'Failed to upgrade to ATHENA Prime');

      return { success: false, error };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await apiService.getUserProfile();
      
      dispatch({
        type: 'UPDATE_USER',
        payload: response.user,
      });

      // Update stored user data
      Cookies.set('userData', JSON.stringify(response.user), { expires: 7 });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      return { success: false, error };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if user has ATHENA Prime
  const hasAthenaPrime = () => {
    return state.user?.athenaPrime || false;
  };

  // Check if user is verified
  const isVerified = () => {
    return state.user?.isVerified || false;
  };

  // Context value
  const value: AuthContextType = {
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.user?.isAdmin || state.user?.role === 'admin' || state.user?.email === 'admin@sovico.com' || false,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    upgradeToAthenaPrime,
    refreshUser,
    clearError,

    // Utilities
    hasAthenaPrime,
    isVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

