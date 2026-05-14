import { expect, test } from "@playwright/test";

test("EmailOS fetch leads flow works", async ({ page }) => {
  const stamp = Date.now();
  const username = `e2e_user_${stamp}`;
  const email = `e2e_${stamp}@example.com`;
  const password = "Password123!";

  await page.goto("/auth?redirect=/emailos");

  await page.getByRole("tab", { name: "Register" }).click();
  await page.locator("#reg-username").fill(username);
  await page.locator("#reg-email").fill(email);
  await page.locator("#reg-password").fill(password);
  await page.locator("#reg-confirm-password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/emailos/);

  // If onboarding is shown, complete it quickly to reach dashboard lists.
  if (await page.getByRole("button", { name: "Let's Get Started" }).isVisible({ timeout: 3_000 }).catch(() => false)) {
    await page.getByRole("button", { name: "Let's Get Started" }).click();

    await page.getByLabel("Account Name *").fill("E2E Email Account");
    await page.getByLabel("Your Website or Brand Domain *").fill("example.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByText("Starter", { exact: true }).first().click();

    await page.getByLabel("List Name *").fill("E2E Leads List");
    await page.getByRole("button", { name: "Create List" }).click();

    await page.getByRole("button", { name: "Skip for now" }).click();
    await page.getByRole("button", { name: "Go to My Dashboard" }).click();
  }

  await page.getByRole("button", { name: "Lists" }).click();
  await expect(page.getByText("Fetch Public Leads").first()).toBeVisible();

  await page.getByRole("button", { name: "Fetch Public Leads" }).first().click();
  await expect(page.getByRole("heading", { name: "Fetch Public Leads" })).toBeVisible();

  await page.locator("input[type='number']").fill("10");
  await page.getByRole("button", { name: "Fetch Leads" }).click();

  // Either success toast or already-deduped/no-new message counts as graceful behavior.
  await expect(
    page.getByText(/Leads aggregated!|Added \d+ new contacts|No new leads found/i).first()
  ).toBeVisible({ timeout: 30_000 });
});
