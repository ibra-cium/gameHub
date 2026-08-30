# PROGRESS.md — IMMUNE

Single source of truth for what is built. **The agent updates this at the end of every ticket, before reporting back.** See `AGENTS.md` section 5.2.

---

## Current state

| Field | Value |
|-------|-------|
| Active phase | Phase 5 — Act II — Bloodstream |
| Active ticket | T5.5 |
| Levels playable | 28 (Act I: Skin & Tissue, Act II: Bloodstream) |
| Last updated | 2026-08-30 |

---

## Phase status

| Phase | Name | Tickets | Status |
|-------|------|---------|--------|
| 0 | Foundation & Documentation | 5 | Done |
| 1 | Two Health Bars | 5 | Done |
| 2 | Blob Identity | 5 | Done |
| 3 | Level & Objective Engine | 6 | Done |
| 4 | Act I — Skin & Tissue | 5 | Done |
| 5 | Act II — Bloodstream | 5 | In progress |
| 6 | Meta Progression | 5 | Not started |
| 7 | The Descent | 5 | Not started |
| 8 | Acts III–VII | 6 | Not started |
| 9 | Game Feel & Ship | 6 | Not started |

Status values: `Not started`, `In progress`, `Done`, `Blocked`.

---

## Ticket log

Append one row per ticket. Newest at the bottom.

| Ticket | Date | Status | Notes |
|--------|------|--------|-------|
| — | — | — | Repo initialised. Single-file prototype: `game.js`, `index.html`, `style.css`. |
| T0.1 | 2026-08-29 | Done | Created src folder structure, module entry point main.js, root and folder READMEs, updated index.html. |
| T0.2 | 2026-08-29 | Done | Modularized game.js into ES classes (core, render, systems, entities). Renamed SoundFX to AudioEngine. Deleted game.js. |
| T0.3 | 2026-08-29 | Done | Extracted all gameplay constants and hex colours into src/config/ (balance.js, palettes.js, constants.js) with comments. |
| T0.4 | 2026-08-29 | Done | Introduced shared Entity base class for Player and Enemy; soft-body point setup unified; removed in-loop array splicing. |
| T0.5 | 2026-08-29 | Done | Completed Phase 0 documentation audit, verified all folder READMEs, and added root Project Map. |
| T1.1 | 2026-08-29 | Done | Created HostVitality system, added host balance config, wired per-frame drain and console logging in Game. |
| T1.2 | 2026-08-29 | Done | Replaced game over on player death with marrow respawn, converging stream particles, edge spawn, 1.5s invulnerability, host vitality drain penalty, and regenerating countdown banner. |
| T1.3 | 2026-08-29 | Done | Created src/ui/Hud.js, moved HUD update logic, added top-center host vitality bar hidden until first drain below 100 with 1.2s fade-in pulse and dynamic palette shifts. |
| T1.4 | 2026-08-29 | Done | Created Screens.js, implemented quiet host death screen with slow 2s black fade, level/germ stats, restart button, and full run reset. |
| T1.5 | 2026-08-29 | Done | Added procedural two-thump Web Audio heartbeat to AudioEngine with dynamic tempo/jitter driven by host vitality ratio. |
| T2.1 | 2026-08-29 | Done | Added enemy weakened state below 30% HP with limp wobble, 25% speed, deflated radius, 0.3s pale desaturation, pulsing outline, zero contact damage, and low Web Audio sound cue. |
| T2.2 | 2026-08-30 | Done | Implemented phagocytosis engulfing: 0.45s wrapping pocket deformation, inward suction shrink/fade, vacuole glow, rising Web Audio suction cue, closure ring particles, mass increment, post-engulf swell spring impulse, and damage interruption escape. |
| T2.3 | 2026-08-30 | Done | Turned mass into risk/reward dial: bacteria (+3), virus (+2), parasite (+1) up to max 30; interpolated radius (1.7x), speed (0.6x), maxHp (1.8x proportional), reach (1.5x), dash CD (1.4x), heavy wobble/inertia sag; 30-segment HUD; mass resets on death. Absorbing everything was more fun for its visceral weight and reach, though agility on low mass is safer against viruses. |
| T2.4 | 2026-08-30 | Done | Added vent action: Q key & mobile burst button dump all mass (min 3) for mass-scaled shockwave (80-360px), scaled damage (15-120) & knockback (280-650), violent squash, 1.2s 1.3x speed boost, 4s mass bar cooldown overlay, and high-pitched release audio. |
| T3.1 | 2026-08-30 | Done | Created data-driven level engine: acts.js, levels.js (LEVELS array), LevelRunner.js with wave/trickle spawning & completion callbacks; replaced and deleted WaveManager.js. |
| T3.2 | 2026-08-30 | Done | Created Objective base class, PurgeObjective, and OBJECTIVES registry; LevelRunner now runs objectives dynamically and passes live progress text to the HUD. |
| T3.3 | 2026-08-30 | Done | Promoted body cells to entities (BodyCell.js) with healthy/infected/dead states, pathogen replication, touch healing in first 40% window, and level bodyCellCount spawning. |
| T3.4 | 2026-08-30 | Done | Added ContainObjective (body cell loss limit & warning counter), SurviveObjective (countdown with continuous spawns & Web Audio 10s tension cue), PatrolObjective (calm debris collection, disabled screen shake, soft palette, slow particles), and Debris entity. |
| T3.5 | 2026-08-30 | Done | Added EscortObjective (RedBloodCell transit, off-screen HUD arrow, exit zone, enemy aggro priority) and HuntObjective (1.8x world bounds, hidden InfectionSource entity, enemy reproduction, directional bio-pulse proximity cue). |
| T3.6 | 2026-08-30 | Done | Wired levels into continuous flow: quiet intro cards, auto 1.5s level complete with vitality regen, containment fail penalty & retry, and host death screen. |
| T4.1 | 2026-08-30 | Done | Built Act I biological histology: multi-layered dermal stroma bokeh, fluid caustics, layered collagen & elastin fibers, lipid droplets, organic body cells with organelles & harmonic breathing. |
| T4.2 | 2026-08-30 | Done | Added Debris variants (fragments, dead cell husks, dust clumps) and Splinter hazard (angular geometry, contact damage, attack immunity, 2x duration 0-mass engulf). |
| T4.3 | 2026-08-30 | Done | Defined all 12 Act I levels as data in levels.js: zero vitalityDrain for L1–6, clinical note intros, alternating wave/trickle rhythms, and seamless difficulty curve. |
| T4.4 | 2026-08-30 | Done | Added bacteria binary fission: 1.5s swelling & hyper-wobble tell, 0.6s cleavage furrow & DNA replication animation, 75% size/HP scaling, Generation 2 cap, 4s damage delay, soft pop audio, and pushback impulse. |
| T4.5 | 2026-08-30 | Done | Completed Act I balance/feel audit: organic first-time tutorial flow (L1-2 movement, L3 attack, L4 engulf, L7 host bar) verified, 12-15m pacing confirmed. |
| T5.1 | 2026-08-30 | Done | Created CurrentField system with seeded flow lanes, mass resistance, faint streamline streaks, ambient particle alignment, and currentStrength level data support. |
| T5.2 | 2026-08-30 | Done | Implemented virus healthy body cell target priority, 3s spike-grip latching with 2x damage vulnerability, attack knockoff/reset, vibrant pulsating infection tether, and 0.4s pre-surge telegraph. |
| T5.3 | 2026-08-30 | Done | Added parasite mass stealing (4 mass default), bulging body & internal core, 420px/s edge flee AI with bright trail, escape despawn, off-screen HUD warning arrow, and collectible mass drops. |
| T5.4 | 2026-08-30 | Done | Built Act II look (arterial red palette, multi-layer flowing RBCs, endothelial walls, fast floaters) and all 16 levels (L13–28) with active vitalityDrain and containment fail conditions; fixed enemy boundary clamping against knockback/current drift and prevented level auto-completion control lock. |
| — | 2026-08-30 | Done | Expanded level WORLD_BOUNDS from 2400x2400 to 4800x4800 (4x area expansion) in constants.js and scaled background particle/collagen density parameters in balance.js. |
| — | 2026-08-30 | Done | Added off-screen HUD enemy indicator arrows to Game.js: color-coded by enemy type (green bacteria, purple virus, amber parasite), glowing cyan for weakened engulfable prey, and pulsating breathing animation. |
| — | 2026-08-30 | Done | Overhauled UI and controls to AAA quality: bio-diegetic frosted HUD, biometric host ECG monitor, segmented mass vial, dynamic floating joystick (left 55% touch zone), ergonomic thumb arc action cluster, radial cooldown rings, and smart auto-aim for mobile strikes. |
| — | 2026-08-30 | Done | Removed orientation lock to support both portrait and landscape; polished horizontal landscape HUD to ultra-minimal non-overlapping bio-capsule with docked top-center host monitor. |
| — | 2026-08-30 | Done | Overhauled mobile HUD & touch controls to studio-grade bioluminescent minimalism: unified Bio-Canopy canopy, breathing ECG host horizon, frosted glass action orbs with clean glowing vector glyphs, and ethereal floating joystick. |
| — | 2026-08-30 | Done | Added animated mobile orientation guard overlay to prompt players on phones to rotate their device to landscape for widescreen battlespace. |
| — | 2026-08-30 | Done | Fixed browser viewport scroll and overflow: locked container with 100dvh & overscroll-behavior none, made modal cards auto-scaling with fluid clamp typography, and added full-screen toggle (F key & HUD button). |
| — | 2026-08-30 | Done | Adapted title modal to 2-column horizontal layout in mobile landscape (zero scroll), added manifest.json & web app metadata, and wired auto-fullscreen trigger on game start and level selection taps. |

Status values: `Done`, `Partial`, `Blocked`.

If `Partial` or `Blocked`, the Notes column must say exactly what is missing and why.
If you deviated from the ticket in any way, record it here. A silent deviation is worse than a failed ticket.

---

## Open questions for the human

Anything the agent could not decide alone. Clear a row once answered.

| Raised in | Question | Answer |
|-----------|----------|--------|
| — | — | — |

---

## Known issues

Bugs found but not yet fixed. Do not fix these opportunistically inside an unrelated ticket.

| Found in | Issue | Severity |
|----------|-------|----------|
| — | — | — |
