export const content = {
  "id": "acids-bases",
  "version": "1.0.1",
  "teacherPackUrl": "https://sciesmic.com/a/members",
  "standards": [
    {
      "code": "TEKS Chem. 12D/E · partial",
      "en": "High-school extension: water-forming acid–base reaction and pH calculations; partial coverage",
      "es": "Extensión de preparatoria: reacción ácido-base y cálculos de pH; cobertura parcial",
      "url": "https://tea.texas.gov/academics/instructional-materials/review-and-adoption-process/breakout-documents/chemistry-breakouts.pdf"
    },
    {
      "code": "MS-PS1-2 · connection",
      "en": "Data-analysis connection only; pH is outside the assessed property list",
      "es": "Conexión con el análisis de datos; el pH queda fuera de las propiedades evaluadas",
      "url": "https://www.nextgenscience.org/pe/ms-ps1-2-matter-and-its-interactions"
    }
  ],
  "strings": {
    "en": {
      "title": "Acids & Bases · pH Lab",
      "eyebrow": "CHEMISTRY / GRADES 6–8 + HIGH SCHOOL EXTENSIONS",
      "h1": "A small change.\nA different pH.",
      "lede": "Test familiar liquids. Add water. Balance an [[acid|acid]] and a [[base|base]]. What does the [[ph|pH]] reading reveal?",
      "step1": "01 / PREDICT",
      "step2": "02 / INVESTIGATE",
      "step3": "03 / EXPLAIN",
      "step4": "04 / CHECK YOUR THINKING",
      "predictPrompt": "What will happen to pH when you change the solution?",
      "prediction": "My prediction and reason",
      "predictHelp": "Choose a mode, predict a change, then test one variable. Your writing stays when you switch modes or languages.",
      "test": "Test substances",
      "dilute": "Dilute a solution",
      "neutralize": "Neutralize",
      "bench": "The testing bench",
      "controls": "Make your investigation",
      "sample": "Choose a substance",
      "tool": "Measurement tool",
      "probe": "Digital probe",
      "strip": "Indicator strip",
      "indicator": "Universal indicator",
      "read": "Measure pH",
      "notMeasured": "Press Measure pH to reveal the results.",
      "measured": "Measurement complete",
      "acidic": "Acidic",
      "neutral": "Neutral",
      "basic": "Basic",
      "moreAcid": "More acidic",
      "moreBase": "More basic",
      "phLabel": "pH / no units",
      "volume": "Total volume (mL)",
      "solution": "Starting solution",
      "acid": "0.010 M HCl",
      "base": "0.010 M NaOH",
      "neutralSolution": "Pure water",
      "waterVolume": "Water added (mL)",
      "baseVolume": "0.010 M NaOH added (mL)",
      "addWater": "Add 20 mL water",
      "addBase": "Add 5 mL base",
      "fineBase": "Add 0.1 mL base",
      "run": "Add base automatically",
      "pause": "Pause addition",
      "reset": "Reset this trial",
      "newTrial": "Start comparison trial",
      "record": "Record observation",
      "download": "Export inquiry CSV",
      "exported": "Inquiry CSV downloaded.",
      "recorded": "Observation saved.",
      "trial": "Trial",
      "compare": "Compare recorded trials",
      "allTrials": "All trials",
      "currentTrial": "Current trial",
      "graph": "pH evidence",
      "enlarge": "Enlarge graph",
      "close": "Close graph",
      "point": "Inspect a recorded point",
      "noPoints": "Record an observation to begin.",
      "pointRead": "Trial {trial} · {mode} · {sample} · added {added} mL · total {volume} mL · pH {ph} · {tool}",
      "graphHelp": "X: added water or base (mL). Y: measured pH (no units). All trials use the same axes. Different substances at 0 mL can overlap; select each point below.",
      "graphTitle": "Recorded pH versus added volume",
      "tableTitle": "Your lab notebook",
      "thTrial": "Trial / mode",
      "thSample": "Solution",
      "thAdded": "Added (mL)",
      "thVolume": "Total (mL)",
      "thTool": "Tool",
      "thPH": "Measured pH",
      "thNote": "Observation",
      "note": "Observation note (optional)",
      "noteHint": "Describe what changed and what stayed the same.",
      "explain": "Use two recorded readings to support a claim. Explain the change using hydronium and hydroxide. What does the model leave out?",
      "conclusion": "My evidence and explanation",
      "ions": "Inside the solution",
      "ionNote": "[[hydronium|Hydronium (H₃O⁺)]] and [[hydroxide|hydroxide (OH⁻)]] are present even at pH 7. Counts below are illustrative, never a literal sample or concentration ratio.",
      "concentration": "[[concentration|Concentration]] in mol/L at 25 °C",
      "ionLegend": "H₃O⁺ / hydronium · OH⁻ / hydroxide · H₂O / water",
      "spectators": "Na⁺ and Cl⁻ remain dissolved. H₃O⁺ + OH⁻ → 2H₂O.",
      "diluteHint": "Follow [[dilution|dilution]]: add pure water to 20 mL of a defined solution. The amount of solute stays constant while concentration decreases.",
      "testHint": "Use a probe or [[indicator|indicator]] to compare representative household samples. Product pH varies; these are reference values, not a way to identify unknown chemicals.",
      "neutralizeHint": "Investigate [[neutralization|neutralization]]: start with 60 mL of 0.010 M HCl. Add 0.010 M NaOH. Equal reacting amounts occur at 60 mL of base, not equal pH readings.",
      "phHint": "The [[ph|pH scale]] is [[logarithmic|logarithmic]]: one pH step means a tenfold change in H₃O⁺ concentration.",
      "readingHint": "Probe: nearest 0.01 pH. Strips/indicator: nearest whole pH. A colored strip or indicator represents a measurement bin; the live scale shows model pH.",
      "modelNotesBtn": "Model & teaching notes",
      "modelNotes": "Ideal, fully mixed water solutions at 25 °C; Kw = 1 × 10⁻¹⁴. For defined HCl/NaOH solutions, [H₃O⁺] − [OH⁻] = excess acid concentration and [H₃O⁺][OH⁻] = Kw. Dilution approaches pH 7 without crossing it. The model does not simulate buffers, weak-acid equilibria, temperature changes or reaction heat. Household samples cannot be mixed here because their starting pH alone does not determine a mixture’s pH. Equal acid/base volumes are neutral only for this pair at equal molarity. Scene and particles are illustrations; the numeric volume and concentration readouts are authoritative. Readings are rounded, with no random instrument noise. The same actions give the same results. The 0–14 display is this lab’s range, not a universal limit. Colors appear only after adding indicator; native liquid colors do not tell you pH.",
      "safety": "Virtual samples only. Never taste chemicals or mix household cleaners. For a teacher-led classroom extension, compare water, vinegar and baking-soda solution separately with indicator paper.",
      "alignment": "Grades 6–8: qualitative properties, evidence and particle explanations. High-school extension: TEKS Chemistry 12D/E (reaction products and pH calculations), partial support. NGSS MS-PS1-2: connection to analyzing data and chemical changes. pH is outside its assessed property list, so this lab does not fully address the performance expectation. Assessment classifications are not claimed.",
      "review": "Spanish is a draft pending review by a native-speaking science educator.",
      "footer": "Sciesmic Labs · Ideal chemistry, real questions. Version 1.0.1 · No account or external libraries required.",
      "lemon_juice": "Lemon juice",
      "vinegar": "Vinegar",
      "cola": "Cola",
      "coffee": "Coffee",
      "milk": "Milk",
      "water": "Pure water",
      "baking_soda": "Baking-soda solution",
      "hand_soap": "Hand soap",
      "ammonia_cleaner": "Ammonia cleaner",
      "drain_cleaner": "Drain cleaner",
      "seedLabel": "Illustration seed",
      "share": "Copy replay link",
      "copied": "Replay link copied.",
      "replayHint": "The link replays controls and illustration layout; export the notebook to keep your writing and recorded observations.",
      "autoDone": "Automatic addition complete.",
      "limit": "Maximum volume reached.",
      "observationRequired": "Measure pH before recording.",
      "compareHelp": "Use a new trial to compare another solution. Reset clears the current trial’s settings, but keeps recorded observations and writing.",
      "cardsTitle": "Acids & Bases · Vocabulary flashcards"
    },
    "es": {
      "title": "Ácidos y bases · Laboratorio de pH",
      "eyebrow": "QUÍMICA / GRADOS 6–8 + EXTENSIONES DE PREPARATORIA",
      "h1": "Un pequeño cambio.\nUn pH diferente.",
      "lede": "Prueba líquidos conocidos. Agrega agua. Equilibra un [[acid|ácido]] y una [[base|base]]. ¿Qué revela la lectura de [[ph|pH]]?",
      "step1": "01 / PREDECIR",
      "step2": "02 / INVESTIGAR",
      "step3": "03 / EXPLICAR",
      "step4": "04 / COMPROBAR",
      "predictPrompt": "¿Qué pasará con el pH al cambiar la solución?",
      "prediction": "Mi predicción y su razón",
      "predictHelp": "Elige un modo, predice un cambio y prueba una variable. Tu texto se conserva al cambiar de modo o idioma.",
      "test": "Probar sustancias",
      "dilute": "Diluir una solución",
      "neutralize": "Neutralizar",
      "bench": "La mesa de pruebas",
      "controls": "Diseña tu investigación",
      "sample": "Elige una sustancia",
      "tool": "Instrumento de medición",
      "probe": "Sonda digital",
      "strip": "Tira indicadora",
      "indicator": "Indicador universal",
      "read": "Medir pH",
      "notMeasured": "Presiona Medir pH para revelar los resultados.",
      "measured": "Medición completa",
      "acidic": "Ácido",
      "neutral": "Neutro",
      "basic": "Básico",
      "moreAcid": "Más ácido",
      "moreBase": "Más básico",
      "phLabel": "pH / sin unidades",
      "volume": "Volumen total (mL)",
      "solution": "Solución inicial",
      "acid": "HCl 0.010 M",
      "base": "NaOH 0.010 M",
      "neutralSolution": "Agua pura",
      "waterVolume": "Agua agregada (mL)",
      "baseVolume": "NaOH 0.010 M agregado (mL)",
      "addWater": "Agregar 20 mL de agua",
      "addBase": "Agregar 5 mL de base",
      "fineBase": "Agregar 0.1 mL de base",
      "run": "Agregar base automáticamente",
      "pause": "Pausar adición",
      "reset": "Reiniciar este ensayo",
      "newTrial": "Iniciar ensayo de comparación",
      "record": "Registrar observación",
      "download": "Exportar investigación en CSV",
      "exported": "Se descargó el CSV de la investigación.",
      "recorded": "Observación guardada.",
      "trial": "Ensayo",
      "compare": "Comparar ensayos registrados",
      "allTrials": "Todos los ensayos",
      "currentTrial": "Ensayo actual",
      "graph": "Evidencia de pH",
      "enlarge": "Ampliar gráfica",
      "close": "Cerrar gráfica",
      "point": "Inspeccionar un punto registrado",
      "noPoints": "Registra una observación para comenzar.",
      "pointRead": "Ensayo {trial} · {mode} · {sample} · agregado {added} mL · total {volume} mL · pH {ph} · {tool}",
      "graphHelp": "X: agua o base agregada (mL). Y: pH medido (sin unidades). Todos los ensayos usan los mismos ejes. Las sustancias a 0 mL pueden superponerse; selecciona cada punto abajo.",
      "graphTitle": "pH registrado frente al volumen agregado",
      "tableTitle": "Tu cuaderno de laboratorio",
      "thTrial": "Ensayo / modo",
      "thSample": "Solución",
      "thAdded": "Agregado (mL)",
      "thVolume": "Total (mL)",
      "thTool": "Instrumento",
      "thPH": "pH medido",
      "thNote": "Observación",
      "note": "Nota de observación (opcional)",
      "noteHint": "Describe qué cambió y qué se mantuvo igual.",
      "explain": "Usa dos lecturas registradas para apoyar una afirmación. Explica el cambio usando hidronio e hidróxido. ¿Qué deja fuera el modelo?",
      "conclusion": "Mi evidencia y explicación",
      "ions": "Dentro de la solución",
      "ionNote": "El [[hydronium|hidronio (H₃O⁺)]] y el [[hydroxide|hidróxido (OH⁻)]] están presentes incluso a pH 7. Las cantidades ilustradas no representan una muestra real ni la proporción de concentraciones.",
      "concentration": "[[concentration|Concentración]] en mol/L a 25 °C",
      "ionLegend": "H₃O⁺ / hidronio · OH⁻ / hidróxido · H₂O / agua",
      "spectators": "Na⁺ y Cl⁻ permanecen disueltos. H₃O⁺ + OH⁻ → 2H₂O.",
      "diluteHint": "Observa la [[dilution|dilución]]: agrega agua pura a 20 mL de una solución definida. La cantidad de soluto se mantiene mientras disminuye la concentración.",
      "testHint": "Usa una sonda o un [[indicator|indicador]] para comparar muestras caseras representativas. El pH de los productos varía; estos valores de referencia no identifican sustancias desconocidas.",
      "neutralizeHint": "Investiga la [[neutralization|neutralización]]: empieza con 60 mL de HCl 0.010 M. Agrega NaOH 0.010 M. Las cantidades que reaccionan son iguales a los 60 mL de base, no cuando los valores iniciales de pH son iguales.",
      "phHint": "La [[ph|escala de pH]] es [[logarithmic|logarítmica]]: un paso equivale a un cambio de diez veces en la concentración de H₃O⁺.",
      "readingHint": "Sonda: al 0.01 de pH más cercano. Tiras/indicador: al pH entero más cercano. El color representa un intervalo de medición; la escala muestra el pH del modelo.",
      "modelNotesBtn": "Notas del modelo y la enseñanza",
      "modelNotes": "Soluciones acuosas ideales, completamente mezcladas, a 25 °C; Kw = 1 × 10⁻¹⁴. En HCl/NaOH definidos, [H₃O⁺] − [OH⁻] es la concentración de ácido en exceso y [H₃O⁺][OH⁻] = Kw. La dilución se acerca a pH 7 sin cruzarlo. No se simulan amortiguadores, equilibrios de ácidos débiles, cambios de temperatura ni calor de reacción. No se mezclan muestras caseras porque su pH inicial no determina el pH de la mezcla. Volúmenes iguales solo son neutros para este par con igual molaridad. La escena y las partículas son ilustraciones; los valores numéricos de volumen y concentración son los datos válidos. Las lecturas se redondean sin ruido aleatorio. Las mismas acciones dan los mismos resultados. El intervalo de 0–14 pertenece a este laboratorio; no es un límite universal. El color indicador aparece solo tras agregar indicador; el color natural no revela el pH.",
      "safety": "Solo muestras virtuales. Nunca pruebes sustancias ni mezcles limpiadores caseros. Como extensión dirigida por un docente, compara agua, vinagre y solución de bicarbonato por separado con papel indicador.",
      "alignment": "Grados 6–8: propiedades cualitativas, evidencia y explicaciones con partículas. Extensión de preparatoria: TEKS Química 12D/E (productos y cálculos de pH), apoyo parcial. NGSS MS-PS1-2: conexión con el análisis de datos y los cambios químicos. El pH queda fuera de su lista de propiedades evaluadas; este laboratorio no cubre toda la expectativa. No se afirman clasificaciones de evaluación.",
      "review": "El español es un borrador pendiente de revisión por un docente de ciencias hispanohablante nativo.",
      "footer": "Sciesmic Labs · Química ideal, preguntas reales. Versión 1.0.1 · Sin cuenta ni bibliotecas externas.",
      "lemon_juice": "Jugo de limón",
      "vinegar": "Vinagre",
      "cola": "Refresco de cola",
      "coffee": "Café",
      "milk": "Leche",
      "water": "Agua pura",
      "baking_soda": "Solución de bicarbonato",
      "hand_soap": "Jabón de manos",
      "ammonia_cleaner": "Limpiador con amoníaco",
      "drain_cleaner": "Destapacaños",
      "seedLabel": "Semilla de ilustración",
      "share": "Copiar enlace de repetición",
      "copied": "Enlace de repetición copiado.",
      "replayHint": "El enlace repite los controles y la distribución de partículas; exporta el cuaderno para conservar tus textos y observaciones.",
      "autoDone": "Adición automática terminada.",
      "limit": "Se alcanzó el volumen máximo.",
      "observationRequired": "Mide el pH antes de registrar.",
      "compareHelp": "Usa un ensayo nuevo para comparar otra solución. Reiniciar restablece los controles del ensayo actual, pero conserva las observaciones y tus textos.",
      "cardsTitle": "Ácidos y bases · Tarjetas de vocabulario"
    }
  },
  "vocab": [
    {
      "id": "acid",
      "en": {
        "term": "Acid",
        "def": "A substance that increases hydronium concentration in water."
      },
      "es": {
        "term": "Ácido",
        "def": "Sustancia que aumenta la concentración de hidronio en agua."
      }
    },
    {
      "id": "base",
      "en": {
        "term": "Base",
        "def": "A substance that accepts protons; in this lab’s aqueous solutions, it increases hydroxide relative to hydronium."
      },
      "es": {
        "term": "Base",
        "def": "Sustancia que acepta protones; en las soluciones acuosas del laboratorio, aumenta el hidróxido respecto al hidronio."
      }
    },
    {
      "id": "ph",
      "en": {
        "term": "pH",
        "def": "A logarithmic measure of acidity. In this ideal model, pH = −log₁₀[H₃O⁺], with concentration in mol/L."
      },
      "es": {
        "term": "pH",
        "def": "Medida logarítmica de acidez. En este modelo ideal, pH = −log₁₀[H₃O⁺], con concentración en mol/L."
      }
    },
    {
      "id": "indicator",
      "en": {
        "term": "Indicator",
        "def": "A chemical whose color depends on pH. Its color gives an approximate pH range."
      },
      "es": {
        "term": "Indicador",
        "def": "Sustancia cuyo color depende del pH. Su color indica un intervalo aproximado de pH."
      }
    },
    {
      "id": "dilution",
      "en": {
        "term": "Dilution",
        "def": "Adding solvent lowers solute concentration while keeping the amount of solute constant."
      },
      "es": {
        "term": "Dilución",
        "def": "Agregar disolvente disminuye la concentración y conserva la cantidad de soluto."
      }
    },
    {
      "id": "neutralization",
      "en": {
        "term": "Neutralization",
        "def": "An acid–base reaction. Here hydronium and hydroxide form water; extra acid or base determines the final pH."
      },
      "es": {
        "term": "Neutralización",
        "def": "Reacción entre ácido y base. Aquí el hidronio y el hidróxido forman agua; el exceso de ácido o base determina el pH final."
      }
    },
    {
      "id": "hydronium",
      "en": {
        "term": "Hydronium (H₃O⁺)",
        "def": "A water molecule with an added proton. More hydronium means lower pH in this model."
      },
      "es": {
        "term": "Hidronio (H₃O⁺)",
        "def": "Molécula de agua con un protón adicional. Más hidronio significa menor pH en este modelo."
      }
    },
    {
      "id": "hydroxide",
      "en": {
        "term": "Hydroxide (OH⁻)",
        "def": "An ion made of oxygen and hydrogen with a negative charge. Basic solutions have more hydroxide than hydronium."
      },
      "es": {
        "term": "Hidróxido (OH⁻)",
        "def": "Ion de oxígeno e hidrógeno con carga negativa. Las soluciones básicas tienen más hidróxido que hidronio."
      }
    },
    {
      "id": "concentration",
      "en": {
        "term": "Concentration",
        "def": "Amount of dissolved substance per volume of solution; this lab uses moles per liter (mol/L)."
      },
      "es": {
        "term": "Concentración",
        "def": "Cantidad de sustancia disuelta por volumen de solución; se expresa en moles por litro (mol/L)."
      }
    },
    {
      "id": "logarithmic",
      "en": {
        "term": "Logarithmic scale",
        "def": "A scale where equal steps mean equal multiplicative changes. One pH step corresponds to a factor of ten in hydronium concentration."
      },
      "es": {
        "term": "Escala logarítmica",
        "def": "Escala cuyos pasos iguales representan cambios multiplicativos iguales. Un paso de pH corresponde a un factor de diez en la concentración de hidronio."
      }
    }
  ],
  "checks": [
    {
      "id": "dilution",
      "answer": "B",
      "standard": "Model reasoning",
      "en": {
        "prompt": "After adding pure water to the defined HCl solution, pH…",
        "options": [
          "moves farther below 7.",
          "moves toward 7 without crossing.",
          "must become 14.",
          "is unchanged."
        ],
        "feedback": {
          "A": "Water reduces excess acid concentration, so pH rises.",
          "B": "Correct: dilution lowers concentration and approaches neutral water.",
          "C": "Adding water does not turn acid into a base.",
          "D": "The amount of solute stays constant, but its concentration changes."
        }
      },
      "es": {
        "prompt": "Al agregar agua pura al HCl definido, el pH…",
        "options": [
          "se aleja por debajo de 7.",
          "se acerca a 7 sin cruzarlo.",
          "debe llegar a 14.",
          "no cambia."
        ],
        "feedback": {
          "A": "El agua reduce la concentración de ácido en exceso; el pH sube.",
          "B": "Correcto: la dilución reduce la concentración y se acerca al agua neutra.",
          "C": "El agua no convierte un ácido en base.",
          "D": "La cantidad de soluto se conserva, pero cambia su concentración."
        }
      }
    },
    {
      "id": "neutral",
      "answer": "C",
      "standard": "Model reasoning",
      "en": {
        "prompt": "At pH 7 and 25 °C, which is true?",
        "options": [
          "There are no ions.",
          "There is only hydroxide.",
          "Hydronium and hydroxide concentrations are equal.",
          "The solution is always safe to drink."
        ],
        "feedback": {
          "A": "Water still contains hydronium and hydroxide.",
          "B": "Both ions are present even in neutral water.",
          "C": "Both are 1 × 10⁻⁷ mol/L in this ideal model.",
          "D": "pH alone does not establish safety."
        }
      },
      "es": {
        "prompt": "A pH 7 y 25 °C, ¿qué es cierto?",
        "options": [
          "No hay iones.",
          "Solo hay hidróxido.",
          "Las concentraciones de hidronio e hidróxido son iguales.",
          "Siempre es seguro beber la solución."
        ],
        "feedback": {
          "A": "El agua contiene hidronio e hidróxido.",
          "B": "Ambos iones están presentes en agua neutra.",
          "C": "Ambas son 1 × 10⁻⁷ mol/L en este modelo ideal.",
          "D": "El pH solo no determina la seguridad."
        }
      }
    },
    {
      "id": "tenfold",
      "answer": "A",
      "standard": "TEKS Chem. 12D/E · partial",
      "en": {
        "prompt": "A solution at pH 3 has how much hydronium compared with pH 4?",
        "options": [
          "10 times as much",
          "2 times as much",
          "The same amount per liter",
          "One tenth as much"
        ],
        "feedback": {
          "A": "The scale is logarithmic: a decrease of one means ten times the concentration.",
          "B": "A one-step pH change is a factor of ten, not two.",
          "C": "Different pH values mean different hydronium concentrations.",
          "D": "Lower pH means higher hydronium concentration."
        }
      },
      "es": {
        "prompt": "Una solución a pH 3 tiene ¿cuánto hidronio comparada con pH 4?",
        "options": [
          "10 veces más",
          "2 veces más",
          "La misma cantidad por litro",
          "La décima parte"
        ],
        "feedback": {
          "A": "La escala es logarítmica: bajar un paso multiplica por diez la concentración.",
          "B": "Un paso representa un factor de diez, no dos.",
          "C": "Distintos valores de pH indican distintas concentraciones de hidronio.",
          "D": "Menor pH significa mayor concentración de hidronio."
        }
      }
    },
    {
      "id": "mix",
      "answer": "D",
      "standard": "TEKS Chem. 12D/E · partial",
      "en": {
        "prompt": "Add 30 mL of 0.010 M NaOH to 60 mL of 0.010 M HCl. The solution is…",
        "options": [
          "neutral because any base neutralizes an acid.",
          "basic because a base was added.",
          "pH 7 because pH values average.",
          "still acidic because acid remains in excess."
        ],
        "feedback": {
          "A": "Neutrality needs equal reacting amounts for this pair.",
          "B": "Some acid reacts, but acid is still in excess.",
          "C": "pH is not a quantity that can be averaged.",
          "D": "0.00060 mol acid exceeds 0.00030 mol base; model pH is about 2.48."
        }
      },
      "es": {
        "prompt": "Agrega 30 mL de NaOH 0.010 M a 60 mL de HCl 0.010 M. La solución queda…",
        "options": [
          "neutra porque cualquier base neutraliza el ácido.",
          "básica porque se agregó base.",
          "a pH 7 porque se promedian los valores.",
          "ácida porque queda ácido en exceso."
        ],
        "feedback": {
          "A": "Se necesitan cantidades que reaccionen iguales para este par.",
          "B": "Parte del ácido reacciona, pero aún queda exceso.",
          "C": "No se pueden promediar directamente los valores de pH.",
          "D": "0.00060 mol de ácido supera 0.00030 mol de base; el pH es aproximadamente 2.48."
        }
      }
    },
    {
      "id": "repeat",
      "answer": "B",
      "standard": "Model reasoning",
      "en": {
        "prompt": "Repeat the same defined-solution trial with the same controls. What should happen?",
        "options": [
          "A different pH must appear.",
          "The same model pH returns.",
          "The illustration seed changes chemical laws.",
          "Indicator readings are more precise than the probe."
        ],
        "feedback": {
          "A": "This deterministic model adds no random instrument noise.",
          "B": "The same settings and actions reproduce the same chemistry.",
          "C": "The seed changes only particle positions.",
          "D": "The probe shows hundredths; indicator colors represent whole-pH bins."
        }
      },
      "es": {
        "prompt": "Repite el ensayo con los mismos controles. ¿Qué debe pasar?",
        "options": [
          "Debe aparecer otro pH.",
          "Regresa el mismo pH del modelo.",
          "La semilla cambia las leyes químicas.",
          "El indicador es más preciso que la sonda."
        ],
        "feedback": {
          "A": "Este modelo determinista no agrega ruido instrumental aleatorio.",
          "B": "Los mismos controles y acciones reproducen la misma química.",
          "C": "La semilla solo cambia las posiciones ilustradas.",
          "D": "La sonda muestra centésimas; los colores representan intervalos enteros de pH."
        }
      }
    }
  ]
};
