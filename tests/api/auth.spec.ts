import { test, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';

test.describe('Auth API @smoke', () => {
  test('valid customer login returns a bearer JWT', async ({ api }) => {
    const body = await api.login(env.customer.email, env.customer.password);

    expect(body.token_type).toBe('bearer');
    expect(body.expires_in).toBeGreaterThan(0);
    // header.payload.signature
    expect(body.access_token.split('.')).toHaveLength(3);
  });

  test('wrong password is rejected with 401', async ({ api }) => {
    const response = await api.rawLogin(env.customer.email, 'definitely-wrong-password');

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  test('/users/me returns the profile for the token owner', async ({ api, customerToken }) => {
    const me = await api.useToken(customerToken).me();

    expect(me.email).toBe(env.customer.email);
    expect(`${me.first_name} ${me.last_name}`).toBe(env.customer.fullName);
    expect(me).not.toHaveProperty('password');
  });

  test('/users/me without a token is rejected with 401', async ({ api }) => {
    const response = await api.useToken(undefined).rawMe();

    expect(response.status()).toBe(401);
  });

  test('/users/me with a tampered token is rejected with 401', async ({ api, customerToken }) => {
    const headerAndPayload = customerToken.split('.').slice(0, 2).join('.');
    const forged = `${headerAndPayload}.invalidsignature`;

    const response = await api.useToken(forged).rawMe();

    expect(response.status()).toBe(401);
  });
});
