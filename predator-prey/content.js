// Spanish draft pending native science educator review.
export const content = {
  "id": "predator-prey",
  "version": "3.0.0",
  "teacherPackUrl": "https://sciesmic.com/a/members",
  "strings": {
    "en": {
      "title": "Predator Prey Lab",
      "eyebrow": "FIELD NOTES / 07 · ECOLOGY",
      "h1": "A change of season.\nA change of chances.",
      "lede": "In a forest-edge meadow, a [[predator|fox]] searches for a [[prey|snowshoe hare]]. Test camouflage in a short experiment, or follow [[population|populations]] through years of changing seasons and delayed responses.",
      "grade": "Grades 7–8 application · Grade 6 ecology foundations",
      "step1": "01 / PREDICT",
      "question": "Will a white coat always help a hare survive?",
      "prediction": "Write your prediction and a reason",
      "step2": "02 / INVESTIGATE",
      "workspace": "Your meadow experiment",
      "mode": "Learning mode",
      "guided": "Guided investigation",
      "explore": "Open exploration",
      "mystery": "Mystery challenge",
      "guidedHint": "A [[fair-test|fair test]] changes one variable. Keep winter, 100% snow, 100 hares, 6 foxes, food capacity 240 and shelter 25%. Compare brown and white coats using the same seed, then repeat with several seeds.",
      "exploreHint": "Change one variable at a time. Settings apply to a fresh trial; save your current evidence before changing them. A season stays fixed for all 13 model weeks.",
      "mysteryHint": "A mystery trial has a hidden brown or white coat. Run it, inspect detection evidence, then diagnose the coat. You may be uncertain with few encounters.",
      "hares": "Hares",
      "foxes": "Foxes",
      "season": "Season",
      "spring": "Spring",
      "summer": "Summer",
      "fall": "Fall",
      "winter": "Winter",
      "snow": "Snow cover (%)",
      "coat": "Hare coat",
      "seasonal": "Seasonal molt",
      "brown": "Brown",
      "white": "White",
      "food": "Base plant food capacity (hares)",
      "shelter": "Shelter (%)",
      "camouflageNote": "[[camouflage|Camouflage]] changes [[detection|detection]], not guaranteed capture. [[shelter|Shelter]] reduces visibility. Snow is an [[abiotic|abiotic factor]]; plants are a [[resource|resource]]. Food capacity approximates [[carrying-capacity|carrying capacity]].",
      "coatNote": "Snowshoe hares are relatives of rabbits. Real molts are gradual and respond mainly to day length. The short experiment and Constant conditions hold the selected coat, snow and season fixed. With Seasonal progression, coat changes gradually on a daylength schedule, independently of actual snow. Each season lasts 13 model weeks. Seasonal molting is not inherited evolutionary change.",
      "play": "Run experiment",
      "pause": "Pause",
      "step": "One week",
      "finish": "Run to week 13",
      "reset": "Reset same seed",
      "new": "New seed",
      "seed": "Trial seed",
      "share": "Copy trial link",
      "copied": "Trial link copied.",
      "copyFail": "Copy the URL from your address bar.",
      "sceneTitle": "Forest-edge meadow",
      "sceneNote": "Illustration: each animal icon represents several individuals. Movement is decorative; counts and hunting events come from the model.",
      "week": "Week",
      "probability": "Detection probability per encounter",
      "hidden": "Hidden coat",
      "counts": "Population trajectories",
      "hunting": "Hunting evidence",
      "encounters": "Encounters",
      "detected": "Detections",
      "kills": "Captures",
      "rate": "Modeled detection rate",
      "noEncounters": "No encounters yet",
      "births": "Hare births",
      "deaths": "Other hare deaths",
      "fBirths": "Fox births",
      "fDeaths": "Fox deaths",
      "cumulative": "Hunting totals are cumulative expected events in the modeled study area. Detection rate = detections ÷ encounters × 100. The carrying capacity applies to hares, not foxes.",
      "save": "Save trial snapshot",
      "download": "Download all evidence CSV",
      "history": "Compare saved trials",
      "empty": "No snapshots saved. Save each trial before changing settings. Saved evidence remains in this tab only.",
      "saved": "Snapshot saved. Download evidence before closing this tab.",
      "data": "Weekly evidence table",
      "dataNote": "Solid green: hares. Dashed orange: foxes. Optional dotted purple: hare carrying capacity. Population peaks can lag, and fluctuations can damp. Weekly tables show one decimal; CSV keeps full precision.",
      "diagnosis": "Which coat best explains the evidence?",
      "checkDiagnosis": "Check diagnosis",
      "diagnosisGood": "Correct. Explain how your detection evidence supports this coat; one short trial still has uncertainty.",
      "diagnosisBad": "Not this time. Compare snow cover with each coat and consider repeated trials.",
      "step3": "03 / EXPLAIN",
      "explainPrompt": "What changed—and what is your evidence?",
      "explainNote": "Use a [[fair-test|fair test]] to connect [[camouflage|camouflage]], hunting and [[population|population]] change. In multi-year trials, trace the feedback: more hares → more food for foxes → more foxes → fewer hares → less food → fewer foxes → hare recovery. Peaks need not occur together.",
      "explanation": "Your claim, evidence, and reasoning",
      "step4": "04 / CHECK YOUR THINKING",
      "checksHeading": "Test your explanation",
      "notes": "Model notes and sources",
      "modelNotes": "Preview 3 uses continuous expected animal abundance in one fixed modeled study area. Hare births are 0.06 × hares per week, modified gradually by ±10% with seasons; resource-related losses are the same rate × hares² / carrying capacity. With no food, births stop and losses increase. Expected search encounters saturate as hares become abundant (Type II response, half-saturation 80). Detection = (0.50 + 0.15 × coat–snow mismatch) × (1 − 0.20 × shelter fraction); expected captures are 65% of detections, capped by available hares. Maximum capture rate is 0.95 × detection / 0.50 per fox per week before weather. Weekly search varies ±2% with the seed. Fox births equal 0.06 × captures; weekly fox losses are foxes × [0.025 + 0.08 × max(0, 1 − intake per fox / 0.5)]. Less intake therefore reduces births and increases losses in the same interval. A delayed population peak emerges from accumulated births and deaths, not an extra reserve or delay queue. Eight integration substeps per week maintain numerical stability. Seasonal carrying capacity varies smoothly by ±8%; snow timing varies independently from a daylength coat proxy. Constant conditions hold the environment fixed, and the short 13-week experiment always holds it fixed. No population waves, immigration or rescue animals are imposed. Expected abundance below 0.01 is treated as local extinction and counted in losses. Other fox foods, space, age/sex structure and genetics are omitted. Synthetic teaching rates are not fitted wildlife parameters or predictions of real cycle lengths. Estimated counts can damp toward balance or collapse under extreme settings.",
      "footer": "Sciesmic Labs · Learn. Grow. Achieve! · 3.0.0 · Spanish draft pending educator review",
      "openFlashcards": "Vocabulary cards ↗ Print · CSV · Offline HTML",
      "cardsTitle": "Predator Prey Vocabulary Cards",
      "cardsIntro": "Explore the words used in the meadow investigation.",
      "backLab": "← Back to the lab",
      "cardsLanguage": "Card language",
      "english": "English",
      "spanish": "Spanish",
      "bilingual": "Bilingual",
      "printCards": "Print / Save as PDF",
      "exportCards": "Export CSV",
      "exportHTML": "Export offline HTML",
      "cardsInstructions": "Print one-sided on US Letter at 100%. Cut on dashed lines; fold on the dotted line to put the term and definition on opposite faces.",
      "cardsReview": "Spanish is a draft pending review by a native-speaking science educator.",
      "cardsNotice": "Free glossary cards · Sciesmic Labs · 2026",
      "cardNumber": "Card {n} of {total}",
      "flashcards": "Vocabulary flashcards",
      "cardsFile": "predator-prey-vocabulary",
      "exportDone": "Export downloaded.",
      "termHeading": "Term",
      "definitionHeading": "Definition",
      "experiment": "Investigation",
      "short": "Short camouflage · 13 weeks",
      "population": "Multi-year populations",
      "years": "Investigation length (years)",
      "year": "Elapsed years",
      "mixed": "Changing coat",
      "endWeek": "End week",
      "finishYears": "Run {years} years",
      "oneYear": "Advance one year",
      "density": "Estimated animal abundance",
      "coatWhite": "White coat (%)",
      "annual": "Annual population evidence",
      "peakSnow": "Peak winter snow (%)",
      "startingSeason": "Starting season",
      "populationHint": "Follow the connection between prey and predator. Hares provide food for foxes; fox births and losses respond to hunting success. In seasonal conditions, each season lasts 13 weeks. Use the percentage graph to compare timing; use abundance to compare numbers. Save before changing settings.",
      "populationGuide": "Start with the Baseline cycles preset to trace the feedback. Compare it with Seasonal cycles, then change one factor. Open the annual or weekly table to support your explanation. The Disturbance scenario starts with 100 hares, 10 foxes and a fixed white coat.",
      "densityNote": "Numbers are estimated animals in a fixed modeled study area. Decimal values are expected abundance, not parts of an individual animal. Graphics represent groups; the model does not track individuals. Tiny estimates below 0.01 are treated as local extinction. No animals are added to rescue a population.",
      "capacity": "Hare carrying capacity",
      "capacityLegend": "Hare capacity",
      "intake": "Food intake per fox",
      "reviewNote": "Choose a starting scenario. Changing model settings starts a new trial; save your current evidence first.",
      "baselinePreset": "Baseline cycles",
      "seasonalPreset": "Seasonal cycles",
      "userPreset": "Disturbance scenario",
      "climate": "Environment",
      "climateSeasonal": "Seasonal progression",
      "climateConstant": "Constant conditions",
      "advanced": "More settings: shelter",
      "graphView": "Graph view",
      "percentView": "% of starting population",
      "abundanceView": "Estimated number of animals",
      "showCapacity": "Show carrying capacity",
      "capacityHelp": "The dotted purple line is the current carrying capacity for hares: the resource level that balances modeled hare births and resource-related deaths without fox predation. It is not a hard ceiling or a fox limit.",
      "capacityPercent": "In this view, hare capacity is divided by starting hares × 100; foxes are compared with starting foxes.",
      "percentNote": "Both species share one percentage scale. Each starts at 100%; compare the timing of rises and falls. This view requires both starting populations to be above zero.",
      "abundanceNote": "Both species share one abundance scale. Fox numbers are smaller, so switch to percentage view to compare their timing. Tables and CSV preserve the same estimates. Percentage view requires both starting populations to be above zero.",
      "interval": "Population changes this week",
      "feedbackStart": "Run or step the model to inspect births and losses.",
      "feedbackFoxRise": "Fox births meet or exceed fox losses this week. Captured hares supply food that supports these births.",
      "feedbackFoxFall": "Fox losses exceed births this week. When food per fox falls, births decrease and shortage losses increase."
    },
    "es": {
      "title": "Laboratorio de depredadores y presas",
      "eyebrow": "NOTAS DE CAMPO / 07 · ECOLOGÍA",
      "h1": "Cambia la estación.\nCambian las posibilidades.",
      "lede": "En una pradera junto al bosque, un [[predator|zorro]] busca una [[prey|liebre americana]]. Prueba el camuflaje en un experimento corto o sigue las [[population|poblaciones]] durante años de estaciones cambiantes y respuestas con retraso.",
      "grade": "Aplicación en grados 7–8 · Bases de ecología de grado 6",
      "step1": "01 / PREDICE",
      "question": "¿Un pelaje blanco siempre ayuda a una liebre a sobrevivir?",
      "prediction": "Escribe tu predicción y una razón",
      "step2": "02 / INVESTIGA",
      "workspace": "Tu experimento en la pradera",
      "mode": "Modo de aprendizaje",
      "guided": "Investigación guiada",
      "explore": "Exploración libre",
      "mystery": "Desafío misterioso",
      "guidedHint": "Una [[fair-test|prueba justa]] cambia una variable. Mantén invierno, 100% de nieve, 100 liebres, 6 zorros, capacidad alimentaria 240 y refugio 25%. Compara pelaje café y blanco con la misma semilla; después repite con varias semillas.",
      "exploreHint": "Cambia una variable a la vez. Los ajustes inician una prueba nueva; guarda los datos antes de cambiarlos. La estación permanece fija durante las 13 semanas del modelo.",
      "mysteryHint": "Una prueba misteriosa tiene pelaje café o blanco oculto. Ejecútala, examina las detecciones y deduce el pelaje. Con pocos encuentros puede haber incertidumbre.",
      "hares": "Liebres",
      "foxes": "Zorros",
      "season": "Estación",
      "spring": "Primavera",
      "summer": "Verano",
      "fall": "Otoño",
      "winter": "Invierno",
      "snow": "Cobertura de nieve (%)",
      "coat": "Pelaje de la liebre",
      "seasonal": "Muda estacional",
      "brown": "Café",
      "white": "Blanco",
      "food": "Capacidad base del alimento vegetal (liebres)",
      "shelter": "Refugio (%)",
      "camouflageNote": "El [[camouflage|camuflaje]] cambia la [[detection|detección]], sin garantizar la captura. El [[shelter|refugio]] reduce la visibilidad. La nieve es un [[abiotic|factor abiótico]]; las plantas son un [[resource|recurso]]. La capacidad alimentaria aproxima la [[carrying-capacity|capacidad de carga]].",
      "coatNote": "Las liebres americanas son parientes de los conejos. La muda real es gradual y responde principalmente a la duración del día. El experimento corto y Condiciones constantes mantienen fijos pelaje, nieve y estación. Con Progresión estacional, la muda sigue la duración del día, independientemente de la nieve. Cada estación dura 13 semanas del modelo. La muda estacional no es un cambio evolutivo heredado.",
      "play": "Ejecutar experimento",
      "pause": "Pausar",
      "step": "Una semana",
      "finish": "Ejecutar hasta la semana 13",
      "reset": "Reiniciar con la misma semilla",
      "new": "Nueva semilla",
      "seed": "Semilla de la prueba",
      "share": "Copiar enlace de la prueba",
      "copied": "Enlace copiado.",
      "copyFail": "Copia la URL de la barra de direcciones.",
      "sceneTitle": "Pradera junto al bosque",
      "sceneNote": "Ilustración: cada ícono representa varios individuos. El movimiento es decorativo; las cantidades y cacerías provienen del modelo.",
      "week": "Semana",
      "probability": "Probabilidad de detección por encuentro",
      "hidden": "Pelaje oculto",
      "counts": "Trayectorias de las poblaciones",
      "hunting": "Evidencia de cacería",
      "encounters": "Encuentros",
      "detected": "Detecciones",
      "kills": "Capturas",
      "rate": "Tasa de detección modelada",
      "noEncounters": "Aún no hay encuentros",
      "births": "Nacimientos de liebres",
      "deaths": "Otras muertes de liebres",
      "fBirths": "Nacimientos de zorros",
      "fDeaths": "Muertes de zorros",
      "cumulative": "Los totales de cacería son eventos esperados acumulados en el área modelada. Tasa de detección = detecciones ÷ encuentros × 100. La capacidad de carga corresponde a liebres, no a zorros.",
      "save": "Guardar datos de la prueba",
      "download": "Descargar toda la evidencia CSV",
      "history": "Comparar pruebas guardadas",
      "empty": "No hay datos guardados. Guarda cada prueba antes de cambiar los ajustes. Los datos permanecen solo en esta pestaña.",
      "saved": "Datos guardados. Descarga la evidencia antes de cerrar esta pestaña.",
      "data": "Tabla de evidencia semanal",
      "dataNote": "Verde continuo: liebres. Naranja discontinuo: zorros. Morado punteado opcional: capacidad de carga de liebres. Los máximos pueden ocurrir después y las fluctuaciones pueden amortiguarse. Tablas con un decimal; CSV con precisión completa.",
      "diagnosis": "¿Qué pelaje explica mejor la evidencia?",
      "checkDiagnosis": "Comprobar respuesta",
      "diagnosisGood": "Correcto. Explica cómo las detecciones respaldan este pelaje; una prueba corta aún tiene incertidumbre.",
      "diagnosisBad": "Esta vez no. Compara la nieve con cada pelaje y considera repetir las pruebas.",
      "step3": "03 / EXPLICA",
      "explainPrompt": "¿Qué cambió y cuál es tu evidencia?",
      "explainNote": "Usa una [[fair-test|prueba justa]] para relacionar [[camouflage|camuflaje]], cacería y cambios de [[population|población]]. En varios años, sigue la relación: más liebres → más alimento para zorros → más zorros → menos liebres → menos alimento → menos zorros → recuperación de liebres. Los máximos no tienen que coincidir.",
      "explanation": "Tu afirmación, evidencia y razonamiento",
      "step4": "04 / COMPRUEBA TUS IDEAS",
      "checksHeading": "Pon a prueba tu explicación",
      "notes": "Notas del modelo y fuentes",
      "modelNotes": "La vista previa 3 usa abundancia continua esperada en un área de estudio fija. Los nacimientos de liebres son 0.06 × liebres por semana, con modificación estacional gradual de ±10%; las pérdidas por recursos usan esa tasa × liebres² / capacidad de carga. Sin alimento no hay nacimientos y aumentan las pérdidas. Los encuentros se saturan con liebres abundantes (respuesta de tipo II; semisaturación 80). Detección = (0.50 + 0.15 × desajuste entre pelaje y nieve) × (1 − 0.20 × fracción de refugio); se captura 65% de las detecciones, sin exceder las liebres disponibles. La captura máxima por zorro por semana es 0.95 × detección / 0.50 antes del clima. La búsqueda varía ±2% con la semilla. Nacimientos de zorros = 0.06 × capturas; pérdidas semanales = zorros × [0.025 + 0.08 × max(0, 1 − ingesta por zorro / 0.5)]. Menor ingesta reduce nacimientos y aumenta pérdidas en el mismo intervalo. El retraso entre máximos surge de nacimientos y muertes acumulados; no hay índice de reservas ni cola de retraso. Se usan ocho subpasos por semana. La capacidad estacional varía suavemente ±8%; la nieve y el indicador de duración del día para la muda varían de forma independiente. Las condiciones constantes y el experimento corto de 13 semanas mantienen fijo el ambiente. No se imponen ondas, inmigración ni animales de rescate. La abundancia esperada menor de 0.01 se considera extinción local y se cuenta en las pérdidas. Se omiten otros alimentos de zorros, espacio, edades, sexos y genética. Las tasas didácticas no son parámetros de campo ni pronósticos de ciclos reales. Las fluctuaciones pueden amortiguarse o colapsar con ajustes extremos.",
      "footer": "Sciesmic Labs · Learn. Grow. Achieve! · 3.0.0 · Borrador en español pendiente de revisión docente",
      "openFlashcards": "Tarjetas de vocabulario ↗ Imprimir · CSV · HTML sin conexión",
      "cardsTitle": "Tarjetas de vocabulario de depredadores y presas",
      "cardsIntro": "Explora las palabras de la investigación de la pradera.",
      "backLab": "← Volver al laboratorio",
      "cardsLanguage": "Idioma de las tarjetas",
      "english": "Inglés",
      "spanish": "Español",
      "bilingual": "Bilingüe",
      "printCards": "Imprimir / Guardar como PDF",
      "exportCards": "Exportar CSV",
      "exportHTML": "Exportar HTML sin conexión",
      "cardsInstructions": "Imprime por un lado en tamaño carta al 100%. Recorta las líneas discontinuas y dobla por la línea punteada para poner el término y la definición en caras opuestas.",
      "cardsReview": "El español es un borrador pendiente de revisión por un docente de ciencias hablante nativo.",
      "cardsNotice": "Tarjetas gratuitas del glosario · Sciesmic Labs · 2026",
      "cardNumber": "Tarjeta {n} de {total}",
      "flashcards": "Tarjetas de vocabulario",
      "cardsFile": "vocabulario-depredadores-presas",
      "exportDone": "Archivo descargado.",
      "termHeading": "Término",
      "definitionHeading": "Definición",
      "experiment": "Investigación",
      "short": "Camuflaje corto · 13 semanas",
      "population": "Poblaciones durante varios años",
      "years": "Duración de la investigación (años)",
      "year": "Años transcurridos",
      "mixed": "Pelaje en transición",
      "endWeek": "Semana final",
      "finishYears": "Ejecutar {years} años",
      "oneYear": "Avanzar un año",
      "density": "Abundancia estimada",
      "coatWhite": "Pelaje blanco (%)",
      "annual": "Evidencia anual de las poblaciones",
      "peakSnow": "Nieve máxima en invierno (%)",
      "startingSeason": "Estación inicial",
      "populationHint": "Sigue la relación entre presa y depredador. Las liebres alimentan a los zorros; los nacimientos y pérdidas de zorros responden a la cacería. Con progresión estacional, cada estación dura 13 semanas. Compara los tiempos en porcentaje y las cantidades en abundancia. Guarda antes de cambiar ajustes.",
      "populationGuide": "Comienza con Ciclos de referencia para seguir la relación. Compara con Ciclos estacionales y cambia un factor. Usa la tabla anual o semanal para justificar tu explicación. Escenario de perturbación inicia con 100 liebres, 10 zorros y pelaje blanco fijo.",
      "densityNote": "Los números son animales estimados en un área modelada fija. Los decimales indican abundancia esperada, no partes de un animal. Los dibujos representan grupos; no se siguen individuos. Los valores menores de 0.01 se consideran extinción local. No se agregan animales de rescate.",
      "capacity": "Capacidad de carga de liebres",
      "capacityLegend": "Capacidad de liebres",
      "intake": "Ingesta por zorro",
      "reviewNote": "Elige un escenario inicial. Cambiar ajustes del modelo inicia otra prueba; guarda primero los datos actuales.",
      "baselinePreset": "Ciclos de referencia",
      "seasonalPreset": "Ciclos estacionales",
      "userPreset": "Escenario de perturbación",
      "climate": "Ambiente",
      "climateSeasonal": "Progresión estacional",
      "climateConstant": "Condiciones constantes",
      "advanced": "Más ajustes: refugio",
      "graphView": "Vista de la gráfica",
      "percentView": "% de la población inicial",
      "abundanceView": "Número estimado de animales",
      "showCapacity": "Mostrar capacidad de carga",
      "capacityHelp": "La línea morada punteada indica la capacidad de carga actual de liebres: el nivel de recursos que equilibra nacimientos y pérdidas por recursos sin depredación. No es un techo rígido ni un límite para zorros.",
      "capacityPercent": "En esta vista, la capacidad se divide entre las liebres iniciales × 100; los zorros se comparan con los zorros iniciales.",
      "percentNote": "Las dos especies comparten una escala porcentual. Cada una inicia en 100%; compara los aumentos y descensos. Ambas poblaciones iniciales deben ser mayores que cero.",
      "abundanceNote": "Ambas especies comparten una escala de abundancia. Como hay menos zorros, cambia a porcentaje para comparar los tiempos. Las tablas y el CSV conservan las mismas estimaciones. La vista porcentual requiere que ambas poblaciones iniciales sean mayores que cero.",
      "interval": "Cambios de población esta semana",
      "feedbackStart": "Ejecuta o avanza el modelo para examinar nacimientos y pérdidas.",
      "feedbackFoxRise": "Los nacimientos de zorros igualan o superan las pérdidas esta semana. Las liebres capturadas aportan alimento para esos nacimientos.",
      "feedbackFoxFall": "Las pérdidas de zorros superan los nacimientos esta semana. Menor alimento por zorro reduce nacimientos y aumenta pérdidas por escasez."
    }
  },
  "vocab": [
    {
      "id": "predator",
      "en": {
        "term": "Predator",
        "def": "An organism that hunts and eats another organism."
      },
      "es": {
        "term": "Depredador",
        "def": "Organismo que caza y se come a otro organismo."
      }
    },
    {
      "id": "prey",
      "en": {
        "term": "Prey",
        "def": "An organism hunted and eaten by a predator."
      },
      "es": {
        "term": "Presa",
        "def": "Organismo que un depredador caza y se come."
      }
    },
    {
      "id": "population",
      "en": {
        "term": "Population",
        "def": "Members of one species living in the same area at the same time."
      },
      "es": {
        "term": "Población",
        "def": "Individuos de una especie que viven en la misma área al mismo tiempo."
      }
    },
    {
      "id": "camouflage",
      "en": {
        "term": "Camouflage",
        "def": "Features that reduce detection by blending with the surroundings."
      },
      "es": {
        "term": "Camuflaje",
        "def": "Características que reducen la detección al confundirse con el entorno."
      }
    },
    {
      "id": "detection",
      "en": {
        "term": "Detection",
        "def": "Noticing that a potential prey animal is present; detection does not guarantee capture."
      },
      "es": {
        "term": "Detección",
        "def": "Notar la presencia de una posible presa; detectarla no garantiza capturarla."
      }
    },
    {
      "id": "shelter",
      "en": {
        "term": "Shelter",
        "def": "Habitat features that provide cover and can reduce exposure to predators."
      },
      "es": {
        "term": "Refugio",
        "def": "Características del hábitat que brindan cobertura y pueden reducir la exposición a depredadores."
      }
    },
    {
      "id": "abiotic",
      "en": {
        "term": "Abiotic factor",
        "def": "A nonliving part of the environment, such as snow cover."
      },
      "es": {
        "term": "Factor abiótico",
        "def": "Parte no viva del ambiente, como la cobertura de nieve."
      }
    },
    {
      "id": "resource",
      "en": {
        "term": "Resource",
        "def": "Something an organism uses to survive or reproduce, such as food."
      },
      "es": {
        "term": "Recurso",
        "def": "Algo que un organismo utiliza para sobrevivir o reproducirse, como el alimento."
      }
    },
    {
      "id": "carrying-capacity",
      "en": {
        "term": "Carrying capacity",
        "def": "The population an environment can support over time with its available resources."
      },
      "es": {
        "term": "Capacidad de carga",
        "def": "Población que un ambiente puede mantener a lo largo del tiempo con sus recursos disponibles."
      }
    },
    {
      "id": "fair-test",
      "en": {
        "term": "Fair test",
        "def": "A comparison that changes one variable while keeping other relevant conditions the same."
      },
      "es": {
        "term": "Prueba justa",
        "def": "Comparación que cambia una variable y mantiene iguales las demás condiciones relevantes."
      }
    }
  ],
  "checks": [
    {
      "id": "coat",
      "answer": "C",
      "standard": "MS-LS2-1 · TEKS 6.12A/B (partial)",
      "en": {
        "prompt": "A white hare is on snow-free ground. What can you conclude?",
        "options": [
          "White always helps.",
          "A fox always catches it.",
          "The mismatch can increase detection.",
          "The hare chooses a new coat instantly."
        ],
        "feedback": [
          "Coat benefits depend on the background.",
          "Detection and capture are separate events.",
          "Contrast can make it easier to detect; capture is still uncertain.",
          "Real molting is gradual, mainly triggered by day length."
        ]
      },
      "es": {
        "prompt": "Una liebre blanca está en terreno sin nieve. ¿Qué concluyes?",
        "options": [
          "El blanco siempre ayuda.",
          "Un zorro siempre la captura.",
          "El contraste puede aumentar la detección.",
          "La liebre cambia de pelaje al instante."
        ],
        "feedback": [
          "La ventaja depende del fondo.",
          "Detectar y capturar son eventos distintos.",
          "El contraste facilita detectarla; la captura aún es incierta.",
          "La muda es gradual y responde principalmente a la duración del día."
        ]
      }
    },
    {
      "id": "variation",
      "answer": "A",
      "standard": "MS-LS2-1 · TEKS 6.12A/B (partial)",
      "en": {
        "prompt": "Identical settings and different seeds can give different trajectories. Why?",
        "options": [
          "Search conditions and annual snow timing vary with the seed.",
          "The graph adds measurement errors.",
          "The model forces a fixed population wave.",
          "A seed creates animals after extinction."
        ],
        "feedback": [
          "The seed varies modeled environmental conditions; the same seed and settings replay.",
          "Displayed values are model states, not noisy measurements.",
          "Population changes follow births, deaths, food and predation, not a prescribed wave.",
          "This closed model never replenishes extinct populations."
        ]
      },
      "es": {
        "prompt": "Con ajustes iguales y semillas distintas, las trayectorias pueden diferir. ¿Por qué?",
        "options": [
          "La semilla varía la búsqueda y el calendario anual de nieve.",
          "La gráfica agrega errores de medición.",
          "El modelo impone una onda fija.",
          "La semilla crea animales tras la extinción."
        ],
        "feedback": [
          "La semilla varía condiciones del modelo; los mismos ajustes y semilla reproducen la prueba.",
          "Los datos son estados del modelo, no mediciones con ruido.",
          "Los cambios siguen nacimientos, muertes, alimento y depredación, no una onda impuesta.",
          "Este modelo cerrado no repone poblaciones extintas."
        ]
      }
    },
    {
      "id": "math",
      "answer": "B",
      "standard": "MS-LS2-1 · TEKS 6.12A/B (partial)",
      "en": {
        "prompt": "Foxes detect hares in 12 of 40 encounters. What is the observed detection rate?",
        "options": [
          "12%",
          "30%",
          "40%",
          "52%"
        ],
        "feedback": [
          "Divide detections by encounters, then multiply by 100.",
          "12 ÷ 40 × 100 = 30%.",
          "40 is the encounter count, not the rate.",
          "Adding counts does not give a percentage."
        ]
      },
      "es": {
        "prompt": "Los zorros detectan liebres en 12 de 40 encuentros. ¿Cuál es la tasa observada?",
        "options": [
          "12%",
          "30%",
          "40%",
          "52%"
        ],
        "feedback": [
          "Divide detecciones entre encuentros y multiplica por 100.",
          "12 ÷ 40 × 100 = 30%.",
          "40 es la cantidad de encuentros.",
          "Sumar cantidades no da un porcentaje."
        ]
      }
    },
    {
      "id": "null",
      "answer": "D",
      "standard": "MS-LS2-1 · TEKS 6.12A/B (partial)",
      "en": {
        "prompt": "A trial starts with no foxes. What must be true?",
        "options": [
          "Hares grow forever.",
          "Foxes appear when food is plentiful.",
          "No hares can die.",
          "There are no fox captures."
        ],
        "feedback": [
          "Food and other deaths still limit hares.",
          "Without parents or immigration, foxes cannot appear.",
          "Other causes of death remain.",
          "Zero foxes means zero fox hunting events."
        ]
      },
      "es": {
        "prompt": "Una prueba comienza sin zorros. ¿Qué debe ser cierto?",
        "options": [
          "Las liebres crecen sin límite.",
          "Aparecen zorros si hay alimento.",
          "No puede morir ninguna liebre.",
          "No hay capturas por zorros."
        ],
        "feedback": [
          "El alimento y otras muertes limitan a las liebres.",
          "Sin progenitores ni inmigración no aparecen zorros.",
          "Persisten otras causas de muerte.",
          "Sin zorros no hay cacerías de zorros."
        ]
      }
    },
    {
      "id": "prediction",
      "answer": "B",
      "standard": "MS-LS2-1 · TEKS 6.12A/B (partial)",
      "en": {
        "prompt": "Hares have begun to decline. Why can the fox population peak later?",
        "options": [
          "The fox curve must immediately match the hare curve.",
          "Fox abundance changes as food-dependent births and deaths accumulate.",
          "Snow creates new foxes.",
          "Foxes are guaranteed to survive every decline."
        ],
        "feedback": [
          "Predator and prey populations need not change at the same time.",
          "Food intake affects births and losses now, but the population changes over time. Its peak can follow the hare peak without an extra delay rule.",
          "Fox births require an existing population; snow does not create foxes.",
          "Prolonged food shortage can still lead to local extinction."
        ]
      },
      "es": {
        "prompt": "Las liebres comenzaron a disminuir. ¿Por qué puede ocurrir después el máximo de zorros?",
        "options": [
          "La curva de zorros debe igualar inmediatamente a la de liebres.",
          "La abundancia de zorros cambia al acumularse nacimientos y muertes que dependen del alimento.",
          "La nieve crea zorros nuevos.",
          "Los zorros siempre sobreviven a cualquier disminución."
        ],
        "feedback": [
          "Las poblaciones no tienen que cambiar al mismo tiempo.",
          "La ingesta afecta ahora a nacimientos y pérdidas, pero la población cambia con el tiempo. Su máximo puede seguir al de liebres sin una regla extra de retraso.",
          "Se necesita una población existente para los nacimientos; la nieve no crea zorros.",
          "La escasez prolongada aún puede causar extinción local."
        ]
      }
    }
  ],
  "standards": [
    {
      "code": "TEKS 6.12A/B",
      "en": "Grade 6 ecology foundations; resource and predator–prey aspects only",
      "es": "Bases de grado 6; solo recursos y depredación",
      "url": "https://legacycms.tea.texas.gov/about-tea/laws-and-rules/sboe-rules-tac/sboe-tac-currently-in-effect/ch112b.pdf"
    },
    {
      "code": "MS-LS2-1",
      "en": "Analyze resource effects on populations",
      "es": "Analizar efectos de recursos en poblaciones",
      "url": "https://www.nextgenscience.org/pe/ms-ls2-1-ecosystems-interactions-energy-and-dynamics"
    }
  ]
};
