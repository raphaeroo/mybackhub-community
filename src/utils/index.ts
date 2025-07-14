import { useCallback } from "react";

export const useQueryString = () => {
  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);
    return params.toString();
  }, []);

  return { createQueryString };
};
