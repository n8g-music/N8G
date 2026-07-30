import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = {
  title: "Gallery",
  description: "Visual worlds from the N8G collective.",
};

export default function GalleryPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <SectionHeading
        title="Gallery"
        subtitle="Visual worlds. Frames from the anonymous."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Placeholder
          title="Visual worlds forming."
          subtitle="Images are being captured. Light is being shaped."
          icon="◈"
        />
      </div>
    </section>
  );
}
