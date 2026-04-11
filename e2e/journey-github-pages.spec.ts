import { createHash } from "node:crypto";
import { test, expect } from "@playwright/test";
import { assertZipListsMacApp } from "./zip-assertions";

/** Canonical download URL (redirects to raw.githubusercontent.com; same bytes as manifest). */
const UNLOOP_ZIP_URL =
  "https://github.com/AryanKK/Unloop-Application/raw/main/downloads/macos/unloop-desktop-macos-test.zip";
const UNLOOP_ZIP_SHA256 =
  "a210d0804b74fd2e7aeebe0bdf83d396155d804310c3d3cb539904abdfce4103";
/** From docs/TESTING_DOWNLOADS.md in Unloop-Application */
const UNLOOP_APP_BUNDLE_NAME = "unloop_desktop_proto1.app";

test.describe("Fast sanity", () => {
  test("home loads with expected title", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Aryan K\. Kedarisetty/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

/**
 * End-to-end journeys starting from the GitHub Pages site (same flows visitors use).
 * StreaKit: modeled on the hosted SDK demo (Record / Freeze / Unfreeze), analogous to exercising
 * core streak flows in StreaKit user-journey checks. Unloop: modeled on proto1 distribution
 * expectations (TESTING_DOWNLOADS.md + manifest): correct URL from the site, SHA-256, zip lists
 * unloop_desktop_proto1.app for local install verification (Playwright cannot launch the macOS
 * .app in Linux CI).
 */
test.describe("GitHub Pages to application journeys", () => {
  test("StreaKit: home → Showcase → open demo (new tab) → record activity → freeze → unfreeze", async ({
    page,
    context,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Primary").getByRole("link", { name: "Showcase", exact: true }).click();
    await expect(page.locator("#showcase-heading")).toBeVisible();

    const popupPromise = context.waitForEvent("page");
    await page.locator("#showcase").getByRole("link", { name: "Open full showcase" }).click();
    const demo = await popupPromise;
    await demo.waitForLoadState("load");
    await expect(demo).toHaveURL(/streakit-demo\/?$/);

    await expect(demo.locator("#root")).toBeVisible({ timeout: 30_000 });
    await expect(demo.getByText("StreaKit Dev Playground")).toBeVisible({ timeout: 30_000 });
    await expect(demo.getByText("Loading streak state...")).toBeHidden({ timeout: 30_000 });

    const record = demo.getByRole("button", { name: "Record Activity" });
    await expect(record).toBeEnabled({ timeout: 15_000 });
    await record.click();
    await expect(demo.getByRole("button", { name: "Record Activity" })).toBeEnabled({ timeout: 15_000 });

    const currentStreak = demo.locator(".status-panel .status-grid .value").first();
    await expect(currentStreak).toHaveText(/^[1-9]\d* days$/);

    const freeze = demo.getByRole("button", { name: "Freeze (2 days)" });
    await expect(freeze).toBeEnabled();
    await freeze.click();
    await expect(demo.locator("section.panel.details")).toContainText("Frozen", { timeout: 15_000 });

    const unfreeze = demo.getByRole("button", { name: "Unfreeze" });
    await expect(unfreeze).toBeEnabled({ timeout: 15_000 });
    await unfreeze.click();
    await expect(demo.locator("section.panel.details")).toContainText("Active", { timeout: 15_000 });

    await demo.close();
  });

  test("Unloop: Showcase download link points at published artifact; bytes match manifest; zip lists .app", async ({
    page,
    request,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Primary").getByRole("link", { name: "Showcase", exact: true }).click();

    const download = page.locator("#showcase").getByRole("link", { name: "Download macOS test build" });
    await expect(download).toBeVisible();
    const href = await download.getAttribute("href");
    expect(href, "download href").toBe(UNLOOP_ZIP_URL);

    const res = await request.get(UNLOOP_ZIP_URL);
    expect(res.ok(), `zip HTTP ${res.status()}`).toBeTruthy();
    const body = await res.body();
    const hash = createHash("sha256").update(body).digest("hex");
    expect(hash).toBe(UNLOOP_ZIP_SHA256);

    assertZipListsMacApp(body, UNLOOP_APP_BUNDLE_NAME);
  });

  test("Unloop: Projects section download link matches Showcase (same artifact URL)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Primary").getByRole("link", { name: "Projects", exact: true }).click();

    const links = page.getByRole("link", { name: "macOS tester download (zip)" });
    await expect(links).toHaveCount(1);
    const href = await links.getAttribute("href");
    expect(href).toBe(UNLOOP_ZIP_URL);
  });
});
