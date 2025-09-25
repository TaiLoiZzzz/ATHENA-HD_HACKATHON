// Safe display utilities for avoiding runtime errors

export const safeGet = (obj: any, path: string, defaultValue: any = 'N/A') => {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    
    return result !== null && result !== undefined ? result : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

export const safeFormatCurrency = (amount: any, currency: string = 'VND') => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return 'N/A';
  }
  
  if (currency === 'SOV') {
    return `${numAmount.toFixed(2)} SOV`;
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numAmount);
};

export const safeFormatPercentage = (rate: any) => {
  const numRate = typeof rate === 'number' ? rate : parseFloat(rate);
  
  if (isNaN(numRate)) {
    return 'N/A';
  }
  
  return `${numRate}%`;
};

export const safeFormatRange = (min: any, max: any, formatter: (val: any) => string = (val) => val.toString()) => {
  const safeMin = min !== null && min !== undefined ? formatter(min) : 'N/A';
  const safeMax = max !== null && max !== undefined ? formatter(max) : 'N/A';
  
  if (safeMin === 'N/A' && safeMax === 'N/A') {
    return 'N/A';
  }
  
  return `${safeMin} - ${safeMax}`;
};

export const safeStringUpper = (str: any) => {
  if (typeof str === 'string') {
    return str.toUpperCase();
  }
  return 'N/A';
};


