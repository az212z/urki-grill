import { test, expect } from "@playwright/test";

test.describe("Ürki Grill site", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/index.html");
  });

  test("loads with RTL + Arabic title", async ({ page }) => {
    await expect(page).toHaveTitle(/أوركي جريل/);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");
  });

  test("preloader hides", async ({ page }) => {
    await page.waitForTimeout(1600);
    const pre = page.locator("#preloader");
    await expect(pre).toBeHidden();
  });

  test("hero shows headline + 2 CTAs", async ({ page }) => {
    await expect(page.locator(".hero h1")).toBeVisible();
    await expect(page.locator(".hero-cta .btn")).toHaveCount(2);
  });

  test("trust bar cites real Google rating", async ({ page }) => {
    await expect(page.locator(".trust")).toContainText("خرائط قوقل");
    await expect(page.locator(".trust")).toContainText("481");
  });

  test("all images resolve (no broken src)", async ({ page }) => {
    const imgs = page.locator("img");
    const n = await imgs.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const ok = await imgs.nth(i).evaluate(
        (el: HTMLImageElement) => el.complete && el.naturalWidth > 0
      );
      expect(ok).toBeTruthy();
    }
  });

  test("no invented prices — uses حسب القائمة", async ({ page }) => {
    await expect(page.locator("#menu")).toContainText("حسب القائمة");
  });

  test("mobile full-screen menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#burger").click();
    const menu = page.locator("#mobileMenu");
    await expect(menu).toHaveClass(/open/);
    const box = await menu.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(380);
    await page.locator("#mmClose").click();
    await expect(menu).not.toHaveClass(/open/);
  });

  test("reservation form validates required fields", async ({ page }) => {
    await page.locator('#reserveForm button[type="submit"]').click();
    await expect(page.locator('.field-error[data-for="r-name"]')).not.toBeEmpty();
  });

  test("no horizontal scroll at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflow).toBeFalsy();
  });

  test("floating FABs present (WhatsApp + Call + Maps)", async ({ page }) => {
    await expect(page.locator(".fab--wa")).toBeVisible();
    await expect(page.locator(".fab--call")).toBeVisible();
    await expect(page.locator(".fab--map")).toBeVisible();
  });

  test("JSON-LD Restaurant with rating 4.2 / 481", async ({ page }) => {
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toContain('"@type": "Restaurant"');
    expect(ld).toContain('"ratingValue": "4.2"');
    expect(ld).toContain('"reviewCount": "481"');
    expect(ld).toContain("Turkish");
  });
});
