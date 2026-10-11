# Quarantined tests

Tests that are flaky against the shared public demo are quarantined here instead of being
deleted or silently retried forever.

**Rule:** a test that needs a retry to pass in more than 1 of the last 10 CI runs is marked
`test.fixme()` with a link to this file and a GitHub issue. It comes back once the root cause
(test bug, app bug, or demo-environment issue) is fixed and it passes 10 runs in a row.

| Test             | Quarantined on | Symptom | Suspected cause | Issue |
| ---------------- | -------------- | ------- | --------------- | ----- |
| _none in v0.1.0_ |                |         |                 |       |

## Stability log

### 11 Oct 2026: first GitHub-hosted runs (CI run 38133181839, commit b27636f)

- UI job: 8/9 passed. `auth.spec.ts:5` (sign in via the form) failed on all 3 attempts with
  `getByTestId('page-title')` not found. The error context, screenshots and trace in the published
  report show the cause: after `POST /users/login` (200) the app loads `/account` as a full
  document, and Cloudflare answered that request with `403` and `cf-mitigated: challenge`
  ("Performing security verification" / "Verify you are human", Ray IDs a48fb2492bc255da,
  a48fb2a0daef4ea0, a48fb2f7cf052f64, POP LAX). The app was never rendered, so no locator
  could have passed. The test id still exists on the live site, and the test passes from the box.
- Not quarantined: it is a demo-environment block, not test flakiness. Failing tests now get a
  `cloudflare-challenge` annotation/attachment (from the `page` fixture) so this case shows up
  by name in the report and CI log. The lasting fix is the planned 0.2.0 item: run Toolshop from
  Docker Compose inside CI instead of the CDN-protected public demo.

### 3 Oct 2026: local baseline

All runs on the box (Linux, Node 20.19, Chromium headless shell 153, Playwright 1.63) against the
public demo on 3 Oct 2026 (times EAT):

- v0.1.0, 29 tests (20 API + 9 UI), 00:46–00:48: 3 consecutive local runs with `retries: 0`
  and 4 workers, 29/29 passed each time (14.4 s, 13.9 s, 14.1 s). Then CI mode (`CI=1`,
  2 workers, `retries: 2`) per CI job: API 20/20 passed (11.1 s), UI 9/9 passed (14.3 s),
  0 flaky.
- After adding GitHub Pages publishing, 00:50–00:52: CI-mode API job 20/20 (11.2 s) and UI job
  9/9 (14.0 s) wrote `report-api.zip` and `report-ui.zip` blob reports; `merge-reports` combined
  them into one HTML report (29 expected, 0 unexpected, 0 flaky). Then one full local run with
  `retries: 0`: 29/29 passed (14.3 s).
- Earlier 24-test build, 00:42–00:44: 3 local runs 24/24 each, plus a CI-mode run and a
  fresh-clone `npm ci` CI-mode run, both 24/24, 0 flaky.
- Test bugs fixed during development (not demo flakiness): the sort-by-price UI test waited
  for a network URL the app does not send (now waits on the app's `sorting_completed` marker);
  the duplicate-email API test expected 422, but the API returns 409 when that is the only
  validation error (422 only when other fields also fail).
- Not yet verified: a run on GitHub-hosted runners (Node LTS from `lts/*`). Treat the first
  three green Actions runs as the real CI baseline.
