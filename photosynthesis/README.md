# Photosynthesis 1.0.1

A free Sciesmic Labs simulation: Predict → Investigate → Explain → Check your thinking. Grade 7 investigation; grade 6 energy foundations and grade 8 atom-conservation extension. No build step or external runtime dependencies. Serve the website root over HTTP and open `photosynthesis/`.

## Experience

- Oxygen lab: vary light intensity, light color and maintained dissolved carbon supply; observe 0–10 minutes of gas collection.
- Inside a leaf: plant → land-leaf cross-section → chloroplast, with contextual vocabulary.
- Build a sugar: choose starting CO₂/H₂O counts and use one net reaction packet at a time; audit conserved C/H/O atoms.
- Day & night: distinguish photosynthesis, respiration and net gas exchange. Respiration continues in both light and darkness.
- Save/compare trials, inspect graph points with keyboard/touch or a full-size selector, enlarge the graph, and export full-precision data as CSV. Every trial shares fixed 0–10 min / 0–4 mL axes.
- Ten contextual glossary definitions and a separate public flashcard tool: EN, ES and bilingual print/Save as PDF, CSV and self-contained offline HTML.
- Five multiple-choice checks with per-option explanations. English and Spanish content in `content.js`.

Changing a condition automatically saves an elapsed trial and starts a new one. Switching views or language preserves settings, trial data and notes. Reset clears only the current observation time; saved records remain. New trial saves elapsed data, advances the illustration seed, and keeps conditions. Notes/data are held in the page, not permanent storage. Export data before reloading. Copy link records starting settings, language, view and seed; it opens at time zero, not with saved records or notes.

## Scientific model

`model.js` is DOM-free and deterministic. L and C are relative 0–100 settings, not measured irradiance or ppm. For a healthy fixed-sized waterweed sample at constant temperature, with ample water, oxygen and stored sugar:

- gross O₂ production = 0.6 × L/(L+25) × C/(C+25) × color factor, in mL/min
- color factors: white 1, red 0.9, blue 0.85, green 0.3 (illustrative, equal incident photon supply)
- respiration = 0.0375 mL O₂/min, in both light and darkness
- net O₂ exchange = gross − respiration
- gas collected = max(0, net rate) × elapsed minutes

These coefficients are teaching choices, not fitted biological measurements. Saturation illustrates diminishing returns and resource limitation. Green light supports photosynthesis; the relative color ordering is not universal across plants, spectra or leaf depths. The carbon supply is held constant by an ideal reservoir. Short-term respiration uses stored food; a zero carbon-supply setting does not disable respiration. No growth, death, depletion, acclimation, dissolution, leaks, temperature response or photorespiration is simulated. A negative net rate means uptake; the tube does not display a negative gas volume. Photosynthetic oxygen comes from water. The balanced net equation is atom accounting, not an animation of the biochemical mechanism.

The collection tube's existing art uses 11 native pixels per mL. The clipped gas layer and numeric readout use the same value. Bubbles are illustrative, not equal-volume units. Seed 42 is the default; seed affects decorative bubble offsets only. Identical settings/time always yield identical numerical data. The molecule activity has its own independent counts and light switch; its counts are not converted into experiment gas volumes.

## Alignment and limitations

- TEKS 6.8B: grade 6 foundation, partial. Students trace light → chemical energy in sugar → cellular activity/heat; no full quantitative energy budget.
- TEKS 7.5E: grade 7 recurring theme, partial. Students trace plant inputs/outputs and audit atoms; the whole biosphere and a variety of systems are not modeled.
- TEKS 7.1B and 7.2B: comparative investigation and data-analysis components. Engineering design and an entire practices standard are not claimed.
- TEKS 8.6E: grade 8 extension, partial atom-rearrangement component. No balance-based mass investigation.
- NGSS MS-LS1-6: students use trials, the material/energy representations and explanatory text to construct an evidence-based explanation. LS1.C / PS3.D, constructing explanations, energy and matter. Biochemical mechanisms remain outside the assessment boundary. A written explanation is required; observing the animation alone does not meet the PE.

Current assessed curriculum was checked on October 26, 2026: TEKS 6.8B is Supporting and 8.6E is Readiness in the grade 8 assessment document effective 2025–26. These classifications describe the standards, not complete coverage by this lab. No grade 7 assessment or future SST classification is claimed.

## Sources

- [OpenStax Biology 2e: Photosynthesis](https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis)
- [Monash University: Factors affecting photosynthesis](https://www.monash.edu/student-academic-success/biology/photosynthesis/factors-affecting-photosynthesis)
- [NC State: Botany and plant processes](https://content.ces.ncsu.edu/extension-gardener-handbook/3-botany)
- [TEA: Science standards](https://tea.texas.gov/educators/subject-areas/science/science)
- [Texas Gateway: Science 7.5E](https://texasgateway.org/teks/s75e/alignments)
- [TEA: Middle-school assessed curriculum, effective 2025–26](https://tea.texas.gov/data-reports/staar/2026-staar-middle-school-science-assessed-curriculum.pdf)
- [NGSS MS-LS1-6](https://www.nextgenscience.org/pe/ms-ls1-6-molecules-organisms-structures-and-processes)

All prose/code is original. The 37 PNGs are selected from Sciesmic's existing Photosynthesis art pack v1 (2026-10-26); no new sprites were generated. The thumbnail composes those same sprites. Existing shared kit and flashcard contracts are reused; shared kit files are unchanged.

Public simulation release 1.0.1. Spanish simulation and public cards are drafts pending native-speaking science educator review. Private teacher pack 1.0.0 is prepared separately and compatible with UI 1.0.1 / model 1.0.0; member upload is pending. The members link points to existing resources. Copyright Sciesmic; no new license is granted.

## 1.0.1 interface revision

The chloroplast explorer now uses the existing vector sprite for sharp zooming. The molecule inventory dims depleted inputs and reveals produced sugar/oxygen; Reset molecules restores 6 CO₂, 6 H₂O, no products, and available light, including custom/zero-input and dark states. The separate balanced equation stays visible. Day & Night shows simultaneous gross photosynthesis and respiration lanes: gas direction, model-rate labels, light-energy markers and rate-dependent icon movement/density. Darkness stops photosynthesis while respiration keeps moving. Pause freezes motion; reduced-motion mode retains labeled still diagrams. Moving icons are schematic, not real molecule counts or a calibrated time/size scale.

Scientific model version/hash remain unchanged from 1.0.0. The UI/content version is 1.0.1. Existing numerical evidence remains valid. Private teacher pack 1.0.0 is compatible and remains outside the public repository.
