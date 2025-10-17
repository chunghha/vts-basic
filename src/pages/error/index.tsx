export default function ErrorPage(): JSX.Element {
	return (
		<main className="min-h-screen bg-base-100 text-base-content flex items-center justify-center p-6">
			<div className="max-w-3xl w-full">
				<div className="card bg-base-100/5 border border-base-300/20 shadow-sm">
					<div className="card-body text-center p-10">
						<div className="mb-4">
							<span className="text-6xl md:text-7xl font-extrabold tracking-tight">
								404
							</span>
						</div>

						<h1 className="text-2xl md:text-3xl font-bold mb-2">
							Page not found
						</h1>
						<p className="mb-6 text-base-content/70">
							The page you are looking for doesn't exist or has been moved. If
							you followed a link, it may be out of date.
						</p>

						<div className="mb-6">
							<a
								href="/"
								className="btn btn-primary mr-3"
								aria-label="Back to home"
							>
								Go home
							</a>
							<a
								href="/about"
								className="btn btn-ghost"
								aria-label="About VTS Basic"
							>
								About
							</a>
						</div>

						<div className="text-sm text-base-content/60">
							<p>If you think this is an error, please reach out:</p>
							<div className="mt-2">
								<a
									href="mailto:support@example.com"
									className="text-primary underline"
									aria-label="Contact support"
								>
									contact support
								</a>
								<span className="mx-2">·</span>
								<a
									href="/"
									className="text-base-content/60 underline"
									onClick={(_e) => {
										// keep link behavior but ensure it's keyboard accessible
									}}
								>
									Return to safety
								</a>
							</div>
						</div>
					</div>
				</div>

				<footer className="mt-8 text-center text-sm text-base-content/60">
					© {new Date().getFullYear()} VTS Basic — built with Tailwind + DaisyUI
				</footer>
			</div>
		</main>
	)
}
