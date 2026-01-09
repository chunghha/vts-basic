/**
 * US State data with economic metrics
 */
export interface USState {
	code: string // 'CA', 'NY', etc.
	name: string // 'California', 'New York'
	population: number // 2020 Census
	gdp: number // in billions USD
	gdpYear: number // year of GDP data
	medianIncome: number // annual median household income in USD
	medianIncomeYear: number // year of median income data
	medianHousePrice: number // median house price in USD
	medianHousePriceYear: number // year of median house price data
}
