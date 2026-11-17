'use client';

import { useCallback, useState } from 'react';

type UseLocalStorageOptions<TValue> = {
  serialize?: (value: TValue) => string;
  deserialize?: (value: string) => TValue;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function useLocalStorage<TValue>(
  key: string,
  initialValue: TValue,
  options?: UseLocalStorageOptions<TValue>,
) {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? ((value: string) => JSON.parse(value) as TValue);

  const [storedValue, setStoredValue] = useState<TValue>(() => {
    if (!isBrowser()) {
      return initialValue;
    }

    try {
      const rawValue = window.localStorage.getItem(key);
      return rawValue === null ? initialValue : deserialize(rawValue);
    } catch {
      return initialValue;
    }
  });

  const updateValue = useCallback(
    (value: TValue | ((currentValue: TValue) => TValue)) => {
      setStoredValue((currentValue) => {
        const nextValue = value instanceof Function ? value(currentValue) : value;

        if (isBrowser()) {
          try {
            window.localStorage.setItem(key, serialize(nextValue));
          } catch {
            // Ignore persistence errors and keep in-memory state in sync.
          }
        }

        return nextValue;
      });
    },
    [key, serialize],
  );

  const removeValue = useCallback(() => {
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore persistence errors and reset local state anyway.
      }
    }

    setStoredValue(initialValue);
  }, [initialValue, key]);

  return [storedValue, updateValue, removeValue] as const;
}
