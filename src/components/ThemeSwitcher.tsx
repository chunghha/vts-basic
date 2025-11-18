import { Check, Palette } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { THEME_CONFIG, type ThemeId } from '../constants/config'
import { getStorageItem, setStorageItem } from '../utils/storage'

const THEMES = THEME_CONFIG.AVAILABLE_THEMES
const STORAGE_KEY = THEME_CONFIG.STORAGE_KEY
const DEFAULT_THEME = THEME_CONFIG.DEFAULT_THEME

/**
 * ThemeSwitcher
 *
 * - Renders a single icon button. When clicked it opens a dropdown with themes.
 * - Defaults to `pursuit`.
 * - Persists choice to localStorage and updates `data-theme` on the <html> element.
 *
 * Accessibility:
 * - Icon button has an accessible name.
 * - Dropdown is keyboard navigable. Arrow keys navigate, Enter selects, Esc closes.
 * - Clicking outside closes the dropdown.
 */
/**
 * ThemeSwitcher component that allows users to select and persist theme preferences.
 *
 * Features:
 * - Dropdown menu with available themes
 * - Persists selection to localStorage
 * - Updates data-theme attribute on document element
 * - Keyboard navigation support (Arrow keys, Enter, Escape)
 * - Click-outside-to-close behavior
 * - Accessible with proper ARIA attributes
 *
 * Themes are loaded from THEME_CONFIG and include:
 * - Light, Dark, Milkshake, Mindful, Polar, Pursuit
 *
 * @example
 * ```tsx
 * <ThemeSwitcher />
 * ```
 */
export default function ThemeSwitcher() {
	const [theme, setTheme] = useState<ThemeId>(() =>
		getStorageItem(STORAGE_KEY, DEFAULT_THEME),
	)

	const [open, setOpen] = useState(false)
	const buttonRef = useRef<HTMLButtonElement | null>(null)
	const menuRef = useRef<HTMLUListElement | null>(null)
	const activeIndexRef = useRef<number>(
		Math.max(
			0,
			THEMES.findIndex((t) => t.id === theme),
		),
	)

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme)
		setStorageItem(STORAGE_KEY, theme)
	}, [theme])

	const focusMenuItem = useCallback((index: number) => {
		const menu = menuRef.current
		if (!menu) return
		const item = menu.querySelectorAll<HTMLButtonElement>('button')[index]
		if (item) item.focus()
	}, [])

	const applyTheme = useCallback((id: ThemeId) => {
		setTheme(id)
		setOpen(false)
		// update active index for keyboard nav
		activeIndexRef.current = Math.max(
			0,
			THEMES.findIndex((t) => t.id === id),
		)
		// return focus to the trigger for continued keyboard navigation
		buttonRef.current?.focus()
	}, [])

	useEffect(() => {
		function onDocumentClick(e: MouseEvent) {
			if (
				open &&
				menuRef.current &&
				buttonRef.current &&
				!menuRef.current.contains(e.target as Node) &&
				!buttonRef.current.contains(e.target as Node)
			) {
				setOpen(false)
			}
		}

		function onKey(e: KeyboardEvent) {
			if (!open) return
			if (e.key === 'Escape') {
				setOpen(false)
				buttonRef.current?.focus()
			} else if (e.key === 'ArrowDown') {
				e.preventDefault()
				activeIndexRef.current = Math.min(
					THEMES.length - 1,
					activeIndexRef.current + 1,
				)
				focusMenuItem(activeIndexRef.current)
			} else if (e.key === 'ArrowUp') {
				e.preventDefault()
				activeIndexRef.current = Math.max(0, activeIndexRef.current - 1)
				focusMenuItem(activeIndexRef.current)
			} else if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				const idx = activeIndexRef.current
				const t = THEMES[idx]
				if (t) {
					applyTheme(t.id)
				}
			}
		}

		document.addEventListener('click', onDocumentClick)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('click', onDocumentClick)
			document.removeEventListener('keydown', onKey)
		}
	}, [open, applyTheme, focusMenuItem])

	return (
		<div className="relative inline-block text-left">
			{/* Trigger button */}
			<button
				ref={buttonRef}
				type="button"
				aria-haspopup="true"
				aria-expanded={open}
				aria-label="Choose theme"
				onClick={() => {
					setOpen((v) => !v)
					// set active index to current theme whenever we open
					activeIndexRef.current = Math.max(
						0,
						THEMES.findIndex((t) => t.id === theme),
					)
				}}
				className="btn btn-square btn-ghost"
			>
				<Palette className="w-5 h-5" />
			</button>

			{/* Dropdown */}
			{open && (
				<ul
					ref={menuRef}
					aria-label="Theme options"
					tabIndex={-1}
					className="absolute right-0 mt-2 w-44 bg-base-100 border border-base-300 rounded-md shadow-md p-2 z-50"
				>
					{THEMES.map((t, _i) => {
						const selected = t.id === theme
						return (
							<li key={t.id} className="mb-1 last:mb-0">
								<button
									type="button"
									role="option"
									aria-selected={selected}
									onClick={() => applyTheme(t.id)}
									onKeyDown={(e) => {
										if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
											// handled globally
											e.stopPropagation()
										}
									}}
									className={`w-full text-left px-3 py-2 rounded hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary ${
										selected ? 'bg-base-200' : ''
									}`}
								>
									<div className="flex items-center justify-between">
										<span>{t.label}</span>
										{selected && <Check className="w-4 h-4" />}
									</div>
								</button>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
