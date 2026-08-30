# src/levels

Data-driven level and act definitions, spawn tables, and objective configurations.

## Files

| File | What it does |
|------|--------------|
| `acts.js` | Act metadata configurations (id, name, level range, palette key, environment key, mood notes). |
| `levels.js` | Array of level configuration objects defining spawn tables, modes, drain rates, and objectives. |
| `objectives/` | Objective rule implementations for victory and failure conditions. |

## Level Object Schema

Every level in `LEVELS` is a plain JavaScript object adhering to this schema:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique numerical level identifier (1 to 28 currently implemented across Acts I & II). |
| `act` | `string` | Identifier matching an act in `ACTS` (e.g. `'skin'`, `'bloodstream'`). |
| `name` | `string` | Display name of the level shown in title banners and UI. |
| `objective` | `object` | Win condition descriptor (e.g. `{ type: 'purge' }`, `{ type: 'contain', maxInfected: 4 }`). |
| `spawns` | `Array<{type: string, count: number}>` | Enemy composition to spawn (`'bacteria'`, `'virus'`, `'parasite'`). |
| `spawnMode` | `'wave' \| 'trickle'` | Spawning timing: `'wave'` spawns all at once; `'trickle'` spawns incrementally over time. |
| `timeLimit` | `number \| null` | Countdown duration in seconds, or `null` if untimed. |
| `vitalityDrain` | `number` | Host vitality lost per second per active living pathogen. |
| `intro` | `string` | Narrative subtitle banner text displayed when the level loads. |

## Notes

Adding a new level requires only adding a new object to the `LEVELS` array in `levels.js`.
