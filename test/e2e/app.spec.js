// End-to-end tests driving the real app in a browser via Playwright.
// The webServer defined in playwright.config.js serves the static files.

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Start every test from a clean slate so localStorage does not leak between runs.
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('adds a task and shows it in the list', async ({ page }) => {
  await page.getByTestId('new-task-input').fill('Review the pull request');
  await page.getByTestId('add-button').click();

  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-list')).toContainText('Review the pull request');
  await expect(page.getByTestId('remaining-count')).toHaveText('1');
});

test('completing a task updates the remaining count', async ({ page }) => {
  await page.getByTestId('new-task-input').fill('Merge to main');
  await page.getByTestId('add-button').click();

  await page.getByTestId('task-checkbox').check();

  await expect(page.getByTestId('remaining-count')).toHaveText('0');
  await expect(page.getByTestId('task-item')).toHaveClass(/task--done/);
});

test('filters narrow the visible tasks', async ({ page }) => {
  await page.getByTestId('new-task-input').fill('Active task');
  await page.getByTestId('add-button').click();
  await page.getByTestId('new-task-input').fill('Done task');
  await page.getByTestId('add-button').click();

  // Complete the second task.
  await page.getByTestId('task-item').nth(1).getByTestId('task-checkbox').check();

  await page.getByTestId('filter-active').click();
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-list')).toContainText('Active task');

  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-list')).toContainText('Done task');
});

test('deleting a task removes it from the list', async ({ page }) => {
  await page.getByTestId('new-task-input').fill('Temporary task');
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('task-item')).toHaveCount(1);

  await page.getByTestId('task-delete').click();

  await expect(page.getByTestId('task-item')).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('tasks persist across a page reload', async ({ page }) => {
  await page.getByTestId('new-task-input').fill('Survive the reload');
  await page.getByTestId('add-button').click();

  await page.reload();

  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-list')).toContainText('Survive the reload');
});
