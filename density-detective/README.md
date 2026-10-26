# Density Detective 1.0.0

Free English/Spanish density investigation for grades 6–8. Concept approved 2026-10-26.

Serve the complete site root over HTTP and open `density-detective/`. ES modules require HTTP. The separate free preview ZIP includes the shared kit and a launch script.

## Learning flow
Predict → Investigate → Explain → Check your thinking. Three modes: guided equal cubes, open investigation (18 material/shape samples), and seeded mystery identification. Measure mass, volume by ruler/cylinder/overflow can, water-test outcome, and calculated density. Record trials, compare on fixed axes, enlarge the graph, select points by touch/keyboard or selector, inspect the equivalent data table, and export CSV. Prediction and explanation remain when switching language or samples. Reset clears current measurements; clear trials clears notebook entries. The setup link shares settings/seed only.

## Science
True mass is `density × volume`; display mass rounds to 0.01 g. Full-submersion displacement equals volume. Floating displacement equals mass divided by water density (1.00 g/cm³). The calculation uses displayed mass and volume and may differ slightly from reference density. There is no random physical or instrument noise. A uint32 xorshift seed chooses the mystery sample. Motion is an illustration of equilibrium outcomes, not settling-time physics. For irregular objects, floating depth is schematic; the model enforces submerged volume, not height. An ideal holder has zero displacement. Wood and foam are uniform, nonabsorbing models; foam uses bulk density. No temperature variation, absorption, surface tension, dissolution, or trapped air.

## Alignment and sources
TEKS 6.6D is partially supported (water only, rather than various fluids). Calculation and identification extend mathematical reasoning. NGSS MS-PS1-2 characteristic-property analysis is a prerequisite connection; no chemical reactions are investigated. Do not label the historical density-calculation expectation 6.6B as current.

- [Adopted TEKS, August 2024](https://tea.texas.gov/laws-and-rules/sboe-rules-tac/sboe-tac-currently-effect/ch112b.pdf)
- [TEA middle school assessed curriculum, effective 2025–26](https://tea.texas.gov/data-reports/staar/2026-staar-middle-school-science-assessed-curriculum.pdf): 6.6D Supporting.
- [NGSS MS-PS1-2](https://www.nextgenscience.org/pe/ms-ps1-2-matter-and-its-interactions)
- [ACS: What is density?](https://www.acs.org/middleschoolchemistry/lessonplans/chapter3/lesson1.html)

## Assets and vocabulary
Existing Sciesmic Density sprites v1 (2026-10-26), with the existing Conservation of Mass digital balance. No new raster art. Thumbnail composes existing sprites. Art scale/layer conventions come from each source manifest. Ten glossary terms in `content.js` generate inline definitions and all public EN/ES/bilingual print, CSV, and offline HTML flashcards. The shared kit is reused without edits. Spanish is draft pending a native-speaking science educator review. Public flashcards contain glossary content only.

Teacher resources link to the established member landing page. The compatible six-document teacher pack 1.0.0 is prepared separately; no paid pack files or keys are included in this public repository. Member upload is a separate step.
