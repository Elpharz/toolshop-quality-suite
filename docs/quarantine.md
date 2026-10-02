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

- v0.1.0 (3 Oct 2026, local, Chromium headless, Linux): 24/24 passed in 3 consecutive runs with
  `retries: 0` (13.1 s, 14.9 s, 13.2 s with 4 workers) and once in CI mode
  (`CI=1`, 2 workers, `retries: 2`): 24 passed, 0 flaky, 42.4 s.
- During development one UI test (sort by price) failed because it waited for a network URL the
  app does not send; the page object now waits on the app's `sorting_completed` marker. This was
  a test bug, not demo flakiness.
