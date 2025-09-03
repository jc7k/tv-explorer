import { useState } from 'react';

/**
 * Hook for persisting state to localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook for caching API responses in localStorage with expiration
 */
export function useCachedValue<T>(
  key: string,
  expirationMinutes: number = 30
): {
  getCachedValue: () => T | null;
  setCachedValue: (value: T) => void;
  clearCache: () => void;
} {
  const getCachedValue = (): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;

      const { data, timestamp } = JSON.parse(item);
      const now = Date.now();
      const expirationTime = timestamp + (expirationMinutes * 60 * 1000);

      if (now > expirationTime) {
        window.localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn(`Error reading cached value for key "${key}":`, error);
      return null;
    }
  };

  const setCachedValue = (value: T): void => {
    try {
      const item = {
        data: value,
        timestamp: Date.now(),
      };
      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn(`Error caching value for key "${key}":`, error);
    }
  };

  const clearCache = (): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error clearing cache for key "${key}":`, error);
    }
  };

  return {
    getCachedValue,
    setCachedValue,
    clearCache,
  };
}