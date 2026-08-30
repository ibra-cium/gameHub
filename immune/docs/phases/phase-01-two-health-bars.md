# Phase 1 — Two Health Bars

**Goal:** build the host vitality system, cheap player death, and the heartbeat that carries the host's state as sound.

**Why now:** this is the identity of the game. Everything after it assumes both bars exist.

**Success test:** you let yourself die on purpose. You respawn. The host bar drops a little. You feel bad about it.

**Risk:** MEDIUM.

---

## T1.1 — HostVitality system

**Touches:** `src/systems/HostVitality.js`, `src/core/Game.js`, `src/config/balance.js`
**Depends on:** Phase 0 complete

**Done when:**
- [ ] Host vitality starts at 100 and persists across levels
- [ ] It drains while infection is active, at a rate the level defines
- [ ] Nothing is shown on screen yet

**Prompt**

```text
## Task
Create the HostVitality system. No UI in this ticket.

## First
Read CONTEXT.md sections 2 and 5.5. Read src/core/Game.js.

## Requirements
1. Create src/systems/HostVitality.js exporting a HostVitality class with:
   - current, max (default 100)
   - drain(amountPerSecond, dt)
   - heal(amount)
   - getRatio() returning 0..1
   - isDead()
   - onChange callback hook so UI can subscribe later
2. Add to BALANCE a host section: maxVitality, baseDrainPerActiveEnemy, drainWhilePlayerDead, regenPerClearedLevel.
3. Game owns one HostVitality instance and updates it every frame.
4. Drain rule for now: vitality drops by baseDrainPerActiveEnemy multiplied by the number of living enemies, per second. Start baseDrainPerActiveEnemy very low, around 0.05.
5. Log vitality to the console once per second so it can be verified without UI.

## Acceptance criteria
- With 5 enemies alive, vitality visibly drops in the console log
- With 0 enemies alive, vitality does not drop
- Clearing a wave does not reset vitality

## Do not
- Add any HUD element yet
- End the game when vitality reaches zero yet

## When finished
1. Play a wave and watch the console.
2. Update src/systems/README.md and PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T1.2 — Player death and marrow respawn

**Touches:** `src/entities/Player.js`, `src/core/Game.js`
**Depends on:** T1.1

**Done when:**
- [ ] Player death no longer shows a game over screen
- [ ] After ~3 seconds a new cell arrives from a random map edge
- [ ] Host vitality drains faster while the player is dead
- [ ] The respawn has a visual: the cell streams in from the edge and reforms

**Prompt**

```text
## Task
Replace the game over screen with a marrow respawn. The player dying is now a setback, not an ending.

## First
Read CONTEXT.md section 5.5. Read src/entities/Player.js and the death handling in src/core/Game.js.

## Requirements
1. On cell HP reaching zero: burst the player into particles as it does now, then enter a DEAD state.
2. Do not show the game over modal. Remove that call.
3. After BALANCE.player.respawnDelay seconds (default 3.0), spawn a new player at a random edge of the world with full HP and zero mass.
4. While dead, HostVitality drains at BALANCE.host.drainWhilePlayerDead per second, on top of normal enemy drain.
5. The respawning cell should visibly stream in: a trail of particles converging to a point, then the soft body forming from small to full radius over about 0.4 seconds.
6. Show a brief centred message: "REGENERATING" with a countdown, then clear it.
7. Give the fresh cell 1.5 seconds of invulnerability so it does not die instantly in a crowded arena.

## Acceptance criteria
- Dying never shows a game over screen
- The player is controllable again about 3 seconds after dying
- Host vitality drops noticeably faster during those 3 seconds
- The respawn animation reads clearly, it is not just a pop-in

## Do not
- Remove the game over modal code from the UI files yet, it gets reused for host death in T1.4
- Reset enemies, score or level state on player death

## When finished
1. Die on purpose three times and confirm the loop feels right.
2. Update PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T1.3 — Host vitality HUD, hidden at first

**Touches:** `src/ui/Hud.js`, `style.css`
**Depends on:** T1.2

**Done when:**
- [ ] A host vitality bar exists in the HUD
- [ ] It is invisible until the first time vitality drops below 100
- [ ] When it first appears it does so with a deliberate reveal, not a pop

**Prompt**

```text
## Task
Add the host vitality bar to the HUD, but keep it hidden until the moment it first matters.

## First
Read CONTEXT.md section 2, especially the design rule about never explaining the second bar.

## Requirements
1. Create src/ui/Hud.js if it does not exist, and move existing HUD update logic into it.
2. Add a host vitality bar. Place it away from the cell HP bar so the two are clearly separate things. Top centre, thin and wide, works well.
3. Label it "HOST" and nothing else. No tooltip, no explanation.
4. The bar has opacity 0 and is not in the layout flow until vitality first drops below 100. At that moment: fade it in over about 1.2 seconds, and pulse it once.
5. Colour it from PALETTE, and let it shift from calm to alarming as the ratio falls. Do not use pure red until below 25%.
6. Subscribe to HostVitality.onChange rather than polling every frame.

## Acceptance criteria
- On a fresh start the bar is not visible anywhere
- The first time an enemy survives long enough to drain vitality, the bar fades in
- Once visible it stays visible for the rest of the run

## Do not
- Add explanatory text, a tutorial popup, or a legend
- Show the numeric value

## When finished
1. Start fresh and confirm the bar is absent, then let an enemy live and confirm the reveal.
2. Update src/ui/README.md and PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T1.4 — Host death ending

**Touches:** `src/ui/Screens.js`, `src/core/Game.js`
**Depends on:** T1.3

**Done when:**
- [ ] Vitality reaching zero ends the run
- [ ] The ending is quiet, not a loud arcade fail
- [ ] It reports how far the player got

**Prompt**

```text
## Task
Implement the real game over: the host dies.

## Requirements
1. When HostVitality.isDead(), freeze gameplay and show the host death screen.
2. Screen content: "THE HOST DID NOT SURVIVE", then below it the level reached and the total germs destroyed. A single RESTART button.
3. Tone: quiet. Slow fade to near black over about 2 seconds. Let the heartbeat sound (T1.5) slow and stop before the text appears. No screen shake, no loud sound, no red flashing.
4. Restart resets vitality, level progress and the player.

## Acceptance criteria
- Setting BALANCE.host.maxVitality to 5 lets you reach this screen within one level, for testing
- The screen feels like a loss, not a fail state

## Do not
- Add a score multiplier celebration or any upbeat element
- Auto-restart

## When finished
1. Test with a low max vitality, then set it back to 100.
2. Update PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T1.5 — Heartbeat audio

**Touches:** `src/systems/AudioEngine.js`
**Depends on:** T1.1

**Done when:**
- [ ] A synthesised heartbeat plays continuously under the game
- [ ] Its tempo and character respond to host vitality
- [ ] It is subtle enough to forget about, and noticeable when it changes

**Prompt**

```text
## Task
Add a procedural heartbeat that expresses host vitality as sound. Web Audio API only, no audio files.

## First
Read CONTEXT.md section 10. Read the existing synthesis code in src/systems/AudioEngine.js.

## Requirements
1. Add startHeartbeat() and stopHeartbeat() to AudioEngine.
2. Build the beat as a two-thump pattern: a low sine around 55Hz with a fast attack and short decay, then a quieter second thump about 0.18s later. Add a touch of low-passed noise for body.
3. Tempo is driven by host vitality ratio:
   - ratio above 0.75: about 60 bpm, steady
   - ratio 0.75 to 0.40: rises toward 100 bpm
   - ratio 0.40 to 0.15: about 130 bpm, and add small random timing jitter so it feels irregular
   - ratio below 0.15: slows to about 40 bpm and drops in volume, faint and struggling
4. Volume must sit clearly under all gameplay sounds. Target around 0.12 gain. Err on the side of too quiet.
5. Tempo changes must interpolate smoothly over several seconds, never jump.
6. Stop the heartbeat on host death, letting the last beat trail off.

## Acceptance criteria
- The heartbeat is audible but never distracting
- Draining vitality in testing produces an audible tempo change
- No clicks, pops or clipping when the tempo shifts

## Do not
- Load any audio file
- Make it loud enough to compete with attack and hit sounds
- Add music

## When finished
1. Test at several vitality levels.
2. Update src/systems/README.md and PROGRESS.md.
3. Report in 5 lines or fewer.
```
