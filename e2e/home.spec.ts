import { expect, test } from '@playwright/test'

test.describe('Home Page E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('should load and display the home page', async ({ page }) => {
		await expect(page.locator('h1')).toBeVisible()
		await expect(page.locator('nav').first()).toBeVisible()
		await expect(page.locator('button[aria-label*="theme"]').first()).toBeVisible()
	})

	test('should navigate to different pages', async ({ page }) => {
		await page.click('a:has-text("About")')
		await expect(page).toHaveURL('/about')
		await expect(page.locator('h1')).toContainText('About')

		await page.click('a:has-text("Countries")')
		await expect(page).toHaveURL('/country')
		await expect(page.locator('h1')).toContainText('Countries')

		await page.click('a:has-text("Home")')
		await expect(page).toHaveURL('/')
	})

	test('should switch themes', async ({ page }) => {
		const themeSwitcher = page.locator('button[aria-label*="theme"]')
		await expect(themeSwitcher).toBeVisible()

		const htmlElement = page.locator('html')
		const initialTheme = await htmlElement.getAttribute('data-theme')

		await themeSwitcher.click()
		await page.waitForTimeout(500)

		const newTheme = await htmlElement.getAttribute('data-theme')
		expect(newTheme).not.toBe(initialTheme)
	})

	test('should be responsive on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 })

		await expect(page.locator('h1')).toBeVisible()
		await expect(page.locator('nav')).toBeVisible()

		const mobileNavButton = page.locator('button[aria-label*="menu"], button[aria-label*="nav"]')
		if (await mobileNavButton.isVisible()) {
			await mobileNavButton.click()
			await expect(page.locator('nav')).toBeVisible()
		}
	})

	test('should handle keyboard navigation', async ({ page }) => {
		await page.keyboard.press('Tab')

		const focusedElement = page.locator(':focus')
		await expect(focusedElement).toBeVisible()

		await page.keyboard.press('Enter')
	})

	test('should show proper page metadata', async ({ page }) => {
		const title = await page.title()
		expect(title).toBeTruthy()
		expect(title.length).toBeGreaterThan(0)

		const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
		if (metaDescription) {
			expect(metaDescription.length).toBeGreaterThan(0)
		}

		const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
		expect(viewport).toContain('width=device-width')
	})

	test('should handle errors gracefully', async ({ page }) => {
		await page.goto('/non-existent-page')

		await expect(page.locator('h1, main')).toBeVisible()
		
		const errorContent = page.locator('text=/404|not found|error/i')
		if (await errorContent.isVisible()) {
			expect(await errorContent.textContent()).toBeTruthy()
		}
	})

	test('should have proper accessibility attributes', async ({ page }) => {
		await page.keyboard.press('Tab')
		const skipLink = page.locator('a[href^="#"], a:has-text("skip")')
		if (await skipLink.isVisible()) {
			expect(await skipLink.getAttribute('href')).toBeTruthy()
		}

		const headings = page.locator('h1, h2, h3, h4, h5, h6')
		const headingCount = await headings.count()
		expect(headingCount).toBeGreaterThan(0)

		const landmarks = page.locator('main, nav, header, footer, section, article, aside')
		await expect(landmarks.first()).toBeVisible()
	})
})