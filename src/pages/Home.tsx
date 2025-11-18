import { useId } from 'react'
import { APP_VERSION } from '../routes/__root'

export default function Home() {
	const emailId = useId()
	const componentsId = useId()
	const themesId = useId()
	return (
		<main className="min-h-screen bg-base-100 text-base-content">
			{/* Hero */}
			<section className="hero min-h-[60vh] bg-base-100">
				<div className="hero-content max-w-5xl w-full flex-col lg:flex-row gap-8">
					<div className="w-full lg:w-1/2 text-center lg:text-left">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
							VTS Basic
						</h1>
						<p className="mt-4 text-lg md:text-xl text-base-content/70">
							A lightweight starter built with Tailwind CSS and DaisyUI. Tidy
							routes, theme tooling, and responsive components so you can
							prototype UI quickly.
						</p>

						<div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
							<a
								href={`#${componentsId}`}
								className="btn btn-primary btn-md"
								aria-label="Explore components"
							>
								Explore Components
							</a>

							<a
								href={`#${themesId}`}
								className="btn btn-outline btn-md"
								aria-label="View themes"
							>
								View Themes
							</a>

							<a
								href="/about"
								className="btn btn-ghost btn-md"
								aria-label="About VTS Basic"
							>
								About
							</a>
						</div>

						<p className="mt-6 text-sm text-base-content/60 max-w-prose">
							Opinionated but small: this starter focuses on a compact route
							structure (Home, About, Countries) and a consistent visual system
							powered by DaisyUI themes. Swap themes, iterate on components, and
							ship UI faster.
						</p>
					</div>

					<div className="w-full lg:w-1/2">
						<div className="card bg-base-100 shadow-md border border-base-300/10">
							<div className="card-body">
								<div className="flex items-center justify-between">
									<div>
										<div className="text-xs text-base-content/60">Status</div>
										<div className="text-lg font-medium">Ready to use</div>
									</div>

									<div className="text-right">
										<div className="text-xs text-base-content/60">Version</div>
										<div className="badge badge-sm bg-base-200 text-base-content/70 border-0 shadow-inner font-mono font-medium">
											v{APP_VERSION}
										</div>
									</div>
								</div>

								<div className="divider my-4" />

								<ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<li className="flex items-start gap-3">
										<span className="text-2xl">🎨</span>
										<div>
											<div className="font-semibold">DaisyUI Themes</div>
											<div className="text-sm text-base-content/60">
												Swap themes instantly with the theme switcher.
											</div>
										</div>
									</li>

									<li className="flex items-start gap-3">
										<span className="text-2xl">⚡</span>
										<div>
											<div className="font-semibold">Tailwind Ready</div>
											<div className="text-sm text-base-content/60">
												Utilities-first styling and responsive defaults.
											</div>
										</div>
									</li>

									<li className="flex items-start gap-3">
										<span className="text-2xl">🗺️</span>
										<div>
											<div className="font-semibold">Simple Routes</div>
											<div className="text-sm text-base-content/60">
												Home, About, Countries — easy to extend.
											</div>
										</div>
									</li>

									<li className="flex items-start gap-3">
										<span className="text-2xl">🔎</span>
										<div>
											<div className="font-semibold">Live Data</div>
											<div className="text-sm text-base-content/60">
												Country listings powered by the REST Countries API.
											</div>
										</div>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Components showcase */}
			<section id={componentsId} className="py-12 px-6">
				<div className="max-w-6xl mx-auto">
					<header className="mb-6">
						<h2 className="text-2xl md:text-3xl font-extrabold">Components</h2>
						<p className="mt-2 text-base-content/70">
							Small, reusable pieces you can copy into your app.
						</p>
					</header>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="card bg-base-100 shadow-md border border-base-300/10">
							<div className="card-body">
								<h3 className="card-title">Buttons</h3>
								<p className="text-sm text-base-content/70">
									Primary, outline, ghost — accessible and theme-aware.
								</p>

								<div className="mt-4 flex flex-wrap gap-3">
									<button type="button" className="btn btn-primary">
										Primary
									</button>
									<button type="button" className="btn btn-outline">
										Outline
									</button>
									<button type="button" className="btn btn-ghost">
										Ghost
									</button>
								</div>
							</div>
						</div>

						<div className="card bg-base-100 shadow-md border border-base-300/10">
							<div className="card-body">
								<h3 className="card-title">Form</h3>
								<p className="text-sm text-base-content/70">
									Clean inputs with labels and helpers.
								</p>

								<div className="mt-4 space-y-3">
									<label htmlFor={emailId} className="label">
										<span className="label-text">Email</span>
									</label>
									<input
										id={emailId}
										className="input input-bordered w-full"
										placeholder="you@example.com"
										aria-label="Email"
									/>
								</div>
							</div>
						</div>

						<div className="card bg-base-100 shadow-md border border-base-300/10">
							<div className="card-body">
								<h3 className="card-title">Cards</h3>
								<p className="text-sm text-base-content/70">
									Content containers with actions and flexible layout.
								</p>

								<div className="mt-4">
									<div className="card bg-base-100 shadow">
										<div className="card-body">
											<h4 className="font-semibold">Example card</h4>
											<p className="text-sm text-base-content/70">
												A compact card with title, body, and actions.
											</p>
											<div className="card-actions mt-4">
												<button type="button" className="btn btn-sm btn-ghost">
													Action
												</button>
												<button
													type="button"
													className="btn btn-sm btn-primary"
												>
													Primary
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Themes preview */}
			<section id={themesId} className="py-12 px-6 bg-base-200/50">
				<div className="max-w-6xl mx-auto">
					<header className="mb-6">
						<h2 className="text-2xl md:text-3xl font-extrabold">Themes</h2>
						<p className="mt-2 text-base-content/70">
							Quickly try different DaisyUI themes using the theme switcher in
							the header.
						</p>
					</header>

					<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
						{['light', 'milkshake', 'dark', 'mindful', 'polar', 'pursuit'].map(
							(t) => (
								<fieldset
									key={t}
									className="rounded-lg p-4 bg-base-100 border border-base-300/10 shadow-md"
									aria-label={`Theme preview ${t}`}
								>
									<legend className="sr-only">Theme preview {t}</legend>
									<div className="font-semibold capitalize">{t}</div>
									<div className="mt-2 text-sm text-base-content/60">
										Color preview for {t}.
									</div>
									<div className="mt-4 flex gap-2">
										<div className="h-6 w-6 rounded bg-primary" />
										<div className="h-6 w-6 rounded bg-secondary" />
										<div className="h-6 w-6 rounded bg-accent" />
									</div>
								</fieldset>
							),
						)}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-8 px-6">
				<div className="max-w-6xl mx-auto text-center text-sm text-base-content/60">
					<div className="mb-2">
						Built with Tailwind CSS + DaisyUI. © {new Date().getFullYear()} VTS
						Basic.
					</div>
					<div className="flex items-center justify-center gap-4">
						<a href="/about" className="link link-hover">
							About
						</a>
						<a href="/country" className="link link-hover">
							Countries
						</a>
						<a
							href="mailto:support@example.com"
							className="link link-hover"
							aria-label="Contact support"
						>
							Contact
						</a>
					</div>
				</div>
			</footer>
		</main>
	)
}
