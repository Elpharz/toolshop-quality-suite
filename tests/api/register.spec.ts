import { test, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';
import type { FieldErrors } from '../../src/api/types';

// Negative-only on purpose: these requests are rejected by validation, so the
// suite never creates accounts on the shared public demo.
test.describe('Registration API validation', () => {
  test('missing names and a weak password are rejected with field errors', async ({ api }) => {
    const response = await api.rawRegister({
      first_name: '',
      email: `qa-suite-${Date.now()}@example.com`,
      password: 'short',
    });

    expect(response.status()).toBe(422);
    const errors = (await response.json()) as FieldErrors;
    expect(errors.first_name?.[0]).toMatch(/required/i);
    expect(errors.last_name?.[0]).toMatch(/required/i);
    expect(errors.password).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/at least 8 characters/i),
        expect.stringMatching(/symbol/i),
        expect.stringMatching(/number/i),
      ]),
    );
  });

  test('an already registered email is rejected with 409 Conflict', async ({ api }) => {
    const response = await api.rawRegister({
      first_name: 'Jane',
      last_name: 'Doe',
      email: env.customer.email,
      password: 'Weak-but-long-1',
    });

    // Observed 3 Oct 2026: a payload that is otherwise valid gets 409; if other fields
    // also fail validation the API answers 422 instead.
    expect(response.status()).toBe(409);
    const errors = (await response.json()) as FieldErrors;
    expect(errors.email?.[0]).toMatch(/already exists/i);
  });
});
