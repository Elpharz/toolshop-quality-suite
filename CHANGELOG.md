# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- `AccountPage.title` uses the user-facing `getByRole('heading', { level: 1 })` instead of the
  `page-title` test id, so a wrong page fails with the heading it actually rendered.
- Failing UI tests that hit a Cloudflare bot challenge on the public demo are annotated
  `cloudflare-challenge` (with the Ray ID) in the report and CI log. Root cause of the
  11 Oct sign-in failure on GitHub-hosted runners; see `docs/quarantine.md`.

### Planned for 0.2.0

- Toolshop started from Docker Compose inside CI, SQL data-integrity checks, Python/pytest API suite.
- Optional later: Postman/Newman export of the API requests.

## [0.1.0] - 2026-10-11

### Added

- Playwright + TypeScript (strict) framework against the public Toolshop demo.
- Page objects for Home, Product, Cart, Login and Account pages (no assertions in page objects).
- Fixtures via `test.extend`: typed API client, customer token, page objects, and a
  token-injected signed-in browser page.
- Typed `ToolshopApiClient` on Playwright's `APIRequestContext` with `raw*` methods for
  negative tests.
- API-first suite: 20 API tests (auth, products, brands, categories, related products, cart,
  registration validation) and 9 UI tests (catalogue, cart, sign-in); 10 tagged `@smoke`.
- GitHub Actions workflow `ci.yml`: parallel lint, API and UI jobs; the API job needs no
  browser so it reports first; HTML reports and JUnit/traces uploaded as artifacts.
- Merged API + UI Playwright HTML report (blob reports + `merge-reports`) deployed to GitHub Pages
  on pushes to `main`: https://elpharz.github.io/toolshop-quality-suite/.
- ESLint (typescript-eslint strict type-checked + eslint-plugin-playwright) and Prettier.
- README with CI badge, run instructions, structure and roadmap; MIT licence.

[Unreleased]: https://github.com/Elpharz/toolshop-quality-suite/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Elpharz/toolshop-quality-suite/releases/tag/v0.1.0
