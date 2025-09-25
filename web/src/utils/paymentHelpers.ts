// Payment utility functions and error handlers
import toast from 'react-hot-toast';

// Safe API call wrapper
export const safeApiCall = async <T>(
  apiCall: () => Promise<Response>,
  errorMessage = 'Có lỗi xảy ra'
): Promise<T | null> => {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const errorData = await response.text();
      let errorMsg = errorMessage;
      
      try {
        const parsed = JSON.parse(errorData);
        errorMsg = parsed.error || parsed.message || errorMessage;
      } catch {
        // If can't parse JSON, use response status text
        errorMsg = response.statusText || errorMessage;
      }
      
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    return data as T;
  } catch (error: any) {
    console.error('API Call Error:', error);
    toast.error(error.message || errorMessage);
    return null;
  }
};

// Get auth token safely
export const getAuthToken = (): string | null => {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
    
    return token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Safe number formatting
export const formatCurrency = (amount: number | undefined | null): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ₫';
  }
  
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount.toLocaleString()} ₫`;
  }
};

// Safe token formatting
export const formatTokens = (amount: number | undefined | null): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  
  try {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting tokens:', error);
    return amount.toFixed(2);
  }
};

// Validate payment data
export const validatePaymentData = (data: any): boolean => {
  if (!data) return false;
  
  const required = ['serviceType', 'baseAmountVnd', 'tokenAmount', 'description'];
  return required.every(field => data[field] !== undefined && data[field] !== null);
};

// Safe payment preview fetch
export const fetchPaymentPreview = async (paymentData: {
  serviceType: string;
  baseAmountVnd: number;
  tokenAmount: number;
  description: string;
}) => {
  if (!validatePaymentData(paymentData)) {
    toast.error('Dữ liệu thanh toán không hợp lệ');
    return null;
  }
  
  const token = getAuthToken();
  if (!token) {
    toast.error('Vui lòng đăng nhập lại');
    return null;
  }
  
  return safeApiCall(
    () => fetch('/api/enhanced-payments/preview', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    }),
    'Không thể tải thông tin thanh toán'
  );
};

// Safe payment processing
export const processPayment = async (paymentData: {
  serviceType: string;
  baseAmountVnd: number;
  tokenAmount: number;
  description: string;
  serviceReferenceId?: string;
}) => {
  if (!validatePaymentData(paymentData)) {
    toast.error('Dữ liệu thanh toán không hợp lệ');
    return null;
  }
  
  const token = getAuthToken();
  if (!token) {
    toast.error('Vui lòng đăng nhập lại');
    return null;
  }
  
  return safeApiCall(
    () => fetch('/api/enhanced-payments/pay', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    }),
    'Thanh toán thất bại'
  );
};

// Payment status helpers
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'text-green-600';
    case 'pending': return 'text-yellow-600';
    case 'failed': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'completed': return 'Hoàn thành';
    case 'pending': return 'Đang xử lý';
    case 'failed': return 'Thất bại';
    default: return 'Không xác định';
  }
};

// Safe array operations
export const safeSlice = <T>(array: T[] | undefined | null, start = 0, end?: number): T[] => {
  if (!Array.isArray(array)) return [];
  try {
    return array.slice(start, end);
  } catch (error) {
    console.error('Error slicing array:', error);
    return [];
  }
};

// Safe object property access
export const safeGet = (obj: any, path: string, defaultValue: any = null): any => {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  } catch (error) {
    console.error('Error accessing object property:', error);
    return defaultValue;
  }
};

// Debounce function for API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Payment amount validation
export const isValidAmount = (amount: any): boolean => {
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         isFinite(amount) && 
         amount > 0;
};

// Service type validation
export const isValidServiceType = (serviceType: any): boolean => {
  const validTypes = ['vietjet', 'hdbank', 'resort', 'insurance', 'cart'];
  return typeof serviceType === 'string' && validTypes.includes(serviceType);
};


