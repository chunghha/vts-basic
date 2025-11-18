import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NAV_CONFIG } from '../constants/config'
import ThemeSwitcher from './ThemeSwitcher'

export default function Header() {
	const [open, setOpen] = useState(false)

	return (
		<header className="sticky top-0 z-40 bg-base-100/60 backdrop-blur-sm border-b border-base-300/20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="navbar py-3">
					<div className="flex-1">
						<div className="text-lg md:text-xl font-semibold">
							Tanstack Start
						</div>
					</div>

					<div className="hidden md:flex items-center gap-2">
						{NAV_CONFIG.LINKS.map((link) => (
							<Link key={link.to} to={link.to} className="btn btn-ghost">
								{link.label}
							</Link>
						))}
					</div>

					<div className="flex-none ml-2">
						<div className="hidden md:flex items-center gap-2">
							<ThemeSwitcher />
						</div>

						<button
							type="button"
							className="md:hidden btn btn-square btn-ghost"
							aria-label="Toggle menu"
							onClick={() => setOpen((v) => !v)}
						>
							{open ? <X size={18} /> : <Menu size={18} />}
						</button>
					</div>
				</div>

				{open && (
					<nav className="md:hidden pb-4">
						<ul className="menu menu-compact bg-base-100 rounded-box p-2 shadow-md space-y-1">
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
								<button
									type="button"
									className="btn btn-block btn-primary"
									onClick={() => setOpen(false)}
								>
									Get started
								</button>
							</li>
						</ul>
					</nav>
				)}
			</div>
		</header>
	)
}
