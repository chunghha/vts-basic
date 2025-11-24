import { useEffect, useId } from 'react'
import { APP_VERSION } from '../../constants/appVersion'

export default function About() {
	const year = new Date().getFullYear()
	const contactId = useId()

	// Scroll Animation Logic (matching Home page)
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible')
					}
				}
			},
			{ threshold: 0.1 },
		)

		const elements = document.querySelectorAll('.animate-on-scroll')
		for (const el of elements) observer.observe(el)

		return () => observer.disconnect()
	}, [])

	return (
		<main className="min-h-screen bg-base-100 text-base-content">
			{/* Hero Section */}
			<section className="py-16 px-6 bg-linear-to-b from-base-200/50 to-base-100">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-8 animate-on-scroll">
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
							<span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
							<span className="text-sm font-semibold text-primary">
								v{APP_VERSION}
							</span>
						</div>
						<h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
							<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
								About VTS Basic
							</span>
						</h1>
						<p className="text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed">
							A minimal, opinionated starter built with Tailwind CSS and
							DaisyUI. Prototype UI quickly and evaluate visual styles with
							ease.
						</p>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-6 py-12">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Article */}
					<article className="lg:col-span-2 space-y-8">
						{/* What You'll Find */}
						<section className="animate-on-scroll">
							<h2 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
								What you'll find
								<span className="badge badge-sm bg-primary/10 text-primary border-0">
									4
								</span>
							</h2>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="card bg-base-100 border border-primary/20 hover:border-primary/40 shadow-md hover:shadow-xl transition-all p-5">
									<div className="flex gap-3 items-start">
										<span className="text-3xl">✨</span>
										<div>
											<div className="font-bold text-lg mb-1">
												Responsive components
											</div>
											<div className="text-sm text-base-content/70">
												Buttons, cards, forms and other small UI building blocks
												ready to drop into your app.
											</div>
										</div>
									</div>
								</div>

								<div className="card bg-base-100 border border-secondary/20 hover:border-secondary/40 shadow-md hover:shadow-xl transition-all p-5">
									<div className="flex gap-3 items-start">
										<span className="text-3xl">🎨</span>
										<div>
											<div className="font-bold text-lg mb-1">
												Theme exploration
											</div>
											<div className="text-sm text-base-content/70">
												Preconfigured DaisyUI themes with a theme switcher so
												you can preview different looks instantly.
											</div>
										</div>
									</div>
								</div>

								<div className="card bg-base-100 border border-accent/20 hover:border-accent/40 shadow-md hover:shadow-xl transition-all p-5">
									<div className="flex gap-3 items-start">
										<span className="text-3xl">⚡</span>
										<div>
											<div className="font-bold text-lg mb-1">
												TanStack Query integration
											</div>
											<div className="text-sm text-base-content/70">
												Example pages that fetch and display live data using
												best-practice patterns for caching and error handling.
											</div>
										</div>
									</div>
								</div>

								<div className="card bg-base-100 border border-primary/20 hover:border-primary/40 shadow-md hover:shadow-xl transition-all p-5">
									<div className="flex gap-3 items-start">
										<span className="text-3xl">🧩</span>
										<div>
											<div className="font-bold text-lg mb-1">
												Small route surface
											</div>
											<div className="text-sm text-base-content/70">
												A compact route structure (Home, About, Countries) keeps
												the project approachable and easy to extend.
											</div>
										</div>
									</div>
								</div>
							</div>
						</section>

						{/* How to Use */}
						<section className="animate-on-scroll">
							<h2 className="text-3xl font-extrabold mb-6">
								How to use this repo
							</h2>
							<div className="card bg-base-200/30 border border-base-300/30 p-6">
								<ol className="list-decimal pl-6 space-y-4 text-base-content/80">
									<li>
										Install dependencies and run the dev server:
										<div className="mt-3 flex flex-wrap gap-2 items-center">
											<code className="bg-base-300/50 px-3 py-1.5 rounded font-mono text-sm">
												bun install
											</code>
											<span className="text-base-content/60">then</span>
											<code className="bg-base-300/50 px-3 py-1.5 rounded font-mono text-sm">
												bun run dev
											</code>
										</div>
									</li>
									<li>
										Open the app and explore the Home and Countries pages.
									</li>
									<li>
										Modify or add components in isolation so your design system
										remains easy to reason about and reuse.
									</li>
								</ol>
							</div>
						</section>

						{/* Contributing */}
						<section className="animate-on-scroll">
							<h2 className="text-3xl font-extrabold mb-6">Contributing</h2>
							<div className="card bg-base-100 border border-base-300/20 p-6">
								<p className="text-base-content/70 leading-relaxed">
									If you plan to add components or routes, document their
									purpose and keep them self-contained. Small, well-documented
									additions make the project easier to maintain and integrate.
								</p>
							</div>
						</section>
					</article>

					{/* Sidebar */}
					<aside className="space-y-6">
						{/* Quick Links */}
						<div className="card bg-base-100 border border-base-300/20 shadow-md p-5 animate-on-scroll">
							<h3 className="font-bold text-lg mb-1">Quick links</h3>
							<p className="text-sm text-base-content/70 mb-4">
								Jump to common pages
							</p>
							<nav className="flex flex-col gap-2">
								<a
									className="btn btn-ghost btn-sm justify-start hover:bg-primary/10"
									href="/"
								>
									🏠 Home
								</a>
								<a
									className="btn btn-ghost btn-sm justify-start hover:bg-secondary/10"
									href="/country"
								>
									🌍 Countries
								</a>
								<a
									className="btn btn-ghost btn-sm justify-start hover:bg-accent/10"
									href={`#${contactId}`}
								>
									📧 Contact
								</a>
							</nav>
						</div>

						{/* Need Help */}
						<div className="card bg-linear-to-br from-primary/5 to-secondary/5 border border-primary/20 shadow-md p-5 animate-on-scroll">
							<h3 className="font-bold text-lg mb-2">Need help?</h3>
							<p className="text-sm text-base-content/70 mb-4">
								For questions or support, email{' '}
								<a
									className="text-primary underline font-medium"
									href="mailto:support@example.com"
								>
									support@example.com
								</a>
								.
							</p>
							<a className="btn btn-primary w-full" href={`#${contactId}`}>
								Contact Us
							</a>
						</div>
					</aside>
				</div>
			</div>

			{/* Footer */}
			<footer
				id={contactId}
				className="border-t border-base-300/20 py-8 px-6 mt-12 bg-base-200/30"
			>
				<div className="max-w-6xl mx-auto">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-base-content/70">
						<div>
							Built with{' '}
							<span className="text-primary font-semibold">Tailwind CSS</span> +{' '}
							<span className="text-secondary font-semibold">DaisyUI</span>. ©{' '}
							{year} VTS Basic.
						</div>
						<div className="flex gap-4">
							<a
								className="text-base-content/60 hover:text-primary underline transition-colors"
								href="/"
							>
								Return home
							</a>
							<a
								className="text-base-content/60 hover:text-secondary underline transition-colors"
								href="/country"
							>
								View countries
							</a>
						</div>
					</div>
				</div>
			</footer>
		</main>
	)
}
