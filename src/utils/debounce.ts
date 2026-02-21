import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom hook to debounce a function
 * 
 * Debouncing is useful when you have a function that gets called very frequently
 * (like on every keystroke) but you only want it to actually execute after the user stops.
 * 
 * For example: User types "John D" quickly. Instead of filtering 5 times (after each keystroke),
 * we wait 300ms after they stop typing and filter once with "John D".
 * 
 * @param callback Function to debounce
 * @param delay Delay in milliseconds before executing the callback
 * @returns Debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Custom hook to debounce a value
 * 
 * This version is useful when you want to debounce a state value rather than a function.
 * The hook returns a debounced version of the value that only updates after a delay.
 * 
 * Example: As the user types in a search field, the search input updates immediately,
 * but the actual API call happens 300ms after they stop typing.
 * 
 * @param value Value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
