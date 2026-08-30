export const BALANCE = {
  host: {
    maxVitality: 100, // Maximum vitality points of the host
    baseDrainPerActiveEnemy: 0.05, // Vitality drain per second per living enemy
    drainWhilePlayerDead: 2.0, // Additional vitality drain per second while player is dead/respawning
    failPenalty: 15, // Host vitality penalty applied when an objective fails
    regenPerClearedLevel: 8 // Host vitality recovered upon completing a level
  },
  player: {
    radius: 42, // Base collision and visual radius in pixels
    speed: 340, // Normal movement speed in pixels per second
    dashSpeed: 980, // Dash speed in pixels per second
    maxHp: 100, // Maximum health points
    invulnerableDuration: 0.8, // Invulnerability duration after taking hit (seconds)
    respawnDelay: 3.0, // Delay before marrow respawn occurs (seconds)
    respawnFormDuration: 0.4, // Soft-body membrane formation duration on respawn (seconds)
    respawnInvulnerability: 1.5, // Invulnerability duration granted upon marrow respawn (seconds)
    dashCooldown: 1.5, // Cooldown between dashes (seconds)
    dashDuration: 0.22, // Duration of dash impulse (seconds)
    attackCooldown: 0.32, // Cooldown between attacks (seconds)
    attackDamage: 25, // Damage dealt per pseudopod strike
    attackDuration: 0.26, // Total strike animation duration (seconds)
    attackReach: 65, // Base reach distance of pseudopod strike
    attackReachExtend: 60, // Maximum dynamic extension during strike
    attackRadius: 52, // Hit circle radius of attack impact
    numPoints: 28, // Number of vertices in soft-body membrane
    bodyMargin: 20, // World boundary clamping margin
    damageSpringDeflect: 6.0, // Inward soft-body spring impulse on taking damage
    damageSpringRandom: 4.0, // Random extra spring deflection variation on taking damage
    damageShakeIntensity: 12, // Screen shake intensity on taking damage
    damageShakeDuration: 0.3, // Screen shake duration on taking damage (seconds)
    dashShakeIntensity: 7, // Screen shake intensity on dash
    dashShakeDuration: 0.22, // Screen shake duration on dash (seconds)
    dashSquashX: 2.4, // Body stretch along dash vector
    dashSquashY: 0.45, // Body compress perpendicular to dash vector
    attackSquashX: 0.65, // Squash factor on attack windup
    attackSquashY: 1.4, // Stretch factor on attack windup
    engulfDuration: 0.45, // Duration of phagocytosis engulfing sequence (seconds)
    engulfSpeedMultiplier: 0.40, // Movement speed multiplier during engulf
    engulfOverlapRadius: 1.0, // Contact radius multiplier to trigger engulf on weakened enemy
    engulfSwellImpulse: 20.0, // Outward soft-body spring velocity impulse on engulf completion
    engulfCameraShakeIntensity: 3.0, // Subtle camera nudge on engulf completion
    engulfCameraShakeDuration: 0.15, // Camera shake duration on engulf completion (seconds)
    engulfParticleCount: 16, // Particle count in closure ring
    engulfParticleSpeed: 4.0, // Particle outward speed in closure ring
    engulfArmReach: 55.0, // Outward reach of wrapping pseudopod lobes during engulf
    engulfArmWidth: 0.55, // Angular half-width in radians of each wrapping lobe
    engulfLipAngle: 0.68, // Angular half-separation of the two lobes (radians)
    engulfPocketDepth: 32.0, // Inward membrane depression depth behind engulfed target
    mass: {
      perBacteria: 3, // Mass gained when engulfing a weakened bacterium
      perVirus: 2, // Mass gained when engulfing a weakened virus
      perParasite: 1, // Mass gained when engulfing a weakened parasite
      max: 30, // Maximum mass capacity limit
      interpSpeed: 4.5, // Exponential interpolation rate for smooth stat scaling
      radiusScale: 1.7, // Max radius multiplier at maximum mass (1.7x)
      speedScale: 0.6, // Movement speed multiplier at maximum mass (0.6x)
      maxHpScale: 1.8, // Maximum health points multiplier at maximum mass (1.8x)
      reachScale: 1.5, // Pseudopod strike and reach multiplier at maximum mass (1.5x)
      dashCooldownScale: 1.4, // Dash cooldown duration multiplier at maximum mass (1.4x)
      wobbleFreqScale: 0.45, // Soft-body wobble frequency multiplier at maximum mass (heavier slosh)
      wobbleAmpScale: 2.0, // Soft-body wobble amplitude multiplier at maximum mass (deeper deformation)
      sagAmp: 14.0 // Soft-body trailing sag deflection along movement vector at maximum mass
    },
    pseudopods: [
      { baseAngleOffset: -0.4, wobbleSpeed: 2.2, phase: 0 }, // Upper left pseudopod
      { baseAngleOffset: 0.0, wobbleSpeed: 2.8, phase: 1.5 }, // Central left pseudopod
      { baseAngleOffset: 0.4, wobbleSpeed: 2.5, phase: 3.0 }, // Central right pseudopod
      { baseAngleOffset: 0.8, wobbleSpeed: 1.9, phase: 4.5 } // Lower right pseudopod
    ],
    vent: {
      minMass: 3, // Minimum mass required to trigger a vent burst
      cooldown: 4.0, // Cooldown timer between vent activations (seconds)
      speedBoostDuration: 1.2, // Duration of post-vent speed boost (seconds)
      speedBoostMultiplier: 1.3, // Movement speed multiplier during post-vent boost
      baseRadius: 80, // Shockwave radius in pixels at minimum mass (3)
      maxRadius: 360, // Maximum shockwave radius in pixels at maximum mass (30)
      baseDamage: 15, // Damage dealt to enemies caught in shockwave at minimum mass
      maxDamage: 120, // Maximum damage dealt to enemies at maximum mass
      baseKnockback: 280, // Knockback impulse imparted to enemies at minimum mass
      maxKnockback: 650, // Knockback impulse imparted to enemies at maximum mass
      squashX: 0.35, // Inward radial compression factor on vent trigger
      squashY: 1.85, // Outward radial stretch factor on vent trigger
      springImpulse: 24.0, // Inward soft-body spring velocity impulse on vent
      particleCountBase: 14, // Minimum particle count in vent release burst
      particleCountMax: 45, // Maximum particle count in vent release burst at max mass
      cameraShakeBase: 4.0, // Camera shake intensity at minimum mass
      cameraShakeMax: 14.0, // Camera shake intensity at maximum mass
      cameraShakeDuration: 0.25 // Camera shake duration on vent (seconds)
    }
  },
  bacteria: {
    radius: 32, // Collision and visual radius in pixels
    speed: 105, // Movement speed in pixels per second
    hp: 70, // Health points
    maxHp: 70, // Maximum health points
    damage: 18, // Contact damage dealt to player
    numPoints: 20, // Soft-body membrane vertex count
    flagellaCount: 6, // Number of trailing flagella appendages
    flagellaMinLen: 18, // Base length of flagella
    flagellaRandLen: 12, // Random extra length of flagella
    flagellaMinSpeed: 4, // Base wave animation speed for flagella
    flagellaRandSpeed: 3, // Random extra wave speed for flagella
    wanderSpeed: 3, // Sinusoidal wandering oscillation speed
    wanderAmplitude: 0.35, // Wandering angle deviation in radians
    steerLerp: 0.08, // Steering agility interpolation factor
    hitStunDecay: 0.9, // Velocity friction multiplier when stunned
    rxMult: 1.35, // Horizontal radius multiplier for capsule shape
    ryMult: 0.85, // Vertical radius multiplier for capsule shape
    wobbleSpeed: 4, // Membrane wobble frequency
    wobbleAmp: 2.5, // Membrane wobble amplitude in pixels
    dnaOscillationSpeed: 3, // Nucleoid DNA animation speed
    dnaOscillationAmp: 6, // Nucleoid DNA wave height
    splitInterval: 9.0, // Interval in seconds between bacteria fission splits
    splitMaxGeneration: 2, // Maximum generation cap for bacteria (generation 2 bacteria never split)
    splitSizeMultiplier: 0.75, // Radius and HP multiplier applied to offspring per generation
    splitDamageDelay: 4.0, // Delay in seconds after taking damage before bacteria can resume splitting
    splitAnimDuration: 0.6, // Duration of binary fission elongation and pinch separation animation (seconds)
    splitTellDuration: 1.5, // Duration of pre-split swelling and hyper-wobble tell (seconds)
    splitPushSpeed: 140, // Outward separation impulse velocity between the two halves (pixels/sec)
    splitParticleCount: 12 // Particle spray count emitted on soft pop fission
  },
  virus: {
    radius: 26, // Collision and capsid radius in pixels
    speed: 135, // Normal movement speed in pixels per second
    hp: 60, // Health points
    maxHp: 60, // Maximum health points
    damage: 22, // Contact damage dealt to player
    numSpikes: 10, // Number of surface glycoprotein spikes
    spikeMinLen: 14, // Minimum spike length
    spikeRandLen: 6, // Random additional spike length
    spikeMinWobble: 3, // Minimum spike wobble rate
    spikeRandWobble: 2, // Random additional spike wobble rate
    dashCooldownMin: 2.0, // Minimum surge cooldown timer (seconds)
    dashCooldownRand: 1.5, // Random extra surge cooldown timer (seconds)
    surgeSpeed: 480, // Speed during surge burst in pixels/sec
    surgeDuration: 0.35, // Duration of surge dash in seconds
    surgeTriggerDistance: 320, // Player proximity distance triggering surge
    surgeSquashX: 1.6, // Squash stretch factor on surge
    surgeSquashY: 0.6, // Squash compress factor on surge
    surgeCooldownReset: 2.8, // Base cooldown after completing surge (seconds)
    surgeTelegraphDuration: 0.4, // Windup telegraph duration in seconds before surge launch
    surgeTelegraphSquashX: 0.65, // Inward radial compression during surge telegraph windup
    surgeTelegraphSquashY: 1.35, // Lateral expansion during surge telegraph windup
    seekRadius: 480, // Detection radius in pixels for seeking healthy body cells over player
    latchDuration: 3.0, // Time in seconds required to infect a latched body cell
    latchCooldown: 1.8, // Cooldown delay in seconds after being knocked off before virus can re-latch
    latchedDamageMultiplier: 2.0, // Damage multiplier taken by virus while latched to a cell
    latchGripDepth: 0.35, // Grip depth overlap ratio on body cell surface
    latchBeamWidthMin: 2.5, // Minimum tether beam width in pixels
    latchBeamWidthMax: 6.5, // Maximum tether beam width at full infection charge
    pursuitLerp: 0.1, // Normal steering agility interpolation factor
    hitStunDecay: 0.88 // Velocity friction multiplier when stunned
  },
  parasite: {
    radius: 18, // Head segment collision radius in pixels
    speed: 240, // Slithering pursuit speed in pixels per second
    hp: 35, // Health points
    maxHp: 35, // Maximum health points
    damage: 12, // Contact damage dealt to player when player has 0 mass
    segments: 5, // Visual segment count
    historyLength: 15, // Trailing position history buffer length
    slitherSpeed: 8, // Slither oscillation frequency
    slitherAmplitude: 0.55, // Slither angle deflection amplitude
    steerLerp: 0.18, // Slithering steering interpolation factor
    hitStunDecay: 0.85, // Velocity friction multiplier when stunned
    squashSpeedFactorX: 0.7, // Stretch response to current velocity
    squashSpeedFactorY: 0.4, // Compress response to current velocity
    stealAmount: 4, // Amount of mass stolen from player on contact
    fleeSpeed: 420, // Increased movement speed in pixels per second when fleeing with mass
    fleeSlitherSpeed: 16, // Fast slither oscillation frequency while fleeing
    fleeSlitherAmplitude: 0.75, // Slither angle amplitude while fleeing
    fleeSteerLerp: 0.12, // Steering interpolation factor toward nearest world boundary
    bulgeScale: 0.65, // Maximum body and segment radius expansion multiplier per stolen mass ratio
    fleeTrailInterval: 0.035, // Interval in seconds between bright flee trail particle emissions
    escapeMargin: 16, // Distance in pixels from world border triggering escape despawn
    warningArrowMargin: 40, // Viewport edge margin for off-screen HUD warning arrow
    warningArrowSize: 18, // Base triangle indicator size in pixels
    warningArrowPulseSpeed: 9.0 // Pulsing frequency of the off-screen warning arrow
  },
  pickup: {
    radius: 9, // Collision and visual radius of dropped mass pellet
    magnetRadius: 110, // Proximity radius where player vacuum attraction triggers
    magnetSpeed: 360, // Suction impulse speed toward the player (pixels/sec)
    bobSpeed: 4.5, // Idle vertical floating bob frequency
    bobAmp: 3.5, // Idle bobbing amplitude in pixels
    burstMinSpeed: 50, // Minimum ejection scattering speed on drop (pixels/sec)
    burstMaxSpeed: 140, // Maximum ejection scattering speed on drop (pixels/sec)
    friction: 0.94 // Friction drag damping on dropped pickups
  },
  enemy: {
    engulfThreshold: 0.30, // HP ratio below which enemy enters weakened state
    weakenedSpeedMultiplier: 0.25, // Movement speed multiplier when weakened
    weakenedRadiusMultiplier: 0.85, // Radius deflation multiplier when weakened
    weakenedTransitionDuration: 0.30, // Duration to interpolate into weakened appearance (seconds)
    weakenedPulseSpeed: 3.2, // Pulsing outline oscillation frequency
    weakenedWobbleSpeedMult: 0.35, // Soft-body wobble speed multiplier when weakened (limp)
    weakenedWobbleAmpMult: 2.2, // Soft-body wobble amplitude multiplier when weakened (loose)
    weakenedOutlineWidth: 2.0 // Outline stroke width in pixels
  },
  enemyBase: {
    radius: 24, // Fallback enemy collision radius
    speed: 120, // Fallback enemy movement speed
    hp: 50, // Fallback enemy health points
    maxHp: 50, // Fallback enemy max health points
    damage: 15, // Fallback enemy contact damage
    numPoints: 16, // Fallback enemy mesh vertex count
    flashDuration: 0.15, // Hit flash duration in seconds
    hitStunDuration: 0.18, // Stun duration when receiving damage (seconds)
    knockbackVelocity: 220, // Knockback impulse velocity
    hitShakeIntensity: 6, // Camera shake intensity on taking hit
    hitShakeDuration: 0.18, // Camera shake duration on hit (seconds)
    deathShakeIntensity: 9, // Camera shake intensity on enemy death
    deathShakeDuration: 0.22, // Camera shake duration on death (seconds)
    hitSquashX: 0.6, // Hit impact horizontal squash
    hitSquashY: 1.5, // Hit impact vertical stretch
    squashRecovery: 0.15, // Squash spring recovery rate per frame
    playerPushback: 140 // Pushback impulse received when colliding with player
  },
  levelRunner: {
    levelClearDelay: 1.6, // Pause duration before next level begins (seconds)
    spawnPadding: 120, // Arena edge margin for enemy spawn coordinates
    trickleInterval: 1.2 // Default interval between trickle enemy spawns (seconds)
  },
  particles: {
    defaultFriction: 0.96, // Default particle velocity drag
    defaultLife: 1.0, // Default particle lifespan (seconds)
    defaultSize: 6, // Default particle radius in pixels
    burstFriction: 0.94, // Standard burst particle friction
    burstMinLife: 0.3, // Burst particle minimum lifespan
    burstRandLife: 0.5, // Burst particle random additional lifespan
    shockwaveDuration: 0.35 // Shockwave expansion duration (seconds)
  },
  audio: {
    masterVolume: 0.32, // Master output gain level (0.0 to 1.0)
    vent: {
      startFreq: 340, // High starting release frequency in Hz
      endFreq: 1100, // Sharp high-pitched sweep peak in Hz
      duration: 0.26, // Release audio duration in seconds
      volume: 0.55 // Release burst sound volume
    },
    ventDenied: {
      freq: 110, // Low soft dull frequency in Hz for denied vent
      duration: 0.14, // Denied tone duration in seconds
      volume: 0.28 // Denied cue volume level
    },
    engulf: {
      startFreq: 75, // Starting low sine pitch in Hz for suction sound
      endFreq: 240, // Ending rising pitch in Hz for closure suction
      duration: 0.42, // Duration of engulf sound sweep (seconds)
      volume: 0.50 // Audio volume gain
    },
    enemyWeakened: {
      startFreq: 145, // Initial pitch in Hz for deflating low tone
      endFreq: 42, // Final pitch in Hz for deflating low tone
      duration: 0.28, // Audio duration in seconds
      volume: 0.48 // Sound cue volume level
    },
    parasiteSteal: {
      startFreq: 180, // Siphon screech start pitch in Hz
      midFreq: 640, // High-pitched suction peak in Hz
      endFreq: 290, // Settling frequency in Hz
      duration: 0.32, // Siphon audio duration in seconds
      volume: 0.60 // Siphon sound volume level
    },
    parasiteEscape: {
      startFreq: 320, // Edge exit start frequency in Hz
      endFreq: 80, // Descending pitch in Hz into tissue wall
      duration: 0.38, // Audio duration in seconds
      volume: 0.45 // Sound volume level
    },
    pickupCollect: {
      note1: 587.33, // D5 bright initial ping in Hz
      note2: 880.00, // A5 harmonic octave ring in Hz
      duration: 0.22, // Chime duration in seconds
      volume: 0.38 // Collection chime volume
    },
    heartbeat: {
      baseGain: 0.12, // Standard volume gain for heartbeat
      faintGain: 0.05, // Reduced volume gain when host is critically low (<0.15)
      thump1Freq: 55, // Low sine base frequency in Hz for first thump (lub)
      thump2Freq: 48, // Low sine base frequency in Hz for second thump (dub)
      thump2Delay: 0.18, // Time delay between first and second thump (seconds)
      thump2VolumeRatio: 0.65, // Relative gain of second thump compared to first
      bpmCalm: 60, // Heartbeat BPM at healthy vitality (>0.75)
      bpmElevated: 100, // Heartbeat BPM approaching intermediate stress (0.40)
      bpmTachycardia: 130, // Heartbeat BPM in high stress / arrhythmia zone (0.15 - 0.40)
      bpmFailing: 40, // Heartbeat BPM when failing and critically low (<0.15)
      bpmLerpSpeed: 0.45, // Interpolation speed factor for smooth tempo transitions over seconds
      jitterAmount: 0.06 // Random timing variation in seconds for irregular rhythm
    }
  },
  hud: {
    hostRevealDuration: 1.2, // Fade-in animation duration for host vitality bar reveal (seconds)
    hostWarningThreshold: 0.6, // Ratio threshold below which host bar shifts from calm to warning
    hostCriticalThreshold: 0.25, // Ratio threshold below which host bar shifts to pure red critical
    enemyIndicatorMargin: 34, // Viewport screen margin for off-screen enemy indicators in pixels
    enemyIndicatorSize: 11, // Size of enemy direction pointer chevron in pixels
    enemyIndicatorPulseSpeed: 4.5, // Subtle breathing pulse speed of enemy indicators
    enemyIndicatorWeakenedPulseSpeed: 7.5 // Accelerated pulsing speed for weakened (engulfable) enemies
  },
  touch: {
    joystickRadius: 54, // Maximum displacement radius of the floating joystick in pixels
    joystickDeadzone: 6, // Movement deadzone in pixels to prevent jitter
    joystickFollowDistance: 95, // Distance at which floating joystick base begins following the touch point
    autoAimRadius: 460, // Search radius for auto-targeting enemies when using mobile strike button
    autoAimAngleWeight: 0.45 // Weight prioritizing enemies in movement direction over distance
  },
  screens: {
    hostDeathFadeDuration: 2.0, // Slow fade to near black on host death (seconds)
    hostDeathTextDelay: 1.8, // Delay before text and restart button appear (seconds)
    introCardDuration: 2.5, // Hold duration for level intro card (seconds)
    levelCompleteDelay: 1.5, // Delay before loading next level on completion (seconds)
    levelFailedDelay: 1.6 // Delay before retrying failed level (seconds)
  },
  environment: {
    // Act I: Skin & Tissue (collagen strands, dust motes, gentle lighting, histological stroma)
    stromaNodeCount: 28, // Number of out-of-focus background deep cellular/stroma bodies
    stromaMinRadius: 45, // Minimum radius for background stroma nodes in pixels
    stromaRandRadius: 55, // Random additional radius for stroma nodes
    stromaDriftSpeedMin: 2, // Minimum ultra-slow parallax drift speed
    stromaDriftSpeedMax: 6, // Maximum ultra-slow parallax drift speed

    collagenStrandCount: 50, // Number of drifting foreground/midground collagen fibers
    collagenDeepStrandCount: 36, // Number of deep fibrous matrix bundles
    collagenMinLength: 160, // Minimum collagen curve length in pixels
    collagenRandLength: 260, // Random extra length for collagen fibers
    collagenDriftSpeedMin: 3, // Minimum slow drift speed in pixels/sec
    collagenDriftSpeedMax: 10, // Maximum slow drift speed in pixels/sec
    collagenWobbleSpeed: 0.7, // Gentle wave frequency for collagen curvature
    collagenWobbleAmp: 22, // Curvature displacement amplitude in pixels
    collagenMinWidth: 2.2, // Minimum fiber line stroke width
    collagenRandWidth: 4.0, // Random extra stroke width for fibers

    lipidDropletCount: 35, // Number of floating refractive lipid micro-vesicles
    lipidDropletMinRadius: 5, // Minimum radius for lipid micro-droplets
    lipidDropletRandRadius: 10, // Random extra radius for lipid droplets
    lipidDropletSpeedMin: 3, // Minimum drift speed for lipid droplets
    lipidDropletSpeedMax: 9, // Maximum drift speed for lipid droplets

    causticRibbonCount: 8, // Number of sweeping fluid caustic light ribbons
    causticRibbonSpeed: 8, // Fluid caustic translation speed
    causticRibbonWidth: 90, // Caustic light band width in pixels

    dustMoteCount: 90, // Number of slow drifting dust particles in tissue
    dustMoteSpeedMin: 5, // Minimum slow upward drift speed
    dustMoteSpeedMax: 14, // Maximum slow upward drift speed
    dustMoteSizeMin: 1.5, // Minimum dust mote radius in pixels
    dustMoteSizeMax: 3.5, // Maximum dust mote radius in pixels
    dustMoteWobbleSpeed: 1.1, // Brownian oscillation rate for motes
    dustMoteWobbleAmp: 0.8, // Brownian horizontal drift amplitude
    topLightHeightRatio: 0.50, // Height fraction of arena bathed in warm top light
    tissueWallThickness: 42, // Act I boundary tissue wall cushion thickness
    tissueWallWaveSpeed: 1.2, // Act I boundary gentle undulation speed
    tissueWallWaveAmp: 6, // Act I boundary gentle undulation amplitude

    // Act II: Bloodstream (erythrocytes, floaters, vascular walls)
    rbcCount: 90, // Number of background flowing red blood cells
    deepRbcCount: 60, // Number of deep out-of-focus background erythrocytes
    floaterCount: 180, // Number of background micro-floaters
    floaterSpeedMin: 16, // Minimum ambient particle motion speed
    floaterSpeedMax: 38, // Maximum ambient particle motion speed
    wallThickness: 46, // Tissue vessel boundary wall thickness in pixels
    wallWaveSpeed: 2.2, // Boundary wall organic pulse speed
    wallWaveAmp: 6, // Boundary wall organic pulse amplitude in pixels
    endothelialCellLength: 52, // Procedural endothelial cell facet length along vessel wall
    endothelialNucleusRadius: 3.5 // Endothelial cell nucleus marker radius
  },
  bodyCell: {
    radius: 34, // Base collision and visual radius in pixels
    numPoints: 24, // Soft-body membrane vertex count
    organelleCount: 6, // Internal cytoplasmic organelle vesicles count
    driftSpeedMin: 14, // Minimum drift speed in pixels per second
    driftSpeedMax: 28, // Maximum drift speed in pixels per second
    healthyWobbleSpeed: 1.8, // Gentle organic membrane wobble speed
    healthyWobbleAmp: 2.4, // Gentle organic membrane wobble amplitude in pixels
    infectionDuration: 6.0, // Total duration from infection to death and enemy spawn (seconds)
    colorShiftDuration: 2.0, // Duration to interpolate towards enemy color (seconds)
    healableRatio: 0.40, // Fraction of infection duration during which player can heal cell (first 40%)
    infectedWobbleSpeed: 8.0, // Spasming wobble speed while infected
    infectedWobbleAmp: 4.2, // Spasming wobble amplitude in pixels while infected
    twitchIntervalMin: 0.08, // Minimum twitch impulse interval (seconds)
    twitchIntervalRand: 0.14, // Random extra twitch interval (seconds)
    twitchJitter: 3.5, // Twitch jitter offset intensity in pixels
    deadRadiusMult: 0.70, // Deflation radius multiplier when dead
    deadWobbleSpeed: 0.4, // Limp wobble speed when dead
    deadWobbleAmp: 0.8, // Limp wobble amplitude when dead
    deadSpeedMult: 0.20, // Drift speed multiplier when dead
    healBurstParticleCount: 16 // Particles in heal burst
  },
  debris: {
    baseRadius: 16, // Base collision radius for cellular debris
    numPoints: 12, // Number of soft-body contour vertices
    driftSpeedMin: 6, // Minimum gentle drift speed
    driftSpeedMax: 18, // Maximum gentle drift speed
    wobbleSpeed: 1.4, // Debris organic wobble frequency
    wobbleAmp: 1.6, // Debris organic wobble amplitude
    collectParticleCount: 14 // Particle burst count on collecting debris
  },
  splinter: {
    radius: 26, // Collision radius for sharp splinter shard
    contactDamage: 22, // Damage dealt to player on contact
    engulfDurationMultiplier: 2.0, // Engulf duration multiplier (takes twice the normal engulf duration)
    engulfOverlapRadius: 1.25, // Proximity radius overlap multiplier to initiate engulf on splinter
    aspectRatio: 2.6, // Length to width aspect ratio of the shard
    facetCount: 6, // Number of sharp angular facets
    deflectParticleCount: 6, // Particles emitted on weapon attack deflection
    shatterParticleCount: 16 // Particles emitted on engulf completion
  },
  redBloodCell: {
    radius: 38, // Collision and membrane radius in pixels
    numPoints: 24, // Soft-body membrane vertex count
    hp: 100, // Default health points
    speed: 42, // Default movement speed along path in pixels/sec
    wobbleSpeed: 2.2, // Membrane wobble frequency
    wobbleAmp: 2.5, // Membrane wobble amplitude in pixels
    dimpleRatio: 0.45, // Inner concave dimple radius ratio
    flashDuration: 0.15, // Damage flash duration in seconds
    knockbackDecay: 0.88, // Velocity damping on knockback
    hitShakeIntensity: 6, // Camera shake intensity on taking damage
    hitShakeDuration: 0.18, // Camera shake duration on taking damage
    deathShakeIntensity: 14, // Camera shake intensity on death
    deathShakeDuration: 0.35, // Camera shake duration on death
    deathParticleCount: 30, // Particles emitted on death
    exitReachDistance: 30 // Proximity distance to final waypoint to register exit
  },
  infectionSource: {
    radius: 64, // Collision and core visual radius in pixels
    numPoints: 28, // Soft-body undulating contour vertex count
    hp: 300, // Default max health points
    defaultSpawnInterval: 3.8, // Default interval between spawned enemies in seconds
    wobbleSpeed: 3.2, // Soft-body pulsation frequency
    wobbleAmp: 4.8, // Soft-body pulsation amplitude in pixels
    tendrilCount: 8, // Outer anchoring biological tendrils
    tendrilLength: 38, // Outward reach of tendrils in pixels
    sporeCount: 6, // Surface pulsating spore pods
    flashDuration: 0.15, // Hit flash duration in seconds
    hitShakeIntensity: 7, // Camera shake intensity on receiving damage
    hitShakeDuration: 0.18, // Camera shake duration on hit
    deathShakeIntensity: 18, // Camera shake intensity on source destruction
    deathShakeDuration: 0.45, // Camera shake duration on destruction
    deathParticleCount: 45, // Spore burst particle count on death
    deathShockwaveRadius: 220 // Death shockwave radius in pixels
  },
  objectives: {
    contain: {
      defaultMaxInfected: 4 // Fallback maximum allowed dead body cells before failure
    },
    survive: {
      defaultDuration: 30, // Default duration to survive in seconds
      defaultSpawnInterval: 2.0, // Default interval between enemy spawns in seconds
      tensionThreshold: 10.0, // Time remaining threshold in seconds to activate rising tension audio
      tensionPulseIntervalMin: 0.35, // Accelerated audio pulse interval at final seconds
      tensionPulseIntervalMax: 1.0 // Initial audio pulse interval at 10s remaining
    },
    patrol: {
      defaultDebrisCount: 10, // Default number of debris items to spawn
      calmParticleSpeedFactor: 0.45, // Floater and background RBC speed multiplier during calm levels
      calmWaveSpeedFactor: 0.5 // Vessel wall pulsing speed multiplier during calm levels
    },
    escort: {
      defaultHp: 100, // Default escort red blood cell health
      defaultSpeed: 42, // Default escort red blood cell transit speed
      arrowMargin: 45, // Screen border inset margin for off-screen directional arrow in pixels
      arrowSize: 18, // Pointer arrow size in pixels
      arrowPulseSpeed: 5.0, // Directional pointer pulsing frequency
      exitZoneRadius: 55 // Radius of destination exit portal beacon in pixels
    },
    hunt: {
      defaultWorldScale: 1.8, // Multiplier for arena width and height in hunt mode
      defaultSourceHp: 300, // Default health of the hidden infection source
      minPulseInterval: 0.28, // Fast proximity pulse interval at closest range (seconds)
      maxPulseInterval: 2.2, // Slow proximity pulse interval at maximum range (seconds)
      pulseArcRadius: 50, // Screen-edge directional pulse arc size in pixels
      pulseFadeDuration: 0.45, // Duration of directional screen pulse decay (seconds)
      minSpawnDistanceRatio: 0.60 // Minimum distance from center as ratio of half arena size
    }
  },
  current: {
    strength: 95, // Base current velocity magnitude in pixels per second
    playerMassResistance: 0.75, // Player mass resistance factor: at maximum mass (30), player experiences (1 - 0.75) = 25% of current force
    enemyResistance: 0.25, // Pathogen mass resistance factor against current drift
    streakCount: 30, // Number of visual current streamline filaments
    streakMinLength: 80, // Minimum streamline filament length in pixels
    streakMaxLength: 170, // Maximum streamline filament length in pixels
    streakSpeedFactor: 1.15, // Visual streak translation speed multiplier
    laneCount: 5, // Number of seeded flow lanes across the arena cross-section
    laneUndulationAmp: 0.20, // Angle undulation amplitude along stream path (radians)
    laneUndulationFreq: 0.0016 // Spatial wave frequency along stream path
  }
};

