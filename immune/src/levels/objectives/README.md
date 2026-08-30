# src/levels/objectives
 
Objective rule checkers and victory/defeat condition logic for all level types.
 
## Files
 
| File | What it does |
|------|--------------|
| `Objective.js` | Base class defining the objective interface (`start`, `update`, `isComplete`, `isFailed`, `getProgressText`, `getIntroText`). |
| `PurgeObjective.js` | Purge objective implementation: completes when all enemies are cleared, never fails. |
| `ContainObjective.js` | Containment objective: fails when dead body cells exceed limit, completes when all enemies are eliminated, warning color at one remaining. |
| `SurviveObjective.js` | Survival objective: countdown timer with continuous enemy spawns and Web Audio rising tension cues in final 10s. |
| `PatrolObjective.js` | Calm cleanup objective: collect scattered cellular debris and dead cells with zero enemies, disabled camera shake, and serene ambient drift. |
| `EscortObjective.js` | Escort objective: guide an erythrocyte across the arena, fail if lost, complete at exit portal, with off-screen HUD tracking arrow. |
| `HuntObjective.js` | Hunt objective: scaled world exploration with hidden infection source, enemy reproduction, and screen-edge bio-radar proximity cues. |
| `index.js` | Registry mapping objective type strings to Objective classes. |
 
## Notes
 
LevelRunner resolves objectives dynamically via the `OBJECTIVES` registry without hardcoded type checks. Adding a new objective requires writing one class file and adding one entry to `index.js`.
