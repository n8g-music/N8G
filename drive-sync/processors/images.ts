/**
 * N8G Drive Sync — Image Processor
 *
 * Processes downloaded images:
 * - Generates 3 sizes: 200px thumb, 800px medium, 1600px full
 * - Converts to WebP
 * - Strips EXIF metadata
 * - Logs compression stats
 */

import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

function log(message: string) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${ts}] [processor:images] ${message}\n`);
}

export interface ImageProcessingResult {
  originalName: string;
  originalSize: number;
  outputs: {
    thumb?: { path: string; size: number };
    medium?: { path: string; size: number };
    full?: { path: string; size: number };
  };
  totalOutputSize: number;
  compressionRatio: number;
}

/**
 * Generate the base name without extension for output naming.
 */
function baseName(filename: string): string {
  const ext = path.extname(filename);
  return filename.slice(0, -ext.length);
}

/**
 * Process a single image file.
 * Input path is the downloaded file; output directory is where to write WebP versions.
 */
export async function processImage(
  inputPath: string,
  outputDir: string,
  dryRun: boolean = false
): Promise<ImageProcessingResult> {
  const filename = path.basename(inputPath);
  const name = baseName(filename);
  const originalSize = fs.statSync(inputPath).size;

  log(`Processing: ${filename} (${(originalSize / 1024).toFixed(1)} KB)`);

  if (dryRun) {
    log(`[DRY RUN] Would generate: ${name}-thumb.webp, ${name}-med.webp, ${name}.webp`);
    return {
      originalName: filename,
      originalSize,
      outputs: {},
      totalOutputSize: 0,
      compressionRatio: 0,
    };
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const result: ImageProcessingResult = {
    originalName: filename,
    originalSize,
    outputs: {},
    totalOutputSize: 0,
    compressionRatio: 0,
  };

  const image = sharp(inputPath).rotate(); // auto-rotate based on EXIF

  // Get metadata to check if we need to resize
  const metadata = await image.metadata();
  const origWidth = metadata.width || 1600;

  const tasks: Promise<void>[] = [];

  // Thumbnail: 200px wide
  if (origWidth > 200) {
    const thumbPath = path.join(outputDir, `${name}-thumb.webp`);
    tasks.push(
      sharp(inputPath)
        .rotate()
        .resize(200, undefined, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(thumbPath)
        .then(() => {
          const size = fs.statSync(thumbPath).size;
          result.outputs.thumb = { path: thumbPath, size };
          result.totalOutputSize += size;
        })
    );
  }

  // Medium: 800px wide
  if (origWidth > 800) {
    const medPath = path.join(outputDir, `${name}-med.webp`);
    tasks.push(
      sharp(inputPath)
        .rotate()
        .resize(800, undefined, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(medPath)
        .then(() => {
          const size = fs.statSync(medPath).size;
          result.outputs.medium = { path: medPath, size };
          result.totalOutputSize += size;
        })
    );
  }

  // Full: 1600px wide
  const fullPath = path.join(outputDir, `${name}.webp`);
  tasks.push(
    sharp(inputPath)
      .rotate()
      .resize(1600, undefined, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(fullPath)
      .then(() => {
        const size = fs.statSync(fullPath).size;
        result.outputs.full = { path: fullPath, size };
        result.totalOutputSize += size;
      })
  );

  await Promise.all(tasks);

  result.compressionRatio =
    originalSize > 0 ? result.totalOutputSize / originalSize : 0;

  log(
    `  → thumb: ${result.outputs.thumb ? (result.outputs.thumb.size / 1024).toFixed(1) + " KB" : "skipped"}, ` +
    `med: ${result.outputs.medium ? (result.outputs.medium.size / 1024).toFixed(1) + " KB" : "skipped"}, ` +
    `full: ${(result.outputs.full?.size || 0 / 1024).toFixed(1)} KB ` +
    `(ratio: ${(result.compressionRatio * 100).toFixed(0)}%)`
  );

  return result;
}

/**
 * Batch-process all images in a directory.
 */
export async function processImagesInDirectory(
  dirPath: string,
  outputDir: string,
  dryRun: boolean = false
): Promise<ImageProcessingResult[]> {
  const results: ImageProcessingResult[] = [];

  if (!fs.existsSync(dirPath)) {
    log(`Directory not found: ${dirPath}`);
    return results;
  }

  const entries = fs.readdirSync(dirPath);
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".tiff", ".bmp"];

  for (const entry of entries) {
    const ext = path.extname(entry).toLowerCase();
    if (!imageExts.includes(ext)) continue;

    const inputPath = path.join(dirPath, entry);
    if (!fs.statSync(inputPath).isFile()) continue;

    try {
      const result = await processImage(inputPath, outputDir, dryRun);
      results.push(result);
    } catch (err: any) {
      log(`ERROR processing ${entry}: ${err.message}`);
    }
  }

  return results;
}
