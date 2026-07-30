import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = {
  title: "Characters",
  description: "The masked architects of N8G.",
};

export default function CharactersPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <SectionHeading
        title="Characters"
        subtitle="The three architects. Masked. Anonymous. Essential."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Placeholder title="The First" subtitle="Identity withheld." icon="◉" />
        <Placeholder title="The Second" subtitle="Identity withheld." icon="◉" />
        <Placeholder title="The Third" subtitle="Identity withheld." icon="◉" />
      </div>
    </section>
  );
}
