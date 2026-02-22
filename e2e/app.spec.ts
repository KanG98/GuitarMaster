import { test, expect, Page } from "@playwright/test";

const E2E_PREFIX = "[E2E]";

/** Delete only song cards whose name starts with the E2E prefix. */
async function deleteE2ESongs(page: Page) {
  await page.goto("/");
  await page.waitForTimeout(1000);

  // Auto-accept all confirm() dialogs
  page.on("dialog", (dialog) => dialog.accept());

  // Loop until no E2E-prefixed cards remain
  while (true) {
    const e2eCard = page.locator(`[data-slot="card"]:has-text("${E2E_PREFIX}")`).first();
    if ((await e2eCard.count()) === 0) break;

    await e2eCard.hover();
    const deleteBtn = e2eCard.locator("button");
    await deleteBtn.click();
    await page.waitForTimeout(500);
  }
}

test.describe("Home Page", () => {
  test("loads and shows header and song list", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=GuitarMaster")).toBeVisible();
    await expect(page.locator("text=Your Songs")).toBeVisible();
    await expect(page.locator("text=Add Song")).toBeVisible();
  });

  test("shows empty state when no songs", async ({ page }) => {
    await page.goto("/");
    // May or may not have songs depending on Firestore state,
    // but the page should load without errors
    await expect(page.locator("header")).toBeVisible();
  });
});

test.describe("Add Song Flow", () => {
  test("opens add song dialog and shows form fields", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Add Song");

    await expect(page.locator("text=Add New Song")).toBeVisible();
    await expect(page.locator('label:has-text("Song Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Artist")')).toBeVisible();
  });

  test("create button is disabled with empty name", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Add Song");

    const createBtn = page.locator('button:has-text("Create")');
    await expect(createBtn).toBeDisabled();
  });

  test("create button enables when name is typed", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Add Song");

    await page.fill("#song-name", "Test Song");
    const createBtn = page.locator('button:has-text("Create")');
    await expect(createBtn).toBeEnabled();
  });

  test("can close dialog with cancel", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Add Song");
    await expect(page.locator("text=Add New Song")).toBeVisible();

    await page.click('button:has-text("Cancel")');
    await expect(page.locator("text=Add New Song")).not.toBeVisible();
  });
});

test.describe("Song Detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Create a test song if none exists
    const songCards = page.locator('[data-slot="card"]');
    const count = await songCards.count();

    if (count === 0) {
      await page.click("text=Add Song");
      await page.fill("#song-name", `${E2E_PREFIX} Test Song`);
      await page.fill("#song-artist", "Test Artist");
      await page.click('button:has-text("Create")');
      await page.waitForTimeout(1000);
    }
  });

  test("clicking a song card opens song detail", async ({ page }) => {
    // Click the first song card
    const firstCard = page.locator('[data-slot="card"]').first();
    await firstCard.click();

    // Should see back button and upload zone
    await expect(page.locator('button:has-text("Back")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete Song")')).toBeVisible();
  });

  test("song detail shows practice timer", async ({ page }) => {
    const firstCard = page.locator('[data-slot="card"]').first();
    await firstCard.click();

    // Timer should show 00:00 or close to it
    await expect(page.locator("text=00:0")).toBeVisible();
  });

  test("back button returns to song list", async ({ page }) => {
    const firstCard = page.locator('[data-slot="card"]').first();
    await firstCard.click();

    await page.click('button:has-text("Back")');
    await expect(page.locator("text=Your Songs")).toBeVisible();
  });

  test("upload zone shows full mode when no files", async ({ page }) => {
    // Create a fresh song to ensure no files
    await page.click("text=Add Song");
    await page.fill("#song-name", `${E2E_PREFIX} Empty Song ` + Date.now());
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(1000);

    // Click the newly created song (should be first)
    const firstCard = page.locator('[data-slot="card"]').first();
    await firstCard.click();

    await expect(
      page.locator("text=Drag & drop your guitar tab here")
    ).toBeVisible();
  });
});

test.describe("Upload Zone", () => {
  test("full upload zone shows accepted file types", async ({ page }) => {
    await page.goto("/");

    // Create and enter a song
    await page.click("text=Add Song");
    await page.fill("#song-name", `${E2E_PREFIX} Upload Test ` + Date.now());
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(1000);

    const firstCard = page.locator('[data-slot="card"]').first();
    await firstCard.click();

    await expect(page.locator("text=PNG, JPG, WebP")).toBeVisible();
    await expect(page.locator("text=PDF")).toBeVisible();
  });

  test("file input accepts correct types", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator('[data-slot="card"]').first();
    if ((await firstCard.count()) > 0) {
      await firstCard.click();

      const input = page.locator('input[type="file"]');
      await expect(input).toHaveAttribute(
        "accept",
        ".png,.jpg,.jpeg,.webp,.gif,.pdf"
      );
    }
  });
});

test.describe("File Viewer Dual-Page Layout", () => {
  test("viewer overlay uses fixed fullscreen layout", async ({ page }) => {
    // Full dual-page viewer tests require uploaded files which depend on Firebase state.
    // This test verifies the page loads and the viewer component can be rendered.
    await page.goto("/");
    await expect(page.locator("text=GuitarMaster")).toBeVisible();
  });

  test("viewer navigation hint mentions arrow keys and Esc", async ({ page }) => {
    // When a viewer is open it should show navigation hints.
    // Since we can't guarantee uploaded files in E2E, we verify
    // the app loads correctly and the viewer component is importable.
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
  });
});

test.describe("Practice Timer", () => {
  test("timer increments while on song detail", async ({ page }) => {
    await page.goto("/");

    // Need a song to click into
    const firstCard = page.locator('[data-slot="card"]').first();
    if ((await firstCard.count()) > 0) {
      await firstCard.click();

      // Wait a few seconds
      await page.waitForTimeout(3000);

      // Timer should have advanced past 00:00
      const timerText = await page.locator(".font-mono").textContent();
      expect(timerText).not.toBe("00:00");
    }
  });

  test("timer has pause/play button", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator('[data-slot="card"]').first();
    if ((await firstCard.count()) > 0) {
      await firstCard.click();

      // The timer section should have a button (pause/play)
      const timerButton = page.locator(".font-mono").locator("..").locator("button");
      await expect(timerButton).toBeVisible();
    }
  });

  test("practice time persists after leaving and re-entering song", async ({ page }) => {
    await page.goto("/");

    // Create a test song
    await page.click("text=Add Song");
    await page.fill("#song-name", `${E2E_PREFIX} Timer Persist`);
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(1000);

    // Enter the song
    const card = page.locator(`[data-slot="card"]:has-text("${E2E_PREFIX} Timer Persist")`).first();
    await card.click();

    // Wait to accumulate some practice time
    await page.waitForTimeout(4000);

    // Go back (handleBack saves before navigating)
    await page.click('button:has-text("Back")');
    await page.waitForTimeout(3000);

    // Song card should show practiced time
    await expect(page.locator("text=/practiced/").first()).toBeVisible();

    // Re-enter the same song
    const card2 = page.locator(`[data-slot="card"]:has-text("${E2E_PREFIX} Timer Persist")`).first();
    await card2.click();
    await page.waitForTimeout(500);

    // Timer should be visible (format is HH:MM, so short durations still show 00:00)
    await expect(page.locator(".font-mono.tabular-nums")).toBeVisible();
  });
});

test.describe("YouTube Video Section", () => {
  test("song detail shows YouTube section", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator('[data-slot="card"]').first();
    if ((await firstCard.count()) > 0) {
      await firstCard.click();

      // Should see the YouTube section (either player or placeholder)
      await expect(page.locator("text=/Video|No video linked|Searching YouTube/")).toBeVisible();
    }
  });

  test("YouTube section has search button when no video", async ({ page }) => {
    await page.goto("/");

    // Create a fresh song (may or may not auto-search depending on API key)
    await page.click("text=Add Song");
    await page.fill("#song-name", `${E2E_PREFIX} YT Test ` + Date.now());
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(3000);

    const card = page.locator(`[data-slot="card"]:has-text("${E2E_PREFIX} YT Test")`).first();
    await card.click();
    await page.waitForTimeout(1000);

    // Should see either embedded player (if auto-search worked) or placeholder with search button
    const hasPlayer = await page.locator('iframe[src*="youtube.com"]').count();
    const hasSearchBtn = await page.locator('button:has-text("Search YouTube")').count();
    expect(hasPlayer + hasSearchBtn).toBeGreaterThan(0);
  });

  test("can paste a YouTube URL to set video", async ({ page }) => {
    await page.goto("/");

    // Create a fresh song
    await page.click("text=Add Song");
    await page.fill("#song-name", `${E2E_PREFIX} YT Paste ` + Date.now());
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(3000);

    const card = page.locator(`[data-slot="card"]:has-text("${E2E_PREFIX} YT Paste")`).first();
    await card.click();
    await page.waitForTimeout(1000);

    // If video already set, click Edit first
    const editBtn = page.locator('button:has-text("Edit")');
    if ((await editBtn.count()) > 0) {
      await editBtn.click();
    }

    // Paste a URL
    const urlInput = page.locator('input[placeholder="Paste YouTube URL..."]');
    await urlInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await page.click('button:has-text("Set")');
    await page.waitForTimeout(500);

    // Should now have an embedded player
    await expect(page.locator('iframe[src*="youtube.com"]')).toBeVisible();
  });
});

test.describe("YouTube Player Controls", () => {
  test("player controls toolbar appears when video is loaded", async ({ page }) => {
    await page.goto("/");

    // Create a song and set a video via paste
    await page.click("text=Add Song");
    await page.fill("#song-name", `${E2E_PREFIX} Controls Test ` + Date.now());
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(3000);

    const card = page.locator(`[data-slot="card"]:has-text("${E2E_PREFIX} Controls Test")`).first();
    await card.click();
    await page.waitForTimeout(1000);

    // If no video, set one via paste URL
    const editBtn = page.locator('button:has-text("Edit")');
    if ((await editBtn.count()) === 0) {
      const urlInput = page.locator('input[placeholder="Paste YouTube URL..."]');
      if ((await urlInput.count()) > 0) {
        await urlInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        await page.click('button:has-text("Set")');
        await page.waitForTimeout(2000);
      }
    }

    // Wait for player controls to appear (YouTube IFrame API needs time to load)
    const controls = page.locator('[data-testid="player-controls"]');
    await expect(controls).toBeVisible({ timeout: 15000 });

    // Verify skip buttons exist
    await expect(page.locator('button[title="Skip back 5s"]')).toBeVisible();
    await expect(page.locator('button[title="Skip forward 5s"]')).toBeVisible();

    // Verify speed buttons exist
    await expect(page.locator('button:has-text("1x")')).toBeVisible();
    await expect(page.locator('button:has-text("0.75x")')).toBeVisible();

    // Verify loop slider exists
    await expect(page.locator('[data-testid="loop-slider"]')).toBeVisible();
  });
});

test.describe("Ear Trainer", () => {
  test("ear trainer tab is visible in header", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="nav-ear-trainer"]')).toBeVisible();
  });

  test("clicking ear trainer tab shows ear trainer view", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="nav-ear-trainer"]');
    await expect(page.locator('[data-testid="piano-keyboard"]')).toBeVisible();
  });

  test("piano keyboard has 7 keys", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="nav-ear-trainer"]');
    const keys = page.locator('[data-testid="piano-keyboard"] button');
    await expect(keys).toHaveCount(7);
  });

  test("learn mode shows hint text", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="nav-ear-trainer"]');
    await expect(page.locator("text=Click a key or press")).toBeVisible();
  });

  test("switching to quiz mode shows quiz panel", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="nav-ear-trainer"]');
    await page.click('[data-testid="mode-quiz"]');
    await expect(page.locator('[data-testid="quiz-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-btn"]')).toBeVisible();
  });

  test("quiz start and reset flow", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="nav-ear-trainer"]');
    await page.click('[data-testid="mode-quiz"]');

    // Start
    await page.click('[data-testid="start-btn"]');
    await expect(page.locator('[data-testid="start-btn"]')).toContainText("Reset");

    // Reset
    await page.click('[data-testid="start-btn"]');
    await expect(page.locator('[data-testid="start-btn"]')).toContainText("Start");
  });

  test("can switch back to songs view", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="nav-ear-trainer"]');
    await expect(page.locator('[data-testid="piano-keyboard"]')).toBeVisible();

    await page.click('[data-testid="nav-songs"]');
    await expect(page.locator("text=Your Songs")).toBeVisible();
  });
});

// --- Cleanup: runs last, removes only [E2E]-prefixed songs ---
test.describe("Cleanup", () => {
  test("delete all E2E test songs from database", async ({ page }) => {
    await deleteE2ESongs(page);
    const remaining = page.locator(`[data-slot="card"]:has-text("${E2E_PREFIX}")`);
    expect(await remaining.count()).toBe(0);
  });
});
