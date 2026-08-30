# src/entities

Game entities including the player white blood cell, invading pathogens, neutral body cells, collectibles, and hazards.

## Files

| File | What it does |
|------|--------------|
| `Entity.js` | Base class for all game entities managing position, velocity, lifecycle, and soft-body points. |
| `Player.js` | Player white blood cell with 28-point soft body mesh, pseudopod strikes, surge dashes, phagocytosis engulf, mass scaling, and mass vent blast. |
| `Enemy.js` | Base entity class for pathogens handling health, damage reactions, knockback, weakened state, and engulf flags. |
| `Bacteria.js` | Oval pathogen multiplying via binary fission with pre-split swelling tell, 0.6s cleavage furrow animation, dual DNA replication, and generation cap. |
| `Virus.js` | Pathogen prioritizing healthy body cells, latching with gripping spikes and pulsing tether, taking 2x damage while latched, and telegraphing surges with a 0.4s spike-retracting compression. |
| `Parasite.js` | Segmented slithering pathogen that steals mass, visibly bulges, flees to arena edges, and drops mass pickups on defeat. |
| `Pickup.js` | Collectible mass pellet with soft bobbing, magnetic homing to player, and chime on recovery. |
| `BodyCell.js` | Neutral tissue cell entity with healthy, infected, and deflated dead states, twitching spasms, pathogen replication, and touch healing. |
| `Debris.js` | Floating cellular fragments, dead cell husks, and dust clumps collectible on touch with chime and sparkle burst. |
| `Splinter.js` | Static sharp foreign shard hazard dealing contact damage, immune to attack damage, removed by slow zero-mass engulfing. |
| `RedBloodCell.js` | Erythrocyte escort entity with waypoint navigation, soft-body biconcave disc shape, health bar, and preferred enemy aggro priority. |
| `InfectionSource.js` | Throbbing biological pathogen nest with undulating membrane, anchoring tendrils, spore clusters, continuous enemy spawning, and health bar. |

## Notes

All entity rendering is procedural Canvas 2D with soft-body spring deformation, except Splinter which uses sharp angular geometry to visually signal foreign inorganic matter. Parasites chase the player and steal up to 4 mass on contact (dealing normal contact damage if player has zero mass; no theft during player engulfing). After stealing mass, the parasite turns and flees toward the nearest world edge at increased speed (420px/s) while visibly bulging with a pulsing stolen mass core and emitting a bright trail; off-screen fleeing parasites trigger a pulsing HUD warning arrow. If the parasite reaches the edge, it escapes and the mass is permanently lost; if killed or engulfed before escaping, it drops its stolen mass as magnetic collectible pickups (`Pickup.js`). Viruses prioritize healthy body cells within seek radius: upon reaching a cell, the virus latches on, grips with its spikes, and casts a high-visibility pulsing energy tether that brightens over 3 seconds before converting the cell into an infected state. A latched virus takes 2x double damage, and any player attack knocks it off and saves the healthy cell. When targeting the player, the virus signals its dash with a 0.4s telegraph during which it compresses, retracts its spikes, and glows with warning energy. Bacteria reproduce every 9 seconds via binary fission: a 1.5s swelling and hyper-wobble tell alerts the player, followed by a 0.6s elongation and waist pinch animation with dual nucleoid DNA replication, separating with a soft pop, small particle spray, and opposing push velocities. Offspring and split parents scale to 75% radius and HP up to Generation 2 (cap prevents runaway reproduction). Taking damage delays splitting by 4 seconds and cancels any active fission. Enemies enter an irreversible limp weakened state below 30% HP. Engulfing is triggered automatically on contact with a weakened enemy or splinter and awards mass based on enemy type (Bacteria +3, Virus +2, Parasite +1 up to max 30; Splinter awards 0 mass and takes 2x duration). Gaining mass smoothly scales size (up to 1.7x), max HP (1.8x), pseudopod reach (1.5x), dash cooldown (1.4x), while reducing speed (down to 0.6x) and increasing soft-body heaviness, wobble amplitude, and inertia sag. Pressing Q or touch vent button dumps all mass (min 3) to trigger a mass-scaled damage shockwave, radial knockback, violent membrane squash, and a 1.2s 1.3x speed escape boost with a 4s cooldown. Mass resets to zero on death. Enemies prioritize active Red Blood Cell escort targets over the player.

Draw order: non-engulfed enemies, static splinters, and pickups are drawn before the player; engulfed enemies and splinters are drawn after the player so the shrink animation is visible on top of the membrane.
