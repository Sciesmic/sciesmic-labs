export const content = {
  "id": "punnett-squares",
  "teacherPackUrl": "https://sciesmic.com/a/members",
  "standards": [
    {
      "code": "TEKS B.8B · partial",
      "url": "https://tea.texas.gov/laws-and-rules/sboe-rules-tac/sboe-tac-currently-effect/ch112c.pdf",
      "en": "Predict monohybrid, dihybrid and incomplete-dominance outcomes. Partial: codominance, sex-linked traits and multiple alleles are not modeled.",
      "es": "Predecir cruces monohíbridos, dihíbridos y de dominancia incompleta. Parcial: no incluye codominancia, herencia ligada al sexo ni alelos múltiples."
    },
    {
      "code": "NGSS HS-LS3-3 · partial",
      "url": "https://www.nextgenscience.org/pe/hs-ls3-3-heredity-inheritance-and-variation-traits",
      "en": "Apply probability to explain trait distributions and sampling variation. Partial: environmental influences on trait expression are not modeled.",
      "es": "Aplicar probabilidad para explicar la distribución de rasgos y variación del muestreo. Parcial: no se modelan efectos ambientales en la expresión."
    }
  ],
  "vocab": [
    {
      "id": "allele",
      "en": {
        "term": "allele",
        "def": "An alternative version of a gene. A diploid parent has two alleles per modeled gene; each gamete receives one."
      },
      "es": {
        "term": "alelo",
        "def": "Una versión alternativa de un gen. Un progenitor diploide tiene dos alelos por gen modelado; cada gameto recibe uno."
      }
    },
    {
      "id": "gamete",
      "en": {
        "term": "gamete",
        "def": "A reproductive cell with one allele of each modeled gene. Two gametes combine at fertilization."
      },
      "es": {
        "term": "gameto",
        "def": "Una célula reproductora con un alelo de cada gen modelado. Dos gametos se unen en la fecundación."
      }
    },
    {
      "id": "genotype",
      "en": {
        "term": "genotype",
        "def": "The allele combination of an organism for the gene or genes studied, such as Rr or RrYy."
      },
      "es": {
        "term": "genotipo",
        "def": "La combinación de alelos de un organismo para los genes estudiados, como Rr o RrYy."
      }
    },
    {
      "id": "phenotype",
      "en": {
        "term": "phenotype",
        "def": "An observable characteristic, such as round seeds or pink flowers. Real phenotypes can also depend on the environment."
      },
      "es": {
        "term": "fenotipo",
        "def": "Una característica observable, como semillas lisas o flores rosas. Los fenotipos reales también pueden depender del ambiente."
      }
    },
    {
      "id": "dominant",
      "en": {
        "term": "dominant",
        "def": "Describes an allele whose associated phenotype appears in a heterozygote under complete dominance. It need not be stronger or more common."
      },
      "es": {
        "term": "dominante",
        "def": "Describe un alelo cuyo fenotipo asociado aparece en un heterocigoto con dominancia completa. No tiene que ser más fuerte ni más común."
      }
    },
    {
      "id": "recessive",
      "en": {
        "term": "recessive",
        "def": "Describes an allele whose associated phenotype appears only with two copies in this complete-dominance model. It can be carried by a heterozygote."
      },
      "es": {
        "term": "recesivo",
        "def": "Describe un alelo cuyo fenotipo asociado aparece solo con dos copias en este modelo de dominancia completa. Un heterocigoto puede portarlo."
      }
    },
    {
      "id": "homozygous",
      "en": {
        "term": "homozygous",
        "def": "Having two identical alleles of a gene, such as RR or rr."
      },
      "es": {
        "term": "homocigoto",
        "def": "Que tiene dos alelos idénticos de un gen, como RR o rr."
      }
    },
    {
      "id": "heterozygous",
      "en": {
        "term": "heterozygous",
        "def": "Having two different alleles of a gene, such as Rr or CᴿCᵂ."
      },
      "es": {
        "term": "heterocigoto",
        "def": "Que tiene dos alelos distintos de un gen, como Rr o CᴿCᵂ."
      }
    },
    {
      "id": "probability",
      "en": {
        "term": "probability",
        "def": "A measure from 0 to 1 of how likely an outcome is. It predicts long-run patterns, not guaranteed counts in each sample."
      },
      "es": {
        "term": "probabilidad",
        "def": "Una medida de 0 a 1 de qué tan probable es un resultado. Predice patrones a largo plazo, no conteos garantizados en cada muestra."
      }
    },
    {
      "id": "punnett-square",
      "en": {
        "term": "Punnett square",
        "def": "A grid combining possible parental gametes to predict offspring genotypes and their probabilities."
      },
      "es": {
        "term": "cuadro de Punnett",
        "def": "Una cuadrícula que combina los posibles gametos parentales para predecir genotipos descendientes y sus probabilidades."
      }
    }
  ],
  "checks": [
    {
      "id": "q1",
      "answer": "B",
      "standard": "B.8B · HS-LS3-3 (partial)",
      "en": {
        "prompt": "For Rr × Rr, which claim is supported?",
        "options": [
          "Exactly three of every four offspring must be round.",
          "Each offspring has a 3/4 chance of being round.",
          "R is stronger, so all offspring will be round.",
          "A wrinkled offspring makes the next round offspring more likely."
        ],
        "feedback": {
          "A": "Four cells describe possible combinations, not a fixed family.",
          "B": "RR, Rr and rR produce round seeds: 3 of 4 equally likely paths.",
          "C": "Dominance concerns phenotype in heterozygotes; rr remains possible.",
          "D": "Fertilizations are independent; earlier offspring do not change later probabilities."
        }
      },
      "es": {
        "prompt": "¿Qué afirmación respalda Rr × Rr?",
        "options": [
          "Exactamente tres de cada cuatro descendientes deben ser lisos.",
          "Cada descendiente tiene una probabilidad de 3/4 de ser liso.",
          "R es más fuerte, así que todos serán lisos.",
          "Un descendiente rugoso hace más probable que el siguiente sea liso."
        ],
        "feedback": {
          "A": "Las casillas describen combinaciones posibles, no una familia fija.",
          "B": "RR, Rr y rR producen semillas lisas: 3 de 4 rutas igualmente probables.",
          "C": "La dominancia describe el fenotipo del heterocigoto; rr sigue siendo posible.",
          "D": "Las fecundaciones son independientes; los resultados previos no cambian las probabilidades."
        }
      }
    },
    {
      "id": "q2",
      "answer": "C",
      "standard": "B.8B · HS-LS3-3 (partial)",
      "en": {
        "prompt": "A sample of four Rr × Rr offspring is all round. What follows?",
        "options": [
          "The model has failed.",
          "One parent must be RR.",
          "This can occur by chance; probability is (3/4)⁴.",
          "The next offspring must be wrinkled."
        ],
        "feedback": {
          "A": "Small samples can differ from expected ratios.",
          "B": "Rr parents can produce four round offspring.",
          "C": "Independent events multiply: (3/4)⁴ = 81/256, about 31.6%.",
          "D": "The next offspring still has a 1/4 chance of being wrinkled."
        }
      },
      "es": {
        "prompt": "Una muestra de cuatro descendientes de Rr × Rr es solo de lisos. ¿Qué se concluye?",
        "options": [
          "El modelo falló.",
          "Un progenitor debe ser RR.",
          "Puede ocurrir por azar; la probabilidad es (3/4)⁴.",
          "El siguiente descendiente debe ser rugoso."
        ],
        "feedback": {
          "A": "Las muestras pequeñas pueden diferir de la proporción prevista.",
          "B": "Dos progenitores Rr pueden producir cuatro lisos.",
          "C": "Los eventos independientes se multiplican: (3/4)⁴ = 81/256, aproximadamente 31.6%.",
          "D": "El siguiente descendiente conserva una probabilidad de 1/4 de ser rugoso."
        }
      }
    },
    {
      "id": "q3",
      "answer": "A",
      "standard": "B.8B · HS-LS3-3 (partial)",
      "en": {
        "prompt": "For independently assorting RrYy × RrYy, what is P(wrinkled green)?",
        "options": [
          "1/16",
          "3/16",
          "1/4",
          "9/16"
        ],
        "feedback": {
          "A": "P(rr) × P(yy) = 1/4 × 1/4 = 1/16.",
          "B": "3/16 applies to wrinkled yellow or round green in this cross.",
          "C": "1/4 is the probability of one recessive phenotype alone.",
          "D": "9/16 is the round-yellow probability."
        }
      },
      "es": {
        "prompt": "En RrYy × RrYy con distribución independiente, ¿cuál es P(rugoso verde)?",
        "options": [
          "1/16",
          "3/16",
          "1/4",
          "9/16"
        ],
        "feedback": {
          "A": "P(rr) × P(yy) = 1/4 × 1/4 = 1/16.",
          "B": "3/16 corresponde a rugoso amarillo o liso verde en este cruce.",
          "C": "1/4 es la probabilidad de un solo fenotipo recesivo.",
          "D": "9/16 es la probabilidad de liso amarillo."
        }
      }
    },
    {
      "id": "q4",
      "answer": "D",
      "standard": "B.8B · HS-LS3-3 (partial)",
      "en": {
        "prompt": "What does RR × rr predict under complete dominance?",
        "options": [
          "Half RR and half rr.",
          "All rr.",
          "Half round and half wrinkled.",
          "All Rr, with round seeds."
        ],
        "feedback": {
          "A": "Each offspring receives R from one parent and r from the other.",
          "B": "The RR parent cannot contribute r.",
          "C": "No rr offspring is possible because every offspring receives R.",
          "D": "All paths give Rr. The recessive allele remains present."
        }
      },
      "es": {
        "prompt": "¿Qué predice RR × rr con dominancia completa?",
        "options": [
          "Mitad RR y mitad rr.",
          "Todos rr.",
          "Mitad lisos y mitad rugosos.",
          "Todos Rr, con semillas lisas."
        ],
        "feedback": {
          "A": "Cada descendiente recibe R de un progenitor y r del otro.",
          "B": "El progenitor RR no aporta r.",
          "C": "No puede haber rr porque todos reciben R.",
          "D": "Todas las rutas dan Rr. El alelo recesivo permanece presente."
        }
      }
    },
    {
      "id": "q5",
      "answer": "B",
      "standard": "B.8B · HS-LS3-3 (partial)",
      "en": {
        "prompt": "Change a snapdragon cross from red × white to pink × pink. What changes?",
        "options": [
          "All offspring stay pink because alleles blended permanently.",
          "The prediction changes from all pink to 1 red : 2 pink : 1 white.",
          "White becomes dominant.",
          "Each gamete now carries both R and W."
        ],
        "feedback": {
          "A": "Alleles remain distinct and segregate into gametes.",
          "B": "RR × WW gives RW; RW × RW gives RR, RW, RW and WW.",
          "C": "Neither allele is dominant in this incomplete-dominance example.",
          "D": "Each gamete still carries one allele per gene."
        }
      },
      "es": {
        "prompt": "Cambia un cruce de bocas de dragón de rojo × blanco a rosa × rosa. ¿Qué cambia?",
        "options": [
          "Todos siguen rosas porque los alelos se mezclaron para siempre.",
          "La predicción pasa de todos rosas a 1 rojo : 2 rosas : 1 blanco.",
          "El blanco se vuelve dominante.",
          "Cada gameto ahora lleva R y W juntos."
        ],
        "feedback": {
          "A": "Los alelos permanecen distintos y se separan en los gametos.",
          "B": "RR × WW da RW; RW × RW da RR, RW, RW y WW.",
          "C": "Ningún alelo es dominante en este ejemplo.",
          "D": "Cada gameto conserva un solo alelo por gen."
        }
      }
    }
  ],
  "strings": {
    "en": {
      "title": "Punnett Squares",
      "eyebrow": "BIOLOGY · GRADES 9–10 · INHERITANCE LAB",
      "h1": "Same parents. Different possibilities.",
      "lede": "Build a [[punnett-square|Punnett square]], then let chance do the crossing. Why do real offspring counts differ from predicted ratios?",
      "notesTitle": "Model notes and limits",
      "notes": "Each parent contributes one [[allele|allele]] per gene through a [[gamete|gamete]]. Peas use complete dominance: R = round and r = wrinkled; in two-gene crosses, Y = yellow and y = green. The two genes assort independently. Snapdragons use Cᴿ and Cᵂ (shown as R and W on the compact tiles); neither allele is dominant. Their heterozygote is pink, but the alleles remain distinct. Fertilizations are independent, with equal gamete probabilities. This model excludes linkage, mutation, selection, environmental effects, codominance, multiple alleles and sex linkage. The seed icons show offspring seed traits; snapdragon flowers show a later adult phenotype. A Punnett square predicts possibilities, not birth order or four guaranteed offspring.",
      "scienceSource": "Science reference: OpenStax Biology 2e",
      "step1": "01 / PREDICT",
      "question": "Will four offspring always give a 3:1 ratio?",
      "predictHelp": "Start with three Rr × Rr families of four. Will every family have three round and one wrinkled offspring? Then compare 100 and 1000 offspring.",
      "predictionLabel": "My prediction",
      "step2": "02 / INVESTIGATE",
      "investigateTitle": "From parent alleles to offspring evidence",
      "modeLabel": "Investigation mode",
      "mono": "One gene · Peas",
      "di": "Two genes · Peas",
      "snap": "Incomplete dominance",
      "mystery": "Mystery parent",
      "monoNote": "R controls seed shape. A [[heterozygous|heterozygous]] parent (Rr) can make R or r gametes.",
      "diNote": "R/r controls shape; Y/y controls color. Independent assortment gives RrYy four equally likely gamete types.",
      "snapNote": "Incomplete dominance: RR = red, RW = pink, WW = white. R and W abbreviate Cᴿ and Cᵂ. Alleles do not blend or disappear.",
      "mysteryNote": "A round-seeded parent is RR or Rr. Cross it with rr and use offspring evidence to infer its [[genotype|genotype]].",
      "chooseParents": "A / CHOOSE PARENTS",
      "parent1": "Parent 1",
      "parent2": "Parent 2",
      "unknownParent": "Round · genotype hidden",
      "gameteHelp": "Select every possible [[gamete|gamete]] type from each parent. Each gamete has one allele per gene. Repeated headers on the board represent equally likely paths.",
      "parent1Gametes": "Gametes from Parent 1",
      "parent2Gametes": "Gametes from Parent 2",
      "checkGametes": "Check gametes",
      "gametesRight": "Correct. Each selected gamete carries one allele per gene.",
      "gametesWrong": "Try again. Include all possible types, with one allele per gene. RR is a genotype, not a one-gene gamete.",
      "buildCross": "B / BUILD THE CROSS",
      "boardTitle": "The possibility board",
      "fillBoard": "Show completed square",
      "boardHelp": "Choose a cell, combine its two gametes, and check the offspring [[genotype|genotype]]. Each cell has the same [[probability|probability]] in this model.",
      "boardScroll": "Punnett board; scroll horizontally for a two-gene cross",
      "checkCell": "Check cell",
      "cellPrompt": "Cell {n}: {a} + {b}",
      "cellLabel": "Cell {n}, gametes {a} and {b}: {g}",
      "unfilled": "not filled",
      "cellRight": "Correct: {a} + {b} → {g}. Phenotype: {p}.",
      "cellWrong": "Check which allele came from each parent. Keep each gene’s pair together.",
      "squareSummary": "{n}/{total} cells completed. Each cell represents 1/{total} of the predicted outcomes.",
      "testPrediction": "C / TEST THE PREDICTION",
      "sampleTitle": "Let chance make the offspring",
      "sampleHelp": "Compare predicted [[phenotype|phenotype]] probabilities with observed counts. Change only sample size to investigate sampling variation.",
      "sampleSize": "Offspring in this sample",
      "run": "Sample offspring",
      "pause": "Pause",
      "resume": "Resume",
      "reset": "Reset same seed",
      "newTrial": "New trial",
      "seedLabel": "Seed",
      "setSeed": "Reproducible trial seed",
      "applySeed": "Apply seed",
      "copyLink": "Copy trial link",
      "export": "Export evidence CSV",
      "progressLabel": "Offspring revealed",
      "ready": "Ready. Same seed + same settings gives the same offspring sequence.",
      "running": "{n} of {total} offspring revealed",
      "complete": "Sample complete: {n} offspring. A new trial changes chance, not the inheritance rules.",
      "paused": "Paused at {n} of {total}. Resume to continue.",
      "seedError": "Use a whole-number seed from 0 to 4294967295.",
      "copied": "Trial link copied. It includes settings and seed, not your written responses.",
      "copyFail": "Copy the address from your browser to share this trial.",
      "exported": "Evidence CSV downloaded. Counts are offspring; probabilities are unitless.",
      "offspringNote": "The most recent 24 revealed offspring are illustrated. All offspring are counted in the table.",
      "evidenceTitle": "Phenotype evidence",
      "phenotypeHeader": "Phenotype",
      "predicted": "Predicted probability",
      "expected": "Expected count (n × p)",
      "observed": "Observed count",
      "proportion": "Observed proportion",
      "genotypeEvidence": "Inspect genotype counts and predictions",
      "genotypeHeader": "Genotype",
      "probabilityNote": "A [[dominant|dominant]] allele affects a heterozygote’s phenotype; it is not stronger or necessarily more common. A [[recessive|recessive]] allele can still be inherited. A predicted count is an average over many samples, not a quota.",
      "compareTrials": "D / COMPARE THE EVIDENCE",
      "graphTitle": "Does a larger sample settle the proportion?",
      "focalNote": "Track {p}. Horizontal lines show predicted probabilities. Retain up to six recent trials per mode and use Graph view to inspect small samples.",
      "mysteryFocal": "Track wrinkled offspring. Compare the RR hypothesis (0) with the Rr hypothesis (0.5); no wrinkled offspring in a small sample cannot prove RR.",
      "xLabel": "Offspring sampled (count)",
      "yLabel": "Observed proportion (0–1)",
      "trial": "Trial {id} · seed {seed} · {cross} · n={n}",
      "theory": "Predicted · {cross}",
      "trialLog": "Trial record and settings",
      "mysteryHelp": "Test the unknown parent with [[homozygous|homozygous]] recessive rr. One wrinkled offspring rules out RR under this model; all-round samples can fit either hypothesis. Make a claim before revealing the answer.",
      "hypothesis": "My genotype hypothesis",
      "choose": "Choose…",
      "reason": "Evidence for my claim",
      "reveal": "Reveal parent genotype",
      "mysteryRevealed": "Hidden parent: {g}. With rr, its predicted wrinkled probability is {p}. Use counts and uncertainty to assess your claim.",
      "mysteryBoard": "The hidden square stays covered until you reveal the parent. Sample offspring first and compare both hypotheses.",
      "rrHyp": "If unknown = RR",
      "RrHyp": "If unknown = Rr",
      "step3": "03 / EXPLAIN",
      "explainTitle": "Use two trials to tell the story",
      "explainHelp": "State a claim, cite counts and proportions from two trials, and connect the evidence to allele segregation and [[probability|probability]]. Explain why a small sample can differ from the square. What does the model leave out?",
      "explanationLabel": "Claim, evidence, and reasoning",
      "step4": "04 / CHECK YOUR THINKING",
      "checksHeading": "What does the evidence support?",
      "footer": "Sciesmic Punnett Squares 1.1.1 · Idealized inheritance model.",
      "round": "Round",
      "wrinkled": "Wrinkled",
      "round_yellow": "Round yellow",
      "round_green": "Round green",
      "wrinkled_yellow": "Wrinkled yellow",
      "wrinkled_green": "Wrinkled green",
      "red": "Red",
      "pink": "Pink",
      "white": "White",
      "total": "Total",
      "noneYet": "No sample yet",
      "row": "Parent 2 gamete",
      "column": "Parent 1 gamete",
      "exportNotebook": "Export lab notebook",
      "startFresh": "Start fresh",
      "freshTitle": "Start a new investigation?",
      "freshHelp": "This clears the saved work for this lab on this browser. Export your notebook first if you want to keep it.",
      "cancelFresh": "Keep my work",
      "confirmFresh": "Clear and start fresh",
      "saved": "Saved on this browser. Export your notebook to take it with you.",
      "restored": "Saved work restored. An unfinished sample resumes paused.",
      "storageUnavailable": "Browser saving is unavailable. Keep this tab open and export your notebook.",
      "notebookExported": "Notebook downloaded with your writing, settings and retained evidence from all modes.",
      "notebookTitle": "Punnett Squares lab notebook",
      "notebookIntro": "Your recorded work and evidence. Unrevealed mystery genotypes stay hidden.",
      "printNotebook": "Print notebook",
      "notebookSettings": "Settings and practice",
      "notebookReasoning": "Cell explanations",
      "notebookChecks": "My check responses",
      "submitted": "Submitted",
      "notSubmitted": "Not submitted",
      "notebookNoWriting": "No response recorded.",
      "familyEyebrow": "START HERE / SMALL FAMILIES",
      "familyTitle": "Three families. The same Rr × Rr cross.",
      "familyHelp": "Run each family of four, then compare larger samples. The numbered seeds reproduce these chance outcomes; they do not change the inheritance rules.",
      "familyButton": "Sample family {n} · seed {seed}",
      "familyRow": "Family {n}",
      "familyColumn": "Family / seed",
      "familyProgress": "{n}/3 small families recorded. What differs despite identical parents?",
      "familyDone": "Three small families recorded. Compare 100, then 1000 offspring; the expected probability stays 0.25 wrinkled. Larger samples need not be closer every time.",
      "family100": "Compare 100 offspring · seed 41",
      "family1000": "Compare 1000 offspring · seed 41",
      "practiceLabel": "Practice setting",
      "guided": "Guided practice",
      "challenge": "Challenge",
      "guidedNote": "Headers are visible. Trace one allele from each parent to check a cell.",
      "challengeNote": "Submit the correct gametes to uncover the headers. Then check a cell and explain its parental alleles before showing the completed square.",
      "challengeBoard": "Challenge: choose and check both parents’ gametes to uncover this board.",
      "cellReasonLabel": "Explain which allele came from each parent",
      "reasonNeeded": "Add your allele explanation before checking this challenge cell.",
      "challengeCellRight": "Correct genotype: {g}. Your explanation is recorded; compare it with the row and column gametes.",
      "challengeRevealHint": "Complete and explain one challenge cell to enable the completed square.",
      "revealRequirements": "Before reveal: finish a sample at this seed, choose RR or Rr, and write your evidence.",
      "revealReady": "Sample, claim and evidence recorded. You can now reveal the parent.",
      "alreadyRevealed": "Parent genotype revealed",
      "allRoundExamples": "Compare two all-round cases",
      "allRoundHelp": "Each case samples four offspring from an unknown round parent crossed with rr. Record a separate claim and evidence, then reveal each parent.",
      "allRoundA": "Sample all-round case A",
      "allRoundB": "Sample all-round case B",
      "allRoundReasoning": "If the parent were Rr, four round offspring would still have probability (1/2)⁴ = 1/16. All-round evidence can fit both hypotheses; one wrinkled offspring excludes RR under this model.",
      "zoomLabel": "Graph view · offspring count",
      "zoomAuto": "Fit all collected samples",
      "zoom4": "First 4 offspring",
      "zoom16": "First 16 offspring",
      "zoom100": "First 100 offspring",
      "zoom1000": "First 1000 offspring",
      "zoomNote": "Showing offspring 0–{n}. Zoom changes only the view; all evidence stays in the trial record and notebook. Trial filtering keeps this scale.",
      "notebookCells": "Punnett cell work",
      "notebookPractice": "Practice setting",
      "notebookCell": "Cell and gametes",
      "notebookEntry": "My genotype entry",
      "notebookChecked": "Genotype shown after checking or completing",
      "notebookNoCells": "No cell work recorded.",
      "notebookCheckChoice": "My selected answer",
      "notebookNoChecks": "No check responses recorded.",
      "notebookCorrect": "Correct.",
      "notebookRevisit": "Review this answer."
    },
    "es": {
      "title": "Cuadros de Punnett",
      "eyebrow": "BIOLOGÍA · GRADOS 9–10 · LABORATORIO DE HERENCIA",
      "h1": "Mismos progenitores. Distintas posibilidades.",
      "lede": "Construye un [[punnett-square|cuadro de Punnett]] y deja que el azar combine los alelos. ¿Por qué los conteos de descendientes difieren de las proporciones previstas?",
      "notesTitle": "Notas y límites del modelo",
      "notes": "Cada progenitor aporta un [[allele|alelo]] por gen mediante un [[gamete|gameto]]. En los chícharos hay dominancia completa: R = liso y r = rugoso; en cruces de dos genes, Y = amarillo y y = verde. Los dos genes se distribuyen independientemente. Las bocas de dragón usan Cᴿ y Cᵂ (R y W en las fichas pequeñas); ningún alelo es dominante. El heterocigoto es rosa, pero los alelos permanecen distintos. Las fecundaciones son independientes y los gametos tienen la misma probabilidad. Se excluyen ligamiento, mutación, selección, efectos ambientales, codominancia, alelos múltiples y herencia ligada al sexo. Los íconos de semillas muestran rasgos de semillas descendientes; las flores muestran el fenotipo adulto posterior. El cuadro predice posibilidades, no el orden de nacimiento ni cuatro descendientes garantizados.",
      "scienceSource": "Referencia científica: OpenStax Biology 2e",
      "step1": "01 / PREDICE",
      "question": "¿Cuatro descendientes siempre darán una proporción 3:1?",
      "predictHelp": "Empieza con tres familias Rr × Rr de cuatro. ¿Cada familia tendrá tres descendientes lisos y uno rugoso? Luego compara 100 y 1000 descendientes.",
      "predictionLabel": "Mi predicción",
      "step2": "02 / INVESTIGA",
      "investigateTitle": "De los alelos parentales a la evidencia de la descendencia",
      "modeLabel": "Modo de investigación",
      "mono": "Un gen · Chícharos",
      "di": "Dos genes · Chícharos",
      "snap": "Dominancia incompleta",
      "mystery": "Progenitor misterioso",
      "monoNote": "R representa la forma de la semilla. Un progenitor [[heterozygous|heterocigoto]] (Rr) puede formar gametos R o r.",
      "diNote": "R/r representa la forma; Y/y, el color. La distribución independiente produce cuatro tipos de gametos igualmente probables en RrYy.",
      "snapNote": "Dominancia incompleta: RR = rojo, RW = rosa, WW = blanco. R y W abrevian Cᴿ y Cᵂ. Los alelos no se mezclan ni desaparecen.",
      "mysteryNote": "Un progenitor de semillas lisas es RR o Rr. Crúzalo con rr e infiere su [[genotype|genotipo]] a partir de la descendencia.",
      "chooseParents": "A / ELIGE PROGENITORES",
      "parent1": "Progenitor 1",
      "parent2": "Progenitor 2",
      "unknownParent": "Liso · genotipo oculto",
      "gameteHelp": "Selecciona todos los tipos de [[gamete|gametos]] posibles de cada progenitor. Cada gameto tiene un alelo por gen. Los encabezados repetidos representan rutas igualmente probables.",
      "parent1Gametes": "Gametos del progenitor 1",
      "parent2Gametes": "Gametos del progenitor 2",
      "checkGametes": "Comprobar gametos",
      "gametesRight": "Correcto. Cada gameto seleccionado lleva un alelo por gen.",
      "gametesWrong": "Inténtalo de nuevo. Incluye todos los tipos posibles con un alelo por gen. RR es un genotipo, no un gameto de un solo gen.",
      "buildCross": "B / CONSTRUYE EL CRUCE",
      "boardTitle": "El tablero de posibilidades",
      "fillBoard": "Mostrar cuadro completo",
      "boardHelp": "Elige una casilla, combina sus dos gametos y comprueba el [[genotype|genotipo]] descendiente. Cada casilla tiene la misma [[probability|probabilidad]] en este modelo.",
      "boardScroll": "Cuadro de Punnett; desplázate horizontalmente para ver el cruce de dos genes",
      "checkCell": "Comprobar casilla",
      "cellPrompt": "Casilla {n}: {a} + {b}",
      "cellLabel": "Casilla {n}, gametos {a} y {b}: {g}",
      "unfilled": "sin completar",
      "cellRight": "Correcto: {a} + {b} → {g}. Fenotipo: {p}.",
      "cellWrong": "Revisa qué alelo viene de cada progenitor. Mantén juntos los dos alelos de cada gen.",
      "squareSummary": "{n}/{total} casillas completas. Cada casilla representa 1/{total} de los resultados previstos.",
      "testPrediction": "C / PON A PRUEBA LA PREDICCIÓN",
      "sampleTitle": "Deja que el azar forme la descendencia",
      "sampleHelp": "Compara las probabilidades del [[phenotype|fenotipo]] con los conteos observados. Cambia solo el tamaño de muestra para investigar la variación del muestreo.",
      "sampleSize": "Descendientes en esta muestra",
      "run": "Generar descendientes",
      "pause": "Pausar",
      "resume": "Continuar",
      "reset": "Reiniciar misma semilla",
      "newTrial": "Nueva prueba",
      "seedLabel": "Semilla",
      "setSeed": "Semilla reproducible de prueba",
      "applySeed": "Aplicar semilla",
      "copyLink": "Copiar enlace de prueba",
      "export": "Exportar evidencia CSV",
      "progressLabel": "Descendientes revelados",
      "ready": "Listo. La misma semilla y configuración producen la misma secuencia.",
      "running": "{n} de {total} descendientes revelados",
      "complete": "Muestra completa: {n} descendientes. Una nueva prueba cambia el azar, no las reglas de herencia.",
      "paused": "En pausa en {n} de {total}. Continúa para seguir.",
      "seedError": "Usa una semilla entera de 0 a 4294967295.",
      "copied": "Enlace copiado. Incluye la configuración y semilla, no tus respuestas escritas.",
      "copyFail": "Copia la dirección del navegador para compartir la prueba.",
      "exported": "CSV de evidencia descargado. Los conteos son descendientes; las probabilidades no tienen unidades.",
      "offspringNote": "Se ilustran los últimos 24 descendientes revelados. La tabla cuenta a todos.",
      "evidenceTitle": "Evidencia de fenotipos",
      "phenotypeHeader": "Fenotipo",
      "predicted": "Probabilidad prevista",
      "expected": "Conteo esperado (n × p)",
      "observed": "Conteo observado",
      "proportion": "Proporción observada",
      "genotypeEvidence": "Inspeccionar conteos y predicciones de genotipos",
      "genotypeHeader": "Genotipo",
      "probabilityNote": "Un alelo [[dominant|dominante]] afecta el fenotipo del heterocigoto; no es más fuerte ni necesariamente más común. Un alelo [[recessive|recesivo]] se puede heredar. Un conteo previsto es un promedio de muchas muestras, no una cuota.",
      "compareTrials": "D / COMPARA LA EVIDENCIA",
      "graphTitle": "¿Una muestra mayor estabiliza la proporción?",
      "focalNote": "Sigue el fenotipo {p}. Las líneas horizontales muestran probabilidades previstas. Se conservan hasta seis pruebas recientes por modo; usa Vista de gráfica para inspeccionar muestras pequeñas.",
      "mysteryFocal": "Sigue los descendientes rugosos. Compara la hipótesis RR (0) con Rr (0.5); una muestra pequeña sin rugosos no demuestra RR.",
      "xLabel": "Descendientes muestreados (conteo)",
      "yLabel": "Proporción observada (0–1)",
      "trial": "Prueba {id} · semilla {seed} · {cross} · n={n}",
      "theory": "Previsto · {cross}",
      "trialLog": "Registro y configuración de pruebas",
      "mysteryHelp": "Cruza el progenitor desconocido con rr [[homozygous|homocigoto]] recesivo. Un descendiente rugoso descarta RR en este modelo; una muestra solo de lisos puede coincidir con ambas hipótesis. Propón una explicación antes de revelar la respuesta.",
      "hypothesis": "Mi hipótesis del genotipo",
      "choose": "Elige…",
      "reason": "Evidencia de mi afirmación",
      "reveal": "Revelar genotipo parental",
      "mysteryRevealed": "Progenitor oculto: {g}. Con rr, la probabilidad prevista de rugosos es {p}. Evalúa tu afirmación con los conteos y la incertidumbre.",
      "mysteryBoard": "El cuadro permanece cubierto hasta que reveles al progenitor. Genera descendientes primero y compara ambas hipótesis.",
      "rrHyp": "Si desconocido = RR",
      "RrHyp": "Si desconocido = Rr",
      "step3": "03 / EXPLICA",
      "explainTitle": "Usa dos pruebas para explicar",
      "explainHelp": "Formula una afirmación, cita conteos y proporciones de dos pruebas y conecta la evidencia con la separación de alelos y la [[probability|probabilidad]]. Explica por qué una muestra pequeña puede diferir del cuadro. ¿Qué omite el modelo?",
      "explanationLabel": "Afirmación, evidencia y razonamiento",
      "step4": "04 / COMPRUEBA LO QUE SABES",
      "checksHeading": "¿Qué respalda la evidencia?",
      "footer": "Sciesmic Cuadros de Punnett 1.1.1 · Modelo idealizado de herencia.",
      "round": "Liso",
      "wrinkled": "Rugoso",
      "round_yellow": "Liso amarillo",
      "round_green": "Liso verde",
      "wrinkled_yellow": "Rugoso amarillo",
      "wrinkled_green": "Rugoso verde",
      "red": "Rojo",
      "pink": "Rosa",
      "white": "Blanco",
      "total": "Total",
      "noneYet": "Aún no hay muestra",
      "row": "Gameto del progenitor 2",
      "column": "Gameto del progenitor 1",
      "exportNotebook": "Exportar cuaderno del laboratorio",
      "startFresh": "Empezar de nuevo",
      "freshTitle": "¿Empezar una nueva investigación?",
      "freshHelp": "Esto borra el trabajo guardado de este laboratorio en este navegador. Exporta primero tu cuaderno si quieres conservarlo.",
      "cancelFresh": "Conservar mi trabajo",
      "confirmFresh": "Borrar y empezar de nuevo",
      "saved": "Guardado en este navegador. Exporta tu cuaderno para llevarlo contigo.",
      "restored": "Trabajo guardado restaurado. Una muestra sin terminar se restaura en pausa.",
      "storageUnavailable": "No se puede guardar en este navegador. Mantén esta pestaña abierta y exporta tu cuaderno.",
      "notebookExported": "Cuaderno descargado con tus escritos, configuración y evidencia conservada de todos los modos.",
      "notebookTitle": "Cuaderno del laboratorio de cuadros de Punnett",
      "notebookIntro": "Tu trabajo y evidencia registrados. Los genotipos misteriosos sin revelar permanecen ocultos.",
      "printNotebook": "Imprimir cuaderno",
      "notebookSettings": "Configuración y práctica",
      "notebookReasoning": "Explicaciones de casillas",
      "notebookChecks": "Mis respuestas de comprobación",
      "submitted": "Enviada",
      "notSubmitted": "Sin enviar",
      "notebookNoWriting": "No se registró una respuesta.",
      "familyEyebrow": "EMPIEZA AQUÍ / FAMILIAS PEQUEÑAS",
      "familyTitle": "Tres familias. El mismo cruce Rr × Rr.",
      "familyHelp": "Genera cada familia de cuatro y luego compara muestras mayores. Las semillas numeradas reproducen estos resultados al azar; no cambian las reglas de herencia.",
      "familyButton": "Generar familia {n} · semilla {seed}",
      "familyRow": "Familia {n}",
      "familyColumn": "Familia / semilla",
      "familyProgress": "{n}/3 familias pequeñas registradas. ¿Qué cambia aunque los progenitores sean iguales?",
      "familyDone": "Tres familias pequeñas registradas. Compara 100 y luego 1000 descendientes; la probabilidad prevista de rugosos sigue en 0.25. Una muestra mayor no siempre está más cerca.",
      "family100": "Comparar 100 descendientes · semilla 41",
      "family1000": "Comparar 1000 descendientes · semilla 41",
      "practiceLabel": "Configuración de práctica",
      "guided": "Práctica guiada",
      "challenge": "Desafío",
      "guidedNote": "Los encabezados están visibles. Sigue un alelo de cada progenitor para comprobar una casilla.",
      "challengeNote": "Envía los gametos correctos para descubrir los encabezados. Luego comprueba una casilla y explica sus alelos parentales antes de mostrar el cuadro completo.",
      "challengeBoard": "Desafío: elige y comprueba los gametos de ambos progenitores para descubrir el tablero.",
      "cellReasonLabel": "Explica qué alelo viene de cada progenitor",
      "reasonNeeded": "Agrega tu explicación de los alelos antes de comprobar esta casilla del desafío.",
      "challengeCellRight": "Genotipo correcto: {g}. Tu explicación está registrada; compárala con los gametos de la fila y la columna.",
      "challengeRevealHint": "Completa y explica una casilla del desafío para habilitar el cuadro completo.",
      "revealRequirements": "Antes de revelar: termina una muestra con esta semilla, elige RR o Rr y escribe tu evidencia.",
      "revealReady": "Muestra, afirmación y evidencia registradas. Ya puedes revelar al progenitor.",
      "alreadyRevealed": "Genotipo parental revelado",
      "allRoundExamples": "Comparar dos casos con solo lisos",
      "allRoundHelp": "Cada caso genera cuatro descendientes de un progenitor liso desconocido cruzado con rr. Registra una afirmación y evidencia por separado y luego revela cada progenitor.",
      "allRoundA": "Generar caso A con solo lisos",
      "allRoundB": "Generar caso B con solo lisos",
      "allRoundReasoning": "Si el progenitor fuera Rr, cuatro descendientes lisos aún tendrían probabilidad (1/2)⁴ = 1/16. Solo lisos puede coincidir con ambas hipótesis; un descendiente rugoso excluye RR en este modelo.",
      "zoomLabel": "Vista de gráfica · conteo de descendientes",
      "zoomAuto": "Ajustar a todas las muestras registradas",
      "zoom4": "Primeros 4 descendientes",
      "zoom16": "Primeros 16 descendientes",
      "zoom100": "Primeros 100 descendientes",
      "zoom1000": "Primeros 1000 descendientes",
      "zoomNote": "Se muestran los descendientes 0–{n}. El zoom solo cambia la vista; toda la evidencia sigue en el registro y cuaderno. El filtro de pruebas mantiene esta escala.",
      "notebookCells": "Trabajo en las casillas de Punnett",
      "notebookPractice": "Configuración de práctica",
      "notebookCell": "Casilla y gametos",
      "notebookEntry": "Mi genotipo elegido",
      "notebookChecked": "Genotipo mostrado después de comprobar o completar",
      "notebookNoCells": "No se registró trabajo en las casillas.",
      "notebookCheckChoice": "Mi respuesta elegida",
      "notebookNoChecks": "No se registraron respuestas de comprobación.",
      "notebookCorrect": "Correcta.",
      "notebookRevisit": "Revisa esta respuesta."
    }
  }
};
