import { test, expect } from "@playwright/test";

const UNLOOP_TESTING_STATUS_URL =
  "https://github.com/AryanKK/Unloop-Application/blob/main/docs/TESTING_DOWNLOADS.md";
const UNLOOP_PRODUCT_BRIEF_URL =
  "https://github.com/AryanKK/Unloop-Application/blob/main/docs/PRODUCT_BRIEF.md";
const UNLOOP_PRIVACY_URL =
  "https://github.com/AryanKK/Unloop-Application/blob/main/docs/PRIVACY_AND_SAFETY.md";
const UNLOOP_PUBLIC_POLICY_URL =
  "https://github.com/AryanKK/Unloop-Application/blob/main/docs/PUBLIC_REPO_POLICY.md";

test.describe("Fast sanity", () => {
  test("home loads with expected title", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Aryan K\. Kedarisetty/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("StreaKit animation library standalone HTML is served", async ({ page }) => {
    await page.goto("/animation-showcase-standalone.html", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/StreaKit.*Animation Library/i);
  });
});

/**
 * End-to-end journeys starting from the GitHub Pages site (same flows visitors use).
 * StreaKit: hosted SDK demo (Record / Freeze / Unfreeze). Unloop: docs-first showcase—no public
 * macOS zip; links must target the distribution documentation hub on Unloop-Application.
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

  test("Unloop: Showcase links to distribution documentation hub (no macOS zip)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Primary").getByRole("link", { name: "Showcase", exact: true }).click();

    const scope = page.locator("article").filter({ has: page.locator("#showcase-unloop-title") });
    await expect(scope.getByRole("link", { name: "Download & testing status" })).toHaveAttribute(
      "href",
      UNLOOP_TESTING_STATUS_URL,
    );
    await expect(scope.getByRole("link", { name: "Product brief" }).first()).toHaveAttribute(
      "href",
      UNLOOP_PRODUCT_BRIEF_URL,
    );
    await expect(scope.getByRole("link", { name: "Privacy & safety" })).toHaveAttribute("href", UNLOOP_PRIVACY_URL);
    await expect(scope.getByRole("link", { name: "Public repo policy" })).toHaveAttribute(
      "href",
      UNLOOP_PUBLIC_POLICY_URL,
    );
  });

  test("Unloop: Projects lists documentation hub links (no macOS zip)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Primary").getByRole("link", { name: "Projects", exact: true }).click();

    const projects = page.locator("#projects");
    const status = projects.getByRole("link", { name: "Download & testing status" });
    await expect(status).toHaveCount(1);
    await expect(status).toHaveAttribute("href", UNLOOP_TESTING_STATUS_URL);
    await expect(projects.getByRole("link", { name: "Privacy & safety" })).toHaveAttribute("href", UNLOOP_PRIVACY_URL);
  });
});
