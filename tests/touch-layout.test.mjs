import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Touch PWA preserves pinch zoom while respecting both safe areas', () => {
  const html=fs.readFileSync('index.html','utf8');
  const css=fs.readFileSync('src/styles/touch.css','utf8');
  assert.match(html,/viewport-fit=cover/);
  assert.ok(!/maximum-scale\s*=\s*1|user-scalable\s*=\s*no/i.test(html));
  assert.match(css,/env\(safe-area-inset-top/);
  assert.match(css,/env\(safe-area-inset-bottom/);
  assert.match(css,/touch-shell:has\(input:focus/);
});
test('Touch nav reuses existing destinations without granting access or changing progress', () => {
  const nav=fs.readFileSync('src/components/members/MobileTouchNav.tsx','utf8');
  assert.match(nav,/MEMBER_NAVIGATION/);
  assert.match(nav,/memberNavigationGroup/);
  assert.match(nav,/aria-current/);
  assert.ok(!/supabase|stripe|localStorage|lesson_progress/.test(nav));
});
