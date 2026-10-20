# Temporary build-only dependency exception — 20 October 2026

This release does **not** have a clean all-dependencies `npm audit`. After compatible updates, six development dependency nodes point to one reviewed advisory: GHSA-vfj7-8cjw-p6xm (braces recursion denial of service). The official advisory lists no patched braces release as of this review. This is risk triage, not a security fix or certification.

## Scope and controls

- All six exact versions in `scripts/security/build-only-exception.json` must be `dev: true` in the lockfile. A runtime instance fails the gate.
- The vulnerable input is a deeply nested brace/glob pattern. In this project these packages handle trusted repository CSS, file globs and development tagging, not submitted lesson text, uploaded documents or HTTP requests.
- Vite's output graph rejects these packages in the browser bundle. Edge/app source must not import them. New source imports, package/version drift, a new advisory or a critical finding require another review.
- `npm audit --omit=dev --audit-level=moderate` remains a separate hard CI gate. The complete audit is stored, and the build exception gate explicitly warns that findings remain.
- Do not expose the development server publicly or run builds from unreviewed contributions with production secrets. The production artifact is static HTML/CSS/JS; there is no production glob-parsing service.
- The exception expires **3 November 2026**. It then blocks CI until the vulnerable chain is removed, patched or explicitly re-reviewed. It is not automatically renewed.

The safe immediate updates include source-map-js and TypeScript ESLint packages, plus tested overrides for postcss-selector-parser 7.1.7 and esbuild 0.25.12. Tailwind 3 to 4 was not forced into this release because it is a separate migration with substantial visual regression risk.

## Commands

`npm run audit:security` produces the full report and enforces the narrowly scoped policy.
`npm audit --omit=dev --audit-level=moderate` checks runtime dependencies without exceptions.
`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:seo-browser` verify compatibility and the release.

## Official advisory references

- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://github.com/advisories/GHSA-rj75-hqrm-r3gf
- https://github.com/advisories/GHSA-68fv-2mgg-jv7q
- https://github.com/advisories/GHSA-67mh-4wv8-2f99
