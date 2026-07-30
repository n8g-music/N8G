"use client";

import { motion } from "framer-motion";

interface CopperDividerProps {
  className?: string;
  animate?: boolean;
}

export default function CopperDivider({ className = "", animate = false }: CopperDividerProps) {
  const Comp = animate ? motion.hr : "hr";

  return (
    <Comp
      className={`border-0 h-px bg-gradient-to-r from-transparent via-copper-500/50 to-transparent ${className}`}
      {...(animate
        ? {
            initial: { scaleX: 0, opacity: 0 },
            animate: { scaleX: 1, opacity: 1 },
            transition: { duration: 0.8, ease: "easeOut" },
            style: { transformOrigin: "center" },
          }
        : {})}
    />
  );
}
