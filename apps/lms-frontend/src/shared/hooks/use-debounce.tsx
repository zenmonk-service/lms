import { useEffect, useState } from "react";

export function useDebounce<T>(value: string, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const trimmed = value.trim();

    if(trimmed === "") return setDebouncedValue("");

    const timer = setTimeout(() => {
      setDebouncedValue(trimmed);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}