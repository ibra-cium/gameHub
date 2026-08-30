export const LEVELS = [
  {
    id: 1,
    act: 'skin',
    name: 'Stratum Corneum',
    objective: { type: 'patrol', debrisCount: 6 },
    bodyCellCount: 8,
    spawns: [],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.0,
    currentStrength: 0.0,
    intro: 'Cellular debris along epidermal surface.'
  },
  {
    id: 2,
    act: 'skin',
    name: 'Micro-Abrasion',
    objective: { type: 'patrol', debrisCount: 10 },
    bodyCellCount: 10,
    spawns: [],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.0,
    currentStrength: 0.0,
    intro: 'Dispersed necrotic debris across tissue boundary.'
  },
  {
    id: 3,
    act: 'skin',
    name: 'Wound Margin',
    objective: { type: 'purge' },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 3 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.0,
    currentStrength: 0.0,
    intro: 'Bacteria at the wound edge.'
  },
  {
    id: 4,
    act: 'skin',
    name: 'Follicular Ingress',
    objective: { type: 'purge' },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 5 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.0,
    currentStrength: 0.0,
    intro: 'Bacterial colony localized along epithelial groove.'
  },
  {
    id: 5,
    act: 'skin',
    name: 'Foreign Body',
    objective: { type: 'patrol', debrisCount: 8 },
    bodyCellCount: 6,
    spawns: [
      { type: 'splinter', count: 2 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.0,
    currentStrength: 0.0,
    intro: 'Foreign inorganic shards embedded in superficial dermal layer.'
  },
  {
    id: 6,
    act: 'skin',
    name: 'Puncture Site',
    objective: { type: 'purge' },
    bodyCellCount: 6,
    spawns: [
      { type: 'bacteria', count: 6 },
      { type: 'splinter', count: 2 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.0,
    currentStrength: 0.0,
    intro: 'Microbial cluster swarming contaminated puncture wound.'
  },
  {
    id: 7,
    act: 'skin',
    name: 'Dermal Containment',
    objective: { type: 'contain', maxInfected: 5 },
    bodyCellCount: 12,
    spawns: [
      { type: 'bacteria', count: 4 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.03,
    currentStrength: 0.0,
    intro: 'Pathogens approaching healthy tissue cells. Prevent systemic spread.'
  },
  {
    id: 8,
    act: 'skin',
    name: 'Viral Transfection',
    objective: { type: 'purge' },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 4 },
      { type: 'virus', count: 2 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.04,
    currentStrength: 0.0,
    intro: 'Motile viral vectors penetrating microvascular junction.'
  },
  {
    id: 9,
    act: 'skin',
    name: 'Complement Delay',
    objective: { type: 'survive', duration: 40, spawnInterval: 4.0 },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 2 },
      { type: 'virus', count: 1 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.03,
    currentStrength: 0.0,
    intro: 'Sustained pathogen influx. Maintain cell integrity until antibody surge.'
  },
  {
    id: 10,
    act: 'skin',
    name: 'Tissue Triage',
    objective: { type: 'contain', maxInfected: 3 },
    bodyCellCount: 10,
    spawns: [
      { type: 'bacteria', count: 5 },
      { type: 'virus', count: 2 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.04,
    currentStrength: 0.0,
    intro: 'Mixed pathogens breaching cellular barrier. Limit tissue necrosis.'
  },
  {
    id: 11,
    act: 'skin',
    name: 'Parasitic Incursion',
    objective: { type: 'purge' },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 6 },
      { type: 'virus', count: 3 },
      { type: 'parasite', count: 2 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.05,
    currentStrength: 0.0,
    intro: 'Fast parasitic contaminants extracting bio-mass from local tissue.'
  },
  {
    id: 12,
    act: 'skin',
    name: 'Epidermal Breach',
    objective: { type: 'purge' },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 8 },
      { type: 'virus', count: 4 },
      { type: 'parasite', count: 3 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.06,
    currentStrength: 0.0,
    intro: 'Full-thickness breach. Neutralize multi-strain pathogen surge.'
  },
  {
    id: 13,
    act: 'bloodstream',
    name: 'Arterial Ingress',
    objective: { type: 'patrol', debrisCount: 8 },
    bodyCellCount: 8,
    spawns: [],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.04,
    currentStrength: 0.6,
    intro: 'Entering the arterial stream. Flow drag active.'
  },
  {
    id: 14,
    act: 'bloodstream',
    name: 'First Breach',
    objective: { type: 'purge' },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 6 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.08,
    currentStrength: 0.8,
    intro: 'Bacterial colonies swept into vascular lumen.'
  },
  {
    id: 15,
    act: 'bloodstream',
    name: 'Turbulent Margin',
    objective: { type: 'purge' },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 6 },
      { type: 'virus', count: 2 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.10,
    currentStrength: 1.0,
    intro: 'High-velocity flow. Pathogens riding stream lanes.'
  },
  {
    id: 16,
    act: 'bloodstream',
    name: 'Capillary Gate',
    objective: { type: 'contain', maxInfected: 3 },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 3 },
      { type: 'virus', count: 4 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.12,
    currentStrength: 0.7,
    intro: 'Viruses latching onto capillary endothelial cells. Triage active infection.'
  },
  {
    id: 17,
    act: 'bloodstream',
    name: 'Vascular Outbreak',
    objective: { type: 'contain', maxInfected: 2 },
    bodyCellCount: 9,
    spawns: [
      { type: 'bacteria', count: 2 },
      { type: 'virus', count: 6 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.14,
    currentStrength: 0.85,
    intro: 'Rapid viral transfection surge. Prioritize infected cells over combat.'
  },
  {
    id: 18,
    act: 'bloodstream',
    name: 'Endothelial Siege',
    objective: { type: 'contain', maxInfected: 2 },
    bodyCellCount: 10,
    spawns: [
      { type: 'bacteria', count: 4 },
      { type: 'virus', count: 5 },
      { type: 'parasite', count: 2 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.15,
    currentStrength: 0.9,
    intro: 'Mixed pathogen wave breaching vessel wall. Contain cellular necrosis.'
  },
  {
    id: 19,
    act: 'bloodstream',
    name: 'Erythrocyte Transit',
    objective: { type: 'escort' },
    bodyCellCount: 6,
    spawns: [
      { type: 'bacteria', count: 5 },
      { type: 'virus', count: 2 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.12,
    currentStrength: 0.8,
    intro: 'Vulnerable red blood cell in transit. Defend against stream predators.'
  },
  {
    id: 20,
    act: 'bloodstream',
    name: 'Crosscurrent Escort',
    objective: { type: 'escort' },
    bodyCellCount: 6,
    spawns: [
      { type: 'bacteria', count: 6 },
      { type: 'virus', count: 3 },
      { type: 'parasite', count: 2 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.15,
    currentStrength: 1.1,
    intro: 'Heavy crosscurrent dragging the carrier. Clear pursuit lanes.'
  },
  {
    id: 21,
    act: 'bloodstream',
    name: 'Thrombus Marauders',
    objective: { type: 'purge' },
    bodyCellCount: 8,
    spawns: [
      { type: 'parasite', count: 5 },
      { type: 'bacteria', count: 4 }
    ],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.16,
    currentStrength: 0.9,
    intro: 'Fast parasites siphoning cellular mass. Intercept before edge escape.'
  },
  {
    id: 22,
    act: 'bloodstream',
    name: 'Septic Current',
    objective: { type: 'contain', maxInfected: 3 },
    bodyCellCount: 8,
    spawns: [
      { type: 'parasite', count: 4 },
      { type: 'virus', count: 4 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.18,
    currentStrength: 1.0,
    intro: 'Parasites distracting defense while viral strains infect host cells.'
  },
  {
    id: 23,
    act: 'bloodstream',
    name: 'Vessel Sweep',
    objective: { type: 'patrol', debrisCount: 12 },
    bodyCellCount: 6,
    spawns: [
      { type: 'parasite', count: 3 },
      { type: 'bacteria', count: 3 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.14,
    currentStrength: 1.2,
    intro: 'Clear particulate thrombus fragments under high hemodynamic shear.'
  },
  {
    id: 24,
    act: 'bloodstream',
    name: 'Vascular Nidus',
    objective: { type: 'hunt' },
    bodyCellCount: 8,
    spawns: [],
    spawnMode: 'wave',
    timeLimit: null,
    vitalityDrain: 0.20,
    currentStrength: 0.8,
    intro: 'Spore nidus localized in deep vascular lumen. Follow bio-radar pulse.'
  },
  {
    id: 25,
    act: 'bloodstream',
    name: 'Deep Lumen Core',
    objective: { type: 'hunt' },
    bodyCellCount: 10,
    spawns: [
      { type: 'parasite', count: 2 },
      { type: 'virus', count: 2 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.25,
    currentStrength: 1.1,
    intro: 'Massive pathogen reproductive core. Navigate strong currents to destroy it.'
  },
  {
    id: 26,
    act: 'bloodstream',
    name: 'Arterial Collapse',
    objective: { type: 'contain', maxInfected: 1 },
    bodyCellCount: 10,
    spawns: [
      { type: 'virus', count: 7 },
      { type: 'bacteria', count: 6 },
      { type: 'parasite', count: 3 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.28,
    currentStrength: 1.2,
    intro: 'Critical containment threshold. A single lost cell triggers vessel collapse.'
  },
  {
    id: 27,
    act: 'bloodstream',
    name: 'Systolic Surge',
    objective: { type: 'survive', duration: 45, spawnInterval: 2.2 },
    bodyCellCount: 8,
    spawns: [
      { type: 'bacteria', count: 4 },
      { type: 'virus', count: 3 },
      { type: 'parasite', count: 3 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.22,
    currentStrength: 1.3,
    intro: 'High-frequency systolic pulse. Survive until hemodynamic stabilization.'
  },
  {
    id: 28,
    act: 'bloodstream',
    name: 'The Great Embolism',
    objective: { type: 'contain', maxInfected: 2 },
    bodyCellCount: 12,
    spawns: [
      { type: 'bacteria', count: 8 },
      { type: 'virus', count: 6 },
      { type: 'parasite', count: 4 },
      { type: 'splinter', count: 3 }
    ],
    spawnMode: 'trickle',
    timeLimit: null,
    vitalityDrain: 0.35,
    currentStrength: 1.4,
    intro: 'ACT FINALE: Multi-strain systemic embolism. Total defensive triage required.'
  }
];
