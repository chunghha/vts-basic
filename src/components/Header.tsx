import { useGSAP } from '@gsap/react'
import { Link } from '@tanstack/react-router'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { Menu, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { APP_VERSION } from '../constants/appVersion'
import { NAV_CONFIG } from '../constants/config'
import type { SafeAny } from '../types/common'
import ThemeSwitcher from './ThemeSwitcher'

gsap.registerPlugin(TextPlugin)

/**
 * Header component that provides site navigation and theme switching.
 *
 * Features:
 * - Responsive navigation with mobile menu
 * - Theme switcher integration
 * - Sticky positioning with backdrop blur
 * - Navigation links from centralized config
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export default function Header() {
	const [open, setOpen] = useState(false)
	const container = useRef<HTMLDivElement>(null)
	const vtsText = useRef<HTMLSpanElement>(null)

	useGSAP(
		() => {
			const originalText = 'VTS Basic'
			const scrambleChars =
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
			const randomString = () => {
				let result = ''
				for (let i = 0; i < originalText.length; i++) {
					if (originalText[i] === ' ') {
						result += ' '
						continue
					}
					result += scrambleChars.charAt(
						Math.floor(Math.random() * scrambleChars.length),
					)
				}
				return result
			}

			const handleMouseEnter = () => {
				gsap.to(vtsText.current, {
					duration: 1,
					text: {
						value: randomString(),
						chars: scrambleChars,
						speed: 0.3,
					} as SafeAny,
					ease: 'none',
				})
			}
			const handleMouseLeave = () => {
				gsap.to(vtsText.current, {
					duration: 1,
					text: {
						value: originalText,
						chars: scrambleChars,
						speed: 0.3,
					} as SafeAny,
					ease: 'none',
				})
			}

			const currentContainer = container.current
			currentContainer?.addEventListener('mouseenter', handleMouseEnter)
			currentContainer?.addEventListener('mouseleave', handleMouseLeave)

			return () => {
				currentContainer?.removeEventListener('mouseenter', handleMouseEnter)
				currentContainer?.removeEventListener('mouseleave', handleMouseLeave)
			}
		},
		{ scope: container },
	)

	return (
		<header className="sticky top-0 z-40 bg-base-100/60 backdrop-blur-sm border-b border-base-300/20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="navbar py-3">
					<div className="flex-1">
						<div ref={container} className="text-xl font-semibold">
							<span ref={vtsText} className="align-bottom mr-2 inline-block">
								VTS Basic
							</span>
							<div className="ml-2 inline-flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-none">
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
								</span>
								<span className="text-sm font-semibold text-primary">
									v{APP_VERSION}
								</span>
							</div>
						</div>
					</div>

					<nav
						className="hidden md:flex items-center gap-2"
						aria-label="Main navigation"
					>
						{NAV_CONFIG.LINKS.map((link) => (
							<Link key={link.to} to={link.to} className="btn btn-ghost">
								{link.label}
							</Link>
						))}
					</nav>

					<div className="flex-none ml-2">
						<div className="hidden md:flex items-center gap-2">
							<ThemeSwitcher />
						</div>

						<button
							type="button"
							className="btn btn-ghost md:hidden"
							onClick={() => setOpen(!open)}
							aria-label={open ? 'Close menu' : 'Open menu'}
							aria-expanded={open}
						>
							{open ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>

				<div
					className={`md:hidden grid transition-all duration-300 ease-in-out ${
						open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
					}`}
					aria-hidden={!open}
				>
					<nav className="overflow-hidden" aria-label="Mobile navigation">
						<ul className="menu menu-compact bg-base-100 rounded-box p-2 shadow-md space-y-1 mb-4">
							{NAV_CONFIG.LINKS.map((link) => (
								<li key={link.to}>
									<Link
										to={link.to}
										onClick={() => setOpen(false)}
										className="btn btn-ghost w-full text-left"
									>
										{link.label}
									</Link>
								</li>
							))}
							<li className="pt-2">
								<div className="px-2">
									<ThemeSwitcher />
								</div>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</header>
	)
}
