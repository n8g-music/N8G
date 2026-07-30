import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = {
  title: "Journal",
  description: "Chronicles from the N8G collective. Process, signal, unfolding.",
};

export default function JournalPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <SectionHeading
        title="Journal"
        subtitle="Chronicles of process. The work as it is shaped."
      />
      <Placeholder
        title="Chronicles unfolding."
        subtitle="Entries are being composed. The ink is still wet."
        icon="☲"
      />
    </section>
  );
}
