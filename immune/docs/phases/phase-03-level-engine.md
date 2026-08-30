# Phase 3 — Level & Objective Engine

**Goal:** replace `WaveManager` with a data-driven level system and six objective types.

**Why now:** this is the machine that produces 100 levels. Without it, every level is hand-built code and the project dies around level 20.

**Success test:** you add a brand new level by adding one object to an array, and it works.

**Risk:** HIGH. Planning mode and `thinking_level: HIGH` for T3.1 and T3.2.

---

## T3.1 — Level data format and loader

**Touches:** `src/levels/`, `src/systems/LevelRunner.js`
**Depends on:** Phase 2 complete

**Done when:**
- [ ] Levels are plain objects in an array
- [ ] `LevelRunner` loads, runs and completes a level from data alone
- [ ] The existing three waves are re-expressed as three level objects

**Prompt**

```text
## Task
Build the data-driven level system. This is the most important architectural ticket in the project.

## First
Read CONTEXT.md sections 8 and 13 carefully. Read src/systems/WaveManager.js.

## Requirements
1. Create src/levels/levels.js exporting LEVELS, an array of level objects in the exact shape from CONTEXT.md section 13.
2. Create src/levels/acts.js exporting act metadata: id, name, level range, palette key, environment key, mood notes.
3. Create src/systems/LevelRunner.js replacing WaveManager. It must:
   - load(levelId): read the level object, configure spawns, set the objective, set vitality drain
   - update(dt): run spawning, check the objective, detect completion and failure
   - expose onComplete and onFail callbacks
   - handle both spawnMode values: 'wave' spawns everything at once, 'trickle' spawns over time
4. Re-express the current three waves as the first three entries of LEVELS, all with objective type 'purge'. The game must play identically to Phase 2.
5. Delete WaveManager.js once LevelRunner works.
6. src/levels/README.md must document the level object schema field by field, so a future agent can add levels without reading the code.

## Acceptance criteria
- Adding a fourth object to LEVELS produces a playable fourth level with no other code change
- Changing spawnMode from 'wave' to 'trickle' on a level visibly changes how enemies arrive
- The first three levels play exactly like the old three waves

## Do not
- Put any level-specific logic inside LevelRunner - if a level needs special behaviour, that is a data field
- Keep WaveManager alive alongside LevelRunner

## When finished
1. Add a test level 4, verify it runs, then remove it.
2. Update src/levels/README.md, src/systems/README.md, PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T3.2 — Objective interface and Purge

**Touches:** `src/levels/objectives/`
**Depends on:** T3.1

**Done when:**
- [ ] A common objective interface exists
- [ ] `PurgeObjective` implements it
- [ ] Objectives are registered by type string, not switch statements

**Prompt**

```text
## Task
Define the objective interface and implement the first objective type.

## Requirements
1. Create src/levels/objectives/Objective.js as the base class:
   - constructor(config, game)
   - start()
   - update(dt)
   - isComplete()
   - isFailed()
   - getProgressText() returning a short HUD string like "GERMS 4/9"
   - getIntroText() returning the one-line brief shown at level start
2. Create src/levels/objectives/PurgeObjective.js: complete when all enemies are dead, never fails.
3. Create src/levels/objectives/index.js exporting an OBJECTIVES registry mapping type strings to classes. LevelRunner looks up the class from the registry. No switch statement, no if-else chain.
4. LevelRunner asks the objective for progress text and passes it to the HUD.

## Acceptance criteria
- Adding a new objective type means writing one file and adding one registry line
- The HUD shows live objective progress
- Levels 1 to 3 still work

## Do not
- Hardcode any objective type name inside LevelRunner

## When finished
1. Update src/levels/objectives/README.md and PROGRESS.md.
2. Report in 5 lines or fewer.
```

---

## T3.3 — BodyCell entity

**Touches:** `src/entities/BodyCell.js`, `src/render/Environment.js`
**Depends on:** T3.2

**Done when:**
- [ ] The decorative floating cells are now real entities with health states
- [ ] They can be healthy, infected or dead
- [ ] Their state is visually obvious

**Prompt**

```text
## Task
Promote the decorative background cells into real gameplay entities. They are the currency of the Contain and Escort objectives.

## First
Read src/render/Environment.js, which currently draws floating cells as decoration.

## Requirements
1. Create src/entities/BodyCell.js extending Entity, with state: 'healthy' | 'infected' | 'dead'.
2. Healthy: soft rounded soft-body shape, gentle drift, warm colour from PALETTE.
3. Infected: colour shifts toward the infecting enemy's accent colour over about 2 seconds, movement becomes twitchy, small dark spots appear on the body. After BALANCE.bodyCell.infectionDuration it becomes dead and spawns one enemy of the infecting type.
4. Dead: grey, deflated, drifts limply, no longer infectable, does not despawn.
5. The player can heal an infected cell by touching it while it is in the first 40% of its infection timer. Add a small feedback burst.
6. Environment keeps drawing far-background decoration, but foreground body cells are now entities owned by the Game.
7. Levels specify a bodyCellCount field. LevelRunner spawns them.

## Acceptance criteria
- You can tell healthy, infecting and dead cells apart instantly
- An infected cell left alone produces a new enemy
- Frame rate is stable with 25 body cells plus 15 enemies

## Do not
- Let dead cells be revived
- Make body cells collide with or block the player

## When finished
1. Update src/entities/README.md, src/render/README.md, PROGRESS.md.
2. Report in 5 lines or fewer.
```

---

## T3.4 — Contain, Survive and Patrol objectives

**Touches:** `src/levels/objectives/`
**Depends on:** T3.3

**Done when:**
- [ ] Three more objective types work
- [ ] Each has a distinct HUD readout and failure condition

**Prompt**

```text
## Task
Implement three more objective types using the interface from T3.2.

## Requirements
1. ContainObjective. Config: { maxInfected }. Fails when the number of dead body cells exceeds maxInfected. Completes when all enemies are dead. Progress text: "LOST 2/4". The counter must turn warning-coloured at one remaining.
2. SurviveObjective. Config: { duration, spawnRate }. Completes when the timer runs out. Never fails on its own. Enemies keep spawning at spawnRate for the whole duration. Progress text: a countdown. Add a rising tension cue in the last 10 seconds using AudioEngine.
3. PatrolObjective. Config: { debrisCount }. No enemies at all. Scattered debris and dead cells must be collected by touching them. Completes when all are collected. Progress text: "CLEARED 7/12". This is the calm level type, so make it feel calm: no camera shake, softer palette, slower ambient particles.
4. Add one test level for each type to LEVELS so they can be played.
5. Register all three in the objectives index.

## Acceptance criteria
- Each of the three test levels is playable and completable
- Contain can actually be failed
- Patrol feels genuinely relaxing compared to Purge

## Do not
- Add enemies to a Patrol level
- Reuse the Purge completion check for Survive

## When finished
1. Play all three test levels.
2. Update src/levels/objectives/README.md and PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T3.5 — Escort and Hunt objectives

**Touches:** `src/levels/objectives/`, `src/entities/`
**Depends on:** T3.4

**Done when:**
- [ ] Both objectives work
- [ ] Escort has a protectable escort entity with its own health
- [ ] Hunt uses a larger world with a hidden source

**Prompt**

```text
## Task
Implement the final two objective types.

## Requirements
1. Create src/entities/RedBloodCell.js: a slow entity that follows a path across the arena, has its own HP, and is a target enemies prefer over the player.
2. EscortObjective. Config: { escortHp, escortSpeed }. Completes when the escort reaches the exit. Fails if the escort dies. HUD shows the escort's HP and a directional arrow pointing to it when off screen.
3. HuntObjective. Config: { worldScale, sourceHp }. The world bounds are multiplied by worldScale, default 1.8. One hidden infection source is placed at a random far position. It continuously spawns enemies. Completes when the source is destroyed. Give the player a proximity cue: a directional pulse on the screen edge that gets faster as they get closer. Do not add a minimap.
4. Add a test level for each.
5. Register both.

## Acceptance criteria
- The escort can be lost, and losing it fails the level
- The hunt proximity cue is enough to find the source without frustration in under 90 seconds
- Off-screen escort arrow is accurate

## Do not
- Add a minimap or a marker over the hidden source
- Let the escort be invincible

## When finished
1. Play both test levels twice.
2. Update src/levels/objectives/README.md, src/entities/README.md, PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T3.6 — Level flow, intro cards and transitions

**Touches:** `src/ui/Screens.js`, `src/core/Game.js`
**Depends on:** T3.5

**Done when:**
- [ ] Levels chain automatically
- [ ] Each level opens with a short intro card
- [ ] Failing a level retries it without losing host vitality progress permanently

**Prompt**

```text
## Task
Wire the levels into a continuous flow.

## Requirements
1. Level intro card: act name in small text, level number and name, then the objective's intro line. Hold for 2.5 seconds or until any key. Style it quiet and clean.
2. Level complete: brief banner, then automatically load the next level after 1.5 seconds.
3. Level failed, meaning the objective failed but the host is still alive: show "CONTAINMENT FAILED", apply a host vitality penalty from BALANCE.host.failPenalty, then retry the same level.
4. Host death still ends the run, from T1.4.
5. Game tracks currentLevelId and passes it to LevelRunner.
6. Clearing a level restores BALANCE.host.regenPerClearedLevel vitality, so a good run can recover a little.

## Acceptance criteria
- You can play levels 1 through 6 back to back without touching anything
- Failing a Contain level costs vitality and retries
- The intro cards do not slow the pace down

## Do not
- Add a level select menu yet, that is Phase 6
- Make level transitions longer than 2 seconds of dead time

## When finished
1. Play the whole chain start to finish.
2. Update src/ui/README.md and PROGRESS.md, and set Phase 3 to Done.
3. Report in 5 lines or fewer.
```
