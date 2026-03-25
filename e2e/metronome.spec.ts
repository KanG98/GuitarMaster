import { test, expect } from "@playwright/test";

test.describe("Metronome", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    // Click on the Metronome nav using text content
    await page.locator('[data-testid="nav-metronome"]').click();
  });

  test("navigates to metronome tool", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Metronome" })).toBeVisible();
    await expect(page.getByTestId("bpm-display")).toHaveText("120");
  });

  test("can increase and decrease BPM", async ({ page }) => {
    await page.getByTestId("bpm-increase").click();
    await expect(page.getByTestId("bpm-display")).toHaveText("121");
    await page.getByTestId("bpm-decrease").click();
    await page.getByTestId("bpm-decrease").click();
    await expect(page.getByTestId("bpm-display")).toHaveText("119");
  });

  test("can change time signature", async ({ page }) => {
    await page.getByTestId("ts-3/4").click();
    await expect(page.getByTestId("ts-3/4")).toHaveAttribute("data-active", "true");
    const dots = page.locator("[data-testid^='beat-dot-']");
    await expect(dots).toHaveCount(3);
  });

  test("can start and stop metronome", async ({ page }) => {
    const toggle = page.getByTestId("metronome-toggle");
    await expect(toggle).toContainText("Start");
    await toggle.click();
    await expect(toggle).toContainText("Stop");
    await toggle.click();
    await expect(toggle).toContainText("Start");
  });

  test("tap tempo button exists and is clickable", async ({ page }) => {
    const tap = page.getByTestId("tap-tempo");
    await expect(tap).toBeVisible();
    await tap.click();
    await tap.click();
  });
});
