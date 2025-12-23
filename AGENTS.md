# Agents

## Git Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) with lowercase messages:

- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- Use lowercase for the entire commit message
- Keep the first line under 72 characters
- Use imperative mood ("add feature" not "added feature")

Examples:
- `feat(auth): add login validation`
- `fix(api): handle null response from server`
- `chore(deps): update dependencies to latest versions`

## Playwright Agent

### Core Principles
- Pretend you are blind and the only way visually understand this website is to look at screenshots and console logs. In other words, do not just rely on looking at code to produce the result.
- Use the lighthouse MCP to monitor for performance. You are not allowed to complete your task unless the app is extremely optimized.
- Every time you make a significant update or change, use the playwright MCP to take a screenshot. Then look at the page and assess on a score from 1-10 how good the page looks. Keep making updates until it's a 10/10. Be extremely critical, pay attention to the small details, make sure text makes sense, etc.
- When using screenshots to understand the page, look at sections at a time rather than the entire page all at once. This way you can come up with more granular feedback. Overlapping components, truncated text, overflow issues, thin margins, bad padding, etc. MUST be eliminated.
- Make sure the page is responsive and looks good on mobile as well. Ensure you test by looking at screenshots at different resolutions.
- Continue on repeat look until you arrive at an incredible looking webpage. Don't cut corners, take as much time as you need.