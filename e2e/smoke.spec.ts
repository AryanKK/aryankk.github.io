import { createHash } from "node:crypto";
import { test, expect } from "@playwright/test";

const UNLOOP_ZIP_URL =
  "https://raw.githubusercontent.com/AryanKK/Unloop-Application/main/downloads/macos/unloop-desktop-macos-test.zip";
const UNLOOP_ZIP_SHA256 =
  "a210d0804b74fd2e7aeebe0bdf83d396155d804310c3d3cb539904abdfce4103";

test.describe("Public site smoke (validates journeys reachable from GitHub Pages)", () => {
  test("home loads with expected title", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Aryan K\. Kedarisetty/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("StreaKit hosted demo loads and exposes Record Activity journey", async ({ page }) => {
    await page.goto("/streakit-demo/", { waitUntil: "load" });
    await expect(page.locator("#root")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("StreaKit Dev Playground")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Record Activity" })).toBeVisible({ timeout: 30_000 });
  });

  test("Unloop macOS zip downloads and matches published SHA-256", async ({ request }) => {
    const res = await request.get(UNLOOP_ZIP_URL);
    expect(res.ok(), `zip HTTP ${res.status()}`).toBeTruthy();
    const ct = res.headers()["content-type"] || "";
    expect(ct.includes("zip") || ct.includes("octet-stream")).toBeTruthy();
    const body = await res.body();
    expect(body.length).toBeGreaterThan(100_000);
    const hash = createHash("sha256").update(body).digest("hex");
    expect(hash).toBe(UNLOOP_ZIP_SHA256);
  });
});
