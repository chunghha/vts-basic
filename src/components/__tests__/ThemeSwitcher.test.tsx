import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * These components import router/link helpers that expect a runtime router.
 * Mock the Link component to render a plain <a> so tests can render Header without a router.
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
			<a href={to} {...props}>
				{children}
			</a>
		),
	}
})

import Header from '../Header'
import ThemeSwitcher from '../ThemeSwitcher'

describe('ThemeSwitcher', () => {
	beforeEach(() => {
		// Ensure a clean environment for each test
		localStorage.clear()
		document.documentElement.removeAttribute('data-theme')
	})

	afterEach(() => {
		cleanup()
	})

	it('renders a trigger button and opens the dropdown', () => {
		render(<ThemeSwitcher />)
		const trigger = screen.getByRole('button', { name: /choose theme/i })
		// use a neutral assertion that doesn't rely on jest-dom matchers
		expect(trigger).toBeTruthy()

		// Initially the menu should not be in the document
		expect(screen.queryByLabelText(/theme options/i)).toBeNull()

		// Open menu
		fireEvent.click(trigger)
		const menu = screen.getByLabelText(/theme options/i)
		expect(menu).toBeTruthy()

		// Menu should contain theme options (they use role="option")
		const optionButtons = within(menu).getAllByRole('option')
		expect(optionButtons.length).toBeGreaterThan(0)
	})

	it('persists selection to localStorage and updates document attribute', () => {
		render(<ThemeSwitcher />)
		const trigger = screen.getByRole('button', { name: /choose theme/i })

		// Open menu and pick "Light"
		fireEvent.click(trigger)
		const menu = screen.getByLabelText(/theme options/i)
		const lightOption = within(menu).getByText('Light')
		// neutral assertion
		expect(lightOption).toBeTruthy()

		// Click the Light option's button (its parent is a button/option)
		const btn = lightOption.closest('button') as HTMLButtonElement
		fireEvent.click(btn)

		// The component sets the data-theme attribute and writes localStorage
		expect(document.documentElement.getAttribute('data-theme')).toBe('light')
		expect(localStorage.getItem('theme')).toBe('light')

		// After selection the menu should be closed
		expect(screen.queryByLabelText(/theme options/i)).toBeNull()
	})

	it('supports keyboard navigation (ArrowDown / Enter) to select an option', () => {
		render(<ThemeSwitcher />)
		const trigger = screen.getByRole('button', { name: /choose theme/i })

		// Open menu
		fireEvent.click(trigger)
		const menu = screen.getByLabelText(/theme options/i)
		// options have role="option"
		const options = within(menu).getAllByRole('option')
		expect(options.length).toBeGreaterThanOrEqual(2)

		// Simulate ArrowDown to move active index to next option and press Enter
		// The component listens for keydown on document
		fireEvent.keyDown(document, { key: 'ArrowDown' })
		fireEvent.keyDown(document, { key: 'Enter' })

		// Confirm that document theme changed (cannot predict which option was chosen,
		// but it should set some theme in localStorage and on documentElement)
		const persisted = localStorage.getItem('theme')
		const dataTheme = document.documentElement.getAttribute('data-theme')
		expect(persisted).toBeTruthy()
		expect(dataTheme).toBeTruthy()
		// they should match
		expect(persisted).toBe(dataTheme)
	})
})

describe('Header', () => {
	beforeEach(() => {
		// Clean up any theme changes from other tests
		localStorage.clear()
	})

	afterEach(() => {
		cleanup()
	})

	it('renders navigation links', () => {
		render(<Header />)

		// Links provided in the header should render as anchors due to the mocked Link
		expect(screen.getByText('Home')).toBeTruthy()
		expect(screen.getByText('About')).toBeTruthy()
		expect(screen.getByText('Country')).toBeTruthy()
	})

	it('toggles mobile menu when the toggle button is clicked', () => {
		render(<Header />)

		// The toggle button has an accessible name
		const toggle = screen.getByRole('button', { name: /toggle menu/i })
		expect(toggle).toBeTruthy()

		// Initially the mobile nav should not be visible
		expect(screen.queryByText('Get started')).toBeNull()

		// Click to open
		fireEvent.click(toggle)
		// Now the mobile menu content should be visible
		expect(screen.getByText('Get started')).toBeTruthy()
		// Desktop and mobile both include an "About" link — assert there are multiple matches
		const aboutMatches = screen.getAllByText('About')
		expect(aboutMatches.length).toBeGreaterThanOrEqual(2)

		// Clicking the "Get started" button should close the menu since it sets open=false
		const getStartedBtn = screen.getByText('Get started')
		fireEvent.click(getStartedBtn)
		expect(screen.queryByText('Get started')).toBeNull()
	})
})
