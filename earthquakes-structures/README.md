# Earthquakes and Structures

Version 1.0.0 · Grades 6–8 · © Sciesmic 2026. All rights reserved.

Build one to six stories from frame modules (beam + columns), floor panels, braces, connection upgrades and dampers. Compare fixed and isolated bases. Explore synthetic magnitude/distance/site scenarios or controlled single-frequency shaking. Use saved trials, graphs, a three-scenario budget challenge, contextual definitions and public vocabulary exports in English and draft Spanish.

## Run

Serve the parent site root over HTTP and open `earthquakes-structures/`. Reuses `../kit/labs-kit.js`, `labs-kit.css`, `flashcards.js` and `flashcards.css`; compatible with the pinned upstream kit at commit 7ecae5c1676a44e5da2e675cd343043e7c78b5f5. No build step or remote runtime dependency. Query `lang=en` or `lang=es` takes precedence over stored language. Copy design link preserves design, settings, seed and mode, including incomplete assemblies; it does not save student writing or notebook history.

## Evidence and limitations

`model.js` is DOM-free and reproducible from design, settings and seed. The elastic–plastic floor model uses SI units with a 0.001 s integration step. `model-notes.html` documents equations, teaching constants, capacities, normalization, units and limits. The synthetic magnitude-to-motion mapping is an illustrative classroom relationship, not an empirical ground-motion prediction equation. Damage states do not certify real building safety. The scene magnifies relative sway ×35; measurements are unscaled.

Public vocabulary exports contain only the glossary. Paid worksheets, keys, teacher guides, private cards, numerical test records, pack sources and private previews are kept outside this public folder.

## Standards and review

TEKS 6–8.1G and 2A–D address student models, calculations, evidence and design evaluation. MS-ETS1-3 is supported through comparing designs and combining useful features. MS-ESS3-2 is partial (mitigation only); TEKS 7.10B is earthquake context rather than full tectonics coverage. Spanish interface and public cards await native-speaking science educator review.

## Assets

`assets/bg_sky.png`, `quake_epicenter.png`, and `quake_ring_a.png` reuse the existing Sciesmic Plate Boundaries master pack (October 26, 2026). `thumbnail.svg`, `icon.svg`, and the parameterized frame drawing are original code-native artwork matching the established palette. No new raster artwork was generated.
