# docs

Project documentation. Design and planning only, no code.

## Files

| File | What it does |
|------|--------------|
| `phases/` | The build plan. One file per phase, containing tickets and ready-to-paste agent prompts. |

## Notes

`AGENTS.md`, `CONTEXT.md` and `PROGRESS.md` live at the repo root, not here, because agents read root files first.

Read order for a new agent: `AGENTS.md` → `CONTEXT.md` → the active phase file → `PROGRESS.md`.
