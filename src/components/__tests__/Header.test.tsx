import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Mock the Link component from @tanstack/react-router so Header can render without a router.
 * We return a simple anchor so queries work the same as in the app.
 */
vi.mock('@tanstack/react-router', () => {
	return {
		Link: ({ to, children }: { to?: string; children?: unknown }) => (
			<a href={to}>{children}</a>
		),
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
		expect(screen.getByText('Home')).toBeTruthy()

		// The header renders an About link in the desktop nav and another in the mobile menu,
		// assert that at least one About link exists.
		expect(screen.getAllByText('About').length).toBeGreaterThanOrEqual(1)

		expect(screen.getByText('Country')).toBeTruthy()
	})

	it('toggles the mobile menu and closes it when actions are taken', () => {
		render(<Header />)

		// The mobile toggle has an accessible name "Toggle menu"
		const toggle = screen.getByRole('button', { name: /toggle menu/i })
		expect(toggle).toBeTruthy()

		// Mobile menu should be closed at first (no mobile 'Get started' button present)
		expect(screen.queryByText('Get started')).toBeNull()

		// Open mobile menu
		fireEvent.click(toggle)

		// Mobile menu content should now be visible
		expect(screen.getByText('Get started')).toBeTruthy()

		// Because the desktop and mobile nav both include 'About', ensure multiple matches exist
		const aboutMatches = screen.getAllByText('About')
		expect(aboutMatches.length).toBeGreaterThanOrEqual(2)

		// Clicking the 'Get started' button (mobile CTA) should close the mobile menu
		const getStarted = screen.getByText('Get started')
		fireEvent.click(getStarted)

		// After clicking the CTA, mobile content should be removed
		expect(screen.queryByText('Get started')).toBeNull()
	})
})
