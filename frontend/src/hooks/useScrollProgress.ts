import { useRef } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";

export const useScrollProgress = (
  offset: [string, string] = ["start end", "end start"]
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any,
  });
  return { ref, scrollYProgress };
};

export const useParallax = (
  scrollYProgress: MotionValue<number>,
  range: [number, number]
) => {
  return useTransform(scrollYProgress, [0, 1], range);
};
