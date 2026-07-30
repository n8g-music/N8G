import Head from "next/head";

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
}

/** Per-page SEO head tags. Use in page components alongside metadata export. */
export default function SEO({ title, description, ogImage }: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
    </Head>
  );
}
