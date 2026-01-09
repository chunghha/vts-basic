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

## Agent Roles

### Implementor
The implementor agent is responsible for writing new code and features:

- Write clean, readable code following existing conventions
- Use existing libraries and patterns from the codebase
- Add comprehensive tests for new functionality
- Run lint and typecheck commands after changes:
  - `npm run lint` (or equivalent based on package.json)
  - `npm run typecheck` (or equivalent)
  - `npm test` (or equivalent)
- Search the codebase first to understand patterns before writing new code
- Examples of implementor tasks:
  - Add a new component: Create `src/components/NewComponent.tsx` following patterns in existing components
  - Add API integration: Extend `src/api/client.ts` with new endpoints
  - Add new pages: Create routes in `src/routes/` following existing page patterns
  - Fix bugs: Use grep/search to find affected code and apply fixes

### Reviewer
The reviewer agent is responsible for reviewing code changes and providing a grade with recommended actions.

#### Review Checklist
- Review for code quality, correctness, and maintainability
- Check for potential bugs, security issues, and edge cases
- Ensure code follows project conventions and style guides
- Verify tests adequately cover the new functionality
- Check for proper error handling and validation
- Look for performance issues or optimization opportunities
- Ensure documentation is updated if needed

#### Grading System

**Grade A - Excellent (Ready to Merge)**
- All requirements met with no issues
- Code follows all conventions and best practices
- Comprehensive tests with good coverage
- Performance optimized
- Documentation complete

**Recommended Action:** Approve and merge

---

**Grade B - Good (Minor Issues)**
- Core functionality correct
- Minor style or convention violations
- Tests adequate but could be improved
- Performance acceptable with minor optimization opportunities
- Documentation mostly complete

**Recommended Action:** Request minor fixes before merge (1-2 hours max)

---

**Grade C - Acceptable (Moderate Issues)**
- Functionality works but with edge cases
- Multiple convention violations
- Tests incomplete or missing edge case coverage
- Performance issues present
- Documentation incomplete

**Recommended Action:** Request moderate improvements (3-6 hours)

---

**Grade D - Poor (Significant Issues)**
- Functionality has bugs or incomplete
- Major convention violations
- Tests inadequate or missing
- Performance severely impacted
- Documentation missing or incorrect

**Recommended Action:** Request significant refactoring (1-2 days)

---

**Grade F - Failing (Critical Issues)**
- Code does not work as intended
- Security vulnerabilities present
- No tests for new functionality
- Severe performance regressions
- Breaking changes not documented

**Recommended Action:** Reject - needs complete rewrite

---

#### Review Examples
- Review new component: Check if it follows patterns in `src/components/Header.tsx` and `src/components/Footer.tsx`
- Review API changes: Ensure endpoints match patterns in `src/api/countries.ts`
- Review route changes: Verify proper use of TanStack Start patterns from `src/routes/__root.tsx`
- Review bug fixes: Confirm the fix addresses the root cause without introducing new issues

## Playwright Agent

### Core Principles
- Pretend you are blind and the only way visually understand this website is to look at screenshots and console logs. In other words, do not just rely on looking at code to produce the result.
- Use the lighthouse MCP to monitor for performance. You are not allowed to complete your task unless the app is extremely optimized.
- Every time you make a significant update or change, use the playwright MCP to take a screenshot. Then look at the page and assess on a score from 1-10 how good the page looks. Keep making updates until it's a 10/10. Be extremely critical, pay attention to the small details, make sure text makes sense, etc.
- When using screenshots to understand the page, look at sections at a time rather than the entire page all at once. This way you can come up with more granular feedback. Overlapping components, truncated text, overflow issues, thin margins, bad padding, etc. MUST be eliminated.
- Make sure the page is responsive and looks good on mobile as well. Ensure you test by looking at screenshots at different resolutions.
- Continue on repeat look until you arrive at an incredible looking webpage. Don't cut corners, take as much time as you need.