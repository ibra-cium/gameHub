# src/systems

Game systems including procedural particle effects, synthesized audio, host vitality, and level progression.

## Files

| File | What it does |
|------|--------------|
| `ParticleSystem.js` | Pools and updates particles; emitters for directional bursts, trails, and shockwaves. |
| `AudioEngine.js` | Procedural Web Audio API sound synthesis for strikes, hits, dashes, vent bursts, wave events, and host heartbeat. |
| `LevelRunner.js` | Data-driven level loader and runner managing wave/trickle spawning, objectives, and progression callbacks. |
| `HostVitality.js` | Tracks overall host vitality, handles drain/heal mechanics, ratio queries, and change callbacks. |
| `CurrentField.js` | Generates seeded smooth flow lanes across the arena, evaluates vector current drift, handles mass resistance, and draws streamline streaks. |

## Notes

All audio synthesis is computed in real-time via Web Audio API without audio assets.
