import { expect, test } from '@playwright/test'

test.describe('Country Page E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/country')
	})

	test('should load and display countries', async ({ page }) => {
		// Wait for the page to load
		await expect(page.locator('h1')).toContainText('Countries')

		// Wait for countries to load (should see country cards)
		await expect(page.locator('article').first()).toBeVisible({
			timeout: 10000,
		})

		// Should have multiple country cards
		const countryCards = page.locator('article')
		await expect(countryCards).not.toHaveCount(0)
	})

	test('should filter countries by region', async ({ page }) => {
		// Wait for countries to load
		await expect(page.locator('article').first()).toBeVisible({
			timeout: 10000,
		})

		// Get initial count
		const initialCount = await page.locator('article').count()
		expect(initialCount).toBeGreaterThan(0)

		// Select a region filter
		await page.selectOption('select[aria-label="Filter by region"]', 'Europe')

		// Wait for filter to apply
		await page.waitForTimeout(500)

		// Verify we're showing filtered results
		const countText = await page
			.locator('text=/Showing \\d+ of \\d+/')
			.textContent()
		expect(countText).toBeTruthy()
	})

	test('should search countries by name', async ({ page }) => {
		// Wait for countries to load
		await expect(page.locator('article').first()).toBeVisible({
			timeout: 10000,
		})

		// Type in search box
		const searchInput = page.locator('input[type="search"]')
		await searchInput.fill('united')

		// Wait for search to apply
		await page.waitForTimeout(500)

		// Should show filtered results
		const countryCards = page.locator('article')
		const count = await countryCards.count()

		// Should have some results
		expect(count).toBeGreaterThan(0)

		// Verify results contain "united" in the name
		const firstCard = countryCards.first()
		const cardText = await firstCard.textContent()
		expect(cardText?.toLowerCase()).toContain('united')
	})

	test('should sort countries by population', async ({ page }) => {
		// Wait for countries to load
		await expect(page.locator('article').first()).toBeVisible({
			timeout: 10000,
		})

		// Change sort to population
		await page.selectOption('select[aria-label="Sort key"]', 'population')

		// Wait for sort to apply
		await page.waitForTimeout(500)

		// Verify countries are displayed (sorting is applied)
		const countryCards = page.locator('article')
		await expect(countryCards.first()).toBeVisible()
	})

	test('should toggle sort order', async ({ page }) => {
		// Wait for countries to load
		await expect(page.locator('article').first()).toBeVisible({
			timeout: 10000,
		})

		// Find the sort order toggle button
		const toggleButton = page.locator('button[aria-label="Toggle descending"]')
		await expect(toggleButton).toBeVisible()

		// Should show "Asc" initially
		await expect(toggleButton).toContainText('Asc')

		// Click to toggle
		await toggleButton.click()

		// Should now show "Desc"
		await expect(toggleButton).toContainText('Desc')

		// Click again to toggle back
		await toggleButton.click()

		// Should show "Asc" again
		await expect(toggleButton).toContainText('Asc')
	})

	test('should reset filters', async ({ page }) => {
		// Wait for countries to load
		await expect(page.locator('article').first()).toBeVisible({
			timeout: 10000,
		})

		// Apply some filters
		await page.selectOption('select[aria-label="Filter by region"]', 'Asia')
		await page.locator('input[type="search"]').fill('japan')

		// Wait for filters to apply
		await page.waitForTimeout(500)

		// Click reset button
		await page.click('button:has-text("Reset")')

		// Wait for reset to apply
		await page.waitForTimeout(500)

		// Search should be cleared
		const searchValue = await page.locator('input[type="search"]').inputValue()
		expect(searchValue).toBe('')

		// Region should be back to "All"
		const regionValue = await page
			.locator('select[aria-label="Filter by region"]')
			.inputValue()
		expect(regionValue).toBe('All')
	})

	test('should show empty state when no results', async ({ page }) => {
		// Wait for countries to load
		await expect(page.locator('article').first()).toBeVisible({
			timeout: 10000,
		})

		// Search for something that doesn't exist
		await page.locator('input[type="search"]').fill('zzzzzzzzz')

		// Wait for search to apply
		await page.waitForTimeout(500)

		// Should show empty state message
		await expect(page.locator('text=No countries found')).toBeVisible()
	})

	test('should combine multiple filters', async ({ page }) => {
		// Wait for countries to load
		await expect(page.locator('article').first()).toBeVisible({
			timeout: 10000,
		})

		// Apply region filter
		await page.selectOption(
			'select[aria-label="Filter by region"]',
			'Americas',
		)

		// Wait for filter to apply
		await page.waitForTimeout(500)

		// Then search within that region
		await page.locator('input[type="search"]').fill('canada')

		// Wait for search to apply
		await page.waitForTimeout(500)

		// Should have results
		const countryCards = page.locator('article')
		const count = await countryCards.count()

		// Should show at least one result (Canada)
		expect(count).toBeGreaterThan(0)
	})

	test('should navigate back to home', async ({ page }) => {
		// Click the home link
		await page.click('a:has-text("Home")')

		// Should navigate to home page
		await expect(page).toHaveURL('/')
	})
})
