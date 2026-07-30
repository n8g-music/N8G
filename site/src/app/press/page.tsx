import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = {
  title: "Press",
  description: "Press kit and media resources for N8G.",
};

export default function PressPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <SectionHeading
        title="Press"
        subtitle="For journalists, curators, and those who carry the work forward."
      />
      <Placeholder
        title="Press kit available on request."
        subtitle="A comprehensive digital press kit is being prepared. In the meantime, direct inquiries to the collective."
        icon="☍"
      />
    </section>
  );
}
