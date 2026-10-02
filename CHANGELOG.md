# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Planned for 0.2.0

- Toolshop started from Docker Compose inside CI, SQL data-integrity checks, Python/pytest API suite.

## [0.1.0] - 2026-10-08

### Added

- Playwright + TypeScript (strict) framework against the public Toolshop demo.
- Page objects for Home, Product, Cart, Login and Account pages (no assertions in page objects).
- Fixtures via `test.extend`: typed API client, customer token, page objects, and a
  token-injected signed-in browser page.
- Typed `ToolshopApiClient` on Playwright's `APIRequestContext` with `raw*` methods for
  negative tests.
- 15 API tests (auth, products, brands, categories, cart) and 9 UI tests (catalogue, cart,
  sign-in); 10 tagged `@smoke`.
- GitHub Actions workflow `ci.yml`: typecheck/lint/format job and Playwright job uploading the
  HTML report and JUnit/traces as artifacts.
- ESLint (typescript-eslint strict type-checked + eslint-plugin-playwright) and Prettier.
- README with CI badge, run instructions, structure and roadmap; MIT licence.

[Unreleased]: https://github.com/Elpharz/toolshop-quality-suite/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Elpharz/toolshop-quality-suite/releases/tag/v0.1.0
