import { useCallback, useEffect, useState } from 'react';


/**
 * @deprecated it’s recommended to use the `use-debounce` NPM package instead.
 */
export function useDebounce<T>(value: T, wait: number): T {
  let [debouncedValue, setDebouncedValue] = useState(value);
  const setDebounced = useCallback(() => setDebouncedValue(value), [value]);

  useEffect(() => {
    let timeout = setTimeout(setDebounced, wait);
    return () => clearTimeout(timeout);
  }, [value, wait]);

  return debouncedValue;
}


export default useDebounce;
