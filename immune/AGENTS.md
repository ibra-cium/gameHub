# AGENTS.md — IMMUNE

Operating rules for any AI agent working in this repository.
Read this file completely before your first edit in a session. Read `CONTEXT.md` before any gameplay ticket.

---

## 1. What this project is

IMMUNE is a browser game. Pure HTML, CSS and vanilla JavaScript. No engine, no framework, no build step. Everything visible is drawn procedurally on an HTML5 Canvas 2D context. All audio is synthesised with the Web Audio API.

The player controls a white blood cell defending a human body across 100 levels. The design vision lives in `CONTEXT.md`.

---

## 2. Hard constraints — never violate these

1. **No game engine or UI framework.** No React, Vue, Phaser, Three.js, Pixi, Godot.
2. **No npm dependencies and no bundler.** If `package.json` exists it holds scripts only.
3. **No external assets.** No image files, no audio files, no icon fonts, no web fonts. Everything is procedural.
4. **No network calls at runtime.** No analytics, no CDN links, no `eval`, no remotely loaded code.
5. **ES modules only.** Use `import` / `export`. Never add game code as a global `<script>` tag.
6. **The game must be playable after every ticket.** If you cannot finish a ticket without leaving the game broken, stop and report instead of leaving broken code behind.
7. **Never delete existing procedural animation code to simplify a problem.** The soft-body deformation is the identity of this game.

---

## 3. How to run it

ES modules do not load over the `file://` protocol. Serve the folder:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

If you hit a module CORS error, start the server. Do **not** "fix" it by converting modules back to global scripts.

---

## 4. Code standards

- Plain ES2022. `const` by default, `let` when reassigned, never `var`.
- One class per file. File name matches the class name: `Player.js` exports `Player`.
- camelCase for variables and functions, PascalCase for classes, SCREAMING_SNAKE for constants.
- **Every tunable number lives in `src/config/`.** No magic numbers inside entity or system code. If you need a new number, add it to `balance.js` with a comment saying what it does.
- All colours come from `src/config/palettes.js`. Never hardcode a hex value in a draw function.
- Every update function takes `dt` in seconds. Never assume 60 FPS.
- Comments explain *why*, not *what*. Do not narrate obvious code.
- No TypeScript, no JSDoc type annotations. Keep it readable plain JS.
- Keep files under roughly 400 lines. If a file grows past that, split it and say so in your report.

---

## 5. Documentation duties — mandatory, not optional

### 5.1 Folder README

**Every folder inside `src/` and `docs/` must contain a `README.md`.**

When you add, rename, delete or significantly change a file, update that folder's `README.md` in the same ticket.

Required format:

```markdown
# src/systems

What this folder is responsible for, in one or two sentences.

## Files

| File | What it does |
|------|--------------|
| `ParticleSystem.js` | Pools and updates all particles. Emitters for bursts, trails and shockwaves. |
| `AudioEngine.js` | Web Audio synthesis. All sound effects are generated, no files. |

## Notes

Anything a future reader needs to know before editing this folder.
```

Keep the "What it does" column to one line. This table is how a future agent finds things without reading every file.

### 5.2 PROGRESS.md

**Update `PROGRESS.md` at the end of every ticket, before you report back.**

Append a row to the log table:

```markdown
| T3.2 | 2026-09-04 | Done | Added ContainObjective, wired into LevelRunner. Infected cells now tracked per level. |
```

Status is `Done`, `Partial` or `Blocked`. If `Partial` or `Blocked`, write one sentence saying exactly what is missing and why.

If you deviated from the ticket in any way, record the deviation here. A silent deviation is worse than a failed ticket.

---

## 6. Definition of done

A ticket is done only when all of these are true:

- [ ] Every acceptance criterion in the ticket passes
- [ ] The game runs with zero errors in the browser console
- [ ] You have actually played it and confirmed the change works
- [ ] No unrelated files were touched
- [ ] Folder `README.md` updated for any folder you changed
- [ ] `PROGRESS.md` updated
- [ ] Your report is five lines or fewer

---

## 7. Workflow for every ticket

1. **Plan first.** Before writing code, state your plan: which files you will create, which you will modify, and in what order. Wait for approval if the ticket touches more than three existing files.
2. **Read before writing.** Open the files you intend to change. Never guess at existing code.
3. **Smallest change that satisfies the ticket.** Do not refactor code the ticket did not ask about.
4. **Verify.** Run the game. Confirm the acceptance criteria yourself.
5. **Document.** Folder README, then PROGRESS.md.
6. **Report.** Five lines maximum: what changed, what to test, anything you deviated on.

---

## 8. Stop and ask when

- The ticket contradicts `CONTEXT.md` or an earlier ticket
- Two acceptance criteria conflict with each other
- Finishing the ticket would require breaking a hard constraint in section 2
- You would need to delete or rewrite more than 200 lines of working code
- You are about to invent a gameplay rule the ticket did not specify

Asking a short question costs one message. Guessing wrong costs a whole phase.

---

## 9. Things agents keep getting wrong here — do not do these

- **Do not add a build step.** Not Vite, not esbuild, not Rollup, not "just for dev".
- **Do not swap Canvas 2D for WebGL.** Performance problems get solved with pooling and culling, not a rewrite.
- **Do not create placeholder art files.** There are no assets. Draw it.
- **Do not restructure folders on your own initiative.** Follow the layout in `CONTEXT.md`.
- **Do not implement future tickets early.** If T4.3 looks easy while you are in T4.1, leave it.
- **Do not write tests unless a ticket asks for them.** This is a game prototype, verification is playing it.
- **Do not add comments describing what an AI did.** No "AI-generated", no "as requested", no changelog comments in source files. The log lives in `PROGRESS.md`.

---

## 10. Model settings (Gemini 3.7 Flash, Antigravity)

- `thinking_level: HIGH` for architecture and refactor tickets (Phase 0, Phase 3).
- `thinking_level: MEDIUM` for everything else. `MINIMAL` is not supported on 3.7 Flash.
- Do not set `temperature`, `top_p` or `top_k`. These parameters are removed on this model generation.
- Prompts to you use Markdown headings. Do not mix Markdown and XML tagging in your own output.
- Start in Planning mode for any ticket marked **HIGH RISK**. Fast mode is fine for the rest.
