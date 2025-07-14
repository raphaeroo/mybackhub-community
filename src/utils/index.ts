import { LexicalEditor } from "lexical";
import { createRef, useCallback } from "react";

export const useQueryString = () => {
  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);
    return params.toString();
  }, []);

  return { createQueryString };
};

export const editorRef = createRef<LexicalEditor | null>();