// Spanish editorial review complete; native-speaking science educator sign-off pending.
export const content = {
  "id": "central-dogma",
  "version": "1.1.0",
  "teacherPackUrl": "https://sciesmic.com/a/members",
  "strings": {
    "en": {
      "useTemplate": "Build from this template",
      "mystery": "Mystery challenge",
      "challenge": "Classify the edited fragment using sequence evidence.",
      "diagnosis": "Your diagnosis",
      "diagnose": "Check diagnosis",
      "mysteryCorrect": "Correct. Use the two sequences and codon chart to explain why.",
      "mysteryWrong": "Compare the chain, start site, and stop position, then try again.",
      "mysteryPrompt": "Solve a mystery…",
      "title": "Central Dogma Lab",
      "eyebrow": "CENTRAL DOGMA · SEQUENCE STUDIO",
      "h1": "Build the message.",
      "lede": "Follow genetic information from a DNA template to mRNA and an amino acid chain. Then change one base and investigate what happens.",
      "step1": "1. PREDICT",
      "question": "Does changing one DNA base always change the amino acid chain?",
      "predictionLabel": "Your prediction",
      "pred0": "Choose a prediction…",
      "predYes": "Every base change changes the chain.",
      "predNo": "Some base changes leave the chain unchanged.",
      "predDepends": "I need evidence to decide.",
      "step2": "2. INVESTIGATE",
      "guided": "Guided",
      "build": "Build",
      "investigate": "Investigate",
      "modeLabel": "Learning mode",
      "workspace": "Your molecular workspace",
      "dnaStage": "1 · Complementary DNA",
      "rnaStage": "2 · Transcribe mRNA",
      "proteinStage": "3 · Translate",
      "stageLabel": "Construction stage",
      "template": "DNA template",
      "coding": "Complementary DNA / coding strand",
      "rna": "mRNA",
      "protein": "Amino acid chain",
      "replicationNote": "Optional pairing practice: this models a piece of DNA replication. Replication is separate from transcription and is not required before a gene can be expressed.",
      "rnaNote": "Read the DNA template 3′→5′. Build complementary mRNA 5′→3′. RNA uses U in place of T. The DNA remains DNA.",
      "proteinNote": "Read mRNA 5′→3′, three bases at a time. Begin at the annotated AUG start site. A stop codon ends translation and adds no amino acid.",
      "guidedHint": "Choose a slot, then choose a base or amino acid. Guided mode checks each choice and explains a mismatch.",
      "buildHint": "Construct your answer, then check it. You can revise any slot. The next stage unlocks after a correct construction.",
      "investigateHint": "Edit the DNA template below. Choose an example or create a sequence, then compare it with the original.",
      "checkConstruction": "Check construction",
      "hint": "Show next answer",
      "clear": "Clear this stage",
      "next": "Next stage →",
      "skip": "Start with transcription",
      "correctConstruction": "All positions match. Use the next stage to follow the information.",
      "wrongConstruction": "{n} positions need attention. Review the marked slots and the pairing rule or codon chart.",
      "chooseSlot": "Choose slot {n}",
      "slotLabel": "{kind}, position {n}, {value}",
      "empty": "empty",
      "choiceLabel": "Building blocks",
      "base": "Base",
      "position": "Position",
      "selected": "Selected position {n}",
      "goodBase": "Correct. {a} pairs with {b} in this stage.",
      "badBase": "Try again. {a} pairs with {b} in this stage.",
      "goodAA": "Correct. {codon} specifies {aa}.",
      "badAA": "Use the codon chart: {codon} specifies {aa}.",
      "stop": "STOP",
      "chooseAA": "Choose an amino acid or STOP",
      "codonChart": "mRNA codon chart",
      "chartNote": "Use the mRNA codon, not the DNA triplet. Each entry shows a codon and its amino acid abbreviation. STOP is a signal, not an amino acid.",
      "play": "Play walkthrough",
      "pause": "Pause",
      "reset": "Reset same seed",
      "newTrial": "New trial",
      "seed": "Trial seed",
      "copy": "Copy trial link",
      "copied": "Trial link copied.",
      "copyFail": "Copy this page URL from the address bar.",
      "example": "Example",
      "reference": "Original fragment",
      "synonymous": "Same amino acid chain",
      "missense": "One amino acid replaced",
      "earlyStop": "Early stop",
      "noStart": "No start at annotated site",
      "noStop": "No stop in this fragment",
      "custom": "Custom template",
      "apply": "Apply sequence",
      "customHint": "Enter 3–60 DNA bases (A, C, G, T), written 3′→5′. Spaces are ignored. The annotated start site is at position 1.",
      "invalid": "Enter 3–60 A, C, G, or T bases.",
      "editPosition": "Template position",
      "editBase": "Replace with",
      "applyEdit": "Apply one-base edit",
      "restore": "Restore original",
      "detail": "Show Biology detail",
      "detailNote": "Direction labels show antiparallel strands. In a eukaryotic cell, transcription occurs in the nucleus; translation occurs on ribosomes in the cytoplasm. This short coding fragment omits RNA processing.",
      "evidence": "Sequence evidence",
      "original": "Original",
      "edited": "Edited",
      "quantity": "Evidence",
      "bases": "DNA bases",
      "aminoCount": "Amino acids",
      "stopPosition": "Stop codon position",
      "status": "Translation status",
      "complete": "Stop reached",
      "none": "None",
      "changed": "Changed amino acid positions (including missing or added positions)",
      "same": "Same amino acid sequence",
      "yes": "Yes",
      "no": "No",
      "comparisonNote": "A different sequence may affect function, but this model cannot determine folding, function, or whether a change is harmful, beneficial, or neutral. An unchanged amino acid sequence does not prove every aspect of gene expression is unchanged.",
      "step3": "3. EXPLAIN",
      "explainPrompt": "Compare two trials. What changed in DNA, mRNA, and the amino acid chain? Use exact sequences as evidence and explain one limit of this model.",
      "explanationLabel": "Your explanation",
      "download": "Download evidence CSV",
      "step4": "4. CHECK YOUR THINKING",
      "checksHeading": "Trace the information",
      "modelNotesBtn": "Model notes and sources",
      "modelNotes": "This is an idealized, deterministic model of a short coding fragment using the standard genetic code. The start site is fixed at the first triplet; downstream initiation is not modeled. No AUG there means no chain in this model. A missing stop means the chain is incomplete, not a finished protein. We omit promoters, introns, RNA processing, tRNA movement, folding, regulation and genetic-code exceptions. DNA and RNA do not turn into amino acids; information guides assembly from separate building blocks. Playback speed represents teaching steps, not molecular time. Trial seeds choose practice sequences; they do not add biological noise.",
      "footer": "Grades 7–8 introduction · Biology extension · Simulation 1.1.0 · Spanish edited; native educator review pending",
      "sourceLabel": "Scientific sources",
      "gradeNote": "Middle school: trace information and compare changes. Biology extension: build exact strands and decode codons.",
      "termContext": "A [[gene|gene]] is a region of [[dna|DNA]]. A [[template|template strand]] directs [[transcription|transcription]] into [[mrna|mRNA]]. A [[ribosome|ribosome]] reads each [[codon|codon]] during [[translation|translation]], joining [[amino-acid|amino acids]]. A [[mutation|mutation]] changes the DNA sequence.",
      "selectionHelp": "Select a numbered slot, then a building block. All construction controls work with a keyboard.",
      "progress": "{n} of {total} positions filled",
      "saved": "Evidence is kept in this browser tab until reset.",
      "chainEmpty": "No amino acids produced at this annotated start site.",
      "notTranslated": "Not translated after STOP",
      "stageComplete": "Stage complete",
      "resultTitle": "What did the sequence produce?",
      "strandHelp": "Both rows are aligned left to right; the opposite direction labels show that the strands are antiparallel.",
      "stopHelp": "The final construction slot is STOP, a signal rather than a bead in the chain.",
      "mutationLabel": "Mutation editor",
      "history": "Trial record",
      "trial": "Trial",
      "record": "Record comparison",
      "recorded": "Comparison added to the trial record.",
      "noRecords": "Record a comparison to collect evidence.",
      "snapshot": "DNA template → mRNA → chain",
      "csvName": "central-dogma-evidence.csv",
      "bioLabel": "Biology extension",
      "introLabel": "Introduction",
      "levelLabel": "Learning depth",
      "artDNA": "DNA",
      "artFlow": "RNA → PROTEIN",
      "flashcards": "Vocabulary flashcards",
      "openFlashcards": "Vocabulary flashcards · print & export ↗",
      "cardsIntro": "Print cut-and-fold vocabulary cards, save them as a PDF, or export the terms and definitions. Choose English, Spanish, or both.",
      "cardsLanguage": "Card language",
      "english": "English",
      "spanish": "Spanish",
      "bilingual": "English and Spanish",
      "printCards": "Print / Save as PDF",
      "exportCards": "Export CSV",
      "exportHTML": "Download printable HTML",
      "backLab": "Back to the lab",
      "cardsInstructions": "Cut along each outer border. Fold on the dotted line so the term is on one side and the definition is on the other. Print one-sided at 100% scale.",
      "cardsReview": "Spanish text has been checked for consistency and scientific meaning; native-speaking science educator review is still pending.",
      "cardNumber": "Card {n} of {total}",
      "termHeading": "Term",
      "definitionHeading": "Definition",
      "exportDone": "Vocabulary file downloaded.",
      "cardsFile": "central-dogma-vocabulary",
      "cardsTitle": "Central Dogma Vocabulary Flashcards",
      "cardsNotice": "These cards contain the public simulation glossary. Teacher worksheets and answer keys remain separate."
    ,
      "aboutDescription": "Build complementary DNA and mRNA, decode an amino acid chain, then investigate one-base changes and mystery fragments.",
      "aboutGrades": "LIFE SCIENCE · GRADES 7–8 INTRODUCTION · BIOLOGY EXTENSION",
      "aboutStandards": "TEKS B.7B · extension · NGSS MS-LS3-1 · partial · NGSS HS-LS1-1 · extension",
      "aboutScope": "Connections may address only part of a standard; consult the lab’s model and alignment notes."
    },
    "es": {
      "useTemplate": "Construir desde este molde",
      "mystery": "Desafío misterioso",
      "challenge": "Clasifica el fragmento editado usando evidencia de las secuencias.",
      "diagnosis": "Tu diagnóstico",
      "diagnose": "Comprobar diagnóstico",
      "mysteryCorrect": "Correcto. Usa las secuencias y la tabla para explicar por qué.",
      "mysteryWrong": "Compara la cadena, el inicio y la terminación e inténtalo de nuevo.",
      "mysteryPrompt": "Resuelve un misterio…",
      "title": "Laboratorio del dogma central",
      "eyebrow": "DOGMA CENTRAL · ESTUDIO DE SECUENCIAS",
      "h1": "Construye el mensaje.",
      "lede": "Sigue la información genética desde una hebra molde de ADN hasta el ARNm y una cadena de aminoácidos. Después cambia una base e investiga el resultado.",
      "step1": "1. PREDICE",
      "question": "¿Cambiar una base del ADN siempre cambia la cadena de aminoácidos?",
      "predictionLabel": "Tu predicción",
      "pred0": "Elige una predicción…",
      "predYes": "Cada cambio de base cambia la cadena.",
      "predNo": "Algunos cambios no alteran la cadena.",
      "predDepends": "Necesito evidencia para decidir.",
      "step2": "2. INVESTIGA",
      "guided": "Guiado",
      "build": "Construir",
      "investigate": "Investigar",
      "modeLabel": "Modo de aprendizaje",
      "workspace": "Tu espacio molecular",
      "dnaStage": "1 · ADN complementario",
      "rnaStage": "2 · Transcribir ARNm",
      "proteinStage": "3 · Traducir",
      "stageLabel": "Etapa de construcción",
      "template": "Hebra molde de ADN",
      "coding": "ADN complementario / hebra codificante",
      "rna": "ARNm",
      "protein": "Cadena de aminoácidos",
      "replicationNote": "Práctica opcional de apareamiento: representa un fragmento de la replicación del ADN. La replicación es distinta de la transcripción y no se requiere antes de expresar un gen.",
      "rnaNote": "Lee la hebra molde de ADN en dirección 3′→5′. Construye ARNm complementario en dirección 5′→3′. El ARN utiliza U en lugar de T. El ADN permanece como ADN.",
      "proteinNote": "Lee el ARNm en dirección 5′→3′, tres bases a la vez. Comienza en el sitio de inicio AUG indicado. Un codón de terminación detiene la traducción y no agrega ningún aminoácido.",
      "guidedHint": "Elige una casilla y luego una base o un aminoácido. El modo guiado comprueba cada elección y explica por qué una respuesta no coincide.",
      "buildHint": "Construye tu respuesta y compruébala. Puedes modificar cualquier casilla. La siguiente etapa se habilita cuando completas correctamente la construcción.",
      "investigateHint": "Edita la hebra molde de ADN. Elige un ejemplo o crea una secuencia y compárala con la original.",
      "checkConstruction": "Comprobar construcción",
      "hint": "Mostrar siguiente respuesta",
      "clear": "Borrar esta etapa",
      "next": "Siguiente etapa →",
      "skip": "Comenzar con la transcripción",
      "correctConstruction": "Todas las posiciones coinciden. Continúa a la siguiente etapa para seguir la información.",
      "wrongConstruction": "Revisa {n} posiciones marcadas. Consulta la regla de apareamiento o la tabla de codones.",
      "chooseSlot": "Elegir casilla {n}",
      "slotLabel": "{kind}, posición {n}, {value}",
      "empty": "vacía",
      "choiceLabel": "Bloques de construcción",
      "base": "Base",
      "position": "Posición",
      "selected": "Posición seleccionada {n}",
      "goodBase": "Correcto. {a} se aparea con {b} en esta etapa.",
      "badBase": "Inténtalo de nuevo. {a} se aparea con {b} en esta etapa.",
      "goodAA": "Correcto. {codon} corresponde a {aa}.",
      "badAA": "Consulta la tabla: {codon} corresponde a {aa}.",
      "stop": "FIN",
      "chooseAA": "Elige un aminoácido o FIN",
      "codonChart": "Tabla de codones del ARNm",
      "chartNote": "Usa el codón del ARNm, no el triplete de ADN. Cada entrada muestra un codón y la abreviatura del aminoácido correspondiente. FIN indica terminación; no es un aminoácido.",
      "play": "Reproducir recorrido",
      "pause": "Pausar",
      "reset": "Reiniciar con la misma semilla",
      "newTrial": "Nueva prueba",
      "seed": "Semilla de la prueba",
      "copy": "Copiar enlace",
      "copied": "Enlace copiado.",
      "copyFail": "Copia la URL de esta página desde la barra de direcciones.",
      "example": "Ejemplo",
      "reference": "Fragmento original",
      "synonymous": "Misma cadena de aminoácidos",
      "missense": "Un aminoácido sustituido",
      "earlyStop": "Terminación anticipada",
      "noStart": "Sin inicio en el sitio indicado",
      "noStop": "Sin terminación en este fragmento",
      "custom": "Hebra molde personalizada",
      "apply": "Aplicar secuencia",
      "customHint": "Escribe de 3 a 60 bases de ADN (A, C, G, T), en dirección 3′→5′. Se ignoran los espacios. El sitio de inicio indicado está en la posición 1.",
      "invalid": "Escribe de 3 a 60 bases A, C, G o T.",
      "editPosition": "Posición en la hebra molde",
      "editBase": "Sustituir por",
      "applyEdit": "Aplicar cambio de una base",
      "restore": "Restaurar original",
      "detail": "Mostrar detalles de biología",
      "detailNote": "Las etiquetas indican hebras antiparalelas. En una célula eucariota, la transcripción ocurre en el núcleo y la traducción en ribosomas del citoplasma. Este fragmento omite el procesamiento del ARN.",
      "evidence": "Evidencia de la secuencia",
      "original": "Original",
      "edited": "Editada",
      "quantity": "Evidencia",
      "bases": "Bases de ADN",
      "aminoCount": "Número de aminoácidos",
      "stopPosition": "Posición del codón de terminación",
      "status": "Estado de traducción",
      "complete": "Se alcanzó el codón de terminación",
      "none": "No hay",
      "changed": "Número de posiciones de aminoácidos diferentes (incluye posiciones faltantes o agregadas)",
      "same": "Misma secuencia de aminoácidos",
      "yes": "Sí",
      "no": "No",
      "comparisonNote": "Una secuencia diferente puede afectar la función, pero este modelo no determina el plegamiento, la función ni si un cambio es perjudicial, beneficioso o neutro. Una secuencia de aminoácidos igual no demuestra que todos los aspectos de la expresión génica sean iguales.",
      "step3": "3. EXPLICA",
      "explainPrompt": "Compara dos pruebas. ¿Qué cambió en el ADN, el ARNm y la cadena de aminoácidos? Usa secuencias exactas como evidencia y explica una limitación del modelo.",
      "explanationLabel": "Tu explicación",
      "download": "Descargar evidencia CSV",
      "step4": "4. COMPRUEBA LO QUE APRENDISTE",
      "checksHeading": "Sigue la información",
      "modelNotesBtn": "Notas del modelo y fuentes",
      "modelNotes": "Modelo idealizado y determinista de un fragmento codificante corto con el código genético estándar. El inicio se fija en el primer triplete; no se representa el inicio posterior. Sin AUG allí no se forma una cadena en este modelo. Sin señal de terminación, la cadena está incompleta. Se omiten promotores, intrones, procesamiento del ARN, movimiento del ARNt, plegamiento, regulación y excepciones del código genético. El ADN y el ARN no se convierten en aminoácidos; la información guía el ensamblaje con bloques separados. La animación muestra pasos didácticos, no el tiempo real de los procesos moleculares. Las semillas eligen secuencias de práctica; no agregan ruido biológico.",
      "footer": "Introducción para grados 7–8 · Extensión de biología · Simulación 1.1.0 · Español con revisión editorial; revisión docente nativa pendiente",
      "sourceLabel": "Fuentes científicas",
      "gradeNote": "Grados 7–8: sigue la información y compara cambios. Extensión de biología: construye hebras exactas y descifra codones.",
      "termContext": "Un [[gene|gen]] es una región de [[dna|ADN]]. Durante la [[transcription|transcripción]], una [[template|hebra molde]] sirve de guía para ensamblar [[mrna|ARNm]]. Durante la [[translation|traducción]], un [[ribosome|ribosoma]] lee los [[codon|codones]] del ARNm y une [[amino-acid|aminoácidos]]. Una [[mutation|mutación]] cambia la secuencia del ADN.",
      "selectionHelp": "Elige una casilla numerada y luego un bloque. Todos los controles se pueden usar con teclado.",
      "progress": "{n} de {total} posiciones completadas",
      "saved": "La evidencia permanece en esta pestaña hasta reiniciar.",
      "chainEmpty": "No se producen aminoácidos en el sitio de inicio indicado.",
      "notTranslated": "No se traduce después de la señal de terminación",
      "stageComplete": "Etapa completa",
      "resultTitle": "¿Qué produjo la secuencia?",
      "strandHelp": "Las filas se alinean de izquierda a derecha; las etiquetas opuestas muestran que las hebras son antiparalelas.",
      "stopHelp": "La última casilla indica FIN: es una señal de terminación, no un aminoácido de la cadena.",
      "mutationLabel": "Editor de mutaciones",
      "history": "Registro de pruebas",
      "trial": "Prueba",
      "record": "Registrar comparación",
      "recorded": "Comparación agregada al registro.",
      "noRecords": "Registra una comparación para reunir evidencia.",
      "snapshot": "ADN molde → ARNm → cadena",
      "csvName": "evidencia-dogma-central.csv",
      "bioLabel": "Extensión de Biología",
      "introLabel": "Introducción",
      "levelLabel": "Nivel de detalle",
      "artDNA": "ADN",
      "artFlow": "ARN → PROTEÍNA",
      "flashcards": "Tarjetas de vocabulario",
      "openFlashcards": "Tarjetas de vocabulario · imprimir y exportar ↗",
      "cardsIntro": "Imprime tarjetas de vocabulario para recortar y doblar, guárdalas como PDF o exporta los términos y sus definiciones. Elige inglés, español o ambos.",
      "cardsLanguage": "Idioma de las tarjetas",
      "english": "Inglés",
      "spanish": "Español",
      "bilingual": "Inglés y español",
      "printCards": "Imprimir / Guardar como PDF",
      "exportCards": "Exportar CSV",
      "exportHTML": "Descargar HTML para imprimir",
      "backLab": "Volver al laboratorio",
      "cardsInstructions": "Recorta el borde exterior de cada tarjeta. Dobla por la línea punteada para dejar el término de un lado y la definición del otro. Imprime por una sola cara a escala del 100%.",
      "cardsReview": "Se revisaron la coherencia y el significado científico del texto en español; aún está pendiente la revisión de un docente de ciencias que sea hablante nativo de español.",
      "cardNumber": "Tarjeta {n} de {total}",
      "termHeading": "Término",
      "definitionHeading": "Definición",
      "exportDone": "Se descargó el archivo de vocabulario.",
      "cardsFile": "vocabulario-dogma-central",
      "cardsTitle": "Tarjetas de vocabulario del dogma central",
      "cardsNotice": "Estas tarjetas contienen el glosario público de la simulación. Las hojas de trabajo y las claves para docentes se mantienen por separado."
    ,
      "aboutDescription": "Construye ADN complementario y ARNm, decodifica una cadena de aminoácidos e investiga cambios de una base y fragmentos misteriosos.",
      "aboutGrades": "CIENCIAS DE LA VIDA · GRADOS 7–8 INTRODUCCIÓN · EXTENSIÓN DE BIOLOGÍA",
      "aboutStandards": "TEKS B.7B · extension · NGSS MS-LS3-1 · partial · NGSS HS-LS1-1 · extension",
      "aboutScope": "Las conexiones pueden cubrir solo parte de un estándar; consulta las notas del modelo y de alineación."
    }
  },
  "standards": [
    {
      "code": "TEKS B.7B · extension",
      "url": "https://tea.texas.gov/laws-and-rules/texas-administrative-code/19-tac-chapter-112",
      "en": "Biology extension: model gene expression and protein synthesis.",
      "es": "Extensión de Biología: modelar expresión génica y síntesis de proteínas."
    },
    {
      "code": "NGSS MS-LS3-1 · partial",
      "url": "https://www.nextgenscience.org/pe/ms-ls3-1-heredity-inheritance-and-variation-traits",
      "en": "Partial support: model how DNA changes may affect proteins. Organism effects are not simulated; molecular mechanisms exceed the assessment boundary.",
      "es": "Apoyo parcial: modelar cómo cambios en ADN pueden afectar proteínas. No se simulan efectos en organismos; los mecanismos moleculares superan el límite de evaluación."
    },
    {
      "code": "NGSS HS-LS1-1 · extension",
      "url": "https://www.nextgenscience.org/pe/hs-ls1-1-molecules-organisms-structures-and-processes",
      "en": "Partial Biology extension: explain the DNA-to-protein sequence relationship. Protein function and specialized cell systems need additional evidence.",
      "es": "Extensión parcial de Biología: explicar la relación entre ADN y proteína. La función y los sistemas celulares requieren evidencia adicional."
    }
  ],
  "vocab": [
    {
      "id": "dna",
      "en": {
        "term": "DNA",
        "def": "The molecule that stores genetic information in a sequence of bases."
      },
      "es": {
        "term": "ADN",
        "def": "Molécula que almacena información genética en una secuencia de bases."
      }
    },
    {
      "id": "gene",
      "en": {
        "term": "gene",
        "def": "A region of DNA whose information contributes to a functional product, such as an RNA or protein."
      },
      "es": {
        "term": "gen",
        "def": "Región de ADN cuya información contribuye a un producto funcional, como ARN o proteína."
      }
    },
    {
      "id": "template",
      "en": {
        "term": "template strand",
        "def": "The DNA strand read to build a complementary RNA strand during transcription."
      },
      "es": {
        "term": "hebra molde",
        "def": "Hebra de ADN que se lee para construir ARN complementario durante la transcripción."
      }
    },
    {
      "id": "transcription",
      "en": {
        "term": "transcription",
        "def": "The synthesis of RNA using DNA as a template."
      },
      "es": {
        "term": "transcripción",
        "def": "Síntesis de ARN usando ADN como molde."
      }
    },
    {
      "id": "mrna",
      "en": {
        "term": "mRNA",
        "def": "Messenger RNA carries information that a ribosome reads to assemble an amino acid chain."
      },
      "es": {
        "term": "ARNm",
        "def": "El ARN mensajero lleva información que un ribosoma lee para ensamblar aminoácidos."
      }
    },
    {
      "id": "ribosome",
      "en": {
        "term": "ribosome",
        "def": "Cellular machinery that reads mRNA and joins amino acids during translation."
      },
      "es": {
        "term": "ribosoma",
        "def": "Maquinaria celular que lee ARNm y une aminoácidos durante la traducción."
      }
    },
    {
      "id": "codon",
      "en": {
        "term": "codon",
        "def": "Three mRNA bases that specify an amino acid or a stop signal in the genetic code."
      },
      "es": {
        "term": "codón",
        "def": "Tres bases de ARNm que indican un aminoácido o una señal de terminación."
      }
    },
    {
      "id": "translation",
      "en": {
        "term": "translation",
        "def": "The assembly of an amino acid chain using information read from mRNA."
      },
      "es": {
        "term": "traducción",
        "def": "Ensamblaje de una cadena de aminoácidos usando información del ARNm."
      }
    },
    {
      "id": "amino-acid",
      "en": {
        "term": "amino acid",
        "def": "A building block joined to other amino acids to form a polypeptide chain."
      },
      "es": {
        "term": "aminoácido",
        "def": "Bloque que se une a otros aminoácidos para formar una cadena polipeptídica."
      }
    },
    {
      "id": "mutation",
      "en": {
        "term": "mutation",
        "def": "A change in the DNA sequence; it may or may not change an amino acid sequence."
      },
      "es": {
        "term": "mutación",
        "def": "Cambio en la secuencia de ADN; puede cambiar o no una secuencia de aminoácidos."
      }
    }
  ],
  "checks": [
    {
      "id": "q1",
      "answer": "B",
      "standard": "B.7B extension · MS-LS3-1 partial",
      "en": {
        "prompt": "What happens to DNA during transcription?",
        "options": [
          "It becomes amino acids.",
          "It serves as a template while RNA is assembled.",
          "It must first become RNA on both strands.",
          "It is replaced by the ribosome."
        ],
        "feedback": {
          "A": "Amino acids are separate building blocks.",
          "B": "Information is copied into RNA; the DNA remains DNA.",
          "C": "Only the relevant template is read for this transcript.",
          "D": "A ribosome reads mRNA during translation."
        }
      },
      "es": {
        "prompt": "¿Qué ocurre con el ADN durante la transcripción?",
        "options": [
          "Se convierte en aminoácidos.",
          "Sirve de molde mientras se ensambla ARN.",
          "Primero se convierte en ARN en ambas hebras.",
          "El ribosoma lo reemplaza."
        ],
        "feedback": {
          "A": "Los aminoácidos son bloques separados.",
          "B": "Se copia información al ARN; el ADN sigue siendo ADN.",
          "C": "Se lee la hebra molde correspondiente.",
          "D": "El ribosoma lee ARNm durante la traducción."
        }
      }
    },
    {
      "id": "q2",
      "answer": "C",
      "standard": "B.7B extension · MS-LS3-1 partial",
      "en": {
        "prompt": "Two students use the same DNA template and the same standard code. What should this model produce?",
        "options": [
          "Different chains because the seed adds noise.",
          "A random amino acid at each codon.",
          "The same mRNA and amino acid sequence.",
          "The same DNA but necessarily different RNA."
        ],
        "feedback": {
          "A": "Seeds select practice sequences, not translation noise.",
          "B": "Each codon has a fixed meaning in the standard code.",
          "C": "The sequence model is deterministic.",
          "D": "The same template has the same complementary mRNA."
        }
      },
      "es": {
        "prompt": "Dos estudiantes usan la misma hebra molde y el mismo código estándar. ¿Qué produce el modelo?",
        "options": [
          "Cadenas diferentes por el ruido de la semilla.",
          "Un aminoácido aleatorio por codón.",
          "El mismo ARNm y la misma secuencia de aminoácidos.",
          "El mismo ADN pero ARN distinto."
        ],
        "feedback": {
          "A": "Las semillas eligen secuencias, no ruido.",
          "B": "Cada codón tiene un significado fijo.",
          "C": "El modelo es determinista.",
          "D": "El mismo molde produce el mismo ARNm complementario."
        }
      }
    },
    {
      "id": "q3",
      "answer": "A",
      "standard": "B.7B extension · MS-LS3-1 partial",
      "en": {
        "prompt": "AUG GCU UUU AAA UAA contains 15 RNA bases. How many amino acids are added?",
        "options": [
          "4",
          "5",
          "15",
          "3"
        ],
        "feedback": {
          "A": "Four codons add amino acids; UAA adds none.",
          "B": "The fifth codon is a stop signal.",
          "C": "Three bases form one codon.",
          "D": "AUG contributes methionine as well as marking the start."
        }
      },
      "es": {
        "prompt": "AUG GCU UUU AAA UAA contiene 15 bases. ¿Cuántos aminoácidos se agregan?",
        "options": [
          "4",
          "5",
          "15",
          "3"
        ],
        "feedback": {
          "A": "Cuatro codones agregan aminoácidos; UAA no agrega ninguno.",
          "B": "El quinto codón indica terminación.",
          "C": "Tres bases forman un codón.",
          "D": "AUG aporta metionina y marca el inicio."
        }
      }
    },
    {
      "id": "q4",
      "answer": "D",
      "standard": "B.7B extension · MS-LS3-1 partial",
      "en": {
        "prompt": "The annotated first mRNA codon changes from AUG to UUG. What does this model show?",
        "options": [
          "A longer chain.",
          "A chain beginning with leucine.",
          "An unchanged chain.",
          "No initiation at the annotated site."
        ],
        "feedback": {
          "A": "Losing the modeled start does not lengthen the chain.",
          "B": "UUG codes for leucine within a chain, but is not the start used here.",
          "C": "The start requirement is no longer met.",
          "D": "This model requires AUG at its annotated start and does not model downstream initiation."
        }
      },
      "es": {
        "prompt": "El primer codón indicado cambia de AUG a UUG. ¿Qué muestra el modelo?",
        "options": [
          "Una cadena más larga.",
          "Una cadena que inicia con leucina.",
          "Una cadena igual.",
          "No hay inicio en el sitio indicado."
        ],
        "feedback": {
          "A": "Perder el inicio no alarga la cadena.",
          "B": "UUG indica leucina dentro de una cadena, pero no es el inicio usado aquí.",
          "C": "Ya no se cumple el requisito de inicio.",
          "D": "El modelo requiere AUG en el inicio indicado y no representa inicios posteriores."
        }
      }
    },
    {
      "id": "q5",
      "answer": "B",
      "standard": "B.7B extension · MS-LS3-1 partial",
      "en": {
        "prompt": "Change the second mRNA codon from GCU to GCC. What can you conclude?",
        "options": [
          "The organism is definitely healthier.",
          "The amino acid at that position stays alanine.",
          "The DNA sequence is unchanged.",
          "Translation must stop early."
        ],
        "feedback": {
          "A": "This model cannot determine organism health.",
          "B": "Both codons specify alanine in the standard code.",
          "C": "A base changed even though the amino acid did not.",
          "D": "Neither codon is a stop signal."
        }
      },
      "es": {
        "prompt": "Cambia el segundo codón de GCU a GCC. ¿Qué puedes concluir?",
        "options": [
          "El organismo está más sano.",
          "El aminoácido sigue siendo alanina.",
          "El ADN no cambió.",
          "La traducción se detiene antes."
        ],
        "feedback": {
          "A": "El modelo no determina la salud.",
          "B": "Ambos codones indican alanina.",
          "C": "Cambió una base aunque no cambió el aminoácido.",
          "D": "Ninguno es señal de terminación."
        }
      }
    }
  ],
  "aminoAcids": {
    "A": {
      "abbr": "Ala",
      "en": "alanine",
      "es": "alanina"
    },
    "R": {
      "abbr": "Arg",
      "en": "arginine",
      "es": "arginina"
    },
    "N": {
      "abbr": "Asn",
      "en": "asparagine",
      "es": "asparagina"
    },
    "D": {
      "abbr": "Asp",
      "en": "aspartate",
      "es": "aspartato"
    },
    "C": {
      "abbr": "Cys",
      "en": "cysteine",
      "es": "cisteína"
    },
    "Q": {
      "abbr": "Gln",
      "en": "glutamine",
      "es": "glutamina"
    },
    "E": {
      "abbr": "Glu",
      "en": "glutamate",
      "es": "glutamato"
    },
    "G": {
      "abbr": "Gly",
      "en": "glycine",
      "es": "glicina"
    },
    "H": {
      "abbr": "His",
      "en": "histidine",
      "es": "histidina"
    },
    "I": {
      "abbr": "Ile",
      "en": "isoleucine",
      "es": "isoleucina"
    },
    "L": {
      "abbr": "Leu",
      "en": "leucine",
      "es": "leucina"
    },
    "K": {
      "abbr": "Lys",
      "en": "lysine",
      "es": "lisina"
    },
    "M": {
      "abbr": "Met",
      "en": "methionine",
      "es": "metionina"
    },
    "F": {
      "abbr": "Phe",
      "en": "phenylalanine",
      "es": "fenilalanina"
    },
    "P": {
      "abbr": "Pro",
      "en": "proline",
      "es": "prolina"
    },
    "S": {
      "abbr": "Ser",
      "en": "serine",
      "es": "serina"
    },
    "T": {
      "abbr": "Thr",
      "en": "threonine",
      "es": "treonina"
    },
    "W": {
      "abbr": "Trp",
      "en": "tryptophan",
      "es": "triptófano"
    },
    "Y": {
      "abbr": "Tyr",
      "en": "tyrosine",
      "es": "tirosina"
    },
    "V": {
      "abbr": "Val",
      "en": "valine",
      "es": "valina"
    }
  },
  "termAliases": {
    "en": {
      "dna": [
        "DNA"
      ],
      "gene": [
        "gene",
        "genes"
      ],
      "template": [
        "template strand",
        "DNA template"
      ],
      "transcription": [
        "transcription"
      ],
      "mrna": [
        "mRNA",
        "messenger RNA"
      ],
      "ribosome": [
        "ribosome",
        "ribosomes"
      ],
      "codon": [
        "codon",
        "codons"
      ],
      "translation": [
        "translation"
      ],
      "amino-acid": [
        "amino acid",
        "amino acids"
      ],
      "mutation": [
        "mutation",
        "mutations"
      ]
    },
    "es": {
      "dna": [
        "ADN"
      ],
      "gene": [
        "gen",
        "genes"
      ],
      "template": [
        "hebra molde",
        "hebras molde"
      ],
      "transcription": [
        "transcripción"
      ],
      "mrna": [
        "ARNm",
        "ARN mensajero"
      ],
      "ribosome": [
        "ribosoma",
        "ribosomas"
      ],
      "codon": [
        "codón",
        "codones"
      ],
      "translation": [
        "traducción"
      ],
      "amino-acid": [
        "aminoácido",
        "aminoácidos"
      ],
      "mutation": [
        "mutación",
        "mutaciones"
      ]
    }
  }
};
