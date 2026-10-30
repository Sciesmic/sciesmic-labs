export const content = {
  "id": "earthquakes-structures",
  "teacherPackUrl": "https://sciesmic.com/a/members",
  "standards": [
    {
      "code": "TEKS 6–8.1G / 2B–D",
      "en": "Use models, analyze evidence, evaluate designs",
      "es": "Usar modelos, analizar evidencia y evaluar diseños",
      "url": "https://tea.texas.gov/laws-and-rules/sboe-rules-tac/sboe-tac-currently-effect/ch112b.pdf"
    },
    {
      "code": "MS-ETS1-3",
      "en": "Compare designs and combine effective features",
      "es": "Comparar diseños y combinar características eficaces",
      "url": "https://www.nextgenscience.org/pe/ms-ets1-3-engineering-design"
    },
    {
      "code": "MS-ESS3-2 · partial",
      "en": "Hazard mitigation connection; not geographic forecasting",
      "es": "Mitigación de riesgos; no pronósticos geográficos",
      "url": "https://www.nextgenscience.org/pe/ms-ess3-2-earth-and-human-activity"
    }
  ],
  "strings": {
    "en": {
      "title": "Earthquakes & Structures",
      "eyebrow": "EARTH SCIENCE + ENGINEERING · GRADES 6–8",
      "h1": "Build it. Shake it.\nMake it stronger.",
      "intro": "Why do buildings respond differently to the same earthquake? Assemble a structure, investigate its motion, and use evidence to improve your design.",
      "gradeNote": "Grades 6–8 · Original learning model · Spanish draft",
      "step1": "01 / PREDICT",
      "step2": "02 / INVESTIGATE",
      "step3": "03 / EXPLAIN",
      "step4": "04 / CHECK YOUR THINKING",
      "predictTitle": "What will help your building?",
      "predictHelp": "Predict how [[bracing|bracing]] or [[base-isolation|base isolation]] will change the motion. What will you keep the same for a fair comparison?",
      "prediction": "My prediction and reason",
      "workspace": "Your earthquake testing ground",
      "explore": "Explore shaking",
      "retrofit": "Retrofit test",
      "challenge": "Build & test",
      "exploreHint": "Compare a house, school, or tower. Change [[magnitude|magnitude]], then hold the site and design fixed to investigate one variable.",
      "retrofitHint": "Record a baseline. Add a component, repeat the identical shaking, and compare [[drift|story drift]] and roof acceleration.",
      "challengeHint": "Build at least 3 stories for 90 design points or fewer. Pass all three tests: no yielding, peak [[drift|drift]] ≤ 1.5%, and no model limit exceeded. Combine useful features from different designs.",
      "structure": "Starter structure",
      "house": "House · 1 story",
      "school": "School / office · 3 stories",
      "tower": "Tower · 6 stories",
      "load": "Load starter",
      "blank": "Start empty",
      "stories": "Number of stories",
      "material": "Frame material preset",
      "timber": "Timber",
      "steel": "Steel",
      "concrete": "Reinforced concrete",
      "foundation": "Foundation",
      "fixed": "Fixed base",
      "isolated": "Isolated base",
      "components": "Component tray",
      "frame": "Frame · beam + columns",
      "light": "Light floor panel",
      "heavy": "Heavy floor panel",
      "diagonal": "Diagonal brace",
      "xbrace": "X bracing",
      "connection": "Reinforced connections",
      "damper": "Damper",
      "erase": "Remove bay",
      "builderHelp": "Select a component, then a bay in the building. Select it again to remove it. Each frame includes its beam and two columns; every bay needs a frame and a floor.",
      "builderTerms": "[[stiffness|Stiffness]] changes bending resistance; [[damping|damping]] reduces vibration. Every floor adds [[mass|mass]]. Reinforced connections increase the model’s yield capacity.",
      "undo": "Undo",
      "designPoints": "Design points",
      "budgetNote": "Fictional classroom budget; not construction prices.",
      "assemblyOK": "Connected structure · ready to test",
      "assemblyBad": "Complete every bay with a frame and floor before testing.",
      "earthquake": "Earthquake scenario",
      "table": "Controlled shake table",
      "source": "Shaking source",
      "magnitude": "Moment magnitude Mw",
      "distance": "Distance from source (km)",
      "soil": "Site ground",
      "rock": "Rock",
      "soft": "Soft soil",
      "amplitude": "Peak acceleration (g)",
      "frequency": "Frequency (Hz)",
      "duration": "Shaking duration (s)",
      "scenarioHelp": "[[magnitude|Magnitude]] describes earthquake size. Distance and local ground affect [[ground-motion|ground motion]] at the site. These are synthetic teaching scenarios, not forecasts.",
      "tableHelp": "Sweep [[frequency|frequency]] to look for [[resonance|resonance]]. Keep amplitude and duration fixed.",
      "test": "Test structure",
      "pause": "Pause",
      "resume": "Resume",
      "step": "Step 0.5 s",
      "reset": "Reset playback",
      "suite": "Run 3 challenge tests",
      "newSeed": "New shaking record",
      "seed": "Record seed",
      "share": "Copy design link",
      "copied": "Design link copied.",
      "copyFallback": "Copy this address:",
      "ready": "Ready · build, predict, then test.",
      "running": "Shaking in progress",
      "paused": "Playback paused",
      "finished": "Test complete · evidence recorded",
      "limit": "Model limit reached · test stopped. This does not predict real collapse.",
      "timeline": "Review observed motion (s)",
      "sceneLabel": "Animated building response; story-by-story evidence follows below.",
      "sceneNote": "Sideways motion is magnified ×35. Floor height is 3 m in the model. Shaking is horizontal; the foundation follows the ground unless isolated.",
      "liveReadings": "Live readings",
      "time": "Time (s)",
      "roof": "Roof displacement relative to ground (cm)",
      "roofAccel": "Roof acceleration (m/s²)",
      "ground": "Ground acceleration (m/s²)",
      "peakDrift": "Peak story drift (%)",
      "peakRoof": "Peak roof displacement (cm)",
      "peakAccel": "Peak roof acceleration (m/s²)",
      "story": "Story",
      "bay": "Bay",
      "floor": "Floor",
      "none": "None",
      "elastic": "Elastic",
      "yielded": "Yielded",
      "major": "Major model damage",
      "state": "Model state",
      "drift": "Drift (%)",
      "yieldNote": "Yielding means permanent deformation in this model. Story-level colors summarize modeled demand; they are not stresses in individual drawn members.",
      "graphTitle": "Inspect the motion",
      "enlarge": "Enlarge graph",
      "closeGraph": "Close graph",
      "graphView": "Evidence quantity",
      "compareTrials": "Compare recorded trials",
      "currentOnly": "Current test only",
      "view": "Graph view",
      "series": "Select trial",
      "point": "Inspect data point",
      "previous": "Previous point",
      "next": "Next point",
      "graphNote": "Select a plotted point or use the point slider. All displayed trials share axes and units. Changing views keeps your evidence. Completed tests are included by default.",
      "graphAlt": "Interactive time-series graph; use trial and point controls or the data table.",
      "dataTable": "Accessible sample data",
      "emptyGraph": "Run a test to collect evidence.",
      "trial": "Trial",
      "notebook": "Your design evidence",
      "download": "Export evidence CSV",
      "clear": "Clear evidence",
      "restore": "Restore design",
      "notebookHelp": "Each completed test saves its design, shaking settings, and graph. Reset keeps your writing and evidence. Download before closing; this session is not saved after reload.",
      "noTrials": "No completed tests yet.",
      "challengePass": "Challenge passed · all 3 tests meet the criteria.",
      "challengeFail": "Keep designing · inspect each test and revise.",
      "challengePending": "Complete a supported 3+ story design, then run the three-test suite.",
      "explainTitle": "What does your evidence support?",
      "explainHelp": "Compare two trials under identical shaking. Which components helped? Explain using [[drift|drift]], [[damping|damping]], or [[resonance|resonance]]. Which useful features could you combine?",
      "explanation": "My claim, evidence, and reasoning",
      "checksHeading": "Test your explanation",
      "notes": "About the model, sources & standards",
      "origin": "Earthquakes release stored energy as rock slips along a fault. Waves carry energy away. This lab investigates the response of buildings to horizontal ground motion; it does not model plate movement or predict earthquake timing.",
      "limitations": "Simplified floor-mass model with elastic–plastic story springs and viscous damping. Components set illustrative properties, not real building specifications. The two bays reduce to one lateral spring per story. No torsion, vertical shaking, liquefaction, individual-member failure, or certified collapse prediction. Beyond 8% story drift or 60 cm isolation travel, the simulation stops. Major model damage is flagged above 2.5 times the story yield drift after yielding. The earthquake magnitude-to-motion mapping is a teaching approximation, not an empirical hazard equation.",
      "standardsNote": "TEKS 6–8.1G and 6–8.2B/C/D: use and critique models, analyze data, evaluate designs. TEKS 7.10B: earthquake context only. NGSS MS-ETS1-3: compare designs and combine useful features. MS-ESS3-2: mitigation connection only; geographic forecasting is outside this lab.",
      "spanishReview": "Spanish interface and vocabulary are drafts pending review by a native-speaking science educator. Teacher pack is English.",
      "footer": "Earthquakes & Structures 1.0.0 · Learn. Grow. Achieve! · © Sciesmic 2026",
      "pga": "Site peak ground acceleration",
      "activeDuration": "Active shaking",
      "costLabel": "Cost",
      "framePresent": "Frame present",
      "missing": "Missing",
      "testA": "Rock · Mw 6.0 · 30 km",
      "testB": "Soft soil · Mw 6.5 · 30 km",
      "testC": "Soft soil · Mw 7.0 · 20 km",
      "criteria": "3+ stories · ≤90 points · ≤1.5% drift · elastic in all tests",
      "ground-motion-label": "GROUND INPUT",
      "bracingLabel": "Bracing",
      "storyCount": "stories",
      "skip": "Skip to investigation",
      "graphDrift": "Maximum absolute story drift at this time (%)"
    },
    "es": {
      "title": "Sismos y estructuras",
      "eyebrow": "CIENCIAS DE LA TIERRA E INGENIERÍA · GRADOS 6–8",
      "h1": "Construye. Pon a prueba.\nMejora tu estructura.",
      "intro": "¿Por qué los edificios responden de forma diferente al mismo sismo? Arma una estructura, investiga su movimiento y usa evidencia para mejorar tu diseño.",
      "gradeNote": "Grados 6–8 · Modelo educativo original · Español en borrador",
      "step1": "01 / PREDICE",
      "step2": "02 / INVESTIGA",
      "step3": "03 / EXPLICA",
      "step4": "04 / COMPRUEBA TUS IDEAS",
      "predictTitle": "¿Qué ayudará a tu edificio?",
      "predictHelp": "Predice cómo los [[bracing|contravientos]] o el [[base-isolation|aislamiento de base]] cambiarán el movimiento. ¿Qué mantendrás igual para una comparación justa?",
      "prediction": "Mi predicción y razón",
      "workspace": "Tu zona de pruebas sísmicas",
      "explore": "Explora el movimiento",
      "retrofit": "Prueba de refuerzo",
      "challenge": "Construye y prueba",
      "exploreHint": "Compara una casa, escuela o torre. Cambia la [[magnitude|magnitud]] y mantén el sitio y el diseño iguales para investigar una variable.",
      "retrofitHint": "Registra una referencia. Agrega un componente, repite el mismo movimiento y compara la [[drift|deriva de entrepiso]] y la aceleración del techo.",
      "challengeHint": "Construye al menos 3 pisos con un máximo de 90 puntos de diseño. Supera las tres pruebas: sin deformación permanente, [[drift|deriva]] máxima ≤ 1.5% y sin exceder el límite del modelo. Combina características útiles de distintos diseños.",
      "structure": "Estructura inicial",
      "house": "Casa · 1 piso",
      "school": "Escuela / oficina · 3 pisos",
      "tower": "Torre · 6 pisos",
      "load": "Cargar estructura",
      "blank": "Comenzar vacío",
      "stories": "Número de pisos",
      "material": "Material del marco",
      "timber": "Madera",
      "steel": "Acero",
      "concrete": "Concreto reforzado",
      "foundation": "Cimentación",
      "fixed": "Base fija",
      "isolated": "Base aislada",
      "components": "Bandeja de componentes",
      "frame": "Marco · viga y columnas",
      "light": "Losa ligera",
      "heavy": "Losa pesada",
      "diagonal": "Contraviento diagonal",
      "xbrace": "Contravientos en X",
      "connection": "Conexiones reforzadas",
      "damper": "Amortiguador",
      "erase": "Vaciar crujía",
      "builderHelp": "Selecciona un componente y después una crujía del edificio. Selecciónalo otra vez para quitarlo. Cada marco incluye una viga y dos columnas; cada crujía necesita un marco y una losa.",
      "builderTerms": "La [[stiffness|rigidez]] cambia la resistencia a la deformación; el [[damping|amortiguamiento]] reduce la vibración. Cada losa agrega [[mass|masa]]. Las conexiones reforzadas aumentan la capacidad de fluencia del modelo.",
      "undo": "Deshacer",
      "designPoints": "Puntos de diseño",
      "budgetNote": "Presupuesto ficticio de clase; no son precios de construcción.",
      "assemblyOK": "Estructura conectada · lista para probar",
      "assemblyBad": "Completa cada crujía con un marco y una losa antes de probar.",
      "earthquake": "Escenario sísmico",
      "table": "Mesa vibratoria controlada",
      "source": "Fuente del movimiento",
      "magnitude": "Magnitud de momento Mw",
      "distance": "Distancia a la fuente (km)",
      "soil": "Suelo del sitio",
      "rock": "Roca",
      "soft": "Suelo blando",
      "amplitude": "Aceleración máxima (g)",
      "frequency": "Frecuencia (Hz)",
      "duration": "Duración del movimiento (s)",
      "scenarioHelp": "La [[magnitude|magnitud]] describe el tamaño del sismo. La distancia y el suelo afectan el [[ground-motion|movimiento del suelo]] en el sitio. Son escenarios educativos sintéticos, no pronósticos.",
      "tableHelp": "Cambia la [[frequency|frecuencia]] para buscar [[resonance|resonancia]]. Mantén fijas la amplitud y la duración.",
      "test": "Probar estructura",
      "pause": "Pausar",
      "resume": "Continuar",
      "step": "Avanzar 0.5 s",
      "reset": "Reiniciar reproducción",
      "suite": "Ejecutar 3 pruebas del reto",
      "newSeed": "Nuevo registro sísmico",
      "seed": "Semilla del registro",
      "share": "Copiar enlace del diseño",
      "copied": "Enlace del diseño copiado.",
      "copyFallback": "Copia esta dirección:",
      "ready": "Listo · construye, predice y prueba.",
      "running": "Prueba en curso",
      "paused": "Reproducción en pausa",
      "finished": "Prueba terminada · evidencia registrada",
      "limit": "Se alcanzó el límite del modelo · prueba detenida. Esto no predice un colapso real.",
      "timeline": "Revisar el movimiento observado (s)",
      "sceneLabel": "Respuesta animada del edificio; la evidencia por piso aparece abajo.",
      "sceneNote": "El movimiento lateral está ampliado ×35. La altura de entrepiso es de 3 m en el modelo. El movimiento es horizontal; la cimentación sigue al suelo salvo que esté aislada.",
      "liveReadings": "Lecturas actuales",
      "time": "Tiempo (s)",
      "roof": "Desplazamiento del techo respecto al suelo (cm)",
      "roofAccel": "Aceleración del techo (m/s²)",
      "ground": "Aceleración del suelo (m/s²)",
      "peakDrift": "Deriva máxima de entrepiso (%)",
      "peakRoof": "Desplazamiento máximo del techo (cm)",
      "peakAccel": "Aceleración máxima del techo (m/s²)",
      "story": "Piso",
      "bay": "Crujía",
      "floor": "Losa",
      "none": "Ninguno",
      "elastic": "Elástico",
      "yielded": "Con fluencia",
      "major": "Daño mayor en el modelo",
      "state": "Estado del modelo",
      "drift": "Deriva (%)",
      "yieldNote": "La fluencia indica deformación permanente en este modelo. Los colores por piso resumen la demanda calculada; no son esfuerzos de cada elemento dibujado.",
      "graphTitle": "Examina el movimiento",
      "enlarge": "Ampliar gráfica",
      "closeGraph": "Cerrar gráfica",
      "graphView": "Variable de evidencia",
      "compareTrials": "Comparar ensayos registrados",
      "currentOnly": "Solo prueba actual",
      "view": "Vista de gráfica",
      "series": "Seleccionar ensayo",
      "point": "Examinar punto de datos",
      "previous": "Punto anterior",
      "next": "Punto siguiente",
      "graphNote": "Selecciona un punto de la gráfica o usa el deslizador. Todos los ensayos mostrados comparten ejes y unidades. Cambiar de vista conserva la evidencia. Las pruebas terminadas se incluyen de forma predeterminada.",
      "graphAlt": "Gráfica interactiva de series de tiempo; usa los controles de ensayo y punto o la tabla de datos.",
      "dataTable": "Tabla accesible de datos",
      "emptyGraph": "Ejecuta una prueba para reunir evidencia.",
      "trial": "Ensayo",
      "notebook": "Evidencia de tus diseños",
      "download": "Exportar evidencia CSV",
      "clear": "Borrar evidencia",
      "restore": "Restaurar diseño",
      "notebookHelp": "Cada prueba terminada guarda el diseño, las condiciones sísmicas y la gráfica. Reiniciar conserva tus textos y evidencia. Descarga antes de cerrar; la sesión no se guarda al recargar.",
      "noTrials": "Aún no hay pruebas terminadas.",
      "challengePass": "Reto superado · las 3 pruebas cumplen los criterios.",
      "challengeFail": "Sigue diseñando · examina cada prueba y mejora el diseño.",
      "challengePending": "Completa un diseño conectado de al menos 3 pisos y ejecuta las tres pruebas.",
      "explainTitle": "¿Qué apoya tu evidencia?",
      "explainHelp": "Compara dos ensayos con movimiento idéntico. ¿Qué componentes ayudaron? Explica usando [[drift|deriva]], [[damping|amortiguamiento]] o [[resonance|resonancia]]. ¿Qué características útiles podrías combinar?",
      "explanation": "Mi afirmación, evidencia y razonamiento",
      "checksHeading": "Pon a prueba tu explicación",
      "notes": "Acerca del modelo, fuentes y estándares",
      "origin": "Los sismos liberan energía almacenada cuando la roca se desliza a lo largo de una falla. Las ondas transportan energía. Este laboratorio investiga la respuesta de edificios al movimiento horizontal del suelo; no simula el movimiento de placas ni predice cuándo ocurrirá un sismo.",
      "limitations": "Modelo simplificado de masas por piso, resortes de entrepiso elastoplásticos y amortiguamiento viscoso. Los componentes tienen propiedades ilustrativas, no especificaciones reales. Las dos crujías se reducen a un resorte lateral por piso. No representa torsión, movimiento vertical, licuefacción, falla de elementos individuales ni predicción certificada de colapso. Se detiene al superar 8% de deriva o 60 cm de recorrido de aislamiento. Marca daño mayor por encima de 2.5 veces la deriva de fluencia después de que ocurre fluencia. La relación entre magnitud y movimiento es una aproximación educativa, no una ecuación empírica de amenaza sísmica.",
      "standardsNote": "TEKS 6–8.1G y 6–8.2B/C/D: usar y evaluar modelos, analizar datos y evaluar diseños. TEKS 7.10B: solo contexto sísmico. NGSS MS-ETS1-3: comparar diseños y combinar características útiles. MS-ESS3-2: conexión parcial con mitigación; no cubre pronósticos geográficos.",
      "spanishReview": "La interfaz y el vocabulario en español son borradores pendientes de revisión por un docente de ciencias hispanohablante nativo. El paquete docente está en inglés.",
      "footer": "Sismos y estructuras 1.0.0 · Learn. Grow. Achieve! · © Sciesmic 2026",
      "pga": "Aceleración máxima del suelo en el sitio",
      "activeDuration": "Movimiento activo",
      "costLabel": "Costo",
      "framePresent": "Marco colocado",
      "missing": "Falta",
      "testA": "Roca · Mw 6.0 · 30 km",
      "testB": "Suelo blando · Mw 6.5 · 30 km",
      "testC": "Suelo blando · Mw 7.0 · 20 km",
      "criteria": "3+ pisos · ≤90 puntos · ≤1.5% deriva · elástico en todas las pruebas",
      "ground-motion-label": "ENTRADA DEL SUELO",
      "bracingLabel": "Contravientos",
      "storyCount": "pisos",
      "skip": "Ir a la investigación",
      "graphDrift": "Deriva absoluta máxima entre pisos en este instante (%)"
    }
  },
  "vocab": [
    {
      "id": "magnitude",
      "en": {
        "term": "Magnitude",
        "def": "A measure of an earthquake’s size at its source. A larger value does not specify the shaking at every site."
      },
      "es": {
        "term": "Magnitud",
        "def": "Medida del tamaño de un sismo en su fuente. Un valor mayor no determina el movimiento en todos los sitios."
      }
    },
    {
      "id": "ground-motion",
      "en": {
        "term": "Ground motion",
        "def": "Movement of the ground during an earthquake; here the input is horizontal acceleration."
      },
      "es": {
        "term": "Movimiento del suelo",
        "def": "Movimiento del terreno durante un sismo; aquí la entrada es la aceleración horizontal."
      }
    },
    {
      "id": "frequency",
      "en": {
        "term": "Frequency",
        "def": "Number of complete vibration cycles each second, measured in hertz (Hz)."
      },
      "es": {
        "term": "Frecuencia",
        "def": "Número de ciclos completos de vibración por segundo, medido en hertz (Hz)."
      }
    },
    {
      "id": "resonance",
      "en": {
        "term": "Resonance",
        "def": "A larger vibration response when repeated forcing is close to a structure’s natural frequency. Damping limits the response."
      },
      "es": {
        "term": "Resonancia",
        "def": "Aumento de la vibración cuando la frecuencia de la fuerza repetida se acerca a la frecuencia natural de una estructura. El amortiguamiento limita la respuesta."
      }
    },
    {
      "id": "mass",
      "en": {
        "term": "Mass",
        "def": "A measure of inertia: resistance to a change in velocity. More floor mass changes a structure’s vibration."
      },
      "es": {
        "term": "Masa",
        "def": "Medida de la inercia: resistencia a un cambio de velocidad. Una mayor masa por piso cambia la vibración de una estructura."
      }
    },
    {
      "id": "stiffness",
      "en": {
        "term": "Stiffness",
        "def": "Resistance to deformation under a force. Greater stiffness changes both sway and natural frequency."
      },
      "es": {
        "term": "Rigidez",
        "def": "Resistencia a la deformación bajo una fuerza. Una mayor rigidez cambia la oscilación y la frecuencia natural."
      }
    },
    {
      "id": "bracing",
      "en": {
        "term": "Bracing",
        "def": "Diagonal members that help a frame resist sideways deformation."
      },
      "es": {
        "term": "Contravientos",
        "def": "Elementos diagonales que ayudan a un marco a resistir la deformación lateral."
      }
    },
    {
      "id": "damping",
      "en": {
        "term": "Damping",
        "def": "Dissipation of mechanical vibration energy, which reduces continued oscillation."
      },
      "es": {
        "term": "Amortiguamiento",
        "def": "Disipación de energía mecánica de vibración que reduce la oscilación continua."
      }
    },
    {
      "id": "base-isolation",
      "en": {
        "term": "Base isolation",
        "def": "A flexible connection between a building and its foundation that changes how ground motion reaches the building."
      },
      "es": {
        "term": "Aislamiento de base",
        "def": "Conexión flexible entre un edificio y su cimentación que cambia cómo el movimiento del suelo llega al edificio."
      }
    },
    {
      "id": "drift",
      "en": {
        "term": "Story drift",
        "def": "Sideways displacement of one floor relative to the floor below, divided by story height; often expressed as a percent."
      },
      "es": {
        "term": "Deriva de entrepiso",
        "def": "Desplazamiento lateral de un piso respecto al inferior, dividido entre la altura de entrepiso; suele expresarse como porcentaje."
      }
    }
  ],
  "checks": [
    {
      "id": "magnitude",
      "answer": "B",
      "standard": "MS-ESS3-2 · partial",
      "en": {
        "prompt": "Two sites experience the same earthquake. Must their ground motion be identical?",
        "options": [
          "Yes, because the magnitude is the same.",
          "No; distance and local ground also matter.",
          "Yes, if both buildings have three stories.",
          "No; each site changes the source magnitude."
        ],
        "feedback": {
          "A": "Magnitude describes the source, not identical shaking everywhere.",
          "B": "Distance and local ground affect site motion even for the same event.",
          "C": "Building height changes structural response, not the site’s input motion.",
          "D": "The earthquake has one source magnitude; local shaking varies."
        }
      },
      "es": {
        "prompt": "Dos sitios sienten el mismo sismo. ¿Su movimiento debe ser idéntico?",
        "options": [
          "Sí, porque la magnitud es igual.",
          "No; también importan la distancia y el suelo.",
          "Sí, si ambos edificios tienen tres pisos.",
          "No; cada sitio cambia la magnitud de la fuente."
        ],
        "feedback": {
          "A": "La magnitud describe la fuente, no movimiento idéntico en todos lados.",
          "B": "La distancia y el suelo afectan el movimiento local del mismo evento.",
          "C": "La altura cambia la respuesta del edificio, no la entrada del suelo.",
          "D": "El sismo tiene una magnitud en su fuente; el movimiento local varía."
        }
      }
    },
    {
      "id": "replay",
      "answer": "D",
      "standard": "TEKS 6–8.2B",
      "en": {
        "prompt": "You reset an unchanged design and repeat the same seed and settings. What should happen?",
        "options": [
          "Damage should randomly increase.",
          "The magnitude should decrease.",
          "The data should be slightly different every time.",
          "The calculated motion should repeat."
        ],
        "feedback": {
          "A": "Each reset starts with an undamaged model, not accumulated damage.",
          "B": "Reset does not change source magnitude.",
          "C": "The model has no added measurement noise; identical inputs repeat.",
          "D": "Same design, seed, and settings reproduce the same calculated results."
        }
      },
      "es": {
        "prompt": "Reinicias el mismo diseño y repites semilla y condiciones. ¿Qué debe pasar?",
        "options": [
          "El daño aumenta al azar.",
          "La magnitud disminuye.",
          "Los datos cambian un poco cada vez.",
          "El movimiento calculado se repite."
        ],
        "feedback": {
          "A": "Cada reinicio parte de un modelo sin daño acumulado.",
          "B": "Reiniciar no cambia la magnitud.",
          "C": "El modelo no agrega ruido de medición; las entradas iguales se repiten.",
          "D": "El mismo diseño, semilla y condiciones reproducen los resultados."
        }
      }
    },
    {
      "id": "drift-math",
      "answer": "A",
      "standard": "TEKS 6–8.2B",
      "en": {
        "prompt": "A 3 m story moves 0.03 m relative to the floor below. What is its drift?",
        "options": [
          "1%",
          "0.01%",
          "10%",
          "3%"
        ],
        "feedback": {
          "A": "0.03 ÷ 3 × 100 = 1%.",
          "B": "0.01 is the ratio; multiply by 100 to express percent.",
          "C": "10% of 3 m would be 0.3 m.",
          "D": "The story height is not the drift percentage."
        }
      },
      "es": {
        "prompt": "Un entrepiso de 3 m se desplaza 0.03 m respecto al inferior. ¿Cuál es su deriva?",
        "options": [
          "1%",
          "0.01%",
          "10%",
          "3%"
        ],
        "feedback": {
          "A": "0.03 ÷ 3 × 100 = 1%.",
          "B": "0.01 es la razón; multiplícala por 100 para obtener porcentaje.",
          "C": "10% de 3 m sería 0.3 m.",
          "D": "La altura no es el porcentaje de deriva."
        }
      }
    },
    {
      "id": "null",
      "answer": "C",
      "standard": "TEKS 6–8.1G",
      "en": {
        "prompt": "An undamaged model starts at rest. Shake-table amplitude is 0 g. What happens?",
        "options": [
          "Tall buildings vibrate by themselves.",
          "Braces create shaking.",
          "The model stays at rest.",
          "Isolation adds energy."
        ],
        "feedback": {
          "A": "Height alone supplies no energy to start motion.",
          "B": "Braces resist deformation; they do not generate input energy.",
          "C": "With zero input and no initial motion, displacement and damage stay zero.",
          "D": "Isolation changes motion transfer; it does not create energy."
        }
      },
      "es": {
        "prompt": "Un modelo sin daño parte del reposo y la amplitud es 0 g. ¿Qué sucede?",
        "options": [
          "Los edificios altos vibran solos.",
          "Los contravientos generan movimiento.",
          "El modelo permanece en reposo.",
          "El aislamiento agrega energía."
        ],
        "feedback": {
          "A": "La altura por sí sola no aporta energía para iniciar movimiento.",
          "B": "Los contravientos resisten deformación; no generan energía de entrada.",
          "C": "Sin entrada ni movimiento inicial, el desplazamiento y el daño son cero.",
          "D": "El aislamiento cambia la transferencia del movimiento; no crea energía."
        }
      }
    },
    {
      "id": "fair-test",
      "answer": "B",
      "standard": "MS-ETS1-3",
      "en": {
        "prompt": "How can you test whether an added damper improves your design?",
        "options": [
          "Change magnitude, height, and damper together.",
          "Keep the design and shaking fixed except for the damper.",
          "Compare unrelated seeds and ignore the settings.",
          "Choose whichever animation looks calmer."
        ],
        "feedback": {
          "A": "Several changed variables prevent identifying the damper’s effect.",
          "B": "Changing only the damper lets you compare drift and acceleration fairly.",
          "C": "Different input records can explain differences unrelated to the damper.",
          "D": "Use measured evidence and criteria, not appearance alone."
        }
      },
      "es": {
        "prompt": "¿Cómo pruebas si agregar un amortiguador mejora tu diseño?",
        "options": [
          "Cambia magnitud, altura y amortiguador juntos.",
          "Mantén iguales diseño y movimiento salvo el amortiguador.",
          "Compara semillas distintas e ignora las condiciones.",
          "Elige la animación que parezca más tranquila."
        ],
        "feedback": {
          "A": "Cambiar varias variables impide identificar el efecto del amortiguador.",
          "B": "Cambiar solo el amortiguador permite comparar deriva y aceleración justamente.",
          "C": "Entradas distintas pueden explicar diferencias ajenas al amortiguador.",
          "D": "Usa evidencia y criterios, no solo la apariencia."
        }
      }
    }
  ]
};
