import { useId } from 'react'

export default function NotFound() {
	const year = new Date().getFullYear()
	const searchId = useId()

	return (
		<main className="min-h-screen bg-base-100 text-base-content flex items-center justify-center p-6">
			<div className="w-full max-w-3xl">
				<div className="card bg-base-100/5 border border-base-300/20 shadow-sm">
					<div className="card-body p-10">
						<header className="mb-6 text-center">
							<div className="mx-auto mb-4 w-24 h-24 rounded-full bg-base-200 flex items-center justify-center text-3xl">
								<span className="sr-only">Not found</span>
								<svg
									width="44"
									height="44"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="text-error"
									aria-hidden="true"
								>
									<path
										d="M12 9v4"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M12 17h.01"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>

							<h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
								Page not found
							</h1>
							<p className="mt-2 text-base-content/70">
								The page you were looking for can't be found. It may have been
								moved, renamed, or never existed.
							</p>
						</header>

						<section className="grid gap-6 md:grid-cols-2 items-start">
							<div>
								<h2 className="text-lg font-semibold mb-2">Helpful links</h2>
								<p className="text-sm text-base-content/70 mb-4">
									Try one of the quick actions below to get back on track.
								</p>

								<div className="flex flex-col sm:flex-row gap-3">
									<a
										href="/"
										className="btn btn-primary"
										aria-label="Go to home"
									>
										Go home
									</a>

									<a
										href="/about"
										className="btn btn-ghost"
										aria-label="Learn about VTS Basic"
									>
										About VTS Basic
									</a>

									<a
										href="mailto:support@example.com"
										className="btn btn-outline mt-0 sm:mt-0"
										aria-label="Contact support"
									>
										Contact support
									</a>
								</div>
							</div>

							<div>
								<h2 className="text-lg font-semibold mb-2">Search the site</h2>
								<p className="text-sm text-base-content/70 mb-3">
									If you know what you're looking for, try a quick site search.
								</p>

								<form
									action="/"
									className="flex gap-2 items-center"
									onSubmit={(e) => {
										// Default search: forward to home with query param.
										// This keeps the page self-contained and keyboard friendly.
										e.preventDefault()
										const form = e.currentTarget as HTMLFormElement
										const input = form.querySelector(
											'input[name="q"]',
										) as HTMLInputElement | null
										const q = input?.value.trim()
										if (!q) {
											// If empty, just go home.
											window.location.href = '/'
										} else {
											// Use Google as a fallback site search.
											const url = `https://www.google.com/search?q=${encodeURIComponent(`${q} site:${window.location.host}`)}`
											window.open(url, '_blank', 'noopener,noreferrer')
										}
									}}
								>
									<label htmlFor={searchId} className="sr-only">
										Search
									</label>
									<input
										id={searchId}
										name="q"
										type="search"
										placeholder="Search the site or enter a query"
										className="input input-bordered w-full bg-transparent"
										aria-label="Search the site"
									/>
									<button type="submit" className="btn btn-primary">
										Search
									</button>
								</form>
							</div>
						</section>

						<div className="mt-8 text-center">
							<p className="text-sm text-base-content/60">
								If you think this is a bug, please reach out to support.
							</p>
						</div>
					</div>
				</div>

				<footer className="mt-6 text-center text-sm text-base-content/60">
					© {year} VTS Basic — built with Tailwind + DaisyUI
				</footer>
			</div>
		</main>
	)
}
