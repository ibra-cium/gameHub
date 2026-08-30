# IMMUNE

IMMUNE is a procedural 2D microscopic action game where you control a white blood cell defending a human body across 100 levels. Built entirely with vanilla JavaScript, HTML5 Canvas, and the Web Audio API, the game features soft-body physics, procedural animations, dual health bars (Cell HP vs. Host Vitality), and adaptive meta-progression mutations with zero external assets, frameworks, or build tools.

## Project map

```
immune/
├── docs/                # Project documentation, design, and planning (no code)
│   └── phases/          # Detailed phase build plans and agent ticket prompts
└── src/                 # Application source code
    ├── config/          # Tunable balance parameters, constants, and color palettes
    ├── core/            # Math primitives, input, camera, and game loop controllers
    ├── entities/        # Base entity classes, player cell, and pathogen definitions
    ├── levels/          # Data-driven level definitions and progression setups
    │   └── objectives/  # Objective rule checkers and condition handlers
    ├── render/          # Canvas 2D rendering routines and procedural fluids
    ├── systems/         # Game subsystems (audio synthesis, particles, wave tracking)
    └── ui/              # DOM HUD overlays, modal screens, and UI elements
```

## How to Run

To run the game locally, start a local HTTP server from the repository root:

```bash
python3 -m http.server 8000
```

Then open your browser and navigate to:

```
http://localhost:8000
```

## Why a Server is Required

IMMUNE is structured using standard JavaScript ES modules (`import` and `export` statements). Modern web browsers enforce CORS (Cross-Origin Resource Sharing) security policies that block loading ES modules directly over the `file://` protocol. Running a lightweight local HTTP server satisfies these security requirements and allows modules to load seamlessly.
