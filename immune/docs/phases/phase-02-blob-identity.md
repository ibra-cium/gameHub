# Phase 2 — Blob Identity

**Goal:** make the player a blob instead of a circle with a punch. Engulf, mass, vent.

**Why now:** this is the mechanic the whole game is named after. Everything from Phase 3 on assumes it exists.

**Success test:** you hesitate before absorbing a germ because you are already too slow.

**Risk:** MEDIUM. T2.2 changes the feel of the game more than any other single ticket.

---

## T2.1 — Enemy weakened state

**Touches:** `src/entities/Enemy.js`, all enemy subclasses, `src/config/`
**Depends on:** Phase 1 complete

**Done when:**
- [ ] Enemies below the engulf threshold enter a visibly different state
- [ ] The state is obvious within half a second of it happening
- [ ] They slow down and stop attacking

**Prompt**

```text
## Task
Add a weakened state to enemies. This is the setup for engulfing in T2.2.

## First
Read CONTEXT.md section 5.3. Read src/entities/Enemy.js.

## Requirements
1. Add BALANCE.enemy.engulfThreshold (default 0.30) and BALANCE.enemy.weakenedSpeedMultiplier (default 0.25).
2. When an enemy's HP ratio drops below engulfThreshold, set isWeakened = true. This is one-way, they never recover.
3. A weakened enemy: moves at weakenedSpeedMultiplier of its normal speed, deals no contact damage, and stops any special behaviour (virus stops surging, parasite stops darting).
4. Visual, and this must be unmistakable:
   - The body deflates slightly, around 85% of normal radius
   - The soft-body wobble slows down and increases in amplitude, so it looks limp instead of tense
   - The colour desaturates toward a pale version of its own accent colour, over about 0.3 seconds
   - A slow pulsing outline appears around it
5. Play a short low sound once when an enemy becomes weakened.

## Acceptance criteria
- You can tell at a glance across the arena which enemies are weakened
- Weakened enemies cannot hurt you
- The transition reads as "going limp", not "changing team colour"

## Do not
- Add engulfing yet
- Change enemy HP values or damage values

## When finished
1. Damage each enemy type down to the threshold and check the read.
2. Update src/entities/README.md and PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T2.2 — Engulf (phagocytosis)

**Touches:** `src/entities/Player.js`, `src/render/softBody.js`, `src/systems/ParticleSystem.js`
**Depends on:** T2.1

**Done when:**
- [ ] Moving into a weakened enemy absorbs it
- [ ] The player's soft body visibly wraps around it during the absorb
- [ ] It feels satisfying, not automatic

**HIGH RISK.** Use Planning mode. This is the signature mechanic of the game.

**Prompt**

```text
## Task
Implement engulfing. This is the core mechanic of IMMUNE, so treat the animation as the deliverable, not a detail.

## First
Read CONTEXT.md sections 3 and 5.3. Read src/entities/Player.js fully, especially the soft-body point update and draw code.

## Requirements
1. When the player overlaps a weakened enemy, start an engulf. Duration BALANCE.player.engulfDuration, default 0.45 seconds.
2. During the engulf:
   - The enemy is locked in place and cannot be hit by anything else
   - The player's soft-body points nearest the enemy are pushed outward to flow around it, so the blob visibly deforms into a pocket that closes over the target
   - The enemy shrinks and desaturates as it is drawn inward toward the player centre
   - Player movement is slowed to about 40% for the duration
3. On completion: the enemy is destroyed, the player gains mass (T2.3 consumes it, for now just increment a mass property), and the player body does one quick swell-and-settle.
4. Feedback: a wet low-frequency sound with a rising pitch, a small ring of particles at the closure point, and a very small camera nudge. No big screen shake, this is not an explosion.
5. Engulfing must be interruptible: taking damage cancels it and the enemy escapes at full weakened HP.

## Acceptance criteria
- The wrapping deformation is clearly visible at normal play speed, not just in slow motion
- Engulfing a germ feels different from killing it with an attack
- Nothing breaks if two weakened enemies overlap the player at once - engulf one at a time
- Frame rate stays stable with 15 enemies on screen

## Do not
- Make engulf instant
- Make engulf automatic on contact without the animation playing
- Let the player engulf a non-weakened enemy

## When finished
1. Weaken and engulf each enemy type. Watch the deformation frame by frame if needed.
2. Update src/entities/README.md and PROGRESS.md.
3. Report in 5 lines or fewer, and say honestly whether the animation reads well.
```

---

## T2.3 — Mass system

**Touches:** `src/entities/Player.js`, `src/config/balance.js`, `src/ui/Hud.js`
**Depends on:** T2.2

**Done when:**
- [ ] Absorbed mass changes size, speed, HP and reach
- [ ] The trade-off is felt within one level
- [ ] Mass is shown in the HUD

**Prompt**

```text
## Task
Turn mass from a counter into the central trade-off of the game.

## First
Read CONTEXT.md section 5.4.

## Requirements
1. Add BALANCE.player.mass: { perBacteria: 3, perVirus: 2, perParasite: 1, max: 30 }.
2. Derive these from current mass, all interpolated smoothly, never snapped:
   - radius: baseRadius scaled up to 1.7x at max mass
   - speed: scaled down to 0.6x at max mass
   - maxHp: scaled up to 1.8x at max mass, and current HP scales with it so absorbing does not feel like a heal
   - pseudopod reach: scaled up to 1.5x at max mass
   - dash cooldown: scaled up to 1.4x at max mass
3. The soft body must visibly get heavier at high mass: slower wobble frequency, larger deformation amplitude, more sag in the direction of travel.
4. HUD: show mass as a small segmented bar under the cell HP bar. Segments, not a smooth fill, so the player can count what they are carrying.
5. Mass resets to zero on player death.

## Acceptance criteria
- At max mass the player is obviously slower and obviously tankier
- The size change is visible without looking at the HUD
- Absorbing at full mass does nothing rather than breaking

## Do not
- Make mass purely positive - the speed penalty must be felt
- Snap any value instantly, everything interpolates

## When finished
1. Play a full wave absorbing everything, then a wave absorbing nothing, and compare.
2. Update PROGRESS.md and report which of the two runs was more fun, honestly.
3. Report in 5 lines or fewer.
```

---

## T2.4 — Vent mass

**Touches:** `src/entities/Player.js`, `src/core/InputManager.js`
**Depends on:** T2.3

**Done when:**
- [ ] Q on desktop and a third button on mobile vent mass
- [ ] Venting deals damage and instantly restores speed
- [ ] It is a real decision, not free

**Prompt**

```text
## Task
Add the vent action: dump mass for an escape and a damage burst.

## Requirements
1. Bind Q on desktop. Add a third touch button above dash, labelled with a burst icon drawn in canvas or CSS, no image files.
2. Venting requires at least BALANCE.player.vent.minMass (default 3). Below that, nothing happens and a soft denied sound plays.
3. On vent:
   - All mass drops to zero instantly
   - A shockwave expands from the player, radius scaled by mass spent
   - Enemies caught in it take damage scaled by mass spent and are knocked back
   - The player body violently squashes then snaps back
   - The player gets BALANCE.player.vent.speedBoostDuration seconds (default 1.2) at 1.3x speed
4. Cooldown BALANCE.player.vent.cooldown, default 4 seconds, shown on the mass bar.
5. Sound: a sharp release, higher pitched than the engulf sound.

## Acceptance criteria
- Venting at max mass clears a crowd and feels powerful
- Venting at minimum mass feels weak, which is correct
- The player is noticeably faster right after venting

## Do not
- Let vent be spammable
- Give any mass back after venting

## When finished
1. Test at low, medium and max mass.
2. Update PROGRESS.md.
3. Report in 5 lines or fewer.
```

---

## T2.5 — Balance pass on the new loop

**Touches:** `src/config/balance.js` only
**Depends on:** T2.4

**Done when:**
- [ ] Attack, engulf, mass and vent form a loop that holds attention for a full three-wave run
- [ ] Numbers are documented

**Prompt**

```text
## Task
Balance pass. Only src/config/balance.js may change.

## Requirements
1. Play three complete runs. Write down what felt wrong.
2. Tune toward these targets:
   - Killing a bacterium outright takes 2 attacks. Weakening one takes 2, engulfing takes 0.45s. So engulfing is slower than finishing it off, and the mass is the reward for the extra risk.
   - Max mass should be reachable in about one and a half waves of careful play.
   - At max mass, being surrounded should feel genuinely dangerous.
   - Venting should feel like the right answer roughly once per wave.
3. Add a comment above each value you change saying what you changed it from and why.
4. Do not touch any file other than balance.js.

## Acceptance criteria
- A full three-wave run has at least three moments where you had to choose between absorbing and retreating

## Do not
- Change code to fix a balance problem - only numbers
- Add new mechanics

## When finished
1. Update PROGRESS.md with the values you changed.
2. Report in 5 lines or fewer, including the single biggest remaining balance problem.
```
