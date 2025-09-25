import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { showMessage } from 'react-native-flash-message';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';

// Cart state shape
const initialState = {
  items: [],
  summary: {
    totalItems: 0,
    totalAmount: 0,
    estimatedTokens: 0,
    isAthenaPrime: false,
    currency: 'VND',
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

// Action types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        items: action.payload.items,
        summary: action.payload.summary,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      };

    case CART_ACTIONS.ADD_ITEM:
      const newItems = [...state.items, action.payload.item];
      return {
        ...state,
        items: newItems,
        summary: action.payload.summary,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      };

    case CART_ACTIONS.UPDATE_ITEM:
      const updatedItems = state.items.map(item =>
        item.id === action.payload.item.id ? action.payload.item : item
      );
      return {
        ...state,
        items: updatedItems,
        summary: action.payload.summary,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      };

    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => item.id !== action.payload.itemId);
      return {
        ...state,
        items: filteredItems,
        summary: action.payload.summary,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        summary: {
          totalItems: 0,
          totalAmount: 0,
          estimatedTokens: 0,
          isAthenaPrime: state.summary.isAthenaPrime,
          currency: 'VND',
        },
        loading: false,
        error: null,
        lastUpdated: new Date(),
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext(null);

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart data on mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated, user?.id]);

  // Load cart from server
  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const cartData = await apiService.getCart();
      
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: cartData,
      });
    } catch (error) {
      console.error('Failed to load cart:', error);
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to load cart',
      });
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(async (serviceType, serviceItemId, quantity, price, metadata = {}) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const itemData = {
        serviceType,
        serviceItemId,
        quantity,
        price,
        metadata,
      };

      const response = await apiService.addToCart(itemData);
      
      // Reload cart to get updated summary
      await loadCart();

      showMessage({
        message: 'Added to Cart',
        description: `${quantity} item(s) added to your cart`,
        type: 'success',
      });

      return { success: true, item: response.item };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to add item to cart',
      });

      showMessage({
        message: 'Add to Cart Failed',
        description: error.message || 'Failed to add item to cart',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, [loadCart]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.updateCartItem(itemId, quantity);
      
      // Reload cart to get updated summary
      await loadCart();

      return { success: true, item: response.item };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to update cart item',
      });

      showMessage({
        message: 'Update Failed',
        description: error.message || 'Failed to update cart item',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, [loadCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      await apiService.removeFromCart(itemId);
      
      // Reload cart to get updated summary
      await loadCart();

      showMessage({
        message: 'Item Removed',
        description: 'Item has been removed from your cart',
        type: 'info',
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to remove item from cart',
      });

      showMessage({
        message: 'Remove Failed',
        description: error.message || 'Failed to remove item from cart',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, [loadCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      await apiService.clearCart();
      
      dispatch({ type: CART_ACTIONS.CLEAR_CART });

      showMessage({
        message: 'Cart Cleared',
        description: 'All items have been removed from your cart',
        type: 'info',
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to clear cart',
      });

      showMessage({
        message: 'Clear Failed',
        description: error.message || 'Failed to clear cart',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, []);

  // Checkout cart
  const checkout = useCallback(async (checkoutData) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.checkout(checkoutData);
      
      // Clear cart after successful checkout
      dispatch({ type: CART_ACTIONS.CLEAR_CART });

      showMessage({
        message: 'Checkout Successful!',
        description: `You earned ${response.checkout.tokensEarned} SOV-Tokens`,
        type: 'success',
      });

      return { success: true, checkout: response.checkout };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.message || 'Checkout failed',
      });

      showMessage({
        message: 'Checkout Failed',
        description: error.message || 'Failed to complete checkout',
        type: 'danger',
      });

      return { success: false, error };
    }
  }, []);

  // Get cart item count
  const getItemCount = useCallback(() => {
    return state.summary.totalItems;
  }, [state.summary.totalItems]);

  // Get cart total amount
  const getTotalAmount = useCallback(() => {
    return state.summary.totalAmount;
  }, [state.summary.totalAmount]);

  // Get estimated tokens
  const getEstimatedTokens = useCallback(() => {
    return state.summary.estimatedTokens;
  }, [state.summary.estimatedTokens]);

  // Check if item is in cart
  const isItemInCart = useCallback((serviceType, serviceItemId) => {
    return state.items.some(
      item => item.serviceType === serviceType && item.serviceItemId === serviceItemId
    );
  }, [state.items]);

  // Get cart item by service details
  const getCartItem = useCallback((serviceType, serviceItemId) => {
    return state.items.find(
      item => item.serviceType === serviceType && item.serviceItemId === serviceItemId
    );
  }, [state.items]);

  // Get items by service type
  const getItemsByService = useCallback((serviceType) => {
    return state.items.filter(item => item.serviceType === serviceType);
  }, [state.items]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  }, []);

  // Refresh cart
  const refreshCart = useCallback(() => {
    return loadCart();
  }, [loadCart]);

  // Context value
  const value = {
    // State
    items: state.items,
    summary: state.summary,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart,
    clearError,

    // Utilities
    getItemCount,
    getTotalAmount,
    getEstimatedTokens,
    isItemInCart,
    getCartItem,
    getItemsByService,

    // Computed values
    isEmpty: state.items.length === 0,
    hasItems: state.items.length > 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

// Export context for testing purposes
export { CartContext };

