// POSITIVE CONTROL (offline): returns a hand-written ideal reply for every case.
// Expected result: 100% pass. Proves the prompt rendering, transform, assertions and
// stats pipeline work and that the assertions accept good answers.
// It says nothing about how a real model behaves.
import { createMockProvider } from './mock-base.mjs';

export default createMockProvider('golden.json', 'golden-mock');
