# Phases 6–9

Phase 6 completes the shippable game. Phases 7 to 9 extend and finish it.

**Do not start Phase 8 until Phase 6 is done and levels 1–28 are genuinely fun.** See `CONTEXT.md` section 14.

---

# Phase 6 — Meta Progression

**Goal:** mutations, score, and saving. This is what makes players start a second run.

**Success test:** you finish a run, immediately start another, and play differently.

---

## T6.1 — Mutation system

**Prompt**

```text
## Task
Build the mutation system: permanent run upgrades chosen between levels.

## First
Read CONTEXT.md section 11.

## Requirements
1. Create src/systems/MutationSystem.js and src/config/mutations.js.
2. A mutation is data: { id, name, description, rarity, apply(player, game), tags }. No mutation-specific code outside mutations.js.
3. Ship at least 18 mutations across three groups:
   - Offence: extra pseudopod so attacks hit twice, longer reach, attacks apply a lingering weaken, vent burst doubled
   - Survival: absorbing heals, slow-time below 25% HP, longer invulnerability, dash grants brief invulnerability
   - Mass: higher engulf threshold, faster engulf, mass speed penalty halved, mass cap raised, split mass gain on kills
4. Mutations stack. Two copies of the same mutation are allowed unless tagged unique.
5. Store the active list on the run state so the save system can persist it.

## Acceptance criteria
- Each mutation has a visible or felt effect within one level
- No mutation makes the player strictly worse
- At least three mutations change how you play, not just your numbers

## Do not
- Put if-statements about specific mutation ids anywhere outside mutations.js

## When finished
Update src/systems/README.md, src/config/README.md, PROGRESS.md. Report in 5 lines or fewer.
```

---

## T6.2 — Mutation picker screen

**Prompt**

```text
## Task
Build the between-level mutation choice.

## Requirements
1. After each cleared level, present three random mutations. The player picks one. Rarity weights the draw.
2. Card design: name, one-line description, a small procedurally drawn icon on canvas. No image files.
3. Keyboard 1/2/3 and click both work. Touch works.
4. Show the player's currently held mutations as small icons along the bottom.
5. The choice must be fast. Target under 8 seconds for an experienced player.
6. Frame it as immune memory, not a shop. No currency, no prices.

## Acceptance criteria
- The picker never blocks the flow for more than a few seconds
- Held mutations are visible before choosing
- Three cards never contain a duplicate in the same draw

## When finished
Update src/ui/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

---

## T6.3 — Score and combo

**Prompt**

```text
## Task
Add scoring with a decaying combo multiplier.

## Requirements
1. Create src/systems/ScoreSystem.js. Points for kills, more for engulfs, bonus for cells saved, bonus for clearing without dying.
2. Combo multiplier rises with fast consecutive kills, decays over BALANCE.score.comboDecay seconds (default 3).
3. HUD: score top right, combo as a shrinking ring around the multiplier number so the decay is visible without reading.
4. End-of-run summary shows total score, levels cleared, germs destroyed, cells saved, times died.

## Acceptance criteria
- The combo ring makes you play faster without being told to
- Engulfing scores meaningfully more than killing

## When finished
Update PROGRESS.md. Report in 5 lines or fewer.
```

---

## T6.4 — Save system

**Prompt**

```text
## Task
Persist progress with localStorage.

## Requirements
1. Create src/systems/SaveSystem.js.
2. Persist: highest level reached, best score, total runs, per-act completion, and an in-progress run so a closed tab can resume.
3. Version the save schema. On a version mismatch, migrate or reset cleanly rather than crashing.
4. Wrap every localStorage call in try/catch. Private browsing and blocked storage must not break the game.
5. Add a reset button on the title screen with a confirmation step.

## Acceptance criteria
- Closing and reopening the tab mid-run resumes it
- Disabling localStorage in devtools does not break the game

## Do not
- Store anything except game progress
- Use any remote storage

## When finished
Update src/systems/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

---

## T6.5 — Act map screen

**Prompt**

```text
## Task
Build the act map: the player's view of the whole body.

## Requirements
1. A stylised anatomical map, drawn procedurally, showing the seven acts as regions of a body silhouette.
2. Completed acts are lit. The current act pulses. Locked acts are dark outlines only.
3. Regions visibly deteriorate as host vitality drops across a run.
4. Clicking an unlocked act starts at its first level. Show best score per act.
5. Reachable from the title screen and after any run ends.

## Acceptance criteria
- The map communicates the 100-level scope without a level list
- It reflects host vitality state

## When finished
Update src/ui/README.md, PROGRESS.md, set Phase 6 Done. Report in 5 lines or fewer.
```

---

# Phase 7 — The Descent

**Goal:** make the darkness mechanical instead of cosmetic. Read `CONTEXT.md` section 10 before every ticket here.

## T7.1 — Vision narrowing

```text
## Task
Shrink the player's view as host vitality drops.

## Requirements
1. Camera zoom and a soft vignette both scale with host vitality ratio.
2. Full vitality: current view. At 20% vitality: about 70% of the view area, with a heavy soft vignette.
3. Interpolate over several seconds. The player should notice it has happened, not watch it happen.
4. Add BALANCE.descent.visionMin so it can be tuned or disabled.

## Acceptance criteria
- At low vitality the arena genuinely feels claustrophobic
- The change never causes motion sickness or sudden jumps

## When finished
Update PROGRESS.md. Report in 5 lines or fewer.
```

## T7.2 — Environment decay

```text
## Task
Let the environment reflect the host's condition.

## Requirements
1. Background body cell density and colour are driven by host vitality: full and healthy at high vitality, sparse grey husks at low.
2. Ambient particle count drops and their movement slows as vitality falls.
3. Add drifting debris of dead cells at low vitality.
4. This is continuous, not per-act. Recovering vitality visibly recovers the environment.

## Acceptance criteria
- With the HUD hidden you can still estimate host vitality from the background alone

## When finished
Update src/render/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

## T7.3 — Fever

```text
## Task
Add the fever state.

## Requirements
1. When active infection load exceeds BALANCE.descent.feverThreshold, fever starts.
2. During fever: every entity including the player moves 1.35x faster, the palette shifts hot, a heat shimmer distorts the edges of the screen, and the heartbeat speeds up beyond its vitality-driven tempo.
3. Fever is neutral, not a penalty. Faster for the player too. Chaotic and hard to control.
4. Ends when infection load drops. Both transitions take about 2 seconds.

## Acceptance criteria
- Fever is instantly recognisable
- It is genuinely double-edged, not just harder

## When finished
Update PROGRESS.md. Report in 5 lines or fewer.
```

## T7.4 — Allied cells

```text
## Task
Add summonable allied immune cells for Act V onward.

## Requirements
1. Create src/entities/AllyCell.js: a smaller white blood cell with simple chase-and-attack AI, limited lifetime.
2. Summoned by spending mass, cost in BALANCE.ally.massCost. Another use for the mass economy.
3. Allies can die. In Act VI they die faster, which is the point.
4. Level data field alliesEnabled controls availability.

## Acceptance criteria
- Allies are useful but never do the work for you
- Losing allies in Act VI feels bad in the intended way

## When finished
Update src/entities/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

## T7.5 — Act palettes III to VII

```text
## Task
Author the five remaining act palettes and environments.

## Requirements
1. Palettes per CONTEXT.md section 9: Lungs pale and airy, Gut dark green and crowded, Lymph cold blue and structured, Sepsis grey and burning, Blood-Brain Barrier near black and sparse.
2. Act III environment breathes: world bounds expand and contract on a slow cycle, and entities are pushed by it.
3. Act VI environment is actively hostile looking: embers, ash-like particles, dead cells everywhere.
4. Act VII is quiet and mostly empty. Restraint is the effect.
5. Each act must be recognisable from a single screenshot.

## Acceptance criteria
- Seven screenshots, one per act, are all clearly different places
- The progression from I to VII reads as decline

## When finished
Update src/render/README.md, PROGRESS.md, set Phase 7 Done. Report in 5 lines or fewer.
```

---

# Phase 8 — Acts III to VII (Levels 29–100)

**Almost pure content. Do not start until Phase 6 is done and the game is fun.**

## T8.1 — New enemy types

```text
## Task
Add the four late-game enemy types from CONTEXT.md section 6.

## Requirements
1. Fungus: slow, spreads a growing carpet that slows anything standing on it. The carpet persists after death unless cleared.
2. ToxinCloud: cannot be damaged at all. Drifts. Deals damage over time in its radius. Only answer is to move.
3. Prion: does not attack. It disables one random active mutation while alive. Killing it restores the mutation.
4. Superbug: an act boss. High HP, splits into two smaller versions at 50% and 25% HP.
5. Every new type follows the Entity base class and the existing procedural animation standard. No exceptions for bosses.

## Acceptance criteria
- Each new type forces a different response from the player
- The Prion in particular changes priorities immediately
- Frame rate holds with a Superbug and its splits on screen

## When finished
Update src/entities/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

## T8.2 to T8.6 — Level authoring

Five tickets, one act each. Same prompt shape as T4.3 and T5.4.

| Ticket | Act | Levels | Focus |
|--------|-----|--------|-------|
| T8.2 | III — Lungs | 29–44 | Breathing arena, airborne pathogens, Hunt levels work well here |
| T8.3 | IV — Gut | 45–60 | Overwhelming counts, Fungus introduced, Contain under pressure |
| T8.4 | V — Lymph Nodes | 61–74 | Allies, Escort levels, Prion introduced |
| T8.5 | VI — Sepsis | 75–90 | Fever is common, allies die, Toxin clouds, Survive levels |
| T8.6 | VII — Blood-Brain Barrier | 91–100 | Sparse, quiet, high stakes. Superbug at L100. No respawn grace. |

**Prompt template for each**

```text
## Task
Write the [ACT NAME] levels ([RANGE]) as data. Only levels.js changes.

## Requirements
1. Follow the act's focus from docs/phases/phase-06-to-09.md.
2. Rotate all six objective types across the act. No more than two of the same type in a row.
3. Introduce the act's new enemy type in the third level of the act, not the first.
4. Every level gets a name and a one-line clinical intro.
5. Difficulty rises inside the act, then the act's last level is a clear step up.
6. Host vitality drain rises across acts. By Act VI, a careless level costs real vitality.

## Acceptance criteria
- The whole act plays end to end without a crash
- No two consecutive levels feel the same
- The act is completable on a clean run and losable on a sloppy one

## Do not
- Change code files
- Introduce an enemy type earlier than its act

## When finished
Play the whole act. Update PROGRESS.md and report the three weakest levels. Report in 5 lines or fewer.
```

---

# Phase 9 — Game Feel & Ship

## T9.1 — Hit-stop and knockback

```text
## Task
Add impact weight to combat.

## Requirements
1. Hit-stop: freeze all updates for 2 to 4 frames on a kill, 1 to 2 on a normal hit. Do not freeze the render loop, only the update.
2. Knockback: enemies get pushed away from the hit direction, scaled by player mass and enemy size.
3. On killing blows, add a brief radial distortion at the impact point.
4. All values in BALANCE.feel so they can be tuned.

## Acceptance criteria
- Hits feel roughly twice as heavy as before
- Hit-stop never causes a visible stutter in movement

## When finished
Update PROGRESS.md. Report in 5 lines or fewer.
```

## T9.2 — Mobile pass

```text
## Task
Make the game genuinely playable on a phone.

## Requirements
1. Joystick, attack, dash and vent buttons must be reachable one-handed and never overlap the HUD.
2. Add a light aim assist for touch: the pseudopod snaps to the nearest enemy within a small cone.
3. Reduce particle counts and body cell counts on touch devices via a device tier check.
4. Test in portrait and landscape. Lock to landscape if portrait cannot be made playable.
5. Prevent scroll, pinch zoom and double-tap zoom on the canvas.

## Acceptance criteria
- 30 FPS or better on a mid-range phone during a busy Act IV level
- No accidental browser gestures during play

## When finished
Update PROGRESS.md. Report in 5 lines or fewer.
```

## T9.3 — Performance

```text
## Task
Make the game hold frame rate in the worst case.

## Requirements
1. Object pooling for particles, enemies and body cells. No allocation in the hot loop.
2. Cull entities outside the camera view before drawing.
3. Cache static background layers to an offscreen canvas and redraw only when the act or vitality tier changes.
4. Add a debug overlay toggled by F3: FPS, entity count, particle count, draw calls.

## Acceptance criteria
- 60 FPS with 40 enemies, 30 body cells and 500 particles on a mid-range laptop
- Garbage collection pauses are not visible during play

## When finished
Update PROGRESS.md. Report in 5 lines or fewer with before and after numbers.
```

## T9.4 — Accessibility

```text
## Task
Add basic accessibility options.

## Requirements
1. Options screen with: screen shake slider (0 to 100%), reduced flashing toggle, colourblind-safe palette variant, master and effects volume, and a slowdown toggle that runs the game at 80% speed.
2. Persist settings via SaveSystem.
3. Respect prefers-reduced-motion on first load.

## Acceptance criteria
- Screen shake can be fully disabled
- The colourblind palette keeps all three enemy types distinguishable

## When finished
Update src/ui/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

## T9.5 — Title, credits and final audio

```text
## Task
Finish the front end of the game.

## Requirements
1. Title screen: the word IMMUNE, a slowly wobbling procedural cell, and a faint heartbeat already playing. Buttons: PLAY, ACT MAP, OPTIONS.
2. Ambient layer per act: low synthesised drones built on the existing AudioEngine, no files.
3. Full audio mix pass. Heartbeat under everything, combat sounds clear, nothing clipping.
4. Credits screen listing the tools used.

## Acceptance criteria
- The title screen sets the tone in under 3 seconds
- Nothing in the mix is uncomfortably loud

## When finished
Update PROGRESS.md. Report in 5 lines or fewer.
```

## T9.6 — Ship

```text
## Task
Prepare the release.

## Requirements
1. Verify the game runs from a plain static host with no build step.
2. Add a GitHub Actions workflow deploying to GitHub Pages on push to main.
3. Write the public README: what the game is, a screenshot, controls, how to run locally, and the build constraints from AGENTS.md section 2.
4. Full documentation audit. Every folder README accurate, PROGRESS.md complete, CONTEXT.md updated to match what was actually built.
5. Tag v1.0.0.

## Acceptance criteria
- A stranger can clone the repo and run it in under a minute
- The Pages deployment plays identically to local

## When finished
Update PROGRESS.md, set Phase 9 Done. Report in 5 lines or fewer.
```
