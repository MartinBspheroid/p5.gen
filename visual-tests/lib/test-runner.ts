/**
 * Core Puppeteer test orchestration for visual testing.
 */

import puppeteer from "puppeteer";
import type { Browser, Page } from "puppeteer";
import { generateHtmlTemplate } from "./html-template";
import { discoverSketches, loadSketch } from "./sketch-loader";
import type { TestConfig, TestResult, SketchMeta } from "./types";

const OUTPUT_DIR = `${import.meta.dirname}/../output`;

/**
 * Run all visual tests matching the configuration.
 * @param config - Test runner configuration
 */
export async function runVisualTests(config: TestConfig): Promise<void> {
  const sketches = await discoverSketches(config.sketchFilter);

  if (sketches.length === 0) {
    console.log("No sketches found matching filter:", config.sketchFilter);
    return;
  }

  console.log(`Running ${sketches.length} visual test(s)...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results: TestResult[] = [];

  for (const sketchPath of sketches) {
    const result = await runSingleTest(browser, sketchPath, config);
    results.push(result);

    const icon = result.success ? "\x1b[32mOK\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    console.log(`  [${icon}] ${result.name} (${result.durationMs}ms)`);

    if (!result.success && result.error) {
      console.error(`       Error: ${result.error}`);
    } else if (config.verbose && result.success) {
      console.log(`       Output: ${result.outputPath}`);
    }
  }

  await browser.close();

  // Summary
  const passed = results.filter((r) => r.success).length;
  const failed = results.length - passed;
  console.log(
    `\nResults: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`
  );

  if (failed > 0) {
    process.exit(1);
  }
}

/**
 * Run a single sketch test.
 * @param browser - Puppeteer browser instance
 * @param sketchPath - Path to the sketch file
 * @param config - Test configuration
 * @returns Test result
 */
async function runSingleTest(
  browser: Browser,
  sketchPath: string,
  config: TestConfig
): Promise<TestResult> {
  const startTime = Date.now();

  let sketchModule;
  try {
    sketchModule = await loadSketch(sketchPath);
  } catch (error) {
    return {
      name: sketchPath.split("/").pop() ?? "unknown",
      success: false,
      outputPath: "",
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    };
  }

  const { meta } = sketchModule;
  const width = meta.width ?? config.width;
  const height = meta.height ?? config.height;

  // Capture console messages for debugging
  const consoleErrors: string[] = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: width + 50, height: height + 50 });
    page.on("console", (msg) => {
      if (config.verbose) {
        console.log(`       [${msg.type()}] ${msg.text()}`);
      }
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
      if (config.verbose) {
        console.log(`       [pageerror] ${err.message}`);
      }
    });

    // Generate and set HTML content with p5.js + library + sketch
    const html = await generateHtmlTemplate(sketchModule, width, height);

    // Save HTML for debugging
    if (config.verbose) {
      const htmlPath = `${OUTPUT_DIR}/${meta.name}.html`;
      await Bun.write(htmlPath, html);
      console.log(`       Saved HTML: ${htmlPath}`);
    }

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    // Wait for sketch completion
    await waitForSketchCompletion(page, meta, config.timeout);

    // Check for console errors
    if (consoleErrors.length > 0 && config.verbose) {
      console.log(`       Console errors: ${consoleErrors.join("; ")}`);
    }

    // Capture the canvas
    const canvasElement = await page.waitForSelector("canvas", {
      timeout: 5000,
    });
    if (!canvasElement) {
      throw new Error("Canvas element not found");
    }

    const outputPath = `${OUTPUT_DIR}/${meta.name}.png`;
    await canvasElement.screenshot({ path: outputPath, type: "png" });

    await page.close();

    return {
      name: meta.name,
      success: true,
      outputPath,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    // Include any collected console errors in the error message
    const errorMsg = error instanceof Error ? error.message : String(error);
    const fullError = consoleErrors.length > 0
      ? `${errorMsg} | Console: ${consoleErrors.join("; ")}`
      : errorMsg;
    return {
      name: meta.name,
      success: false,
      outputPath: "",
      error: fullError,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Wait for sketch to signal completion.
 * @param page - Puppeteer page
 * @param meta - Sketch metadata
 * @param timeout - Maximum wait time in ms
 */
async function waitForSketchCompletion(
  page: Page,
  meta: SketchMeta,
  timeout: number
): Promise<void> {
  if (meta.completionSignal) {
    // Wait for explicit window.__sketchComplete = true
    await page.waitForFunction(
      () =>
        (window as unknown as { __sketchComplete?: boolean })
          .__sketchComplete === true,
      { timeout }
    );
  } else if (meta.frameCount !== undefined && meta.frameCount > 1) {
    // Wait for frame count to be reached
    await page.waitForFunction(
      (targetFrame: number) => {
        const p5Instance = (
          window as unknown as { _p5Instance?: { frameCount: number } }
        )._p5Instance;
        return p5Instance && p5Instance.frameCount >= targetFrame;
      },
      { timeout },
      meta.frameCount
    );
  } else {
    // Default: wait for first frame + small delay
    await page.waitForFunction(
      () =>
        (window as unknown as { _p5Instance?: { frameCount: number } })
          ._p5Instance?.frameCount >= 1,
      { timeout }
    );
    // Small delay to ensure rendering is complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
