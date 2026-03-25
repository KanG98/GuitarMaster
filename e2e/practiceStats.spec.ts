import { test, expect } from "@playwright/test";

test.describe("Practice Stats", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    await page.locator('[data-testid="nav-stats"]').click();
  });

  test("navigates to stats page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Practice Stats" })).toBeVisible();
  });

  test("shows loading then content or empty state", async ({ page }) => {
    // Should eventually show either the empty state or stats content
    await expect(
      page.getByTestId("stats-empty").or(page.getByTestId("total-time"))
    ).toBeVisible({ timeout: 10000 });
  });

  test("stats nav button is active when selected", async ({ page }) => {
    await expect(page.locator('[data-testid="nav-stats"]')).toHaveAttribute(
      "data-variant",
      "secondary"
    );
  });

  test("can switch back to songs", async ({ page }) => {
    await page.locator('[data-testid="nav-songs"]').click();
    await expect(page.getByText("Your Songs")).toBeVisible();
  });
});
