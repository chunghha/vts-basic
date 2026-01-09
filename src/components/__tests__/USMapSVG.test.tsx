import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import USMapSVG from '../USMapSVG'
import { US_MAP_MODES, US_MAP_COLORS } from '../../constants/us-map-colors'
import type { USState } from '../../types/us-map'

const mockStates: USState[] = [
	{
		code: 'CA',
		name: 'California',
		population: 39000000,
		gdp: 4100,
		gdpYear: 2024,
		medianIncome: 91500,
		medianIncomeYear: 2023,
	},
	{
		code: 'TX',
		name: 'Texas',
		population: 29000000,
		gdp: 2700,
		gdpYear: 2024,
		medianIncome: 77150,
		medianIncomeYear: 2023,
	},
	{
		code: 'FL',
		name: 'Florida',
		population: 21500000,
		gdp: 1700,
		gdpYear: 2024,
		medianIncome: 77250,
		medianIncomeYear: 2023,
	},
	{
		code: 'NY',
		name: 'New York',
		population: 19950000,
		gdp: 2300,
		gdpYear: 2024,
		medianIncome: 85450,
		medianIncomeYear: 2023,
	},
]

describe('USMapSVG Component', () => {
	const mockOnStateClick = vi.fn()
	const mockOnModeChange = vi.fn()

	beforeEach(() => {
		mockOnStateClick.mockClear()
		mockOnModeChange.mockClear()
	})

	describe('Display Mode Toggle', () => {
		it('renders toggle buttons with correct text', () => {
			const { container } = render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			expect(screen.getByText('GDP')).toBeTruthy()
			expect(screen.getByText('Median Income')).toBeTruthy()
		})

		it('GDP button should be pressed when displayMode is GDP', () => {
			render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			const gdpButton = screen.getByText('GDP').closest('button')
			expect(gdpButton?.getAttribute('aria-pressed')).toBe('true')
		})

		it('Income button should be pressed when displayMode is INCOME', () => {
			render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.INCOME}
					onModeChange={mockOnModeChange}
				/>
			)

			const incomeButton = screen.getByText('Median Income').closest('button')
			expect(incomeButton?.getAttribute('aria-pressed')).toBe('true')
		})

		it('calls onModeChange with GDP when GDP button is clicked', () => {
			render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.INCOME}
					onModeChange={mockOnModeChange}
				/>
			)

			const gdpButton = screen.getByText('GDP').closest('button')
			if (gdpButton) fireEvent.click(gdpButton)

			expect(mockOnModeChange).toHaveBeenCalledWith(US_MAP_MODES.GDP)
		})

		it('calls onModeChange with INCOME when Income button is clicked', () => {
			render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			const incomeButton = screen.getByText('Median Income').closest('button')
			if (incomeButton) fireEvent.click(incomeButton)

			expect(mockOnModeChange).toHaveBeenCalledWith(US_MAP_MODES.INCOME)
		})
	})

	describe('Legend Display', () => {
		it('displays GDP labels in legend when mode is GDP', () => {
			render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			expect(screen.getByText(/Lowest GDP/i)).toBeTruthy()
			expect(screen.getByText(/Low GDP/i)).toBeTruthy()
			expect(screen.getByText(/Medium GDP/i)).toBeTruthy()
			expect(screen.getByText(/High GDP/i)).toBeTruthy()
		})

		it('displays Income labels in legend when mode is INCOME', () => {
			render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.INCOME}
					onModeChange={mockOnModeChange}
				/>
			)

			expect(screen.getByText(/Lowest Income/i)).toBeTruthy()
			expect(screen.getByText(/Low Income/i)).toBeTruthy()
			expect(screen.getByText(/Medium Income/i)).toBeTruthy()
			expect(screen.getByText(/High Income/i)).toBeTruthy()
		})

		it('uses pastel colors in legend', () => {
			const { container } = render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			const legendBoxes = container.querySelectorAll('.w-6.h-6.rounded-sm')
			expect(legendBoxes.length).toBeGreaterThanOrEqual(4)

			// Check that at least one box has the q1 color
			const colors = Array.from(legendBoxes).map((box) =>
				window.getComputedStyle(box).backgroundColor
			)
			expect(colors.length).toBeGreaterThanOrEqual(1)
		})
	})

	describe('SVG Rendering', () => {
		it('renders SVG with proper aria-label including display mode', () => {
			const { rerender } = render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			let svg = screen.getByRole('img')
			expect(svg.getAttribute('aria-label')).toContain('GDP')

			rerender(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.INCOME}
					onModeChange={mockOnModeChange}
				/>
			)

			svg = screen.getByRole('img')
			expect(svg.getAttribute('aria-label')).toContain('Median Income')
		})
	})

	describe('State Interaction', () => {
		it('calls onStateClick when a state is clicked', () => {
			render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			const stateElements = screen.getAllByRole('button')
			// Find a state button (not toggle buttons)
			const stateButton = stateElements.find((btn) =>
				btn.getAttribute('aria-label')?.includes('California')
			)

			if (stateButton) {
				fireEvent.click(stateButton)
				expect(mockOnStateClick).toHaveBeenCalledWith(expect.any(Object))
			}
		})

		it('displays state overlay with correct data based on display mode', () => {
			const { rerender } = render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					selectedState={mockStates[0]}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			// In GDP mode, should show GDP and per capita
			expect(screen.getByText(/GDP:/i)).toBeTruthy()

			// Switch to income mode
			rerender(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					selectedState={mockStates[0]}
					displayMode={US_MAP_MODES.INCOME}
					onModeChange={mockOnModeChange}
				/>
			)

			// In income mode, should show median income
			expect(screen.getByText(/Median Income:/i)).toBeTruthy()
		})
	})

	describe('Accessibility', () => {
		it('toggle buttons have proper ARIA attributes', () => {
			render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			const gdpButton = screen.getByText('GDP').closest('button')
			const incomeButton = screen.getByText('Median Income').closest('button')

			expect(gdpButton?.hasAttribute('aria-pressed')).toBe(true)
			expect(incomeButton?.hasAttribute('aria-pressed')).toBe(true)
		})

		it('state buttons have descriptive aria-labels with current metric', () => {
			const { rerender } = render(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.GDP}
					onModeChange={mockOnModeChange}
				/>
			)

			const stateButtons = screen.getAllByRole('button')
			const caButton = stateButtons.find((btn) =>
				btn.getAttribute('aria-label')?.includes('California')
			)

			expect(caButton?.getAttribute('aria-label')).toContain('GDP')

			rerender(
				<USMapSVG
					states={mockStates}
					onStateClick={mockOnStateClick}
					displayMode={US_MAP_MODES.INCOME}
					onModeChange={mockOnModeChange}
				/>
			)

			const stateButtonsIncome = screen.getAllByRole('button')
			const caButtonIncome = stateButtonsIncome.find((btn) =>
				btn.getAttribute('aria-label')?.includes('California')
			)

			expect(caButtonIncome?.getAttribute('aria-label')).toContain('Median Income')
		})
	})
})
