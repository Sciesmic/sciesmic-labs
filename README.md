# Sciesmic Labs

Free browser-based science simulations from Sciesmic. TEKS and NGSS aligned, with English and Spanish interfaces.

## Website

Intended production address: https://labs.sciesmic.com

## Repository structure

- `index.html`: lab directory and homepage
- `kit/`: shared interface styles and JavaScript
- `marsh-beetles/`: Marsh Beetles: Selection Lab
- `plate-boundaries/`: Plate Boundary Lab
- `net-force-cart/`: Net Force Cart Lab
- `cell-operations/`: Cell Operations Lab
- `star-life-cycle/`: Star Life Cycle Lab
- `states-of-matter/`: States of Matter Lab
- `central-dogma/`: Central Dogma Lab 1.1.0, including vocabulary flashcards and print/export tools
- `predator-prey/`: Predator Prey Lab 3.0.0 with short camouflage and seasonal population investigations
- `CNAME`: custom domain for GitHub Pages
- `.nojekyll`: serve static files without Jekyll processing

## Local preview

Run `python3 -m http.server 8000` from the repository root, then visit http://localhost:8000. Use an HTTP server because the simulations use JavaScript modules.

## Publishing

GitHub Pages publishes `main` from the repository root. Changes merged into `main` update the site automatically.

## Adding labs

Create a separate folder for each lab, reuse the shared `kit/` where appropriate, and add a card to the homepage. Check relative links, simulation behavior, English and Spanish, keyboard access, and mobile layout before publishing.

## Content boundaries

This repository contains the free public website only. Paid teacher packs, answer keys, internal build tools, credentials, and business documents belong outside this repository. Teacher resources are available through https://sciesmic.com/a/members.

## Review status

Marsh Beetles Spanish content awaits native-speaker review.

Central Dogma 1.1.0 English and Spanish interfaces, contextual definitions, and vocabulary flashcard exports have completed editorial and browser QA. Spanish native-speaking science educator review remains pending.

## Rights

Copyright Sciesmic. All rights reserved. No open-source license is granted by this repository.


## Predator Prey Lab

`predator-prey/` 3.0.0 supports a 13-week held-condition camouflage comparison and 5–30-year population investigation. Food-dependent predator births/losses produce linked population changes without a prescribed wave. Three presets compare constant conditions, seasonal progression and a stronger disturbance. The shared graph offers abundance, percentage of starting population, and an optional hare carrying-capacity line; annual/weekly tables and CSV preserve full-precision model estimates.

Grades 7–8 application with partial TEKS 6.12A/B foundations and an NGSS MS-LS2-1 resource investigation. The synthetic model is not a wildlife forecast. English/Spanish interface and public vocabulary print/CSV/offline HTML tools; Spanish native science educator review remains pending. Use the matching private 3.0.0 teacher pack. Paid documents and build sources are excluded from this repository.


## Gravity Drop

`gravity-drop/` 1.0.1 serves grades 6–8 with air/vacuum comparison, controlled experiments and seeded prediction challenges. Five supplied object sprites and layered chambers accompany model-driven height, time, speed, force and acceleration readings. Students record evidence, calculate average speed and revise explanations using gravity and drag. TEKS 7.7A average-speed skill is directly practiced; TEKS 6.7A, 8.7A and NGSS MS-PS2-2/MS-PS2-4 connections are partial. English/Spanish interface and public vocabulary print/CSV/offline HTML tools; Spanish native science-educator review remains pending. Physics model 1.0.0 and private teacher pack 1.0.0 are compatible. Paid pack files are not included in this repository.


## Astronomy labs

- `seasonal-changes/` 1.0.0: Seasonal Changes; grades 6–8, TEKS 6.9A grade 6 core, MS-ESS1-1 seasons component. Explore daylight, Sun angle, solar input and illustrative land/ocean temperature lag.
- `solar-system/` 1.0.0: Solar System in Motion; grades 6–8, TEKS 7.9B, partial 7.9A/MS-ESS1-2/MS-ESS1-3. Explore eight planetary orbits, compare planetary years and investigate solar gravity.
- `earth-moon/` 1.0.0: Earth & Moon; grades 6–8, TEKS 6–8.1G model development with worksheet, 7.9A partial and MS-ESS1-1 phases/eclipses component. Compare synchronized space/Earth views, orbit tilt, alignment and distance.

All three include EN/ES interfaces, five checks, contextual definitions, evidence exports and public vocabulary print/CSV/offline HTML tools. Spanish native science educator review remains pending. Matching private English teacher packs 1.0.0 are distributed separately through the members library; no private documents are included here.

## Photosynthesis

`photosynthesis/` 1.0.1: grade 7 investigation with grade 6 energy foundations and grade 8 atom-conservation extension. Oxygen lab, Inside a leaf, Build a sugar, and Day & night connect trial evidence with matter and energy. Includes EN/ES, accessible comparison graphs and tables, five checks, ten contextual terms and public vocabulary print/CSV/offline HTML. Partial TEKS 6.8B and 7.5E; NGSS MS-LS1-6. Reuses Sciesmic art; deterministic rates are illustrative. Spanish educator review remains pending. Compatible private teacher pack 1.0.0 is prepared separately; member upload is pending. Private materials are excluded from this repository.

## Directory performance and release checks

The homepage uses native controls and a small dependency-free filter. Cards and links remain available without JavaScript. Keep simulation code on individual lab pages. Homepage preview copies live in `kit/previews/`; preserve original lab artwork. Use system fonts and avoid third-party scripts.

Budget: keep the homepage HTML, JavaScript and all directory previews below 500 KB combined before compression. Use lazy loading below the first card and explicit image dimensions. Check every local link, canonical URL, JSON-LD block and sitemap entry when adding a lab. Include accurate grade eligibility and partial/extension alignment qualifiers.

Before a release, check search, combined filters, empty/reset states, keyboard focus, 200% zoom, narrow screens and JavaScript-disabled browsing. Target mobile Lighthouse performance 90+, accessibility 95+, SEO 90+, and field LCP <=2.5 seconds at the 75th percentile. These are targets, not measured scores. Validate on a school Chromebook and throttled network; do not infer real-device performance from transfer size. GitHub Pages manages caching headers, so content-hashed asset naming is preferred when changing cached assets.



## Density Detective

`density-detective/` · v1.0.0 · Grades 6–8 · English/Spanish. Measure mass and full volume, compare density relative to water, graph recorded trials, and identify seeded mysteries. Three modes, 18 samples, five checks, and ten contextual terms with EN/ES/bilingual public flashcard print/CSV/offline HTML exports. Existing Sciesmic sprites are reused. TEKS 6.6D coverage is partial (water only); MS-PS1-2 is a prerequisite connection. Spanish is draft pending native science-educator review. Teacher-pack documents are distributed separately and are excluded from this public repository.
