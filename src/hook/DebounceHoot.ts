import { useEffect, useState } from "react";

export function useDebounce(value: any, delay: any) {
  const [debounceVal, setDebounceVal] = useState();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceVal(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debounceVal;
}
