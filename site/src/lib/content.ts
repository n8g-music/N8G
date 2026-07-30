import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface MarkdownContent {
  slug: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

/** Read and parse a markdown file from the content directory */
export async function getMarkdownFile(
  relativePath: string
): Promise<MarkdownContent | null> {
  try {
    const fullPath = path.join(CONTENT_DIR, relativePath);
    const raw = await fs.readFile(fullPath, "utf-8");
    const { data, content } = matter(raw);
    const slug = path.basename(relativePath, path.extname(relativePath));
    return { slug, frontmatter: data, content };
  } catch {
    return null;
  }
}

/** List all markdown files in a content subdirectory */
export async function listMarkdownFiles(
  subDir: string
): Promise<MarkdownContent[]> {
  try {
    const dirPath = path.join(CONTENT_DIR, subDir);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name);

    const results = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(subDir, file);
        return getMarkdownFile(filePath);
      })
    );

    return results.filter((r): r is MarkdownContent => r !== null);
  } catch {
    return [];
  }
}

/** Base frontmatter schema for all content types */
export const BaseFrontmatter = z.object({
  title: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type BaseFrontmatter = z.infer<typeof BaseFrontmatter>;
