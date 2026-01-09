import { test, expect } from '../playwright.setup'

test('has title', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
})

test('user count', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('user')).toHaveCount(5)
})
