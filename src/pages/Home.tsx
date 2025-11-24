import { useLoaderData } from '@tanstack/react-router'
import { useEffect, useId, useState } from 'react'
import toast from 'react-hot-toast'
import { Footer } from '../components/Footer'
import { APP_VERSION } from '../constants/appVersion'
import { THEME_CONFIG } from '../constants/config'
import { getStorageItem, setStorageItem } from '../utils/storage'

export default function Home() {
	const { themes } = useLoaderData({ from: '/' })
	const emailId = useId()
	const componentsId = useId()
	const themesId = useId()
	const [showBackToTop, setShowBackToTop] = useState(false)
	const [currentTheme, setCurrentTheme] = useState<string>(() =>
		getStorageItem(THEME_CONFIG.STORAGE_KEY, THEME_CONFIG.DEFAULT_THEME),
	)

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleThemeChange = (themeName: string) => {
		// Update the data-theme attribute on the document
		document.documentElement.setAttribute('data-theme', themeName)
		// Persist to localStorage
		setStorageItem(THEME_CONFIG.STORAGE_KEY, themeName)
		// Update current theme state
		setCurrentTheme(themeName)
		// Show success toast
		toast.success(
			`Switched to ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme`,
			{
				duration: 2000,
			},
		)
	}

	// Scroll Animation & Back to Top Logic
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible')
					}
				})
			},
			{ threshold: 0.1 },
		)

		const hiddenElements = document.querySelectorAll('.animate-on-scroll')
		hiddenElements.forEach((el) => {
			observer.observe(el)
		})

		const handleScroll = () => {
			setShowBackToTop(window.scrollY > 500)
		}

		window.addEventListener('scroll', handleScroll)

		return () => {
			hiddenElements.forEach((el) => {
				observer.unobserve(el)
			})
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])

	return (
		<main className="min-h-screen bg-base-100 text-base-content">
			{/* Hero */}
			<section className="hero min-h-[60vh] bg-base-100 animate-on-scroll">
				<div className="hero-content max-w-5xl w-full flex-col lg:flex-row gap-12">
					<div className="w-full lg:w-1/2 text-center lg:text-left">
						<h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
							VTS Basic
						</h1>
						<p className="text-xl md:text-2xl text-base-content/80 leading-relaxed font-medium">
							A lightweight starter built with{' '}
							<span className="font-semibold text-primary">Tailwind CSS</span>{' '}
							and <span className="font-semibold text-secondary">DaisyUI</span>.
							Tidy routes, theme tooling, and responsive components so you can
							prototype UI quickly.
						</p>

						<div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
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
					</div>

					<div className="w-full lg:w-1/2 animate-on-scroll delay-200">
						<div className="card bg-linear-to-br from-base-100 to-base-200 shadow-xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
							<div className="card-body">
								<div className="flex items-center justify-between mb-2">
									<div>
										<div className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">
											Status
										</div>
										<div className="text-lg font-bold mt-1 flex items-center gap-2">
											<span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
											Ready to use
										</div>
									</div>

									<div className="text-right">
										<div className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">
											Version
										</div>
										<div className="badge badge-lg bg-linear-to-r from-primary to-secondary text-info border-0 shadow-lg font-mono font-bold mt-1">
											v{APP_VERSION}
										</div>
									</div>
								</div>

								<div className="divider my-4" />

								<ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<li className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200/50 transition-colors">
										<span className="text-3xl">🎨</span>
										<div>
											<div className="font-bold text-base">DaisyUI Themes</div>
											<div className="text-sm text-base-content/70 mt-1">
												Swap themes instantly with the theme switcher.
											</div>
										</div>
									</li>

									<li className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200/50 transition-colors">
										<span className="text-3xl">⚡</span>
										<div>
											<div className="font-bold text-base">Tailwind Ready</div>
											<div className="text-sm text-base-content/70 mt-1">
												Utilities-first styling and responsive defaults.
											</div>
										</div>
									</li>

									<li className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200/50 transition-colors">
										<span className="text-3xl">🗺️</span>
										<div>
											<div className="font-bold text-base">Simple Routes</div>
											<div className="text-sm text-base-content/70 mt-1">
												Home, About, Countries — easy to extend.
											</div>
										</div>
									</li>

									<li className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200/50 transition-colors">
										<span className="text-3xl">🔎</span>
										<div>
											<div className="font-bold text-base">Live Data</div>
											<div className="text-sm text-base-content/70 mt-1">
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
			<section id={componentsId} className="py-12 px-6 animate-on-scroll">
				<div className="max-w-6xl mx-auto">
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-3">
							<h2 className="text-3xl md:text-4xl font-extrabold">
								Components
							</h2>
							<span className="badge badge-sm bg-primary/10 text-primary border border-primary/20 font-semibold">
								3
							</span>
						</div>
						<p className="text-base md:text-lg text-base-content/70 font-medium">
							Small, reusable pieces you can copy into your app.
						</p>
					</div>

					<div
						id="components"
						className="grid grid-cols-1 md:grid-cols-3 gap-6"
					>
						<div className="card bg-base-100 shadow-md border border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl">
							<div className="card-body">
								<h3 className="card-title">
									<span className="emoji">🎯</span>Buttons
								</h3>
								<p className="text-sm text-base-content/70">
									Primary, outline, ghost — accessible and theme-aware.
								</p>
								<div className="flex gap-2 mt-2">
									<span className="badge badge-sm bg-primary/10 text-primary border-0">
										DaisyUI
									</span>
								</div>

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

						<div className="card bg-base-100 shadow-md border border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-xl">
							<div className="card-body">
								<h3 className="card-title">
									<span className="emoji">📝</span>Form
								</h3>
								<p className="text-sm text-base-content/70">
									Clean inputs with labels and helpers.
								</p>
								<div className="flex gap-2 mt-2">
									<span className="badge badge-sm bg-secondary/10 text-secondary border-0">
										TanStack Form
									</span>
								</div>

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

						<div className="card bg-base-100 shadow-md border border-accent/20 hover:border-accent/40 transition-all hover:shadow-xl">
							<div className="card-body">
								<h3 className="card-title">
									<span className="emoji">🎴</span>Cards
								</h3>
								<p className="text-sm text-base-content/70">
									Content containers with actions and flexible layout.
								</p>
								<div className="flex gap-2 mt-2">
									<span className="badge badge-sm bg-accent/10 text-accent border-0">
										DaisyUI
									</span>
								</div>

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

			{/* Features Section */}
			<section className="py-12 px-6 bg-base-100 animate-on-scroll">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center p-6 rounded-2xl hover:bg-base-200/50 transition-colors duration-300 group">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Type Safe Icon</title>
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
								</svg>
							</div>
							<h3 className="text-xl font-bold mb-2">Type Safe</h3>
							<p className="text-base-content/70">
								Built with TypeScript for robust, error-free code and great
								developer experience.
							</p>
						</div>

						<div className="text-center p-6 rounded-2xl hover:bg-base-200/50 transition-colors duration-300 group">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary mb-4 group-hover:scale-110 transition-transform duration-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Themeable Icon</title>
									<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-bold mb-2">Themeable</h3>
							<p className="text-base-content/70">
								Change the look and feel instantly with DaisyUI's powerful
								theming engine.
							</p>
						</div>

						<div className="text-center p-6 rounded-2xl hover:bg-base-200/50 transition-colors duration-300 group">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4 group-hover:scale-110 transition-transform duration-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Lightweight Icon</title>
									<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
								</svg>
							</div>
							<h3 className="text-xl font-bold mb-2">Lightweight</h3>
							<p className="text-base-content/70">
								Minimal dependencies and optimized build size for fast loading
								applications.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 px-6 bg-linear-to-b from-base-100 to-base-200/30 animate-on-scroll">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						<div className="text-center">
							<div className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
								7
							</div>
							<div className="text-sm md:text-base text-base-content/70 font-medium uppercase tracking-wider">
								Themes
							</div>
						</div>
						<div className="text-center">
							<div className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
								100%
							</div>
							<div className="text-sm md:text-base text-base-content/70 font-medium uppercase tracking-wider">
								Type Safe
							</div>
						</div>
						<div className="text-center">
							<div className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
								⚡
							</div>
							<div className="text-sm md:text-base text-base-content/70 font-medium uppercase tracking-wider">
								Lightning Fast
							</div>
						</div>
						<div className="text-center">
							<div className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
								✓
							</div>
							<div className="text-sm md:text-base text-base-content/70 font-medium uppercase tracking-wider">
								Production Ready
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Themes preview */}
			<section
				id={themesId}
				className="py-12 px-6 bg-base-200/50 animate-on-scroll"
			>
				<div className="max-w-6xl mx-auto">
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-3">
							<h2 className="text-3xl md:text-4xl font-extrabold">Themes</h2>
							<span className="badge badge-sm bg-secondary/10 text-secondary border border-secondary/20 font-semibold">
								{themes?.length || 0}
							</span>
						</div>
						<p className="text-base md:text-lg text-base-content/70 font-medium">
							Quickly try different DaisyUI themes using the theme switcher in
							the header.
						</p>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
						{themes?.map((t) => {
							const isActive = t.name === currentTheme
							return (
								<fieldset
									key={t.name}
									onClick={() => handleThemeChange(t.name)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault()
											handleThemeChange(t.name)
										}
									}}
									className={`group rounded-xl p-5 border-2 shadow-lg bg-base-100 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
										isActive
											? 'border-primary/60 ring-2 ring-primary/30'
											: 'border-base-300/20 hover:border-primary/40'
									}`}
									style={{ backgroundColor: t.base100 }}
									aria-label={`Theme preview ${t.name}${isActive ? ' (active)' : ''}`}
								>
									<legend className="sr-only">Theme preview {t.name}</legend>

									<div className="flex items-center justify-between mb-1">
										<div
											className="text-lg font-bold capitalize group-hover:scale-105 transition-transform"
											style={{ color: t.baseContent }}
										>
											{t.name}
										</div>
										{isActive && (
											<div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="w-4 h-4"
												>
													<title>Active theme</title>
													<polyline points="20 6 9 17 4 12"></polyline>
												</svg>
											</div>
										)}
									</div>

									<div
										className="text-xs text-base-content/50 mb-3"
										style={{ color: `${t.baseContent}80` }}
									>
										{isActive ? 'Active theme' : 'Click to preview'}
									</div>

									<div className="flex gap-2">
										<div
											className="h-8 w-8 rounded-lg shadow-md ring-2 ring-white/20 group-hover:scale-110 transition-transform"
											style={{ backgroundColor: t.primary }}
											title="Primary color"
										/>

										<div
											className="h-8 w-8 rounded-lg shadow-md ring-2 ring-white/20 group-hover:scale-110 transition-transform"
											style={{ backgroundColor: t.secondary }}
											title="Secondary color"
										/>

										<div
											className="h-8 w-8 rounded-lg shadow-md ring-2 ring-white/20 group-hover:scale-110 transition-transform"
											style={{ backgroundColor: t.accent }}
											title="Accent color"
										/>
									</div>
								</fieldset>
							)
						})}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative py-24 px-6 animate-on-scroll overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5" />
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

				<div className="relative max-w-4xl mx-auto text-center">
					<h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
						Ready to build?
					</h2>
					<p className="text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
						Clone the repository and start shipping your next React application
						in minutes.
					</p>

					<div className="relative max-w-xl mx-auto group">
						<div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
						<div className="relative flex items-center bg-base-100 border border-base-300 rounded-xl p-2 shadow-xl">
							<code className="flex-1 text-left font-mono text-sm sm:text-base px-4 text-base-content/90 overflow-x-auto whitespace-nowrap">
								git clone https://github.com/chunghha/vts-basic.git vts-basic
							</code>
							<button
								type="button"
								className="btn btn-square btn-ghost btn-sm"
								onClick={() => {
									navigator.clipboard.writeText(
										'git clone https://github.com/chunghha/vts-basic.git vts-basic',
									)
									const btn = document.activeElement as HTMLButtonElement
									const originalContent = btn.innerHTML
									btn.innerHTML =
										'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-success"><polyline points="20 6 9 17 4 12"></polyline></svg>'
									setTimeout(() => {
										btn.innerHTML = originalContent
									}, 2000)
								}}
								aria-label="Copy to clipboard"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Copy Icon</title>
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</section>

			<Footer page="home" />

			{/* Back to Top Button */}
			<button
				type="button"
				className={`fixed bottom-8 right-8 btn btn-circle btn-primary shadow-lg z-50 transition-all duration-300 ${
					showBackToTop
						? 'opacity-100 translate-y-0'
						: 'opacity-0 translate-y-10 pointer-events-none'
				}`}
				onClick={scrollToTop}
				aria-label="Back to top"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Back to Top Icon</title>
					<path d="M18 15l-6-6-6 6" />
				</svg>
			</button>
		</main>
	)
}
