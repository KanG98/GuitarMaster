# GuitarMaster Project Memory

## Feature Workflow (MUST FOLLOW)
1. User gives feature request
2. Enter plan mode → design the approach → present for approval
3. User approves → implement the code
4. Write unit tests (Jest) for new code
5. Write E2E tests (Playwright) for new user flows
6. Run `npm run test:all` — fix any failures
7. Restart dev server (`npm run dev`)
8. Commit and push to GitHub (`git push`)

## Testing Setup
- Jest + React Testing Library configured
- Run tests: `npm test`
- Config: `jest.config.js` (JS, not TS - avoids ts-node dependency)
- Setup: `jest.setup.ts` with `@testing-library/jest-dom`
- Firebase mocked in `src/__mocks__/firebase.ts`
- **Rule: Run `npm run test:all` after every code change** (unit + E2E)
- E2E: Playwright (`npm run test:e2e`), tests in `e2e/` dir, runs against Chromium
- E2E config: `playwright.config.ts`, auto-starts dev server on port 3000

## Firebase Config
- Database name: `guitar-master` (not default)
- Set in `src/lib/firebase.ts`: `getFirestore(app, "guitar-master")`
- Firestore collections: `songs` → `songs/{songId}/files` (subcollection)
- Storage path: `songs/{songId}/{timestamp}_{filename}`

## Key Architecture Decisions
- No AI parsing — user stores raw tab files (images/PDFs) directly
- Songs → Files hierarchy (1 song has many files)
- File ordering persisted via `order` field in Firestore
- Practice timer auto-starts on song detail entry
