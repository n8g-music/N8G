import CopperDivider from "./CopperDivider";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-12 md:mb-16">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-sans font-normal text-text-primary mb-4">
        {title}
      </h2>
      <CopperDivider className="w-16 md:w-24 !from-copper-500 !to-copper-500/20" />
      {subtitle && (
        <p className="mt-4 text-stone-400 text-lg max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
