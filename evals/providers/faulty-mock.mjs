// NEGATIVE CONTROL (offline): returns a reply with one realistic, deliberate flaw per
// case (wrong price, invented warranty, leaked canary, obeyed injection, broken JSON...).
// Expected result: 0% pass. Proves every case's assertions actually catch the failure
// they were written for, i.e. the tests are not vacuous.
import { createMockProvider } from './mock-base.mjs';

export default createMockProvider('faulty.json', 'faulty-mock');
