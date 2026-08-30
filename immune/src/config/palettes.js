// Shared base configurations for sub-palettes
const SHARED_PLAYER = {
  base: '#ffffff',
  membrane: '#e0f2fe',
  bodyGlow: ['rgba(235, 248, 255, 0.45)', 'rgba(186, 230, 253, 0.2)', 'rgba(186, 230, 253, 0)'],
  bodyGrad: ['#ffffff', '#f0f9ff', '#dbeafe', '#93c5fd'],
  pseudopodStem: '#e0f2fe',
  pseudopodTip: '#f8fafc',
  organelleLobe: 'rgba(96, 165, 250, 0.4)',
  granules: 'rgba(59, 130, 246, 0.55)',
  attackStrike: '#67e8f9',
  attackGlow: 'rgba(255, 255, 255, 0.8)',
  damageFlash: '#ff6b8b',
  deathBurst: '#ffffff',
  deathShockwave: '#ff4b6e',
  dashBurst: '#7dd3fc',
  dashShockwave: '#38bdf8',
  dashTrail: 'rgba(235, 245, 255, 0.65)',
  swimTrail: 'rgba(255, 255, 255, 0.4)',
  respawnStream: '#bae6fd',
  engulfRing: '#bae6fd',
  engulfVacuole: 'rgba(186, 230, 253, 0.45)',
  engulfVacuoleGrad: ['rgba(255, 255, 255, 0.25)', 'rgba(186, 230, 253, 0.45)', 'rgba(186, 230, 253, 0)'],
  engulfVacuoleBorder: 'rgba(224, 242, 254, 0.7)',
  ventShockwave: '#38bdf8',
  ventBurst: '#bae6fd',
  ventSpeedTrail: 'rgba(56, 189, 248, 0.75)'
};

const SHARED_ENEMY = {
  base: {
    blood: '#ffffff',
    accent: '#ffffff',
    healthBarBg: 'rgba(0, 0, 0, 0.65)',
    healthBarFill: '#ef4444',
    healthBarBorder: 'rgba(255, 255, 255, 0.3)',
    weakenedOutline: 'rgba(255, 255, 255, '
  },
  bacteria: {
    blood: '#86efac',
    accent: '#22c55e',
    flagella: '#4ade80',
    flash: ['#ffffff', '#ef4444'],
    grad: ['#bbf7d0', '#4ade80', '#15803d'],
    weakenedGrad: ['#f0fdf4', '#dcfce7', '#86efac'],
    membrane: '#22c55e',
    weakenedMembrane: '#86efac',
    weakenedFlagella: '#bbf7d0',
    weakenedOutline: 'rgba(134, 239, 172, ',
    nucleoid: 'rgba(21, 128, 61, 0.75)',
    weakenedNucleoid: 'rgba(134, 239, 172, 0.5)'
  },
  virus: {
    blood: '#e879f9',
    accent: '#c084fc',
    spikes: '#c084fc',
    spikeKnobs: '#f472b6',
    flash: ['#ffffff', '#f43f5e'],
    grad: ['#f5d0fe', '#c084fc', '#7e22ce'],
    weakenedGrad: ['#faf5ff', '#f3e8ff', '#d8b4fe'],
    membrane: '#e879f9',
    weakenedMembrane: '#d8b4fe',
    weakenedSpikes: '#d8b4fe',
    weakenedSpikeKnobs: '#fbcfe8',
    weakenedOutline: 'rgba(216, 180, 254, ',
    rna: '#fae8ff',
    weakenedRna: 'rgba(250, 232, 255, 0.6)',
    latchBeam: '#f472b6',
    latchBeamCore: '#ffffff',
    latchGlow: 'rgba(232, 121, 249, 0.85)',
    latchGrip: '#e879f9',
    telegraphGlow: 'rgba(244, 63, 94, 0.85)',
    telegraphSpikes: '#fb7185'
  },
  parasite: {
    blood: '#fde047',
    accent: '#f59e0b',
    tailSeg1: '#fde047',
    tailSeg2: '#d97706',
    weakenedTailSeg1: '#fef08a',
    weakenedTailSeg2: '#fde68a',
    tailFlash: '#ffffff',
    flash: ['#ffffff', '#ef4444'],
    grad: ['#fef08a', '#f59e0b', '#b45309'],
    weakenedGrad: ['#fffbeb', '#fef3c7', '#fde68a'],
    membrane: '#fbbf24',
    weakenedMembrane: '#fde68a',
    weakenedOutline: 'rgba(253, 230, 138, ',
    mouthHooks: '#ffffff',
    weakenedMouthHooks: 'rgba(255, 255, 255, 0.6)',
    stolenMassCore: '#38bdf8',
    stolenMassGlow: 'rgba(56, 189, 248, 0.85)',
    fleeTrail: '#fde047',
    fleeTrailGlow: 'rgba(253, 224, 71, 0.85)',
    warningArrow: '#fbbf24',
    warningArrowBorder: '#fef08a',
    warningArrowGlow: 'rgba(251, 191, 36, 0.85)'
  },
  indicator: {
    bacteria: '#4ade80',
    bacteriaBorder: '#bbf7d0',
    bacteriaGlow: 'rgba(74, 222, 128, 0.75)',
    virus: '#c084fc',
    virusBorder: '#f5d0fe',
    virusGlow: 'rgba(192, 132, 252, 0.75)',
    parasite: '#f59e0b',
    parasiteBorder: '#fef08a',
    parasiteGlow: 'rgba(245, 158, 11, 0.75)',
    weakened: '#38bdf8',
    weakenedBorder: '#ffffff',
    weakenedGlow: 'rgba(56, 189, 248, 0.85)'
  }
};

const SHARED_PICKUP = {
  core: '#ffffff',
  membrane: '#38bdf8',
  membraneGlow: 'rgba(56, 189, 248, 0.8)',
  innerGlow: 'rgba(186, 230, 253, 0.6)',
  trail: 'rgba(56, 189, 248, 0.6)',
  collectBurst: '#bae6fd',
  collectSparkle: '#ffffff'
};

const SHARED_HUD = {
  hpCritical: 'linear-gradient(90deg, #ef4444, #f87171)',
  hpNormal: 'linear-gradient(90deg, #4ade80, #38ef7d)',
  hostCalm: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
  hostWarning: 'linear-gradient(90deg, #fbbf24 0%, #f97316 100%)',
  hostCritical: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
  hostGlowCalm: 'rgba(56, 189, 248, 0.5)',
  hostGlowWarning: 'rgba(251, 191, 36, 0.5)',
  hostGlowCritical: 'rgba(239, 68, 68, 0.7)',
  massSegmentEmpty: 'rgba(255, 255, 255, 0.08)',
  massSegmentFilled: '#38bdf8',
  massSegmentGlow: 'rgba(56, 189, 248, 0.65)',
  massSegmentFull: '#f43f5e',
  massSegmentFullGlow: 'rgba(244, 63, 94, 0.75)',
  progressNormal: '#ff3355',
  progressWarning: '#fbbf24',
  progressCalm: '#38bdf8'
};

const SHARED_DEBRIS = {
  grad: ['#e2e8f0', '#94a3b8', '#475569'],
  membrane: '#64748b',
  glow: 'rgba(148, 163, 184, 0.25)',
  spots: 'rgba(30, 41, 59, 0.5)',
  collectBurst: '#94a3b8',
  sparkleBurst: '#f8fafc',
  deadHusk: ['#cbd5e1', '#64748b', '#334155'],
  dustMote: 'rgba(226, 232, 240, 0.75)'
};

const SHARED_SPLINTER = {
  body: '#78350f',
  facetDark: '#451a03',
  facetMid: '#92400e',
  facetLight: '#d97706',
  edge: '#fef3c7',
  edgeHighlight: '#ffffff',
  glow: 'rgba(245, 158, 11, 0.3)',
  grain: '#b45309',
  irritation: 'rgba(239, 68, 68, 0.4)',
  irritationCore: 'rgba(220, 38, 38, 0.65)',
  deflectBurst: '#fde68a',
  shatterBurst: '#fef08a'
};

const SHARED_PARTICLES = {
  defaultColor: '#ffffff'
};

const SHARED_CURRENT = {
  streak: 'rgba(255, 120, 140, ',
  streakGlow: 'rgba(255, 180, 200, ',
  laneLine: 'rgba(255, 100, 130, 0.04)'
};

const SHARED_RED_BLOOD_CELL = {
  grad: ['#ff8fa3', '#e11d48', '#881337'],
  membrane: '#be123c',
  dimple: 'rgba(76, 5, 25, 0.65)',
  dimpleRing: 'rgba(159, 18, 57, 0.4)',
  flash: ['#ffffff', '#ff4d6d'],
  blood: '#f43f5e',
  glow: 'rgba(244, 63, 94, 0.35)',
  exitRing: '#38bdf8',
  exitRingGlow: 'rgba(56, 189, 248, 0.4)',
  exitMarker: 'rgba(56, 189, 248, 0.15)',
  arrow: '#f43f5e',
  arrowGlow: 'rgba(244, 63, 94, 0.8)',
  arrowBorder: '#ffffff'
};

const SHARED_INFECTION_SOURCE = {
  grad: ['#f472b6', '#db2777', '#701a75'],
  membrane: '#9d174d',
  core: 'rgba(49, 10, 16, 0.9)',
  spores: '#f472b6',
  tendril: '#be185d',
  flash: ['#ffffff', '#ec4899'],
  blood: '#db2777',
  glow: 'rgba(219, 39, 119, 0.4)',
  pulseCue: 'rgba(244, 63, 94, ',
  pulseCueGlow: 'rgba(251, 113, 133, '
};

const SHARED_INFECTED_BODY_CELL = {
  spots: 'rgba(24, 24, 27, 0.85)',
  spotsFaint: 'rgba(24, 24, 27, 0.4)',
  healAura: 'rgba(56, 189, 248, 0.75)',
  healAuraGlow: 'rgba(56, 189, 248, 0.3)',
  bacteria: {
    grad: ['#dcfce7', '#4ade80', '#15803d'],
    membrane: '#22c55e',
    nucleus: 'rgba(21, 128, 61, 0.8)'
  },
  virus: {
    grad: ['#f3e8ff', '#c084fc', '#7e22ce'],
    membrane: '#a855f7',
    nucleus: 'rgba(126, 34, 206, 0.8)'
  },
  parasite: {
    grad: ['#fef3c7', '#f59e0b', '#b45309'],
    membrane: '#d97706',
    nucleus: 'rgba(180, 83, 9, 0.8)'
  },
  fallback: {
    grad: ['#fed7aa', '#ea580c', '#9a3412'],
    membrane: '#c2410c',
    nucleus: 'rgba(154, 52, 18, 0.8)'
  }
};

const SHARED_DEAD_BODY_CELL = {
  grad: ['#cbd5e1', '#64748b', '#334155'],
  membrane: '#475569',
  nucleus: 'rgba(15, 23, 42, 0.65)',
  spots: 'rgba(15, 23, 42, 0.45)'
};

export const ACT_PALETTES = {
  skin: {
    id: 'skin',
    name: 'Skin & Tissue',
    background: ['#fcd5ce', '#f8ad9d', '#f48472', '#b83b3b'],
    backgroundDeep: '#9f2a2b',
    stromaNode: 'rgba(224, 87, 83, 0.22)',
    stromaNodeGlow: 'rgba(248, 173, 157, 0.28)',
    stromaNodeRim: 'rgba(252, 213, 206, 0.35)',
    tissue: '#fde68a',
    tissueStrand: 'rgba(254, 240, 138, 0.55)',
    tissueStrandDeep: 'rgba(248, 113, 113, 0.35)',
    tissueStrandBright: 'rgba(255, 251, 235, 0.70)',
    tissueGlow: 'rgba(251, 191, 36, 0.22)',
    lipidDroplet: 'rgba(255, 237, 213, 0.40)',
    lipidDropletRim: 'rgba(253, 224, 71, 0.60)',
    lipidDropletCore: 'rgba(251, 146, 60, 0.25)',
    causticRibbon: 'rgba(255, 255, 255, 0.16)',
    causticRibbonGlow: 'rgba(254, 243, 199, 0.14)',
    dustMote: 'rgba(255, 251, 235, ',
    dustMoteGlow: 'rgba(253, 224, 71, ',
    lightGradientTop: ['rgba(255, 247, 237, 0.45)', 'rgba(254, 215, 170, 0.20)', 'rgba(248, 113, 113, 0)'],
    wallFill: '#f08080',
    wallBorder: '#cd5c5c',
    calmWallFill: '#f4978e',
    calmWallBorder: '#f08080',
    playerBody: '#ffffff',
    playerAccent: '#38bdf8',
    hudPrimary: '#38bdf8',
    hudWarning: '#fbbf24',
    bodyCell: {
      healthy: {
        grad: ['#ffffff', '#fffbeb', '#fef3c7', '#fed7aa'],
        membrane: '#f59e0b',
        membraneSub: 'rgba(251, 191, 36, 0.45)',
        nucleus: 'rgba(180, 83, 9, 0.85)',
        nucleusInner: 'rgba(120, 53, 15, 0.95)',
        nucleusGlow: 'rgba(245, 158, 11, 0.40)',
        organelle: 'rgba(217, 119, 6, 0.45)',
        glow: 'rgba(254, 243, 199, 0.45)'
      },
      infected: SHARED_INFECTED_BODY_CELL,
      dead: SHARED_DEAD_BODY_CELL,
      healBurst: '#38bdf8'
    },
    enemy: SHARED_ENEMY,
    player: SHARED_PLAYER,
    hud: SHARED_HUD,
    debris: SHARED_DEBRIS,
    splinter: SHARED_SPLINTER,
    particles: SHARED_PARTICLES,
    current: SHARED_CURRENT,
    redBloodCell: SHARED_RED_BLOOD_CELL,
    infectionSource: SHARED_INFECTION_SOURCE,
    pickup: SHARED_PICKUP,
    environment: {
      background: ['#fcd5ce', '#f8ad9d', '#f48472', '#b83b3b'],
      calmBackground: ['#ffe5d9', '#fcd5ce', '#f8ad9d', '#e05753'],
      floaterPrefix: 'rgba(254, 243, 199, ',
      calmFloaterPrefix: 'rgba(255, 250, 235, ',
      rbc: ['#fb7185', '#f43f5e'],
      calmRbc: ['#fda4af', '#fb7185'],
      rbcCenter: 'rgba(225, 29, 72, 0.35)',
      rbcParticleCenter: 'rgba(225, 29, 72, 0.28)',
      vesselFill: '#f08080',
      vesselBorder: '#cd5c5c',
      calmVesselFill: '#f4978e',
      calmVesselBorder: '#f08080'
    }
  },

  bloodstream: {
    id: 'bloodstream',
    name: 'Bloodstream',
    background: ['#28040a', '#170206', '#080002'],
    backgroundDeep: '#050001',
    tissue: '#991b2b',
    tissueStrand: 'rgba(185, 28, 48, 0.45)',
    tissueGlow: 'rgba(153, 27, 43, 0.25)',
    dustMote: 'rgba(255, 120, 150, ',
    lightGradientTop: ['rgba(140, 20, 35, 0.45)', 'rgba(65, 10, 18, 0.22)', 'rgba(8, 0, 2, 0)'],
    wallFill: '#3d0810',
    wallBorder: '#7a1422',
    wallEndothelium: '#9e1b2d',
    wallEndotheliumNucleus: '#500913',
    wallCapillaryGlow: 'rgba(255, 46, 91, 0.35)',
    calmWallFill: '#2c070c',
    calmWallBorder: '#5c101b',
    playerBody: '#ffffff',
    playerAccent: '#38bdf8',
    hudPrimary: '#38bdf8',
    hudWarning: '#fbbf24',
    bodyCell: {
      healthy: {
        grad: ['#fff1f2', '#fda4af', '#f43f5e', '#be123c'],
        membrane: '#ff2d55',
        membraneSub: 'rgba(255, 77, 109, 0.45)',
        nucleus: 'rgba(225, 29, 72, 0.85)',
        nucleusInner: 'rgba(159, 18, 57, 0.95)',
        nucleusGlow: 'rgba(255, 45, 85, 0.40)',
        organelle: 'rgba(244, 63, 94, 0.50)',
        glow: 'rgba(254, 205, 211, 0.40)'
      },
      infected: SHARED_INFECTED_BODY_CELL,
      dead: SHARED_DEAD_BODY_CELL,
      healBurst: '#38bdf8'
    },
    enemy: SHARED_ENEMY,
    player: SHARED_PLAYER,
    hud: SHARED_HUD,
    debris: SHARED_DEBRIS,
    splinter: SHARED_SPLINTER,
    particles: SHARED_PARTICLES,
    current: {
      streak: 'rgba(255, 55, 95, ',
      streakGlow: 'rgba(255, 140, 170, ',
      laneLine: 'rgba(255, 60, 95, 0.06)'
    },
    redBloodCell: SHARED_RED_BLOOD_CELL,
    infectionSource: SHARED_INFECTION_SOURCE,
    pickup: SHARED_PICKUP,
    environment: {
      background: ['#28040a', '#170206', '#080002'],
      calmBackground: ['#1a0407', '#0f0204', '#050001'],
      floaterPrefix: 'rgba(255, 140, 170, ',
      calmFloaterPrefix: 'rgba(210, 120, 145, ',
      rbc: ['#881320', '#aa192b'],
      rbcDeep: ['#42080f', '#560b14'],
      rbcHighlight: 'rgba(255, 100, 130, 0.45)',
      calmRbc: ['#59161c', '#6b1c24'],
      rbcCenter: 'rgba(10, 1, 2, 0.55)',
      rbcParticleCenter: 'rgba(10, 1, 2, 0.40)',
      vesselFill: '#3d0810',
      vesselBorder: '#7a1422',
      vesselEndothelium: '#9e1b2d',
      vesselEndotheliumNucleus: '#500913',
      vesselCapillaryGlow: 'rgba(255, 46, 91, 0.35)',
      calmVesselFill: '#2c070c',
      calmVesselBorder: '#5c101b'
    }
  },

  lungs: {
    id: 'lungs',
    name: 'Lungs',
    background: ['#f1f5f9', '#cbd5e1', '#94a3b8'],
    backgroundDeep: '#64748b',
    tissue: '#93c5fd',
    tissueStrand: 'rgba(147, 197, 253, 0.4)',
    tissueGlow: 'rgba(96, 165, 250, 0.15)',
    dustMote: 'rgba(226, 232, 240, ',
    lightGradientTop: ['rgba(255, 255, 255, 0.6)', 'rgba(241, 245, 249, 0.2)', 'rgba(241, 245, 249, 0)'],
    wallFill: '#94a3b8',
    wallBorder: '#64748b',
    calmWallFill: '#cbd5e1',
    calmWallBorder: '#94a3b8',
    playerBody: '#ffffff',
    playerAccent: '#38bdf8',
    hudPrimary: '#38bdf8',
    hudWarning: '#fbbf24',
    bodyCell: {
      healthy: {
        grad: ['#f0fdfa', '#ccfbf1', '#99f6e4'],
        membrane: '#5eead4',
        nucleus: 'rgba(13, 148, 136, 0.75)',
        nucleusInner: 'rgba(15, 118, 110, 0.85)',
        glow: 'rgba(204, 251, 241, 0.4)'
      },
      infected: SHARED_INFECTED_BODY_CELL,
      dead: SHARED_DEAD_BODY_CELL,
      healBurst: '#38bdf8'
    },
    enemy: SHARED_ENEMY,
    player: SHARED_PLAYER,
    hud: SHARED_HUD,
    debris: SHARED_DEBRIS,
    splinter: SHARED_SPLINTER,
    particles: SHARED_PARTICLES,
    current: SHARED_CURRENT,
    redBloodCell: SHARED_RED_BLOOD_CELL,
    infectionSource: SHARED_INFECTION_SOURCE,
    pickup: SHARED_PICKUP,
    environment: {
      background: ['#f1f5f9', '#cbd5e1', '#94a3b8'],
      calmBackground: ['#f8fafc', '#e2e8f0', '#cbd5e1'],
      floaterPrefix: 'rgba(203, 213, 225, ',
      calmFloaterPrefix: 'rgba(226, 232, 240, ',
      rbc: ['#64748b', '#475569'],
      calmRbc: ['#94a3b8', '#64748b'],
      rbcCenter: 'rgba(15, 23, 42, 0.3)',
      rbcParticleCenter: 'rgba(15, 23, 42, 0.25)',
      vesselFill: '#94a3b8',
      vesselBorder: '#64748b',
      calmVesselFill: '#cbd5e1',
      calmVesselBorder: '#94a3b8'
    }
  },

  gut: {
    id: 'gut',
    name: 'Gut',
    background: ['#14281d', '#0b1911', '#040b07'],
    backgroundDeep: '#020604',
    tissue: '#4ade80',
    tissueStrand: 'rgba(74, 222, 128, 0.35)',
    tissueGlow: 'rgba(34, 197, 94, 0.15)',
    dustMote: 'rgba(187, 247, 208, ',
    lightGradientTop: ['rgba(34, 197, 94, 0.35)', 'rgba(20, 40, 29, 0.15)', 'rgba(4, 11, 7, 0)'],
    wallFill: '#1b3829',
    wallBorder: '#2d5a42',
    calmWallFill: '#14281d',
    calmWallBorder: '#1e402f',
    playerBody: '#ffffff',
    playerAccent: '#38bdf8',
    hudPrimary: '#38bdf8',
    hudWarning: '#fbbf24',
    bodyCell: {
      healthy: {
        grad: ['#f0fdf4', '#dcfce7', '#86efac'],
        membrane: '#4ade80',
        nucleus: 'rgba(22, 101, 52, 0.8)',
        nucleusInner: 'rgba(20, 83, 45, 0.9)',
        glow: 'rgba(187, 247, 208, 0.35)'
      },
      infected: SHARED_INFECTED_BODY_CELL,
      dead: SHARED_DEAD_BODY_CELL,
      healBurst: '#38bdf8'
    },
    enemy: SHARED_ENEMY,
    player: SHARED_PLAYER,
    hud: SHARED_HUD,
    debris: SHARED_DEBRIS,
    splinter: SHARED_SPLINTER,
    particles: SHARED_PARTICLES,
    current: SHARED_CURRENT,
    redBloodCell: SHARED_RED_BLOOD_CELL,
    infectionSource: SHARED_INFECTION_SOURCE,
    pickup: SHARED_PICKUP,
    environment: {
      background: ['#14281d', '#0b1911', '#040b07'],
      calmBackground: ['#0d1d15', '#060e0a', '#020604'],
      floaterPrefix: 'rgba(134, 239, 172, ',
      calmFloaterPrefix: 'rgba(187, 247, 208, ',
      rbc: ['#1e3a2b', '#2d533e'],
      calmRbc: ['#162d22', '#224231'],
      rbcCenter: 'rgba(2, 6, 4, 0.4)',
      rbcParticleCenter: 'rgba(2, 6, 4, 0.3)',
      vesselFill: '#1b3829',
      vesselBorder: '#2d5a42',
      calmVesselFill: '#14281d',
      calmVesselBorder: '#1e402f'
    }
  },

  lymph: {
    id: 'lymph',
    name: 'Lymph Nodes',
    background: ['#0f172a', '#090e17', '#020617'],
    backgroundDeep: '#020617',
    tissue: '#38bdf8',
    tissueStrand: 'rgba(56, 189, 248, 0.35)',
    tissueGlow: 'rgba(14, 165, 233, 0.15)',
    dustMote: 'rgba(186, 230, 253, ',
    lightGradientTop: ['rgba(56, 189, 248, 0.35)', 'rgba(15, 23, 42, 0.15)', 'rgba(2, 6, 23, 0)'],
    wallFill: '#1e293b',
    wallBorder: '#334155',
    calmWallFill: '#0f172a',
    calmWallBorder: '#1e293b',
    playerBody: '#ffffff',
    playerAccent: '#38bdf8',
    hudPrimary: '#38bdf8',
    hudWarning: '#fbbf24',
    bodyCell: {
      healthy: {
        grad: ['#f0f9ff', '#e0f2fe', '#bae6fd'],
        membrane: '#7dd3fc',
        nucleus: 'rgba(3, 105, 161, 0.8)',
        nucleusInner: 'rgba(7, 89, 133, 0.9)',
        glow: 'rgba(186, 230, 253, 0.35)'
      },
      infected: SHARED_INFECTED_BODY_CELL,
      dead: SHARED_DEAD_BODY_CELL,
      healBurst: '#38bdf8'
    },
    enemy: SHARED_ENEMY,
    player: SHARED_PLAYER,
    hud: SHARED_HUD,
    debris: SHARED_DEBRIS,
    splinter: SHARED_SPLINTER,
    particles: SHARED_PARTICLES,
    current: SHARED_CURRENT,
    redBloodCell: SHARED_RED_BLOOD_CELL,
    infectionSource: SHARED_INFECTION_SOURCE,
    pickup: SHARED_PICKUP,
    environment: {
      background: ['#0f172a', '#090e17', '#020617'],
      calmBackground: ['#0a0f1d', '#050811', '#01030a'],
      floaterPrefix: 'rgba(186, 230, 253, ',
      calmFloaterPrefix: 'rgba(224, 242, 254, ',
      rbc: ['#1e293b', '#334155'],
      calmRbc: ['#0f172a', '#1e293b'],
      rbcCenter: 'rgba(2, 6, 23, 0.4)',
      rbcParticleCenter: 'rgba(2, 6, 23, 0.3)',
      vesselFill: '#1e293b',
      vesselBorder: '#334155',
      calmVesselFill: '#0f172a',
      calmVesselBorder: '#1e293b'
    }
  },

  sepsis: {
    id: 'sepsis',
    name: 'Sepsis',
    background: ['#291a1a', '#1a0d0d', '#0a0303'],
    backgroundDeep: '#050101',
    tissue: '#f97316',
    tissueStrand: 'rgba(249, 115, 22, 0.35)',
    tissueGlow: 'rgba(234, 88, 12, 0.15)',
    dustMote: 'rgba(254, 215, 170, ',
    lightGradientTop: ['rgba(249, 115, 22, 0.35)', 'rgba(41, 26, 26, 0.15)', 'rgba(10, 3, 3, 0)'],
    wallFill: '#3b2020',
    wallBorder: '#5c3131',
    calmWallFill: '#291a1a',
    calmWallBorder: '#3b2020',
    playerBody: '#ffffff',
    playerAccent: '#38bdf8',
    hudPrimary: '#38bdf8',
    hudWarning: '#fbbf24',
    bodyCell: {
      healthy: {
        grad: ['#fff7ed', '#ffedd5', '#fed7aa'],
        membrane: '#fb923c',
        nucleus: 'rgba(194, 65, 12, 0.8)',
        nucleusInner: 'rgba(154, 52, 18, 0.9)',
        glow: 'rgba(254, 215, 170, 0.35)'
      },
      infected: SHARED_INFECTED_BODY_CELL,
      dead: SHARED_DEAD_BODY_CELL,
      healBurst: '#38bdf8'
    },
    enemy: SHARED_ENEMY,
    player: SHARED_PLAYER,
    hud: SHARED_HUD,
    debris: SHARED_DEBRIS,
    splinter: SHARED_SPLINTER,
    particles: SHARED_PARTICLES,
    current: SHARED_CURRENT,
    redBloodCell: SHARED_RED_BLOOD_CELL,
    infectionSource: SHARED_INFECTION_SOURCE,
    pickup: SHARED_PICKUP,
    environment: {
      background: ['#291a1a', '#1a0d0d', '#0a0303'],
      calmBackground: ['#1d1111', '#110707', '#050101'],
      floaterPrefix: 'rgba(254, 215, 170, ',
      calmFloaterPrefix: 'rgba(255, 237, 213, ',
      rbc: ['#451a1a', '#5c2222'],
      calmRbc: ['#301212', '#421818'],
      rbcCenter: 'rgba(5, 1, 1, 0.4)',
      rbcParticleCenter: 'rgba(5, 1, 1, 0.3)',
      vesselFill: '#3b2020',
      vesselBorder: '#5c3131',
      calmVesselFill: '#291a1a',
      calmVesselBorder: '#3b2020'
    }
  },

  brain: {
    id: 'brain',
    name: 'Blood-Brain Barrier',
    background: ['#09090b', '#050507', '#000000'],
    backgroundDeep: '#000000',
    tissue: '#a1a1aa',
    tissueStrand: 'rgba(161, 161, 170, 0.25)',
    tissueGlow: 'rgba(113, 113, 122, 0.1)',
    dustMote: 'rgba(212, 212, 216, ',
    lightGradientTop: ['rgba(113, 113, 122, 0.25)', 'rgba(9, 9, 11, 0.1)', 'rgba(0, 0, 0, 0)'],
    wallFill: '#18181b',
    wallBorder: '#27272a',
    calmWallFill: '#09090b',
    calmWallBorder: '#18181b',
    playerBody: '#ffffff',
    playerAccent: '#38bdf8',
    hudPrimary: '#38bdf8',
    hudWarning: '#fbbf24',
    bodyCell: {
      healthy: {
        grad: ['#fafafa', '#f4f4f5', '#e4e4e7'],
        membrane: '#a1a1aa',
        nucleus: 'rgba(63, 63, 70, 0.8)',
        nucleusInner: 'rgba(39, 39, 42, 0.9)',
        glow: 'rgba(228, 228, 231, 0.3)'
      },
      infected: SHARED_INFECTED_BODY_CELL,
      dead: SHARED_DEAD_BODY_CELL,
      healBurst: '#38bdf8'
    },
    enemy: SHARED_ENEMY,
    player: SHARED_PLAYER,
    hud: SHARED_HUD,
    debris: SHARED_DEBRIS,
    splinter: SHARED_SPLINTER,
    particles: SHARED_PARTICLES,
    current: SHARED_CURRENT,
    redBloodCell: SHARED_RED_BLOOD_CELL,
    infectionSource: SHARED_INFECTION_SOURCE,
    pickup: SHARED_PICKUP,
    environment: {
      background: ['#09090b', '#050507', '#000000'],
      calmBackground: ['#050506', '#020203', '#000000'],
      floaterPrefix: 'rgba(161, 161, 170, ',
      calmFloaterPrefix: 'rgba(212, 212, 216, ',
      rbc: ['#18181b', '#27272a'],
      calmRbc: ['#09090b', '#18181b'],
      rbcCenter: 'rgba(0, 0, 0, 0.5)',
      rbcParticleCenter: 'rgba(0, 0, 0, 0.4)',
      vesselFill: '#18181b',
      vesselBorder: '#27272a',
      calmVesselFill: '#09090b',
      calmVesselBorder: '#18181b'
    }
  }
};

// Live palette reference exported across all systems.
// Mutating or reassigning via setActPalette propagates instantly.
export const PALETTE = JSON.parse(JSON.stringify(ACT_PALETTES.skin));

export function setActPalette(actKey) {
  const target = ACT_PALETTES[actKey] || ACT_PALETTES.skin;
  Object.keys(PALETTE).forEach((k) => delete PALETTE[k]);
  Object.assign(PALETTE, JSON.parse(JSON.stringify(target)));
  return PALETTE;
}
