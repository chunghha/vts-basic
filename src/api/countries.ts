import type { Country } from '../hooks/useCountryFilters'
import { apiClient } from './client'

/**
 * Country API methods
 *
 * Provides type-safe methods for interacting with the country API.
 */

/**
 * Fetch all countries
 * @returns Promise resolving to array of countries
 */
export async function getAllCountries(): Promise<Country[]> {
	return apiClient.get<Country[]>('/api/country')
}

/**
 * Fetch a single country by code
 * @param code - The country code (e.g., 'US', 'GB')
 * @returns Promise resolving to a single country
 */
export async function getCountryByCode(code: string): Promise<Country> {
	return apiClient.get<Country>(`/api/country/${code}`)
}
