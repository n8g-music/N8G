"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PlaceholderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export default function Placeholder({
  title,
  subtitle,
  icon = "◇",
}: PlaceholderProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative surface-card p-8 md:p-12 text-center max-w-lg mx-auto overflow-hidden"
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Copper pulse border */}
      <div className="absolute inset-0 rounded-lg pointer-events-none">
        <div className="absolute inset-0 rounded-lg animate-pulse-copper" />
      </div>

      {/* Inner content */}
      <div className="relative z-10">
        <span className="text-4xl md:text-5xl text-copper-500/60 mb-6 block">
          {icon}
        </span>
        <h3 className="text-xl md:text-2xl font-sans text-copper-500 mb-3">
          {title}
        </h3>
        {subtitle && (
          <p className="text-stone-400 text-sm md:text-base">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
