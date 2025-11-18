import { useQuery } from '@tanstack/react-query'
import { useId, useMemo, useState } from 'react'

type Country = {
	code: string
	name: string
	region: string
	flagEmoji: string
	population: number
}

async function fetchCountries(): Promise<Country[]> {
	const res = await fetch(
		'https://restcountries.com/v3.1/all?fields=name,cca2,region,flags,population',
	)
	if (!res.ok) {
		throw new Error(`Failed to fetch countries: ${res.statusText}`)
	}
	type RawCountry = {
		cca2?: string | null
		name?: { common?: string } | null
		region?: string | null
		population?: number | null
		flag?: string | null
		flags?: { png?: string } | null
	}
	const data = (await res.json()) as RawCountry[]

	const toEmoji = (cca2?: string | null): string => {
		if (!cca2 || cca2.length !== 2) return ''
		const A = 0x41
		const offset = 0x1f1e6
		const first = cca2.toUpperCase().charCodeAt(0)
		const second = cca2.toUpperCase().charCodeAt(1)
		if (!first || !second) return ''
		return String.fromCodePoint(offset + (first - A), offset + (second - A))
	}

	return data
		.map((c) => {
			const code = (c.cca2 || '').toUpperCase()
			const name = c?.name?.common ?? code ?? 'Unknown'
			const region = c?.region ?? 'Unknown'
			const population = typeof c?.population === 'number' ? c.population : 0
			const flagEmoji = toEmoji(code) || (c?.flag ?? '')
			return { code, name, region, population, flagEmoji } as Country
		})
		.filter(Boolean)
		.sort((a, b) => a.name.localeCompare(b.name))
}

/* ---------- Presentational components ---------- */

function LoadingGrid() {
	const PLACEHOLDERS = ['ph-0', 'ph-1', 'ph-2', 'ph-3', 'ph-4', 'ph-5']

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{PLACEHOLDERS.map((id) => (
				<div key={id} className="card bg-base-100 shadow-sm animate-pulse">
					<div className="card-body">
						<div className="h-12 w-12 bg-base-200 rounded-full mb-4" />
						<div className="h-6 bg-base-200 rounded mb-2 w-3/4" />
						<div className="h-4 bg-base-200 rounded mb-1 w-1/2" />
						<div className="mt-4 h-8 bg-base-200 rounded w-full" />
					</div>
				</div>
			))}
		</div>
	)
}

function EmptyState() {
	return (
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body">
				<h2 className="card-title">No countries found</h2>
				<p className="text-base-content/60">
					Try clearing filters or searching for a different name or code.
				</p>
			</div>
		</div>
	)
}

function ErrorAlert({ message }: { message: string }) {
	return (
		<div className="mb-6">
			<div className="alert alert-error shadow-sm">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="stroke-current flex-shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<title>Error loading countries</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M12 9v.01"
						/>
					</svg>
					<span>Error loading countries: {message}</span>
				</div>
			</div>
		</div>
	)
}

function CountryCard({ c, nf }: { c: Country; nf: Intl.NumberFormat }) {
	return (
		<article className="card bg-base-100 shadow-sm overflow-hidden">
			<div className="p-4 border-b border-base-300/10 flex items-start gap-4">
				<div className="avatar">
					<div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center text-2xl">
						{c.flagEmoji || '🏳️'}
					</div>
				</div>

				<div className="flex-1 min-w-0">
					<h3 className="card-title text-lg truncate">{c.name}</h3>
					<div className="text-xs text-base-content/60 truncate">
						{c.code} • {c.region}
					</div>
				</div>

				<div className="text-right text-sm text-base-content/70">
					<div className="text-xs">Population</div>
					<div className="font-semibold">{nf.format(c.population)}</div>
				</div>
			</div>

			<div className="card-body">
				<p className="text-sm text-base-content/70 mb-4">
					Explore {c.name}. Click details to learn more or open a quick search.
				</p>

				<div className="card-actions justify-end">
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						aria-label={`Open details for ${c.name}`}
					>
						Details
					</button>
					<a
						href={`https://www.google.com/search?q=${encodeURIComponent(c.name)}`}
						target="_blank"
						rel="noreferrer"
						className="btn btn-primary btn-sm"
					>
						Search
					</a>
				</div>
			</div>
		</article>
	)
}

/* ---------- Country page (main) ---------- */

export default function Country() {
	const searchId = useId()
	const regionId = useId()
	const sortId = useId()
	const [query, setQuery] = useState('')
	const [regionFilter, setRegionFilter] = useState<'All' | string>('All')
	const [sortKey, setSortKey] = useState<'name' | 'population'>('name')
	const [descending, setDescending] = useState(false)

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['countries'],
		queryFn: fetchCountries,
		staleTime: 1000 * 60 * 60,
		cacheTime: 1000 * 60 * 60,
	})

	const countries = data ?? []

	const regions = useMemo(() => {
		const set = new Set(countries.map((c) => c.region).filter(Boolean))
		return ['All', ...Array.from(set).sort()]
	}, [countries])

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		let list = countries.filter((c) => {
			if (regionFilter !== 'All' && c.region !== regionFilter) return false
			if (!q) return true
			return (
				c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
			)
		})

		list = list.sort((a, b) => {
			if (sortKey === 'name') {
				return a.name.localeCompare(b.name)
			} else {
				return a.population - b.population
			}
		})

		if (descending) list = list.reverse()
		return list
	}, [countries, query, regionFilter, sortKey, descending])

	const nf = useMemo(() => new Intl.NumberFormat(), [])

	return (
		<main className="min-h-screen bg-base-100 text-base-content py-12 px-4">
			<div className="max-w-7xl mx-auto">
				<header className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl md:text-4xl font-extrabold">Countries</h1>
						<p className="text-sm text-base-content/60 mt-1">
							Browse countries, filter by region, and sort by name or
							population.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<a href="/" className="btn btn-ghost" aria-label="Back to home">
							← Home
						</a>
					</div>
				</header>

				{/* Controls */}
				<section className="mb-6 grid gap-4 md:grid-cols-5 items-end">
					<div className="md:col-span-3">
						<label htmlFor={searchId} className="label">
							<span className="label-text">Search</span>
						</label>
						<input
							id={searchId}
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by name or code (e.g. 'Canada' or 'CA')"
							className="input input-bordered w-full bg-transparent"
							aria-label="Search countries"
						/>
					</div>

					<div>
						<label htmlFor={regionId} className="label">
							<span className="label-text">Region</span>
						</label>
						<select
							id={regionId}
							value={regionFilter}
							onChange={(e) => setRegionFilter(e.target.value)}
							className="select select-bordered w-full bg-transparent"
							aria-label="Filter by region"
						>
							{regions.map((r) => (
								<option key={r} value={r}>
									{r}
								</option>
							))}
						</select>
					</div>

					<div>
						<label htmlFor={sortId} className="label">
							<span className="label-text">Sort</span>
						</label>
						<div className="flex gap-2">
							<select
								id={sortId}
								value={sortKey}
								onChange={(e) =>
									setSortKey(e.target.value as 'name' | 'population')
								}
								className="select select-bordered w-full bg-transparent"
								aria-label="Sort key"
							>
								<option value="name">Name</option>
								<option value="population">Population</option>
							</select>

							<button
								type="button"
								onClick={() => setDescending((v) => !v)}
								className="btn btn-outline"
								aria-pressed={descending}
								aria-label="Toggle descending"
							>
								{descending ? 'Desc' : 'Asc'}
							</button>
						</div>
					</div>
				</section>

				{/* Status and actions */}
				<div className="mb-4 flex items-center justify-between">
					<div className="text-sm text-base-content/60">
						{isLoading
							? 'Loading countries...'
							: `Showing ${filtered.length} of ${countries.length}`}
					</div>

					<div className="space-x-2">
						<button
							type="button"
							onClick={() => {
								setQuery('')
								setRegionFilter('All')
								setSortKey('name')
								setDescending(false)
							}}
							className="btn btn-ghost btn-sm"
						>
							Reset
						</button>

						<a
							href="/about"
							className="btn btn-sm btn-primary"
							aria-label="Learn more about VTS Basic"
						>
							About
						</a>
					</div>
				</div>

				{/* Error */}
				{isError && (
					<ErrorAlert
						message={String((error as Error)?.message ?? 'Unknown')}
					/>
				)}

				{/* Content grid */}
				<section>
					{isLoading ? (
						<LoadingGrid />
					) : filtered.length === 0 ? (
						<EmptyState />
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{filtered.map((c) => (
								<CountryCard key={c.code} c={c} nf={nf} />
							))}
						</div>
					)}
				</section>
			</div>
		</main>
	)
}
