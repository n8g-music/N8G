import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = {
  title: "Store",
  description: "Offerings from N8G. Music, artifacts, transmissions.",
};

export default function StorePage() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <SectionHeading
        title="Store"
        subtitle="Physical artifacts. Limited editions. Objects you can hold."
      />
      <Placeholder
        title="Offerings in preparation."
        subtitle="Objects are being crafted. Each release will be announced when the work is ready."
        icon="◆"
      />
    </section>
  );
}
