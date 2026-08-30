# Phase 0 — Foundation & Documentation

**Goal:** turn the 1,913-line single file into the folder structure from `CONTEXT.md` section 12, with documentation in place. Zero gameplay change.

**Why first:** every later phase touches five or six files at once. If the agent has to navigate one giant file every time, it will make mistakes and burn context. This phase pays for itself by Phase 2.

**Success test:** you play the game after Phase 0 and cannot tell anything changed.

**Risk:** HIGH. Use Planning mode and `thinking_level: HIGH` for T0.1 and T0.2.

---

## T0.1 — Create folder structure and module entry point

**Touches:** `index.html`, new `src/` tree
**Depends on:** nothing

**Done when:**
- [ ] All folders from `CONTEXT.md` section 12 exist under `src/`
- [ ] `src/main.js` exists and is the only script `index.html` loads
- [ ] `index.html` uses `<script type="module" src="src/main.js"></script>`
- [ ] Game still runs identically when served over `http://localhost:8000`
- [ ] Root `README.md` explains how to start the dev server

**Prompt**

```text
## Task
Set up the ES module folder structure for IMMUNE. Do not move any game logic yet.

## First
Read AGENTS.md and CONTEXT.md completely. Read docs/phases/phase-00-foundation.md.

## Requirements
1. Create these folders under src/: config, core, entities, systems, levels, levels/objectives, render, ui.
2. Create src/main.js as the entry point. For now it should import the existing game.js and start it, nothing more.
3. Change index.html to load src/main.js with type="module" instead of loading game.js directly.
4. Create a root README.md with: what the game is (one paragraph), how to run it (python3 -m http.server 8000, open localhost:8000), and why a server is required (ES modules do not work over file://).
5. Create a README.md in every folder you created, using the exact table format from AGENTS.md section 5.1. Folders with no files yet get a table with a single row saying "empty - populated in T0.2".

## Acceptance criteria
- Serving the folder and opening localhost:8000 gives the same game as before, no console errors
- Opening index.html directly from disk fails with a module error - this is expected and correct
- Every new folder has a README.md

## Do not
- Move, split or rewrite any game logic in this ticket
- Add a bundler, a package.json with dependencies, or any npm install
- Change any gameplay values

## When finished
1. Run the game and confirm it is unchanged.
2. Update PROGRESS.md: mark T0.1, set active ticket to T0.2.
3. Report in 5 lines or fewer.
```

---

## T0.2 — Split game.js into modules

**Touches:** `game.js` (deleted at the end), all of `src/`
**Depends on:** T0.1

**Done when:**
- [ ] Every class from `game.js` lives in its own file, in the right folder
- [ ] `game.js` is deleted
- [ ] No file exceeds ~400 lines
- [ ] Game behaves identically
- [ ] Every folder README lists its real files

**Prompt**

```text
## Task
Split game.js into one file per class, following the folder map in CONTEXT.md section 12. Behaviour must not change at all.

## First
Read AGENTS.md and CONTEXT.md. Read the whole of game.js before moving anything.

## File mapping
- Vec2                              -> src/core/Vec2.js
- Camera                            -> src/core/Camera.js
- InputManager                      -> src/core/InputManager.js
- Game                              -> src/core/Game.js
- Particle, ParticleSystem          -> src/systems/ParticleSystem.js
- SoundFX                           -> src/systems/AudioEngine.js (rename class to AudioEngine)
- WaveManager                       -> src/systems/WaveManager.js
- Player                            -> src/entities/Player.js
- Enemy                             -> src/entities/Enemy.js
- Bacteria                          -> src/entities/Bacteria.js
- Virus                             -> src/entities/Virus.js
- Parasite                          -> src/entities/Parasite.js
- Environment                       -> src/render/Environment.js

## Requirements
1. One class per file. Named exports.
2. src/main.js creates the Game instance and starts the loop. Nothing else lives in main.js.
3. If Player.js or Enemy.js exceeds 400 lines, extract the drawing code into src/render/softBody.js as pure functions that take (ctx, points, options).
4. Update every folder README.md with the real file table.
5. Delete game.js only after the game runs correctly from the modules.

## Acceptance criteria
- Game plays identically: same movement speed, same damage, same waves, same visuals
- Zero console errors
- game.js no longer exists
- No file over ~400 lines

## Do not
- Change any number, any behaviour, or any visual
- "Improve" code while moving it - copy it as-is
- Rename anything except SoundFX -> AudioEngine

## When finished
1. Play all 3 waves and confirm nothing changed.
2. Update all folder READMEs and PROGRESS.md.
3. Report in 5 lines or fewer, listing any file you had to split beyond the mapping above.
```

---

## T0.3 — Extract all tunable values into config

**Touches:** `src/config/`, all entity and system files
**Depends on:** T0.2

**Done when:**
- [ ] `src/config/balance.js` holds every gameplay number
- [ ] `src/config/palettes.js` holds every colour
- [ ] `src/config/constants.js` holds world size, canvas defaults, physics constants
- [ ] No hardcoded hex colour or magic number remains in entity or system code

**Prompt**

```text
## Task
Move every tunable number and colour out of the game code and into src/config/.

## First
Read AGENTS.md section 4. Read every file in src/entities and src/systems.

## Requirements
1. src/config/balance.js exports a nested object. Example shape:
   export const BALANCE = {
     player: { radius: 42, speed: 340, dashSpeed: 980, maxHp: 100, attackDamage: 35, ... },
     bacteria: { radius: 32, speed: 105, hp: 70, damage: 18 },
     virus: { ... },
     parasite: { ... }
   };
2. src/config/palettes.js exports colours grouped by subject, not by hex value.
   Example: PALETTE.enemy.bacteria.body, PALETTE.enemy.bacteria.accent, PALETTE.player.body,
   PALETTE.environment.background.
   Structure it so an entire act palette can be swapped later by changing one object.
3. src/config/constants.js exports world bounds, target frame budget, particle pool cap.
4. Replace every literal in the entity and system files with a config reference.
5. Every entry in balance.js gets a short trailing comment explaining what it controls.

## Acceptance criteria
- Changing BALANCE.player.speed to 600 makes the player visibly faster with no other edit
- Changing a colour in palettes.js changes it on screen
- Searching src/entities and src/systems for a "#" hex literal returns nothing
- Game plays identically with the original values

## Do not
- Change any value while moving it
- Put behaviour or functions inside config files - data only

## When finished
1. Verify by temporarily changing player speed, then change it back.
2. Update src/config/README.md and PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T0.4 — Entity base class and lifecycle

**Touches:** `src/entities/Entity.js`, all entities
**Depends on:** T0.3

**Done when:**
- [ ] `Entity` base class exists with shared position, velocity, radius, alive flag, update, draw
- [ ] `Player` and `Enemy` both extend it
- [ ] Duplicate wobble and soft-body point code is shared, not copy-pasted

**Prompt**

```text
## Task
Introduce a shared Entity base class so future entity types are cheap to add.

## First
Read src/entities/Player.js and src/entities/Enemy.js side by side and list what they duplicate.

## Requirements
1. Create src/entities/Entity.js with: pos, vel, radius, alive, id, update(dt), draw(ctx), and the shared soft-body point array setup and wobble update.
2. Player and Enemy both extend Entity.
3. Move any deformation logic that both use into Entity or into src/render/softBody.js.
4. Add an alive flag and a destroy() method. Nothing should be removed from arrays by index inside an update loop.

## Acceptance criteria
- Player and all three enemy types behave exactly as before
- Adding a new enemy type would now mean writing only its own behaviour and draw code
- No visual change

## Do not
- Change movement, damage, or animation timing
- Add entity types in this ticket

## When finished
1. Play all 3 waves.
2. Update src/entities/README.md and PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T0.5 — Documentation sweep and phase gate

**Touches:** all `README.md`, `PROGRESS.md`
**Depends on:** T0.4

**Done when:**
- [ ] Every folder README table matches the real files
- [ ] `PROGRESS.md` phase table shows Phase 0 Done
- [ ] Root README has a project map

**Prompt**

```text
## Task
Verify and complete all documentation for Phase 0. This is a checking ticket, not a coding ticket.

## Requirements
1. Walk every folder under src/ and docs/. Open its README.md. Confirm the file table lists every file that actually exists, and no file that does not.
2. Fix any mismatch.
3. Add a "Project map" section to the root README.md: a tree of the folder structure with one line per folder.
4. In PROGRESS.md, set Phase 0 to Done and Phase 1 to In progress. Set active ticket to T1.1.
5. List in your report any file that is over 400 lines, any TODO left in the code, and any place where the refactor changed behaviour even slightly.

## Acceptance criteria
- Every folder README is accurate
- Game still runs with zero console errors

## Do not
- Change any code in this ticket unless you find an actual bug, and if you do, report it rather than silently fixing it

## When finished
Report in 5 lines or fewer, plus the lists requested in requirement 5.
```
