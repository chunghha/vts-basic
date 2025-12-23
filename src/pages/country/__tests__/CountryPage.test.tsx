import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SafeAny } from '../../../types/common'

vi.mock('@tanstack/react-router', () => ({
	Link: ({
		to,
		children,
		...props
	}: {
		to?: string
		children?: React.ReactNode
		[k: string]: SafeAny
	}) => (
		<a href={to} {...props}>
			{children}
		</a>
	),
}))

vi.mock('../../../api/countries', () => ({
	getAllCountries: vi.fn(),
}))

vi.mock('../../../components/VirtualizedCountryList', () => ({
	VirtualizedCountryList: ({
		countries,
		nf,
	}: {
		countries: {
			code: string
			name: string
			region: string
			population: number
		}[]
		nf: Intl.NumberFormat
	}) => (
		<div data-testid="country-list">
			{countries.map((c) => (
				<div key={c.code} data-testid={`country-${c.code}`}>
					<span>{c.name}</span>
					<span>{c.region}</span>
					<span>{nf.format(c.population)}</span>
				</div>
			))}
		</div>
	),
}))

import { getAllCountries } from '../../../api/countries'
import CountryPage from '../index'

const mockCountries = [
	{
		code: 'US',
		name: 'United States',
		region: 'Americas',
		population: 331000000,
		flag: 'https://flagcdn.com/us.png',
	},
	{
		code: 'CA',
		name: 'Canada',
		region: 'Americas',
		population: 38000000,
		flag: 'https://flagcdn.com/ca.png',
	},
	{
		code: 'DE',
		name: 'Germany',
		region: 'Europe',
		population: 83000000,
		flag: 'https://flagcdn.com/de.png',
	},
	{
		code: 'JP',
		name: 'Japan',
		region: 'Asia',
		population: 126000000,
		flag: 'https://flagcdn.com/jp.png',
	},
	{
		code: 'AU',
		name: 'Australia',
		region: 'Oceania',
		population: 26000000,
		flag: 'https://flagcdn.com/au.png',
	},
]

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
				staleTime: 0,
			},
		},
	})
}

function renderWithProviders(ui: React.ReactElement) {
	const queryClient = createTestQueryClient()
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	)
}

describe('CountryPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		cleanup()
	})

	describe('Loading State', () => {
		it('shows loading skeleton while fetching data', () => {
			vi.mocked(getAllCountries).mockImplementation(() => new Promise(() => {}))

			renderWithProviders(<CountryPage />)

			expect(screen.getByText('Loading countries...')).toBeTruthy()
		})
	})

	describe('Error State', () => {
		it('displays error message when fetch fails', async () => {
			vi.mocked(getAllCountries).mockRejectedValue(new Error('Network error'))

			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(
					screen.getByText(/Error loading countries: Network error/i),
				).toBeTruthy()
			})
		})
	})

	describe('Success State', () => {
		beforeEach(() => {
			vi.mocked(getAllCountries).mockResolvedValue(mockCountries)
		})

		it('renders country list after successful fetch', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			expect(screen.getByText('Canada')).toBeTruthy()
			expect(screen.getByText('Germany')).toBeTruthy()
		})

		it('displays correct count of countries', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText(/Showing 5 of 5/)).toBeTruthy()
			})
		})
	})

	describe('Search Functionality', () => {
		beforeEach(() => {
			vi.mocked(getAllCountries).mockResolvedValue(mockCountries)
		})

		it('filters countries by name search', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const searchInput = screen.getByPlaceholderText(/Search by name or code/i)
			fireEvent.change(searchInput, { target: { value: 'Canada' } })

			await waitFor(() => {
				expect(screen.getByText(/Showing 1 of 5/)).toBeTruthy()
			})

			expect(screen.getByText('Canada')).toBeTruthy()
			expect(screen.queryByText('United States')).toBeNull()
		})

		it('filters countries by country code', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const searchInput = screen.getByPlaceholderText(/Search by name or code/i)
			fireEvent.change(searchInput, { target: { value: 'DE' } })

			await waitFor(() => {
				expect(screen.getByText(/Showing 1 of 5/)).toBeTruthy()
			})

			expect(screen.getByText('Germany')).toBeTruthy()
		})

		it('shows empty state when no matches found', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const searchInput = screen.getByPlaceholderText(/Search by name or code/i)
			fireEvent.change(searchInput, { target: { value: 'xyz123' } })

			await waitFor(() => {
				expect(screen.getByText('No countries found')).toBeTruthy()
			})
		})
	})

	describe('Region Filter', () => {
		beforeEach(() => {
			vi.mocked(getAllCountries).mockResolvedValue(mockCountries)
		})

		it('filters countries by region', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const regionSelect = screen.getByLabelText('Filter by region')
			fireEvent.change(regionSelect, { target: { value: 'Europe' } })

			await waitFor(() => {
				expect(screen.getByText(/Showing 1 of 5/)).toBeTruthy()
			})

			expect(screen.getByText('Germany')).toBeTruthy()
			expect(screen.queryByText('United States')).toBeNull()
		})

		it('shows all countries when "All" region selected', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const regionSelect = screen.getByLabelText('Filter by region')
			fireEvent.change(regionSelect, { target: { value: 'Americas' } })

			await waitFor(() => {
				expect(screen.getByText(/Showing 2 of 5/)).toBeTruthy()
			})

			fireEvent.change(regionSelect, { target: { value: 'All' } })

			await waitFor(() => {
				expect(screen.getByText(/Showing 5 of 5/)).toBeTruthy()
			})
		})
	})

	describe('Sorting', () => {
		beforeEach(() => {
			vi.mocked(getAllCountries).mockResolvedValue(mockCountries)
		})

		it('toggles sort direction when clicking Asc/Desc button', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const toggleButton = screen.getByRole('button', {
				name: /Toggle descending/i,
			})
			expect(toggleButton.textContent).toBe('Asc')

			fireEvent.click(toggleButton)

			expect(toggleButton.textContent).toBe('Desc')
		})

		it('changes sort key between name and population', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const sortSelect = screen.getByLabelText('Sort key')
			expect(sortSelect).toBeTruthy()

			fireEvent.change(sortSelect, { target: { value: 'population' } })

			await waitFor(() => {
				const option = sortSelect.querySelector(
					'option[value="population"]',
				) as HTMLOptionElement
				expect(option?.selected).toBe(true)
			})
		})
	})

	describe('Reset Functionality', () => {
		beforeEach(() => {
			vi.mocked(getAllCountries).mockResolvedValue(mockCountries)
		})

		it('resets all filters when clicking Reset button', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const searchInput = screen.getByPlaceholderText(/Search by name or code/i)
			fireEvent.change(searchInput, { target: { value: 'Canada' } })

			await waitFor(() => {
				expect(screen.getByText(/Showing 1 of 5/)).toBeTruthy()
			})

			const resetButton = screen.getByRole('button', { name: 'Reset' })
			fireEvent.click(resetButton)

			await waitFor(() => {
				expect(screen.getByText(/Showing 5 of 5/)).toBeTruthy()
			})

			expect((searchInput as HTMLInputElement).value).toBe('')
		})
	})

	describe('Combined Filters', () => {
		beforeEach(() => {
			vi.mocked(getAllCountries).mockResolvedValue(mockCountries)
		})

		it('applies search and region filter together', async () => {
			renderWithProviders(<CountryPage />)

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeTruthy()
			})

			const regionSelect = screen.getByLabelText('Filter by region')
			fireEvent.change(regionSelect, { target: { value: 'Americas' } })

			await waitFor(() => {
				expect(screen.getByText(/Showing 2 of 5/)).toBeTruthy()
			})

			const searchInput = screen.getByPlaceholderText(/Search by name or code/i)
			fireEvent.change(searchInput, { target: { value: 'United' } })

			await waitFor(() => {
				expect(screen.getByText(/Showing 1 of 5/)).toBeTruthy()
			})

			expect(screen.getByText('United States')).toBeTruthy()
			expect(screen.queryByText('Canada')).toBeNull()
		})
	})
})
