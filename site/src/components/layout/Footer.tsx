"use client";

import Link from "next/link";
import CopperDivider from "@/components/ui/CopperDivider";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-24 md:mt-32 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CopperDivider className="mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-copper-500 font-sans font-light text-lg tracking-widest hover:text-copper-400 transition-colors"
            >
              N8G
            </Link>
            <span className="text-charcoal-500">·</span>
            <span className="text-stone-500 text-sm">
              Anonymous Audiovisual Collective
            </span>
          </div>

          {/* Center — symbol */}
          <span className="text-copper-500/40 text-2xl" aria-hidden="true">
            ◈
          </span>

          {/* Right */}
          <div className="flex items-center gap-6">
            <span className="text-stone-600 text-sm">
              &copy; {new Date().getFullYear()} N8G
            </span>
            <button
              onClick={scrollToTop}
              className="text-stone-500 hover:text-copper-400 transition-colors text-sm"
              aria-label="Back to top"
            >
              ↑ Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
