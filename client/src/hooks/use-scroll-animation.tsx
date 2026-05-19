import { useRef } from "react";

// Scroll animation disabled for performance — returns a plain ref with no side-effects.
export function useScrollAnimation() {
  const elementRef = useRef<HTMLDivElement>(null);
  return elementRef;
}
