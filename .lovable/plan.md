

# Landing Page Restructure — Método IA Real

## Overview
Complete restructure of the landing page from 19 sections down to 8, with a new premium dark design system, updated typography (Space Grotesk), and high-conversion layout.

## Files to Create
1. **`src/components/sections/ProblemSolutionSection.tsx`** — Combined problem (2x2 red cards) + solution (3 method cards with large numbers)
2. **`src/components/sections/SocialProofSection.tsx`** — 2x2 testimonial grid with star ratings and avatar initials
3. **`src/components/sections/ForWhoSection.tsx`** — 2x3 grid of target audiences with emoji + hover effect

## Files to Rewrite
4. **`src/components/TopHeader.tsx`** — Fixed navbar, transparent→blur on scroll, text logo "IA Real" (mint), single CTA button "Começar agora"
5. **`src/components/sections/HeroSection.tsx`** — Full viewport, headline "Aprenda IA de verdade. Aplique hoje.", single CTA → /auth, stats row, pulsing badge, grain overlay, no images
6. **`src/components/sections/ModulesSection.tsx`** — Accordion format, 6 modules, 760px max-width, no character image
7. **`src/components/sections/FAQSection.tsx`** — 6 essential questions, 680px centered, clean accordion with +/× toggle
8. **`src/components/sections/FinalCTASection.tsx`** — "Pronto pra dominar IA?", benefit badges, single CTA, green radial gradient
9. **`src/components/Footer.tsx`** — Single line: copyright left + Termos/Privacidade links right
10. **`src/pages/Index.tsx`** — Update imports to 8 sections only, keep Helmet/SEO schemas

## Files to Delete
- `ProblemSection.tsx`, `SolutionSection.tsx`, `HowAIWorksSection.tsx`, `ComparisonSection.tsx`, `StepByStepSection.tsx`, `PromptExampleSection.tsx`, `LearningMapSection.tsx`, `WhatYouLearnSection.tsx`, `RealProofSection.tsx`, `HumanSection.tsx`, `TargetAudienceSection.tsx`, `DifferentialsSection.tsx`, `BonusSection.tsx`, `HowItWorksSection.tsx`
- `ProcessSection.tsx`, `StorytellingSection.tsx`, `LearningSection.tsx` (if not used elsewhere)

## Design System Changes

**`src/index.css`** updates:
- Import Space Grotesk from Google Fonts
- Add new CSS custom properties for the premium dark landing colors (#08080C base, mint #6EE7B7, blue #3B82F6)
- Add grain overlay SVG utility class
- Add landing-specific scroll-reveal with `translateY(32px)` and `cubic-bezier(.16,1,.3,1)` timing
- Add pulse animation for hero badge

**`tailwind.config.ts`** updates:
- Add `'Space Grotesk'` to font family config
- Existing ScrollReveal component will be reused (already uses IntersectionObserver — no heavy libs)

## Key UX Rules Enforced
- Only 3 CTAs total: navbar, hero, final CTA — all link to `/auth`
- No images/videos in hero — typography-driven
- All sections use `clamp()` for responsive sizing
- Mobile-first: tested at 375px width
- Accordion uses Radix UI (already installed)
- No pop-ups, countdowns, or floating bars

## Section Structure Summary

```text
┌─────────────────────────────┐
│  TopHeader (fixed, blur)    │  CTA: "Começar agora"
├─────────────────────────────┤
│  1. Hero (100vh)            │  Badge + Headline + CTA + Stats
├─────────────────────────────┤
│  2. Problem + Solution      │  4 pain cards + 3 method cards
├─────────────────────────────┤
│  3. Modules (accordion)     │  6 modules, 43 aulas
├─────────────────────────────┤
│  4. Social Proof            │  4 testimonial cards
├─────────────────────────────┤
│  5. For Who                 │  6 audience cards
├─────────────────────────────┤
│  6. FAQ (accordion)         │  6 questions
├─────────────────────────────┤
│  7. Final CTA               │  Headline + badges + CTA
├─────────────────────────────┤
│  8. Footer (1 line)         │  © + links
└─────────────────────────────┘
```

