import { useId } from 'react'

interface FooterProps {
	page?: 'home' | 'about'
}

export function Footer({ page }: FooterProps) {
	const year = new Date().getFullYear()
	const contactId = useId()

	return (
		<footer
			id={contactId}
			className="py-12 px-6 bg-base-100 relative border-t border-base-300/20"
		>
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="text-center md:text-left pt-1">
						<div>
							Built with{' '}
							<span className="text-primary font-semibold">Tailwind CSS</span> +{' '}
							<span className="text-secondary font-semibold">DaisyUI</span>. ©{' '}
							{year} VTS Basic.
						</div>
					</div>

					<div className="flex items-center gap-6">
						{page !== 'home' && (
							<a href="/" className="link link-hover text-sm font-medium">
								Home
							</a>
						)}
						{page !== 'about' && (
							<a href="/about" className="link link-hover text-sm font-medium">
								About
							</a>
						)}
						<a href="/country" className="link link-hover text-sm font-medium">
							Countries
						</a>
						<a
							href="mailto:support@example.com"
							className="link link-hover text-sm font-medium"
						>
							Contact
						</a>
						<a
							href="https://github.com/chunghha/vts-basic.git"
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-ghost btn-sm btn-circle"
							aria-label="GitHub"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<title>GitHub Icon</title>
								<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
							</svg>
						</a>
					</div>
				</div>
			</div>
		</footer>
	)
}
