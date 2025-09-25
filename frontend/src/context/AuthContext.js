import React, { createContext, useContext, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { apiService } from '../services/apiService';

// Auth state shape
const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        isAuthenticated: true,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = useCallback(async (emailOrUserData, passwordOrToken = null) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      let user, token;

      if (typeof emailOrUserData === 'string' && passwordOrToken) {
        // Email/password login
        const response = await apiService.login(emailOrUserData, passwordOrToken);
        user = response.user;
        token = response.token;
      } else {
        // Direct user data and token (for auto-login)
        user = emailOrUserData;
        token = passwordOrToken;
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      showMessage({
        message: 'Welcome to ATHENA!',
        description: `Hello ${user.fullName}`,
        type: 'success',
      });

      return { success: true, user, token };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Login failed',
      });

      showMessage({
        message: 'Login Failed',
        description: error.message || 'Please check your credentials',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.register(userData);
      const { user, token } = response;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      showMessage({
        message: 'Registration Successful!',
        description: `Welcome to ATHENA, ${user.fullName}!`,
        type: 'success',
      });

      return { success: true, user, token };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Registration failed',
      });

      showMessage({
        message: 'Registration Failed',
        description: error.message || 'Please try again',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      await apiService.logout();
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      showMessage({
        message: 'Logged Out',
        description: 'You have been successfully logged out',
        type: 'info',
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if API call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      return { success: true };
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.updateUserProfile(profileData);
      
      // Update user data in context
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user,
      });

      // Update stored user data
      const updatedUserData = { ...state.user, ...response.user };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      showMessage({
        message: 'Profile Updated',
        description: 'Your profile has been updated successfully',
        type: 'success',
      });

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      return { success: true, user: response.user };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      showMessage({
        message: 'Update Failed',
        description: error.message || 'Failed to update profile',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, [state.user]);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      await apiService.changePassword(currentPassword, newPassword);

      showMessage({
        message: 'Password Changed',
        description: 'Your password has been updated successfully',
        type: 'success',
      });

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      showMessage({
        message: 'Password Change Failed',
        description: error.message || 'Failed to change password',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, []);

  // Upgrade to ATHENA Prime
  const upgradeToAthenaPrime = useCallback(async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.upgradeToAthenaPrime();
      
      // Update user's ATHENA Prime status
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { athenaPrime: true },
      });

      // Update stored user data
      const updatedUserData = { ...state.user, athenaPrime: true };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      showMessage({
        message: 'ATHENA Prime Activated!',
        description: 'You now enjoy 1.5x token earning rate and premium benefits',
        type: 'success',
      });

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      return { success: true, benefits: response.benefits };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      showMessage({
        message: 'Upgrade Failed',
        description: error.message || 'Failed to upgrade to ATHENA Prime',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, [state.user]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await apiService.getUserProfile();
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user,
      });

      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));

      return { success: true, user: response.user };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return { success: false, error };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has specific permission or status
  const hasAthenaPrime = useCallback(() => {
    return state.user?.athenaPrime || false;
  }, [state.user]);

  const isVerified = useCallback(() => {
    return state.user?.isVerified || false;
  }, [state.user]);

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
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

// Export context for testing purposes
export { AuthContext };
