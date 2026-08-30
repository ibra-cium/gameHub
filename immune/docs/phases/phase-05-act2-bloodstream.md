# Phase 5 — Act II: Bloodstream (Levels 13–28)

**Goal:** the first act where the body itself fights you, and the first act where you can genuinely lose.

**Success test:** a level where you win the fight and still lose the host, and it feels like your fault.

**Risk:** MEDIUM. T5.1 changes physics for every entity.

---

## T5.1 — Blood current system

**Touches:** `src/systems/CurrentField.js`, `src/entities/Entity.js`

**Prompt**

```text
## Task
Add flowing blood currents that push every entity in the arena.

## Requirements
1. Create src/systems/CurrentField.js. The field is a set of smooth flow lanes across the world, generated from a seed so a level always plays the same.
2. Every Entity samples the field at its position each frame and gets a velocity contribution scaled by BALANCE.current.strength.
3. Mass matters: heavier players resist the current more. A light player gets carried, a heavy one holds position. This makes the Phase 2 mass trade-off deeper without adding any new rule.
4. Visual: the existing ambient particles must follow the flow lanes so the current is always visible. Add faint streak lines in the flow direction. The player must never be pushed by an invisible force.
5. Level data gets a currentStrength field, 0 disables it entirely.
6. Swimming against the current is possible but slow, going with it is fast. This is a real navigation choice.

## Acceptance criteria
- Standing still with no input drifts you along a visible lane
- The flow direction is readable from particles alone, with the HUD hidden
- Act I levels are unaffected because currentStrength is 0

## Do not
- Make the current strong enough to make aiming frustrating
- Apply current during the engulf animation

## When finished
Update src/systems/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

---

## T5.2 — Virus infection behaviour

**Touches:** `src/entities/Virus.js`

**Prompt**

```text
## Task
Give the virus its real behaviour: it infects body cells instead of only chasing you.

## First
Read CONTEXT.md section 6. Read src/entities/BodyCell.js from T3.3.

## Requirements
1. Virus AI priority: if a healthy BodyCell is within BALANCE.virus.seekRadius, go for it instead of the player.
2. On reaching a healthy cell, latch on: the virus attaches, stops moving, and its spikes visibly grip the cell surface. After BALANCE.virus.latchDuration (default 3s) the cell becomes infected and the virus detaches to find another.
3. A latched virus takes double damage. This is the risk it accepts.
4. Attacking a latching virus knocks it off and resets the cell.
5. Visual during latch: a pulsing line between virus and cell that grows brighter as the timer fills. Impossible to miss across the arena.
6. Add the surge telegraph: before its dash at the player, the virus compresses and its spikes retract for about 0.4 seconds, then it launches. Currently it surges with no warning.

## Acceptance criteria
- Viruses ignore you when body cells are available, which changes how you play
- A latch in progress is visible from across the map
- The surge can now be dodged reliably by a player paying attention

## Do not
- Let a virus latch onto an already infected or dead cell

## When finished
Update src/entities/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

---

## T5.3 — Parasite mass theft

**Touches:** `src/entities/Parasite.js`

**Prompt**

```text
## Task
Give the parasite its real behaviour: it steals your mass and runs.

## Requirements
1. Parasite AI: rush the player, and on contact steal BALANCE.parasite.stealAmount mass (default 4) instead of dealing normal damage.
2. After a successful steal, the parasite turns and flees toward the nearest world edge at increased speed. Its body visibly bulges with what it took.
3. If it reaches the edge it escapes and is gone, and the mass is lost permanently.
4. If killed or engulfed before escaping, the stolen mass is dropped as pickups the player can collect.
5. A fleeing parasite is worth chasing, so make the chase readable: a bright trail, a distinct sound, and a HUD warning arrow when it goes off screen.
6. If the player has zero mass, the parasite deals normal contact damage instead.

## Acceptance criteria
- Losing mass to a parasite is annoying in the right way and creates an immediate decision
- The chase is winnable but not free
- Zero-mass players are not immune to parasites

## Do not
- Let a parasite steal during the player's engulf animation
- Make the escape instant

## When finished
Update src/entities/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

---

## T5.4 — Act II palette, environment and levels 13 to 28

**Touches:** `src/config/palettes.js`, `src/render/Environment.js`, `src/levels/levels.js`

**Prompt**

```text
## Task
Build the Act II look and its sixteen levels.

## Requirements
1. Act II palette: deep arterial red, darker than Act I, with bright oxygenated highlights. The warmth of Act I is gone, replaced by something faster and more alive.
2. Environment: dense flowing red blood cells in the background moving along the current lanes, vessel wall textures at the world edges, faster ambient particle motion.
3. Levels 13 to 28, using this pacing:
   - L13-15: introduce currents on familiar objective types
   - L16-18: virus infection becomes the main threat, Contain objectives
   - L19-20: first Escort levels, currents make them hard
   - L21-23: parasite theft levels, mixed objectives
   - L24-25: first Hunt levels
   - L26-27: high pressure Contain and Survive
   - L28: act finale, all six enemy behaviours at once, tight Contain limit
4. Every level gets vitalityDrain above 0. Act II is where the host bar matters.
5. At least two levels must be losable by failing containment while winning every fight.

## Acceptance criteria
- Act II feels faster and more dangerous than Act I within one level
- Levels 13 to 28 play end to end in about 25 minutes
- At least one level teaches that killing everything is not always winning

## Do not
- Add new enemy types
- Change code files other than palettes and Environment

## When finished
Play all 16. Update PROGRESS.md and report the three levels that need rework. Report in 5 lines or fewer.
```

---

## T5.5 — Act II gate: the first real playtest

**Touches:** tuning only

**Prompt**

```text
## Task
Full playtest of levels 1 to 28. This is the gate before any meta systems get built.

## Requirements
1. Play 1 to 28 in one sitting, twice.
2. Record: where you got bored, where you got stuck, where you stopped caring about the host bar, and where the game got good.
3. Fix only balance and level data. No new features.
4. Write your findings into PROGRESS.md under a new "Playtest 1" section, not just the ticket log.

## Acceptance criteria
- 28 levels are completable without a crash or a soft lock
- You can name the exact level where the game becomes fun

## When finished
Set Phase 5 Done. Report in 5 lines or fewer, and answer directly: is this fun enough to build 72 more levels?
```
