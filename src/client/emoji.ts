/**
 * vts-basic/src/client/emoji.ts
 *
 * Small client-side utility to replace inline emoji spans (e.g. <span class="emoji">🎯</span>)
 * with Twemoji-hosted SVG images for consistent emoji rendering across platforms.
 *
 * Usage:
 * - Add <span class="emoji">🎯</span> in your markup (instead of relying on ::before pseudo).
 * - This module auto-runs on DOMContentLoaded and replaces those spans with <img> elements.
 * - You can also import and call `replaceEmojiSpans()` manually (e.g. after client-side hydration).
 *
 * Notes:
 * - Uses Twemoji CDN: https://twemoji.maxcdn.com/v/latest/svg/{codepoints}.svg
 * - Handles multi-codepoint emoji sequences (ZWJ, skin tones, variation selectors, etc.)
 *   by converting the string into hex codepoint segments joined with '-'.
 * - The generated <img> will have class 'emoji-img' so you can style sizing in CSS.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

type ReplaceOptions = {
	/**
	 * Twemoji base URL (default uses the official CDN).
	 * Example: 'https://twemoji.maxcdn.com/v/latest/svg'
	 */
	baseUrl?: string
	/**
	 * Whether to run replacement for elements that have a `data-emoji` attribute
	 * in addition to `.emoji` class.
	 */
	includeDataAttribute?: boolean
	/**
	 * Img attributes to apply to generated <img>. Useful for aria or custom classes.
	 */
	imgAttributes?: Record<string, string>
}

/**
 * Convert a string (single emoji or multi-codepoint sequence) into the Twemoji code string.
 * Example: "👨‍👩‍👧‍👦" -> "1f468-200d-1f469-200d-1f467-200d-1f466"
 */
export function toCodePoints(str: string): string {
	// Array.from iterates by code point (handles surrogate pairs).
	const parts: string[] = []
	for (const ch of Array.from(str)) {
		// Safely handle the possibility that `codePointAt` returns undefined.
		const cp = ch.codePointAt(0)
		if (typeof cp !== 'number') continue
		parts.push(cp.toString(16))
	}
	// Twemoji expects lowercase hex joined by '-'
	return parts.map((p) => p.toLowerCase()).join('-')
}

/**
 * Create an <img> element for the given emoji text.
 */
export function makeEmojiImg(
	emoji: string,
	opts: ReplaceOptions = {},
): HTMLImageElement {
	const baseUrl = opts.baseUrl ?? 'https://twemoji.maxcdn.com/v/latest/svg'
	const code = toCodePoints(emoji)
	const img = document.createElement('img')
	img.setAttribute('alt', emoji)
	img.setAttribute('role', 'img')
	img.src = `${baseUrl}/${code}.svg`
	img.className = 'emoji-img'
	img.style.width = '1em'
	img.style.height = '1em'
	img.style.display = 'inline-block'
	img.style.verticalAlign = '-0.125em'
	// whitespace to the right so the emoji appears like the previous ::before margin
	img.style.marginRight = '0.5rem'

	if (opts.imgAttributes) {
		for (const [k, v] of Object.entries(opts.imgAttributes)) {
			img.setAttribute(k, v)
		}
	}

	return img
}

/**
 * Replace all inline <span class="emoji">...</span> (and optionally data-emoji)
 * nodes with Twemoji <img> elements.
 *
 * Returns the number of replacements performed.
 */
export function replaceEmojiSpans(
	root: ParentNode = document,
	opts: ReplaceOptions = {},
): number {
	if (typeof root === 'undefined' || root === null) return 0
	const selector = opts.includeDataAttribute ? '.emoji, [data-emoji]' : '.emoji'
	const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector))
	let count = 0

	for (const node of nodes) {
		// If node is a <img> already (defensive), skip
		if (node.tagName.toLowerCase() === 'img') continue

		const text = (node.textContent ?? '').trim()
		if (!text) continue

		// If the element contains more than simple emoji text (e.g., nested markup),
		// preserve fallback and skip. We only replace simple text nodes or single-child spans.
		const canReplaceSafely = (() => {
			// If the node has any child elements, skip replacement
			if (Array.from(node.children).length > 0) return false
			// If text contains newline or more than a couple of characters, still allow it:
			// Twemoji will try to resolve the whole string (useful for sequences).
			return true
		})()

		if (!canReplaceSafely) continue

		try {
			const img = makeEmojiImg(text, opts)
			node.replaceWith(img)
			count++
		} catch (err) {
			// If replacement fails, leave the original content in place.
			// Keep console output minimal but useful for debugging.
			// eslint-disable-next-line no-console
			console.warn('Failed to replace emoji span:', err)
		}
	}

	return count
}

/**
 * Auto-run on DOMContentLoaded so simple uses (static markup) just work.
 * If the environment isn't a browser (e.g., server-side), this is a no-op.
 */
function autoRun() {
	if (typeof document === 'undefined') return
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			replaceEmojiSpans(document)
		})
	} else {
		// Already ready
		replaceEmojiSpans(document)
	}
}

// Auto-run by default
autoRun()

export default {
	toCodePoints,
	makeEmojiImg,
	replaceEmojiSpans,
}
