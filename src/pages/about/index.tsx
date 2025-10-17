import { useId } from 'react'

export default function About(): JSX.Element {
	const year = new Date().getFullYear()
	const contactId = useId()

	return (
		<main className="min-h-screen bg-base-100 text-base-content py-16 px-6">
			<div className="max-w-6xl mx-auto">
				<div className="card bg-base-100/5 border border-base-300/10 shadow-sm overflow-hidden">
					<div className="card-body p-8 md:p-12">
						<header className="mb-6 md:mb-8">
							<h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
								About VTS Basic
							</h1>
							<p className="mt-3 text-lg text-base-content/70 max-w-2xl">
								VTS Basic is a minimal starter built with Tailwind CSS and
								DaisyUI. It provides a focused set of components, layout
								utilities, and theme tooling so you can prototype UI quickly and
								evaluate visual styles with ease.
							</p>
						</header>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							<article className="lg:col-span-2 space-y-6">
								<section>
									<h2 className="text-2xl font-semibold mb-3">
										What you'll find
									</h2>
									<ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0">
										<li className="flex gap-3 items-start">
											<span className="text-2xl">✨</span>
											<div>
												<div className="font-medium">Responsive components</div>
												<div className="text-sm text-base-content/70">
													Buttons, cards, forms and other small UI building
													blocks ready to drop into your app.
												</div>
											</div>
										</li>

										<li className="flex gap-3 items-start">
											<span className="text-2xl">🎨</span>
											<div>
												<div className="font-medium">Theme exploration</div>
												<div className="text-sm text-base-content/70">
													Preconfigured DaisyUI themes with a theme switcher so
													you can preview different looks instantly.
												</div>
											</div>
										</li>

										<li className="flex gap-3 items-start">
											<span className="text-2xl">⚡</span>
											<div>
												<div className="font-medium">
													TanStack Query integration
												</div>
												<div className="text-sm text-base-content/70">
													Example pages that fetch and display live data using
													best-practice patterns for caching and error handling.
												</div>
											</div>
										</li>

										<li className="flex gap-3 items-start">
											<span className="text-2xl">🧩</span>
											<div>
												<div className="font-medium">Small route surface</div>
												<div className="text-sm text-base-content/70">
													A compact route structure (Home, About, Countries)
													keeps the project approachable and easy to extend.
												</div>
											</div>
										</li>
									</ul>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-3">
										How to use this repo
									</h2>
									<ol className="list-decimal pl-6 space-y-2 text-base-content/80">
										<li>
											Install dependencies and run the dev server:
											<div className="mt-2">
												<code className="bg-base-200 px-2 py-0.5 rounded">
													bun install
												</code>{' '}
												<span className="text-base-content/60">then</span>{' '}
												<code className="bg-base-200 px-2 py-0.5 rounded">
													bun run dev
												</code>
											</div>
										</li>
										<li>
											Open the app and explore the Home and Countries pages.
										</li>
										<li>
											Modify or add components in isolation so your design
											system remains easy to reason about and reuse.
										</li>
									</ol>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-3">Contributing</h2>
									<p className="text-base-content/70">
										If you plan to add components or routes, document their
										purpose and keep them self-contained. Small, well-documented
										additions make the project easier to maintain and integrate.
									</p>
								</section>
							</article>

							<aside className="space-y-6">
								<div className="bg-base-100 p-4 rounded border border-base-300/10">
									<div className="flex items-start justify-between">
										<div>
											<h3 className="font-semibold">Quick links</h3>
											<p className="text-sm text-base-content/70">
												Jump to common pages
											</p>
										</div>
									</div>

									<nav className="mt-4 flex flex-col gap-2">
										<a className="btn btn-ghost justify-start" href="/">
											Home
										</a>
										<a className="btn btn-ghost justify-start" href="/country">
											Countries
										</a>
										<a
											className="btn btn-ghost justify-start"
											href={`#${contactId}`}
										>
											Contact
										</a>
									</nav>
								</div>

								<div className="bg-base-100 p-4 rounded border border-base-300/10">
									<h3 className="font-semibold">Need help?</h3>
									<p className="text-sm text-base-content/70 mt-2">
										For questions or support, email{' '}
										<a
											className="text-primary underline"
											href="mailto:support@example.com"
										>
											support@example.com
										</a>
										.
									</p>

									<div className="mt-4">
										<a
											className="btn btn-primary w-full"
											href={`#${contactId}`}
										>
											Contact
										</a>
									</div>
								</div>
							</aside>
						</div>

						<footer
							id={contactId}
							className="mt-8 border-t border-base-300/10 pt-6 text-sm text-base-content/70"
						>
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
								<div>
									Built with Tailwind CSS + DaisyUI. © {year} VTS Basic.
								</div>

								<div className="flex gap-3">
									<a className="text-base-content/60 underline" href="/">
										Return home
									</a>
									<a className="text-base-content/60 underline" href="/country">
										View countries
									</a>
								</div>
							</div>
						</footer>
					</div>
				</div>
			</div>
		</main>
	)
}
