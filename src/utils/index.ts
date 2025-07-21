import { LexicalEditor } from "lexical";
import { createRef, useCallback } from "react";

export const getCategoryImagePathByCategoryName = (categoryName: string) => {
  switch (categoryName) {
    case "Scoliosis":
      return "/scoliosis-pic.png";
    case "Osteoporosis / Osteopenia":
      return "/osteoporosis-pic.png";
    case "Pain Relief":
      return "/pain-relief-pic.png";
    case "Stenosis":
      return "/stenosis-pic.png";
    case "Posture & Kyphosis":
      return "/posture-pic.png";
    case "Aging":
      return "/aging-pic.png";
    case "Surgery":
      return "/surgery-pic.png";
    case "Other Back Questions":
      return "/back-question-pic.png";
    default:
      return "/placeholder-image.png"; // Fallback image
  }
};

export const useQueryString = () => {
  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);
    return params.toString();
  }, []);

  return { createQueryString };
};

export const editorRef = createRef<LexicalEditor | null>();
