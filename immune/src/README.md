# src

Application source code root containing the module entry point and subsystem directories.

## Files

| File | What it does |
|------|--------------|
| `main.js` | Application entry point that bootstraps the game. |
| `config/` | Tunable balance numbers, color palettes, and global constants. |
| `core/` | Fundamental math, camera, input, and game loop primitives. |
| `entities/` | Game entity classes including player, enemies, body cells, and debris. |
| `systems/` | Engine sub-systems including particles, audio, level progression, and stats. |
| `levels/` | Level definitions, act configurations, and objective handlers. |
| `render/` | Procedural rendering, environment drawing, and soft-body deformation routines. |
| `ui/` | DOM HUD overlays, modal screens, and UI controllers. |

## Notes

All game code is authored in plain ES2022 modules. External runtime dependencies and build steps are strictly prohibited.
