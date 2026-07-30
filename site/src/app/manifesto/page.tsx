import { getMarkdownFile } from "@/lib/content";
import SectionHeading from "@/components/ui/SectionHeading";
import CopperDivider from "@/components/ui/CopperDivider";
import Placeholder from "@/components/ui/Placeholder";
import ManifestoContent from "./ManifestoContent";

export const metadata = {
  title: "Manifesto",
  description: "The N8G manifesto. Music is not entertainment. Music is an environment.",
};

export default async function ManifestoPage() {
  const doc = await getMarkdownFile("manifesto.md");

  if (!doc) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <SectionHeading
          title="Manifesto"
          subtitle="The foundation. Words carved from Johannesburg stone."
        />
        <Placeholder
          title="The Manifesto is being inscribed."
          subtitle="Words are being chosen with care. Return when the ink is dry."
          icon="☲"
        />
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <SectionHeading
        title={String(doc.frontmatter.title ?? "Manifesto")}
        subtitle="The foundation. Words carved from Johannesburg stone."
      />
      <CopperDivider className="mb-12" />
      <div className="prose-n8g">
        <ManifestoContent content={doc.content} />
      </div>
    </section>
  );
}
