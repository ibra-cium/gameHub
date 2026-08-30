# src/core

Core game loop, math primitives, camera transformation, and user input handling.

## Files

| File | What it does |
|------|--------------|
| `Vec2.js` | 2D vector class supporting arithmetic, distance, normalization, angles, and interpolation. |
| `Camera.js` | Viewport positioning, target tracking, smooth lerp, and trauma-based screen shake. |
| `InputManager.js` | Keyboard, mouse, floating dynamic touch joystick, thumb arc actions, and smart aim targeting. |
| `Game.js` | Primary game controller orchestrating game loop, state transitions, DOM, and entity lifecycle. |

## Notes

Contains engine fundamentals and math utilities used across the entire game codebase.
