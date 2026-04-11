import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Confirms the published macOS artifact lists the expected .app name inside the zip
 * (mirrors manual checks in Unloop-Application docs/TESTING_DOWNLOADS.md).
 */
export function assertZipListsMacApp(buffer: Buffer, appEntrySubstring: string): void {
  const dir = mkdtempSync(join(tmpdir(), "pw-unloop-zip-"));
  const zipPath = join(dir, "unloop-desktop-macos-test.zip");
  try {
    writeFileSync(zipPath, buffer);
    const listing = execFileSync("unzip", ["-l", zipPath], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    const lower = listing.toLowerCase();
    if (!lower.includes(appEntrySubstring.toLowerCase())) {
      throw new Error(
        `Expected zip listing to include "${appEntrySubstring}". Listing head:\n${listing.slice(0, 2500)}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
