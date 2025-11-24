import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Provide a minimal mock for @tanstack/react-router so Header and any modules
 * that import items from the router (like the app root) can be imported safely
 * during tests.
 *
 * We mock:
 * - `Link` as a simple anchor so queries and clicks behave like the real thing.
 * - `createRootRouteWithContext` as a no-op factory so modules that call it
 *   won't throw during test import.
 * - `HeadContent` and `Scripts` as simple components used by the app root.
 */
vi.mock('@tanstack/react-router', () => {
	return {
		Link: ({
			to,
			children,
			...props
		}: {
			to?: string
			children?: unknown
			[k: string]: unknown
		}) => (
			<a href={to} {...(props as unknown)}>
				{children}
			</a>
		),
		createRootRouteWithContext: () => () => (route: unknown) => route,
		HeadContent: () => null,
		Scripts: () => null,
	}
})

import Header from '../Header'

describe('Header', () => {
	beforeEach(() => {
		// ensure a clean DOM and no persisted theme state influences tests
		localStorage.clear()
		document.documentElement.removeAttribute('data-theme')
	})

	afterEach(() => {
		cleanup()
	})

	it('renders primary navigation links (desktop)', () => {
		render(<Header />)

		// Desktop nav links are rendered (we use truthy checks to avoid requiring extra matchers)
		expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)

		// The header renders an About link in the desktop nav and another in the mobile menu,
		// assert that at least one About link exists.
		expect(screen.getAllByText('About').length).toBeGreaterThanOrEqual(1)

		expect(screen.getAllByText('Countries').length).toBeGreaterThanOrEqual(1)
	})

	it('toggles the mobile menu and closes it when actions are taken', () => {
		render(<Header />)

		// The mobile toggle has an accessible name "Open menu"
		const toggle = screen.getByRole('button', { name: /open menu/i })
		expect(toggle).toBeTruthy()

		// Mobile menu container should exist but be hidden via classes
		// We check the container div that wraps the nav
		const mobileMenuContainer =
			screen.getByLabelText('Mobile navigation').parentElement
		expect(mobileMenuContainer).not.toBeNull()
		expect(mobileMenuContainer?.classList.contains('grid-rows-[0fr]')).toBe(
			true,
		)
		expect(mobileMenuContainer?.classList.contains('opacity-0')).toBe(true)

		// Open mobile menu
		fireEvent.click(toggle)

		// Mobile menu should now be visible
		expect(mobileMenuContainer?.classList.contains('grid-rows-[1fr]')).toBe(
			true,
		)
		expect(mobileMenuContainer?.classList.contains('opacity-100')).toBe(true)

		// Because the desktop and mobile nav both include 'About', ensure multiple matches exist
		const aboutMatches = screen.getAllByText('About')
		expect(aboutMatches.length).toBeGreaterThanOrEqual(2)

		// Click toggle again to close
		fireEvent.click(toggle)

		// After clicking toggle, mobile content should be hidden again
		expect(mobileMenuContainer?.classList.contains('grid-rows-[0fr]')).toBe(
			true,
		)
		expect(mobileMenuContainer?.classList.contains('opacity-0')).toBe(true)
	})
})
