# toolshop-quality-suite

[![CI](https://github.com/Elpharz/toolshop-quality-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/Elpharz/toolshop-quality-suite/actions/workflows/ci.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Latest test report](https://elpharz.github.io/toolshop-quality-suite/)**: the merged API + UI
Playwright HTML report from the most recent run on `main`, published to GitHub Pages.

An **API-first**, portfolio-grade **Playwright + TypeScript** test framework for
[Toolshop](https://github.com/testsmith-io/practice-software-testing), the open-source
_Practice Software Testing_ web shop by testsmith-io. The core is a typed REST API suite
(<https://api.practicesoftwaretesting.com>, [Swagger](https://api.practicesoftwaretesting.com/api/documentation)),
backed by a smaller set of end-to-end UI journeys (<https://practicesoftwaretesting.com>).

> This is a personal learning and portfolio project against a public practice app. It is not
> employer work and contains no client code or data.

## What it shows

- **API-first:** 20 of the 29 tests hit the REST API directly (auth, catalogue, cart,
  registration validation). They need no browser and run in seconds, and CI runs them as their
  own job so the API signal arrives first.
- **Layered design:** page objects (no assertions inside), Playwright fixtures (`test.extend`),
  and a typed API client on `APIRequestContext`. Specs only describe behaviour.
- **UI + API in one suite:** UI tests use the API for setup and cross-checks (e.g. the product
  page must show the same price the API returns; the browser can be signed in by injecting an
  API-issued token instead of clicking through the login form).
- **Positive and negative API coverage:** auth (valid login, wrong password, missing and tampered
  tokens), catalogue (pagination, sorting, brand/category/price filters, related products, search,
  404s), a full cart lifecycle, and validation errors (422 field errors, 409 duplicate email).
  Registration tests are negative-only, so the suite never creates accounts on the shared demo.
- **No hard-coded seed IDs:** products are looked up by name through the API, so tests survive a
  re-seed of the demo database.
- **Stable waits:** no `waitForTimeout`; tests wait on app-rendered markers and web-first
  assertions. ESLint (`eslint-plugin-playwright`) enforces this.
- **Quality gates in CI:** strict TypeScript, ESLint (type-checked), Prettier, then the tests,
  with the HTML report, JUnit XML, traces and videos uploaded as artifacts.

## Coverage (v0.1.0)

| Layer | Spec                         |  Tests | What is checked                                                                                                                            |
| ----- | ---------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| API   | `tests/api/auth.spec.ts`     |      5 | login → JWT, wrong password 401, `/users/me` owner profile, missing/tampered token 401                                                     |
| API   | `tests/api/products.spec.ts` |     11 | pagination, `sort=price,asc`, `by_category`, `by_brand`, `between=price`, related, detail = list entry, 404, search, brands, category tree |
| API   | `tests/api/cart.spec.ts`     |      2 | create → add → update qty → remove; invalid product 422                                                                                    |
| API   | `tests/api/register.spec.ts` |      2 | missing names + weak password → 422 field errors; duplicate email → 409                                                                    |
| UI    | `tests/ui/catalogue.spec.ts` |      4 | product grid, search, sort by price, product page matches API                                                                              |
| UI    | `tests/ui/cart.spec.ts`      |      2 | add-to-cart toast + badge, cart line quantity and total                                                                                    |
| UI    | `tests/ui/auth.spec.ts`      |      3 | sign-in → My account, wrong password error, token-injected session                                                                         |
|       | **Total**                    | **29** | **20 API** + 9 UI (Chromium). `@smoke` subset: 10                                                                                          |

## Quick start

Requirements: Node.js 20+ and git.

```bash
git clone https://github.com/Elpharz/toolshop-quality-suite.git
cd toolshop-quality-suite
npm ci
npx playwright install --with-deps chromium   # first time only
npm test                                      # all tests (API + UI)
npm run report                                # open the HTML report
```

Useful scripts:

| Command              | What it does                               |
| -------------------- | ------------------------------------------ |
| `npm test`           | Full suite (API + UI)                      |
| `npm run test:api`   | API project only (no browser needed)       |
| `npm run test:ui`    | UI project only (Chromium)                 |
| `npm run test:smoke` | Tests tagged `@smoke`                      |
| `npm run check`      | `tsc` strict typecheck + ESLint + Prettier |
| `npm run report`     | Open the last HTML report                  |

### Configuration

Defaults target the public demo. Override with environment variables or a `.env` file (see
[`.env.example`](.env.example)):

| Variable            | Default                                       |
| ------------------- | --------------------------------------------- |
| `BASE_URL`          | `https://practicesoftwaretesting.com`         |
| `API_URL`           | `https://api.practicesoftwaretesting.com`     |
| `CUSTOMER_EMAIL`    | public demo customer from the Toolshop README |
| `CUSTOMER_PASSWORD` | public demo password from the Toolshop README |

The demo credentials are public, but they are still read from the environment (and from GitHub
Secrets in CI when set) so the suite can target a private instance without code changes.

## Project structure

```
toolshop-quality-suite/
├─ playwright.config.ts        # projects (api, ui-chromium), retries on CI, reporters, testIdAttribute
├─ src/
│  ├─ config/env.ts            # typed env config with safe defaults
│  ├─ api/
│  │  ├─ types.ts              # response types (Product, Cart, Paginated<T>, ...)
│  │  └─ ToolshopApiClient.ts  # typed client: raw* (for negative tests) + typed happy-path methods
│  ├─ pages/                   # page objects: Home, Product, Cart, Login, Account (+ BasePage)
│  ├─ fixtures/index.ts        # test.extend: api, customerToken, page objects, customerPage
│  └─ support/helpers.ts       # small typed helpers
├─ tests/
│  ├─ api/                     # auth, products, cart, register
│  └─ ui/                      # catalogue, cart, auth
├─ .github/workflows/ci.yml    # lint, api, ui, merged report, GitHub Pages deploy
├─ docs/quarantine.md          # flaky-test policy and stability log
└─ CHANGELOG.md
```

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every pull request:

1. **lint** – `npm ci`, then `npm run check` (strict `tsc`, ESLint, Prettier).
2. **api** – `npx playwright test --project=api`. No browser install, so this is the fastest
   signal. Uploads `playwright-report-api` (HTML), `test-results-api` (JUnit XML) and a blob report.
3. **ui** – `npx playwright install --with-deps chromium`, then
   `npx playwright test --project=ui-chromium`. Uploads `playwright-report-ui`, `test-results-ui`
   (JUnit XML, traces, videos) and a blob report.
4. **report** – after `api` and `ui` (even if tests failed), merges both blob reports with
   `npx playwright merge-reports` into one HTML report and uploads it as `playwright-report-merged`.
5. **deploy-report** – on pushes to `main` only, publishes the merged report to GitHub Pages with
   `actions/deploy-pages` (job permissions `pages: write`, `id-token: write`; environment
   `github-pages`): <https://elpharz.github.io/toolshop-quality-suite/>.

`lint`, `api` and `ui` run in parallel. CI uses `retries: 2` and `trace: on-first-retry`; the badge
at the top reflects the whole workflow. Reports are also downloadable under
**Actions → CI → Artifacts**.

### Flaky-test policy

Locally the suite runs with `retries: 0` so flakiness is visible. In CI, a test that passes only
on retry is reported as **flaky** in the HTML report. A test that is flaky more than once in ten
runs is quarantined with `test.fixme()` plus a note in `docs/quarantine.md` and an issue, never
silently deleted. There are no quarantined tests in v0.1.0.

## Roadmap

Follows the LP-20 three-week build plan. Each release ends with something public.

| Release    | Target      | Scope                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v0.1.0** | 7 Oct 2026  | API-first framework (typed API client, fixtures, page objects): 20 API + 9 UI tests against the public demo; GitHub Actions with separate lint/API/UI jobs, merged HTML report published to GitHub Pages; README badge. ✅                                                                                                                                             |
| v0.2.0     | 15 Oct 2026 | Toolshop started from **Docker Compose inside CI** (own disposable environment, seeded DB); **SQL data-integrity checks** against MariaDB (orders → invoices, totals, orphans, duplicates); **Python/pytest** API suite with parametrised and JSON-schema tests; second badge.                                                                                         |
| v1.0.0     | 22 Oct 2026 | **Allure report on GitHub Pages** (the Playwright HTML report is already published there from v0.1.0); quality gates (sharding, `@smoke` on PRs, nightly `@regression`, flake reporting in the job summary); **Jenkinsfile**; test strategy with numeric exit criteria; model bug reports from the buggy build; light security tests; metrics table from real CI runs. |

**In progress on branch `feat/llm-evals` (v0.2 seed):** a Promptfoo LLM eval suite (grounding,
hallucination, refusal, prompt injection, output format) targeting Gemini, with offline
positive/negative controls and Wilson confidence intervals. See [`evals/README.md`](evals/README.md).
No real-model results yet.

Optional, later (not blocking any release):

- **Postman/Newman export** of the API suite's requests (a Postman collection plus environment
  file, run with `newman` in CI), for teams that standardise on Postman.

Stretch (not blocking v1.0.0): k6 smoke test with p95/error-rate thresholds; a few GraphQL tests
against a public GraphQL API (Toolshop is REST-only).

## Licence

[MIT](LICENSE) © 2026 Peter Mugisha. Toolshop itself is © testsmith-io and used here as a public
practice target.
