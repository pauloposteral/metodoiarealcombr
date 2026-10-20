# Método IA Real — Touch refinement (20/10/2026)

## Scope and status
Mobile-first refinement on branch `feat/ia-real-human-practice-v4-20261020`. The branch also contains the earlier uncommitted human landing, Reels workshop, notes recovery, access and cross-course navigation work. These are preserved; this change is incremental. No new runtime libraries, external calls, payments or student data migrations.

## Touch-specific implementation
- Fixed five-destination bottom navigation on widths below 768px: Início, Aprender, Laboratório (visually shortened to Lab), Criar, Perfil. It reuses the existing `memberNavigationGroup` and React Router; no entitlement logic is duplicated. Active route uses `aria-current="page"`.
- Each bottom destination is at least 44px wide and 56px high. The header drawer/search/theme/notification controls have 44px touch areas. The mobile header hides nonessential streak and avatar labels to avoid squeezing a 320px screen.
- The app reserves space for the bottom bar plus `env(safe-area-inset-bottom)` (iPhone home indicator), using `viewport-fit=cover` without disabling pinch zoom.
- The bar hides while a text input, textarea or editable region is focused so it does not compete with the software keyboard.
- Reels and lesson step selectors support native horizontal touch scrolling and scroll snapping, instead of six tiny buttons in a cramped grid. Step buttons remain keyboard accessible and preserve the current draft.
- Reels step focus is applied after the React commit, not in a delayed animation frame. This fixes a reproduced race where focus jumped from a textarea back to the heading while the user was typing. The current step is now also stored per account/lesson in the tab, synchronously on navigation, so a temporary remount or reload does not reset the student to step one. Signing out clears that step together with the draft.
- Mobile input font size is 16px to avoid unwanted iOS focus zoom. The landing login's secondary links and cookie choices now meet 44px minimum height.
- The cookie consent banner is positioned above the mobile bottom bar, with room reserved to scroll content; it does not cover navigation targets.
- Reduced-motion preference disables decorative nav transitions. No auto-playing media or new telemetry was added.

## Automated evidence
The new `scripts/verify-touch.mjs` uses the existing school fixture and intercepts all external auth, database, AI, billing and email traffic. It checks widths 320, 360, 390, 430, 767 and 768, touch target dimensions, accessible names/current state, input focus behavior, cookie overlap, horizontal step scrolling, draft preservation, layout overflow, safe bottom padding and absence of sensitive writes. It also checks the public login at 320 and 390px. Screenshot files contain synthetic fixture data.

This does **not** replace a manual test on a real iPhone/iPad with the software keyboard, VoiceOver, rotation and home indicator. Browser emulation validates geometry and behavior, not hardware haptics or native Safari quirks.

## Commercial consistency cross-check
A read-only check of the connected live Stripe account confirmed the existing checkout price is BRL 497.00, one-time, and its active product describes lifetime access, prompts, community and certificate. The shared offer copy was aligned to preserve the lifetime benefit, with existing purchase terms still controlling entitlements. No price, product, webhook or payment was changed.

## Verified results (local build)
- 228 automated unit/contract tests passed, zero failures. TypeScript and Vite 6.4.4 build passed. ESLint: zero errors, 35 warnings (not individually remediated in this release).
- Eight browser suites passed against the local preview: smoke, SEO, study, laboratory, school, notes, cross-course navigation and Touch. The Touch suite uses Chromium mobile emulation with actual touchscreen tap events, tests widths 320, 360, 390, 430, 440 and 767px, and confirms the desktop sidebar at 768px.
- The tested touch round trip moved from the Reels workshop to Laboratório and back without losing the draft. Checkout forms and modal fields remained at least 44px high with 16px mobile text. Cookie consent no longer covered bottom navigation. No payment, publication or completion was triggered by these checks.
- Runtime dependency audit found zero findings. A newly reported Vite launch-editor vulnerability was addressed by updating to 6.4.4. The six dev-only braces findings remain under the documented, expiring exception (03/11/2026); the audit is not globally clean.
- Screenshots and JSON test results in this folder contain only fictional fixtures and generated scenes, not customer data.

## Other gates required before release
`npm run check`, browser smoke, SEO, study, lab, school, notes, navigation and touch tests; runtime dependency audit and documented expiring build-only exception; GitHub Actions. Production deploy only after passing all gates. Do not claim this version is live until its served asset is verified on the custom domain.

## Rollback
Revert the single release commit or PR. No schema, payment, pricing, access or progress migrations are introduced by the touch layer. Old URLs remain valid.
