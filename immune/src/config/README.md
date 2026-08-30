# src/config

Configuration values, tunable gameplay balance constants, and visual color palettes.

## Files

| File | What it does |
|------|--------------|
| `constants.js` | Core engine constants including world bounds, target frame budget, and particle caps. |
| `balance.js` | Central repository for all tunable gameplay numeric parameters with trailing comments. |
| `palettes.js` | Complete Act palette objects (`ACT_PALETTES`) and active live palette updater (`setActPalette`). |

## Notes

Every tunable gameplay number and hex color code belongs here. No magic numbers or hardcoded hex strings should exist in entity or system code.
