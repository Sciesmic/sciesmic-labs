# Sciesmic Labs

Free browser-based science simulations from Sciesmic. TEKS and NGSS aligned, with English and Spanish interfaces.

## Website

Intended production address: https://labs.sciesmic.com

## Repository structure

- `index.html`: lab directory and homepage
- `kit/`: shared interface styles and JavaScript
- `marsh-beetles/`: Marsh Beetles: Selection Lab and its assets
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

## Rights

Copyright Sciesmic. All rights reserved. No open-source license is granted by this repository.
