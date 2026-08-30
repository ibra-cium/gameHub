# Phase 4 — Act I: Skin & Tissue (Levels 1–12)

**Goal:** the opening act. Warm, bright, low stakes. This is where the player learns everything without being taught.

**Why now:** with the engine done, this is the first act that is mostly content and tuning.

**Success test:** a friend who has never seen the game plays 12 levels without asking you a single question.

**Risk:** LOW.

---

## T4.1 — Act I palette and environment

**Touches:** `src/config/palettes.js`, `src/render/Environment.js`

**Prompt**

```text
## Task
Build the Act I visual identity: skin and tissue. Warm, bright, almost cosy.

## First
Read CONTEXT.md section 9. Read src/config/palettes.js and src/render/Environment.js.

## Requirements
1. Restructure palettes.js so a whole act palette is one object, and switching acts is one assignment. Keys: background, backgroundDeep, tissue, bodyCell, playerBody, playerAccent, hudPrimary, hudWarning, and the per-enemy colours.
2. Act I palette: warm peach and soft coral background, pale gold tissue strands, cream body cells. Bright and healthy. This should look like the safest place in the game, because every later act gets darker by comparison.
3. Environment for Act I: slow drifting collagen strands as long soft curves, occasional dust motes, gentle warm light gradient from the top. Movement is slow and calm.
4. Environment must accept an act key and pick its own visuals from it. No if-chains scattered through the draw code.

## Acceptance criteria
- Act I reads as warm and safe at a glance
- Switching the act key changes the whole look in one place
- No hardcoded colour survives in Environment.js

## When finished
Update src/render/README.md, src/config/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

---

## T4.2 — Debris and splinter entities

**Touches:** `src/entities/Debris.js`, `src/entities/Splinter.js`

**Prompt**

```text
## Task
Add the two Act I specific objects: debris for Patrol levels and splinters as the first hazard.

## Requirements
1. src/entities/Debris.js: small irregular procedural fragments, dead cell husks and dust clumps. Drift slowly. Collected by touching. On collection: a soft chime and a small sparkle burst. No danger.
2. src/entities/Splinter.js: a static sharp shard embedded in the tissue. Deals damage on contact. Cannot be killed by attacking. It is removed by engulfing it, which takes twice the normal engulf duration and gives no mass.
3. Splinter draw: hard angular lines, deliberately breaking the soft organic look of everything else, so it reads instantly as foreign.
4. Add a 'splinter' spawn type usable in level data.

## Acceptance criteria
- Debris collection feels pleasant and low-pressure
- Splinters look wrong in a good way, clearly not part of the body
- Engulfing a splinter is a deliberate slow choice

## Do not
- Let splinters move or chase

## When finished
Update src/entities/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

---

## T4.3 — Levels 1 to 12

**Touches:** `src/levels/levels.js` only

**Prompt**

```text
## Task
Write the twelve Act I levels as data. Only levels.js changes.

## First
Read CONTEXT.md sections 8 and 13, and src/levels/README.md for the schema.

## Pacing plan
- L1 Patrol, 6 debris. No enemies at all. Teaches movement.
- L2 Patrol, 10 debris, wider map. Teaches dash by placing debris far apart.
- L3 Purge, 3 bacteria. First combat.
- L4 Purge, 5 bacteria. First level where engulfing is worth it.
- L5 Patrol, 8 debris + 2 splinters. Teaches splinters safely.
- L6 Purge, 6 bacteria + 2 splinters.
- L7 Contain, maxInfected 5, 4 bacteria, 12 body cells. First time the host bar can move.
- L8 Purge, 4 bacteria + 2 viruses. Introduces virus.
- L9 Survive, 40 seconds, low spawn rate.
- L10 Contain, maxInfected 3, 5 bacteria + 2 viruses.
- L11 Purge, 6 bacteria + 3 viruses + 2 parasites. Introduces parasite.
- L12 Purge, 8 bacteria + 4 viruses + 3 parasites. Act finale, noticeably harder.

## Requirements
1. Every level gets a short name and a one-line intro that sounds like a medical note, not a game tutorial. Example for L3: "Bacteria at the wound edge."
2. Set vitalityDrain to 0 for levels 1 to 6, so the host bar never appears during the tutorial stretch.
3. Vary spawnMode between 'wave' and 'trickle' so the rhythm changes.
4. Tune counts so levels 1 to 6 take under 60 seconds each and cannot realistically be lost.

## Acceptance criteria
- All 12 levels are playable back to back
- The host vitality bar first appears at L7, not before
- Difficulty rises without a spike

## Do not
- Add tutorial text, arrows or popups anywhere
- Change any code file

## When finished
Play all 12 in one sitting. Update PROGRESS.md and report the two levels that felt worst. Report in 5 lines or fewer.
```

---

## T4.4 — Bacteria multiply

**Touches:** `src/entities/Bacteria.js`

**Prompt**

```text
## Task
Give bacteria a goal that is not the player: they multiply.

## First
Read CONTEXT.md section 6.

## Requirements
1. Add BALANCE.bacteria.splitInterval (default 9s), splitGeneration max (default 2), splitSizeMultiplier (0.75).
2. Every splitInterval seconds a bacterium splits into two, each at splitSizeMultiplier of the parent radius and HP. Generation 2 bacteria never split again.
3. Split animation, and this matters more than the rule: the body elongates over about 0.6 seconds, pinches in the middle, then separates with a soft pop and a small particle spray. The two halves push apart. This must be readable, not instant.
4. A bacterium that has taken any damage in the last 4 seconds cannot split. Attacking delays the problem.
5. Show a subtle visual tell about 1.5 seconds before a split: the body swells and the wobble speeds up.

## Acceptance criteria
- Ignoring bacteria in a Purge level visibly gets worse over time
- The split tell gives the player time to intervene
- Generation cap prevents runaway spawning

## Do not
- Let split bacteria split again past the generation cap
- Make splitting instant

## When finished
Update src/entities/README.md and PROGRESS.md. Report in 5 lines or fewer.
```

---

## T4.5 — Act I polish and gate

**Touches:** tuning only

**Prompt**

```text
## Task
Final Act I pass. Balance and feel only.

## Requirements
1. Play levels 1 to 12 three times without stopping.
2. Fix only: pacing that drags, difficulty spikes, unclear moments, and anything that made you want to stop playing.
3. Confirm the first-time experience: a new player should understand movement by L2, attacking by L3, engulfing by L4, and the host bar by L7, with no text explaining any of it.
4. If any of those four moments fails, fix it with level design in levels.js, not with tutorial text.

## Acceptance criteria
- Twelve levels play end to end in about 12 to 15 minutes
- No level takes more than three attempts on a first playthrough

## When finished
Update PROGRESS.md, set Phase 4 Done. Report in 5 lines or fewer, and say whether Act I is fun enough to justify building Act II.
```
