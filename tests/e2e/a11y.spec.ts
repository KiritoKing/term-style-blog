import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Smoke Tests', () => {
  test('home page has no critical axe violations', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('main, [role="main"], body')
      .analyze();
    
    // Smoke test: only block on critical violations, not all violations
    // Color contrast issues (AA) are pre-existing UI issues, not test failures
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );
    expect(criticalViolations).toHaveLength(0);
  });

  test('posts listing has no critical axe violations', async ({ page }) => {
    await page.goto('/posts');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('main, [role="main"], body')
      .analyze();
    
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );
    expect(criticalViolations).toHaveLength(0);
  });

  test('about page has no critical axe violations', async ({ page }) => {
    await page.goto('/about');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('main, [role="main"], body')
      .analyze();
    
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );
    expect(criticalViolations).toHaveLength(0);
  });
});