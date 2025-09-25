import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import io from 'socket.io-client';
import { showMessage } from 'react-native-flash-message';
import { useAuth } from './AuthContext';

// Socket configuration
const SOCKET_URL = __DEV__ 
  ? 'http://localhost:3000' // Development
  : 'https://your-production-api.com'; // Production

// Create context
const SocketContext = createContext(null);

// Socket provider component
export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user?.id]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && isAuthenticated && user?.id) {
        // App became active, reconnect if needed
        if (!socketRef.current || !socketRef.current.connected) {
          connectSocket();
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background, keep connection but reduce activity
        // In a production app, you might want to disconnect here to save battery
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, [isAuthenticated, user?.id]);

  const connectSocket = () => {
    try {
      // Don't create multiple connections
      if (socketRef.current && socketRef.current.connected) {
        return;
      }

      console.log('Connecting to socket server...');

      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
      });

      // Connection event handlers
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        setIsConnected(true);
        setConnectionError(null);

        // Join user-specific room
        if (user?.id) {
          socketRef.current.emit('join_user_room', user.id);
        }

        // Clear any reconnection timeouts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        
        // Don't show error for intentional disconnections
        if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
          setConnectionError(`Connection lost: ${reason}`);
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        setConnectionError(`Connection failed: ${error.message}`);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setConnectionError(null);
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setConnectionError('Failed to reconnect to server');
      });

      // Real-time event handlers
      setupEventHandlers();

    } catch (error) {
      console.error('Error creating socket connection:', error);
      setConnectionError(`Failed to create connection: ${error.message}`);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      console.log('Disconnecting socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionError(null);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const setupEventHandlers = () => {
    if (!socketRef.current) return;

    // Token earning notifications
    socketRef.current.on('tokens_earned', (data) => {
      showMessage({
        message: 'Tokens Earned! 🎉',
        description: `You earned ${data.amount} SOV-Tokens from ${data.serviceType}`,
        type: 'success',
        duration: 4000,
        icon: 'success',
      });
    });

    // Token redemption notifications
    socketRef.current.on('tokens_redeemed', (data) => {
      showMessage({
        message: 'Tokens Redeemed',
        description: `${data.amount} SOV-Tokens redeemed for ${data.redeemType}`,
        type: 'info',
        duration: 3000,
      });
    });

    // Marketplace notifications
    socketRef.current.on('new_marketplace_order', (data) => {
      // Only show if it's not the current user's order
      if (data.userId !== user?.id) {
        showMessage({
          message: 'New Marketplace Order',
          description: `${data.orderType.toUpperCase()}: ${data.amount} tokens at ${data.pricePerToken} VND`,
          type: 'info',
          duration: 2000,
        });
      }
    });

    socketRef.current.on('marketplace_trade_executed', (data) => {
      showMessage({
        message: 'Trade Executed! 📈',
        description: `${data.amount} tokens traded at ${data.pricePerToken} VND`,
        type: 'success',
        duration: 3000,
      });
    });

    socketRef.current.on('order_cancelled', (data) => {
      if (data.userId === user?.id) {
        showMessage({
          message: 'Order Cancelled',
          description: 'Your marketplace order has been cancelled',
          type: 'info',
          duration: 2000,
        });
      }
    });

    // Checkout notifications
    socketRef.current.on('checkout_completed', (data) => {
      showMessage({
        message: 'Checkout Complete! 🛒',
        description: `Paid ${data.totalAmount.toLocaleString()} VND, earned ${data.tokensEarned} tokens`,
        type: 'success',
        duration: 4000,
      });
    });

    // ATHENA Prime notifications
    socketRef.current.on('prime_upgrade', (data) => {
      showMessage({
        message: 'ATHENA Prime Activated! ⭐',
        description: 'You now enjoy 1.5x token earning rate!',
        type: 'success',
        duration: 5000,
      });
    });

    // System notifications
    socketRef.current.on('system_notification', (data) => {
      showMessage({
        message: data.title || 'System Notification',
        description: data.message,
        type: data.type || 'info',
        duration: data.duration || 3000,
      });
    });

    // Maintenance notifications
    socketRef.current.on('maintenance_notice', (data) => {
      showMessage({
        message: 'Maintenance Notice',
        description: data.message,
        type: 'warning',
        duration: 5000,
      });
    });

    // Error notifications
    socketRef.current.on('error_notification', (data) => {
      showMessage({
        message: 'Error',
        description: data.message,
        type: 'danger',
        duration: 4000,
      });
    });
  };

  // Emit events
  const emit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
      return true;
    } else {
      console.warn(`Cannot emit ${event}: socket not connected`);
      return false;
    }
  };

  // Subscribe to custom events
  const on = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      
      // Return unsubscribe function
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, handler);
        }
      };
    }
    return () => {};
  };

  // Unsubscribe from events
  const off = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  };

  // Manually reconnect
  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    // Reconnect after a short delay
    reconnectTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && user?.id) {
        connectSocket();
      }
    }, 1000);
  };

  // Get connection status
  const getConnectionStatus = () => {
    return {
      isConnected,
      error: connectionError,
      socketId: socketRef.current?.id || null,
    };
  };

  // Context value
  const value = {
    isConnected,
    connectionError,
    emit,
    on,
    off,
    reconnect,
    getConnectionStatus,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

// Export context for testing purposes
export { SocketContext };

