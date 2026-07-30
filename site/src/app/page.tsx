import Link from "next/link";
import CopperDivider from "@/components/ui/CopperDivider";
import SectionHeading from "@/components/ui/SectionHeading";

const sectionCards = [
  {
    title: "Music",
    href: "/music",
    description: "Sonic environments. Compositions that breathe.",
    symbol: "♪",
  },
  {
    title: "Gallery",
    href: "/gallery",
    description: "Visual worlds. Frames from the anonymous.",
    symbol: "◈",
  },
  {
    title: "Journal",
    href: "/journal",
    description: "Chronicles. Process. The work as it is shaped.",
    symbol: "☲",
  },
  {
    title: "Characters",
    href: "/characters",
    description: "The three masked architects of N8G.",
    symbol: "◉",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/50 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(184,115,51,0.08)_0%,_transparent_70%)]" />

        {/* Three.js placeholder */}
        <div
          id="hero-scene"
          className="absolute inset-0 opacity-30"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 px-4 max-w-4xl mx-auto">
          <div className="max-w-2xl text-left">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-sans font-light text-copper-500 tracking-[0.05em] mb-6 animate-fade-in">
              N8G
            </h1>
            <CopperDivider className="w-32 mb-6" animate />
            <p className="text-xl md:text-2xl text-stone-400 font-light tracking-wide mb-8 animate-slide-up">
              Anonymous Audiovisual Collective
            </p>
            <p className="text-base md:text-lg text-stone-500 leading-relaxed animate-fade-in">
              Music is not entertainment. Music is an environment. We work in the
              shadows, speaking through sound and image. N8G transmits from
              Johannesburg — a city built on gold and held together by the sound
              of it.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-copper-500/40 text-2xl">↓</span>
        </div>
      </section>

      {/* Section Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <SectionHeading
          title="The Work"
          subtitle="Each piece carries its own weight. Copper, stone, light, and air."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {sectionCards.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className="group surface-card p-8 md:p-10 hover:border-copper-500/30 transition-all duration-300 hover:bg-charcoal-900/50"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-3xl text-copper-500/40 mb-4 block group-hover:text-copper-500 transition-colors">
                {card.symbol}
              </span>
              <h3 className="text-2xl font-sans text-text-primary mb-3 group-hover:text-copper-500 transition-colors">
                {card.title}
              </h3>
              <p className="text-stone-400 group-hover:text-stone-300 transition-colors">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Manifesto excerpt */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <blockquote className="border-l-2 border-copper-500/40 pl-6 text-left">
          <p className="text-lg md:text-xl text-stone-400 italic leading-relaxed">
            &ldquo;We do not seek attention. We do not perform identity. The
            work speaks. The masks remain. What matters is the copper in the
            earth and the air between the notes — and whether you can feel it.&rdquo;
          </p>
        </blockquote>
        <Link
          href="/manifesto"
          className="inline-block mt-8 text-copper-500 hover:text-copper-400 text-sm tracking-widest uppercase transition-colors"
        >
          Read the Manifesto →
        </Link>
      </section>
    </>
  );
}
