#!/usr/bin/env node

/**
 * Screenshot Generator for PWA
 * Creates placeholder screenshots or verifies existing ones
 * 
 * Usage: npx tsx script/generate-screenshots.ts
 */

import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = path.join(process.cwd(), "public/screenshots");

interface ScreenshotConfig {
  filename: string;
  width: number;
  height: number;
  description: string;
}

const REQUIRED_SCREENSHOTS: ScreenshotConfig[] = [
  {
    filename: "home.png",
    width: 1280,
    height: 720,
    description: "Home screen showing prayer countdown (wide format)"
  },
  {
    filename: "focus.png",
    width: 390,
    height: 844,
    description: "Focus session timer (mobile format)"
  }
];

/**
 * Check if screenshot files exist
 */
function checkScreenshots(): void {
  console.log("📸 Checking PWA screenshots...\n");

  const existingScreenshots = new Map<string, boolean>();

  for (const screenshot of REQUIRED_SCREENSHOTS) {
    const filePath = path.join(SCREENSHOTS_DIR, screenshot.filename);
    const exists = fs.existsSync(filePath);
    existingScreenshots.set(screenshot.filename, exists);

    const status = exists ? "✅" : "❌";
    console.log(`${status} ${screenshot.filename} (${screenshot.width}x${screenshot.height})`);
    console.log(`   ${screenshot.description}`);
    if (!exists) {
      console.log(`   Missing: Please add this file for better PWA install experience`);
    }
    console.log();
  }

  // Summary
  const missing = Array.from(existingScreenshots.values()).filter(v => !v).length;
  const total = existingScreenshots.size;

  if (missing === 0) {
    console.log(`✅ All ${total} screenshots found! PWA manifest is complete.`);
  } else {
    console.log(`⚠️  Missing ${missing}/${total} screenshots.`);
    console.log("\n📝 To add screenshots:");
    console.log("1. Run the app: npm run dev");
    console.log("2. Take screenshots at the specified dimensions");
    console.log("3. Save them to public/screenshots/ directory");
    console.log("4. Run this script again to verify\n");
  }
}

/**
 * Generate list of available screenshots for manifest
 */
export function getAvailableScreenshots(): ScreenshotConfig[] {
  return REQUIRED_SCREENSHOTS.filter(screenshot => {
    const filePath = path.join(SCREENSHOTS_DIR, screenshot.filename);
    return fs.existsSync(filePath);
  });
}

/**
 * Get manifest screenshots array (only includes existing files)
 */
export function getManifestScreenshots(): Array<{
  src: string;
  sizes: string;
  type: string;
  form_factor: string;
  label: string;
}> {
  const screenshots = getAvailableScreenshots();
  
  return screenshots.map(screenshot => {
    let form_factor = "wide";
    let label = screenshot.description;

    if (screenshot.width < 600) {
      form_factor = "narrow";
    }

    return {
      src: `/screenshots/${screenshot.filename}`,
      sizes: `${screenshot.width}x${screenshot.height}`,
      type: "image/png",
      form_factor,
      label
    };
  });
}

// Run check if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkScreenshots();
}
