# Acids & Bases: pH Lab 1.0.2

Free simulation for grades 6–8, with high-school chemistry extensions. Use the existing Sciesmic shared kit at `../kit/`. Run an HTTP server from the site root, then open `/acids-bases/`. Opening ES modules as local files will not work.

Three modes: test ten reference household substances; dilute a defined 20 mL solution; neutralize 60 mL of 0.010 M HCl with 0.010 M NaOH. Digital probe rounds to hundredths. Indicator colors and strips round to whole-pH bins; the scale and concentration readouts show model state. Household samples cannot be mixed or quantitatively diluted; no buffering claim is made.

Record observations, start comparison trials, enlarge the graph, and select each point using touch, pointer or keyboard. CSV includes full model values, measured readings, prediction and conclusion. Reset preserves recorded evidence and writing. A replay link restores the current controls and illustration seed, not a student's notebook. Export before leaving or reloading. Public flashcards use the same content.js glossary, with English/Spanish/bilingual print/Save as PDF, CSV and self-contained offline HTML.

## Chemistry and model limitations

Ideal aqueous solutions at 25 °C. Kw = 1e-14; H - OH = excess strong-acid concentration. The quadratic root uses a stable expression on both sides of equivalence. Neutralization conserves analytical HCl/NaOH amounts and Na+/Cl− spectators. Dilution conserves solute amount and approaches neutral water. No measurement noise, buffers, weak-acid equilibria, activity corrections, temperature or heat calculation. The supplied household pH values are representative references, not measurements of real products. pH has no units and the 0–14 scale is the range of this model, not a universal bound. Particle counts are schematic, not to scale; numeric concentrations are authoritative. Hydronium is composed from the supplied water artwork and an extra hydrogen/charge, rather than mislabeling the supplied bare H+ sprite.

## Sources and alignment

- [OpenStax: pH and pOH](https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh): water equilibrium and logarithmic scale.
- [OpenStax: acid-base titrations](https://openstax.org/books/chemistry-2e/pages/14-7-acid-base-titrations): strong acid/base reacting amounts and equivalence.
- [TEA Chemistry breakouts](https://tea.texas.gov/academics/instructional-materials/review-and-adoption-process/breakout-documents/chemistry-breakouts.pdf): Chemistry 12D/E, high-school extension with partial support. Students explain water formation, compare H3O+ and pH, and use pH evidence. No comprehensive acid/base course coverage or assessment designation is claimed.
- [NGSS MS-PS1-2](https://www.nextgenscience.org/pe/ms-ps1-2-matter-and-its-interactions): connection to analyzing data and chemical changes. pH is outside its assessment property list; this is not full PE coverage.

Spanish simulation and vocabulary are approved by Matt for classroom use (2026-10-29). The simulation was tested in desktop Chrome at 1440 and 390 px with normal/reduced motion; real Chromebook hardware and screen-reader testing are pending. Teacher resources link to the existing members landing page; English teacher pack 1.0.0 is prepared separately in editable Word and PDF formats; member-library upload is tracked separately.

## Existing art

Supplied Acids & Bases v1 (2026-10-29), Density glassware, Conservation of Mass bench and zoom rim. SVG assets are reused locally, with runtime color/level changes. The thumbnail assembles the same art. No generated raster art, external fonts, tracking or library downloads. Copyright Sciesmic; existing project rights apply.

Measurement reveal: the pH marker, classification, ion diagram and concentrations stay hidden until Measure pH is pressed. Changing a sample, solution, instrument, mode or manual added volume, resetting or starting a trial clears the current reveal while keeping recorded observations. Automatic addition only updates live results after measurement has been activated; starting automatic addition alone does not reveal pH. The reference scale remains visible.

The header illustration reuses existing glassware, lemon, indicator and reference-scale SVGs. It contains no selected-sample result or pH marker.
