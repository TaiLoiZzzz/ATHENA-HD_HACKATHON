import React, { useEffect, useState } from 'react';
import { StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import FlashMessage from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { SocketProvider } from './src/context/SocketContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import LoadingScreen from './src/components/LoadingScreen';
import { athenaTheme } from './src/theme/theme';
import { apiService } from './src/services/apiService';

const AppContent = () => {
  const { user, loading, login } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check for stored authentication token on app start
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Verify token is still valid
          const isValid = await apiService.verifyToken(token);
          if (isValid) {
            // Auto-login user
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              login(JSON.parse(userData), token);
            }
          } else {
            // Clear invalid token
            await AsyncStorage.multiRemove(['authToken', 'userData']);
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Clear potentially corrupted data
        await AsyncStorage.multiRemove(['authToken', 'userData']);
      } finally {
        setInitializing(false);
      }
    };

    checkAuthState();
  }, []);

  if (initializing || loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor={athenaTheme.colors.primary}
        translucent={false}
      />
      {user ? (
        <SocketProvider>
          <CartProvider>
            <MainNavigator />
          </CartProvider>
        </SocketProvider>
      ) : (
        <AuthNavigator />
      )}
      <FlashMessage position="top" />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <PaperProvider theme={athenaTheme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;

