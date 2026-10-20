# School refinement — implementation plan

Base: 81ef466e36f813c28db8cb93e8b8560698b9e1d2. Spec: approved PRD REA v4 and owner's current request for a human landing and practical Reels learning. Execution: inline; no subagent tool available. Scope is an incremental release, not certification of the entire school.

## Constraints
Preserve lesson/course IDs, prices actually charged, entitlements, paid lesson bodies, progress, submissions, certificates and existing URLs. No dependency accumulation, automatic social posting, customer charges, live transactional emails or DNS/proxy changes. Generated people are fictional illustrations, never students/testimonials. No guaranteed virality or fabricated social proof. Existing contractual benefits must not be silently revoked.

## Tasks and checks
1. Research maintained official libraries and licenses. Prefer already installed components/native browser capabilities. Record what is used, deferred, and why; do not claim an exhaustive scan of GitHub. Verify source dates and Meta guidance for the content exercise.
2. Reproduce signup without session. Correct checkout UI to distinguish confirmation pending from authenticated. Preserve server requireUser. Remove unsupported countdown/stock/discount assertions while keeping current displayed R$497 and existing rights; payment-provider conditions prevail. Test delayed/error auth, signup null session, valid session and returning entitled member.
3. Human cinematic landing: three original generated illustrations with local responsive WebP, dimensions and provenance. Keep email/password initially visible, existing H1, brand and sensible CTA. Do not autoplay unrelated video over the new imagery. Disclose fictional AI scenes. Test 360/390/768/1440px, keyboard, reduced motion, image budgets, no new third-party request.
4. Practical Reels workshop attached to the existing short-video lesson (ID 5ffa37ee-6b74-6358-fa6e-f51cd3f8dafc). Six short steps, examples, editable fields, preview, checklist and Markdown export. Access reads the lesson through current RLS. No automatic completion or external generation. Draft is scoped to user+lesson in this tab; explain its local scope, allow export and handle unavailable storage. Keep complete course text available. No paid lesson dump in frontend.
5. Reliable notes: reproduce race/failed-save paths; keep draft recoverable, isolate user/lesson, avoid overwriting a newer server version, display conflict/error honestly. Do not migrate or reset existing rows. Test fast switches and stale responses before applying fixes. This does not claim all multi-device workflows tested live.
6. Improve discovery/retomada only where existing data supports it, without a wholesale reorganization that risks regression. Add clear course/lab routes to the workshop; retain old menu destinations. Five-destination redesign remains a separately gated PRD deliverable unless covered by the final tests.
7. Full validation: npm check, existing smoke/SEO/study/lab suites, new integration scenarios, screenshots and diff review. GitHub Actions must pass before merge; publish once and verify served asset/version. Content writes require a snapshot and hash guard. Rollback by reverting this release, never deleting users/content.

## Review focus
- Null auth session must not enable payment UI or label email verified.
- Real paid access stays server-authoritative; no static exercise page leaks full lesson body.
- Switching tabs/steps cannot lose drafts or mark course progress.
- Fictional imagery must remain legible and correctly attributed, without full-resolution raw images in the app.
- Quota/offline/storage failures produce actionable states, not a success toast.

## Progress ledger
- Baseline branch isolated in the existing clean worktree; old main remains untouched.
- Generated-image jobs: 3 completed, visually inspected and optimized into nine local responsive WebP variants; provenance and synthetic-person disclosures retained.
- Current scope does not include paid account purchase/email homologation, new subscriptions, native distribution or Cloudflare proxy migration.

## Execution continuation
- Core baseline 182 tests passed; school helpers showed 11 failures/3 passes before implementation, notes helper 7 failures/1 pass, media and fonts 3 failures each.
- Quick reload of a note was observed losing the draft before the change. New scoped local recovery and cloud confirmation passed; two tabs, failure/retry and late acknowledgements are tested against simulated PostgREST.
- Ruling: old Google Fonts requests were pre-existing, not new media leakage. Reduced the core to five families, removed duplicate CSS import, and deferred creative-editor fonts to their routes. Browser acceptance checks no new external media, not an impossible claim of zero network requests.
- Ruling: keep the existing /membros confirmation redirect to avoid inventing an unverified provider allowlist.
- Ruling: preserve all existing lesson bodies and IDs in this release. The new practical view reads the existing short-video lesson through RLS, with independent original generic exercise examples; it does not copy paid content into public JSON.
- Updated after the Touch acceptance pass: five primary destinations now reuse existing routes, with the previous secondary destinations retained and cross-course resume guarded by accessible lessons. Responsive, keyboard and touchscreen tests passed; no data migration was needed. Live billing/email homologation, a real iPhone Safari/VoiceOver pass and Cloudflare proxy migration remain separate gates.
- Touch continuation: 228 unit/contract tests passed, eight browser suites passed, Vite was patched to 6.4.4, and live Stripe read-only verification confirmed the existing R$ 497 one-time price and lifetime-access product description. No charge, webhook, customer account or entitlement was changed.
