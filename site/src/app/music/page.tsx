import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = {
  title: "Music",
  description: "Sonic environments from the N8G collective.",
};

export default function MusicPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <SectionHeading
        title="Music"
        subtitle="Sonic environments. Compositions that breathe."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Placeholder
          title="Releases in preparation."
          subtitle="Each composition is shaped by hand — copper, clay, breath."
          icon="♪"
        />
      </div>
    </section>
  );
}
