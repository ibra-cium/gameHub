# CONTEXT.md — IMMUNE

The design bible. `AGENTS.md` says *how* to work. This file says *what* we are building and *why*.

---

## 1. One-line pitch

You are a single white blood cell defending one human body across 100 levels, and the human is dying.

---

## 2. The central idea

Most action games give the player one health bar. IMMUNE has two.

| Bar | Belongs to | What happens at zero |
|-----|-----------|---------------------|
| **Cell HP** | The white blood cell you control | You are destroyed and respawn from the bone marrow after a short delay |
| **Host Vitality** | The human body you live inside | Run over. Permanent. |

Your own death is cheap because bodies make millions of white blood cells every day. The host's death is the real stake, and the player never sees the host. That gap is the emotional core of the game.

**Design rule:** never explain the second bar in a tutorial. Let it sit full and untouched for the first ten levels, then let the player watch it drop for the first time.

---

## 3. Design pillars

Every feature must serve at least one of these. If it serves none, cut it.

1. **You are a blob, not a soldier.** Squash, stretch, engulf, swell, split. If the mechanic would work on a rectangle with a gun, it is the wrong mechanic.
2. **The body is a place, not a backdrop.** Environments have rules: currents push you, lungs breathe, fever speeds everything up.
3. **Neglect has a cost.** Germs have goals that are not the player. Ignoring them is always worse than fighting them.
4. **It gets darker, and the darkness is mechanical.** Not a colour filter. Vision shrinks, allies die, the heartbeat changes.
5. **Instant to play.** No launcher, no login, no loading screen. Open the page, press START.

---

## 4. Core loop

```
Enter level → read objective → fight / protect / contain
  → germs weaken → engulf them → gain mass
  → choose: stay lean and fast, or heavy and strong
  → clear objective → pick one mutation → next level
  → host vitality carries forward
```

---

## 5. Player mechanics

### 5.1 Movement
WASD or arrows. Mouse aims. Space dashes. Left click attacks. Virtual joystick and buttons on touch devices.

### 5.2 Attack — pseudopod strike
Extends a soft limb toward the cursor. Physical, not a projectile. Damage scales slightly with mass.

### 5.3 Engulf — phagocytosis (the signature mechanic)
When an enemy drops below its **engulf threshold** (30% HP by default) it goes limp, slows down and shifts colour. Dash into it or hold near it and your body wraps around it and absorbs it.

Absorbing gives mass. This is how a real white blood cell kills, and it makes the soft-body animation part of the gameplay instead of decoration.

### 5.4 Mass — the risk/reward dial
Every germ absorbed adds mass. Mass is the central trade-off:

| More mass | Less mass |
|-----------|-----------|
| More max HP | Faster movement |
| Longer pseudopod reach | Smaller hitbox |
| Heavier knockback | Faster dash recovery |
| Slower, bigger target | Fragile |

Press **Q** to vent mass: instantly shrink, release a damaging burst, get fast again. Venting is an escape tool and a panic button.

### 5.5 Death and respawn
Cell HP zero means you burst. After ~3 seconds a new cell arrives from the marrow at a random edge. The cost is that host vitality drains faster while you are gone, and any mass you were carrying is lost.

---

## 6. Enemies

| Enemy | Behaviour now | Behaviour to build |
|-------|--------------|-------------------|
| **Bacteria** | Slow chase | Multiplies. Splits into two smaller bacteria on a timer if left alive. |
| **Virus** | Chase with occasional surge | Latches onto a healthy body cell and converts it into a new enemy. Telegraphs its surge. |
| **Parasite** | Fast chase | Steals absorbed mass and runs for the map edge with it. |

Later acts add: **Fungus** (spreads a slowing carpet), **Toxin cloud** (area denial, cannot be killed, only outrun), **Prion** (corrupts your mutations), **Superbug boss** (splits when damaged).

---

## 7. Body cells

Neutral floating cells already exist in the environment renderer. Promote them to real entities. They can be healthy, infected or dead. They are the currency of the Contain and Escort objectives, and their state is the visual proof that the body is losing.

---

## 8. Objective types

Six objectives, reused across all seven acts. This is how we reach 100 levels without designing 100 arenas.

| Type | Rule | Feeling |
|------|------|---------|
| **Patrol** | Clear debris and dead cells. No enemies. | Calm. The daily chores. |
| **Purge** | Kill every germ. | Straight combat. |
| **Contain** | Stop infection spreading past N body cells. | Triage and priority. |
| **Escort** | Guide one red blood cell safely across the arena. | Tense, protective. |
| **Survive** | Hold out for a fixed time until backup arrives. | Endurance. |
| **Hunt** | Find the hidden infection source in a larger map. | Exploration. |

---

## 9. Acts

| Act | Levels | Environment | Mood | New mechanic |
|-----|--------|------------|------|--------------|
| I — Skin & Tissue | 1–12 | Warm, bright, cosy | Routine maintenance | Tutorial. Debris, splinters, minor cuts. |
| II — Bloodstream | 13–28 | Red currents, fast flow | First real war | Currents push entities. Virus infection begins. |
| III — Lungs | 29–44 | Pale, airy, rhythmic | Breathless | The arena expands and contracts on a breathing cycle. |
| IV — Gut | 45–60 | Dark green, crowded, messy | Overwhelmed | Bacterial overgrowth. Too many enemies at once. |
| V — Lymph Nodes | 61–74 | Cold blue, structured | Organised resistance | Allied cells you can summon. |
| VI — Sepsis | 75–90 | Grey, burning, chaotic | Collapse | Fever. Everything faster. Allies start dying. |
| VII — Blood-Brain Barrier | 91–100 | Near black, sparse, quiet | Last stand | Host vitality permanently low. No respawn grace. |

---

## 10. The descent — how darkness is expressed mechanically

- **Heartbeat audio.** A synthesised pulse under everything. Act I: slow and steady. Act IV: fast. Act VI: irregular. Act VII: faint. This is the host's health bar rendered as sound, and the player feels it before they read it.
- **Vision narrowing.** The camera view shrinks as host vitality drops. The body is shutting down, so you see less of it.
- **Environment decay.** Act I is full of healthy drifting cells. By Act VI they are husks.
- **Palette drift.** Each act shifts the base palette colder and darker. Handled entirely by `palettes.js`.
- **Fever.** Above a threshold of active infection, the whole arena heats up. Every entity, including the player, moves faster. Chaotic and hard to control.

---

## 11. Meta progression — mutations

After each cleared level, offer three random mutations. The player picks one. They persist for the run.

Thematically this is adaptive immunity, which is exactly what a real immune system does after an infection.

Examples: extra pseudopod so attacks hit twice, acid trail during dash, absorbing heals, slow-time below 25% HP, vent burst does double damage, engulf threshold raised to 45%.

---

## 12. Target architecture

```
immune/
├── AGENTS.md
├── CONTEXT.md
├── PROGRESS.md
├── README.md
├── index.html
├── style.css
├── docs/
│   ├── README.md
│   └── phases/
│       ├── README.md
│       └── phase-00 … phase-09.md
└── src/
    ├── README.md
    ├── main.js              entry point
    ├── config/              balance.js, palettes.js, constants.js
    ├── core/                Vec2, Rng, Camera, InputManager, Game, GameLoop
    ├── entities/            Entity, Player, Enemy, Bacteria, Virus, Parasite, BodyCell, Debris
    ├── systems/             ParticleSystem, AudioEngine, HostVitality, LevelRunner,
    │                        MutationSystem, ScoreSystem, SaveSystem, ScreenEffects
    ├── levels/              acts.js, levels.js, objectives/
    ├── render/              Environment, drawUtils, softBody
    └── ui/                  Hud, Screens, MutationPicker, ActMap
```

Every folder listed above owns a `README.md`. See `AGENTS.md` section 5.

---

## 13. Levels are data, not code

A level is a plain object. This is the single most important architectural decision in the project, because it is what makes 100 levels achievable.

```js
{
  id: 14,
  act: 'bloodstream',
  name: 'First Breach',
  objective: { type: 'contain', maxInfected: 4 },
  spawns: [
    { type: 'bacteria', count: 6 },
    { type: 'virus', count: 2 }
  ],
  spawnMode: 'trickle',        // 'wave' | 'trickle'
  timeLimit: null,             // seconds, or null
  vitalityDrain: 0.5,          // host vitality lost per second of active infection
  intro: 'Something got in through the cut.'
}
```

Adding a level means adding an object to an array. Never a new file, never a new class.

---

## 14. Build order and the scope warning

Phases 0 through 6 produce a **complete, shippable game**: 28 levels, three objective types, two acts, both health bars, mutations, save system.

Phase 8 adds levels 29–100, and it is almost pure content.

**Do not attempt Act III or later before Phase 6 is finished and the game is fun.** The most likely way this project dies is building toward 100 levels before 28 levels are good.

---

## 15. Glossary

| Term | Meaning |
|------|---------|
| **Host** | The human body. Never seen. Has the vitality bar. |
| **Cell HP** | The player's own health. Cheap. |
| **Mass** | Accumulated from engulfing. Drives the size trade-off. |
| **Engulf threshold** | HP percentage below which an enemy becomes absorbable. |
| **Vent** | Releasing mass for speed and a damage burst. |
| **Soft body** | The 28-point deforming mesh that draws the player. |
| **Act** | A group of levels sharing an environment, palette and mood. |
| **Objective** | The win condition of a single level. One of six types. |
| **Mutation** | A permanent run upgrade chosen between levels. |
