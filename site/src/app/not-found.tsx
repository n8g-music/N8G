import Link from "next/link";
import CopperDivider from "@/components/ui/CopperDivider";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl text-copper-500/30 mb-6 block">◈</span>
        <h1 className="text-4xl font-sans text-copper-500 mb-4">404</h1>
        <CopperDivider className="w-16 mx-auto mb-6" />
        <p className="text-stone-400 mb-8">
          This room does not exist. The silence stretches into stone.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-copper-500/30 text-copper-500 hover:bg-copper-500/10 hover:border-copper-500/50 rounded-lg transition-all text-sm tracking-widest uppercase"
        >
          Return Home →
        </Link>
      </div>
    </section>
  );
}
