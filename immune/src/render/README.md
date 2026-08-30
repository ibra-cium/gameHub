# src/render

Procedural 2D Canvas rendering routines, background fluid environments, and soft-body curve helpers.

## Files

| File | What it does |
|------|--------------|
| `drawUtils.js` | Pure rendering math utilities including smooth closed bezier curve construction. |
| `Environment.js` | Procedural environment orchestrator delegating to act visual handlers. |
| `SkinTissueVisuals.js` | Act I histological dermal tissue visuals (stroma bokeh, caustics, layered collagen, lipid droplets, dust motes). |
| `BloodstreamVisuals.js` | Act II vascular visuals (multi-layer flowing erythrocytes, fast ambient plasma floaters, procedural endothelial cell walls with muscular tunic striations). |

## Notes

All visuals are rendered procedurally on an HTML5 2D Canvas. No external image assets or textures. `Environment.js` delegates act-specific visuals through polymorphic visual descriptors without scattered if-chains.
