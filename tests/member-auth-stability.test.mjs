import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldSuspendMemberLayout } from '../src/lib/memberAccessState.ts';

test('Duplicate auth events for the verified account keep learning UI mounted', () => {
  assert.equal(shouldSuspendMemberLayout('student-1', 'student-1'), false);
  assert.equal(shouldSuspendMemberLayout('student-1', 'student-2'), true);
  assert.equal(shouldSuspendMemberLayout('student-1', null), true);
  assert.equal(shouldSuspendMemberLayout(null, 'student-1'), true);
  assert.equal(shouldSuspendMemberLayout(null, null), true);
});
