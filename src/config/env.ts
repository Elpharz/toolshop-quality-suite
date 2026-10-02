import 'dotenv/config';

/**
 * Central test configuration. Everything can be overridden with environment
 * variables (locally via a `.env` file, in CI via repository variables/secrets).
 *
 * The fallback credentials are the PUBLIC demo accounts published in the
 * Toolshop README (https://github.com/testsmith-io/practice-software-testing).
 * They are not secrets, but they are still read from the environment so the
 * suite can point at a private Toolshop instance without code changes.
 */
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
  apiUrl: process.env.API_URL ?? 'https://api.practicesoftwaretesting.com',
  customer: {
    email: process.env.CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
    password: process.env.CUSTOMER_PASSWORD ?? 'welcome01',
    fullName: process.env.CUSTOMER_FULL_NAME ?? 'Jane Doe',
  },
} as const;
