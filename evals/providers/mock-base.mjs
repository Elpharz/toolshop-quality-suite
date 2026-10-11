// Shared logic for the two offline mock providers. Replies are keyed by the
// test case id (metadata.id, e.g. "G01"), so no network or API key is involved.
import { readFileSync } from 'node:fs';

export function createMockProvider(file, providerId) {
  const replies = JSON.parse(readFileSync(new URL(`../mock/${file}`, import.meta.url), 'utf8'));
  return class MockProvider {
    id() {
      return providerId;
    }

    async callApi(_prompt, context) {
      const caseId = context?.test?.metadata?.id;
      if (!caseId || !(caseId in replies)) return { error: `No ${file} reply for case ${caseId}` };
      const reply = replies[caseId];
      return { output: typeof reply === 'string' ? reply : JSON.stringify(reply) };
    }
  };
}
