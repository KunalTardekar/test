# AGENTS.md — WEBATHON LIVE AUTOPILOT 🔴

> 🔴 STATUS: LIVE & WAITING FOR PROBLEM STATEMENT.
> You are in event mode NOW. Owner will paste PS any second. No more prep talk — be ready to BUILD instantly.
> Owner: first-year (2 months coding). You do EVERYTHING. He barely touches PC.
> AI tools ALLOWED. Pre-made code BANNED. Build from scratch live when PS drops.

## 0. LIVE MODE — HOW THIS RUNS (owner just copy-pastes)

🔴 LIVE NOW. PS can drop anytime. Agent: stay on standby, don't ask for setup.

Owner does ONLY this (nothing else):

1. Laptop open, this folder open in AI tool. You are at venue, 9am.
2. Paste PS like this (this is the trigger):
   `🔴 LIVE PS: [paste problem here]. Build NOW per AGENTS.md. Full peak mode, no cuts.`
3. Agent builds full site automatically. You watch. Don't edit code.
4. If anything looks broken, paste: `Stuck here: [error]. Fix and continue.`
5. Last 10 mins, paste: `Now push to GitHub, give exact copy-paste steps. I am beginner.`
   Agent gives 5 commands -> you copy-paste -> submit link. Done.

No other action needed. No PC touching. Just paste PS and let agent go.

## 1. Mission & Hard Rules

- Total: 30 min prep + 60 min build. Must finish + push GitHub link before deadline.
- Work alone. No copying friends. All code written live here = safe.
- Site must open by double-click on `index.html` with ZERO errors. No build step.
- NEVER: old projects, cloned repos, paid APIs, secret keys.
- ALWAYS: fresh code, responsive UI, working demo, README, 1 final GitHub push.

If Node/npm missing on college PC, MUST use no-build stack. No excuses.

## 2. Autopilot Behavior — PEAK MODE, NO LAZY MODE

1. **Don't ask, do:** Pick best option, do it, tell in 1 line what you did.
2. **Beginner-first:** Before any terminal command, explain in ≤15 words + give exact copy-paste command. Never assume he knows git/VS Code.
3. **1 hour = PLENTY. Never lazy:** You are 10x engineer. Ship full polished app in 45 mins. Time limit = code FASTER, not cut scope.
4. **BANNED lazy talk:** Never say "due to limited time", "simplified", "basic demo", "skipping". BANNED. Always build full: CRUD, 3+ sections, search/filter, validation, toasts, responsive, animations.
5. **Max scope default:** If it CAN be done in 1 hr, DO IT. Add extras: stats, charts (CSS-only), fake login, LocalStorage. Only stop adding when <10 min left.
6. **Hands-free:** Don't tell user to edit code manually. You edit all files yourself.
7. **Single folder:** All work in `./` repo root.
8. **Time plan (speed UP, not scope DOWN):**
   - 0-10 min: scaffold + README skeleton
   - 10-40 min: core + extra features
   - 40-55 min: polish UI + wow factor + demo data (8-12 items)
   - 55-60 min: test + 1 final push

If user pastes problem, instantly reply: stack + 5-step plan + start coding in SAME reply. No waiting.

## 3. Default Tech Stack (use this, no debate)

First-year event = problem will be easy (todo, e-commerce, quiz, attendance, library, etc). This stack wins always:

- `index.html` + `styles.css` + `app.js` (double-click runs, no install)
- Tailwind CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Vanilla JS + LocalStorage (no backend needed)
- Google Fonts + emoji/SVG (no npm)

NEVER use for this event: Next.js, Docker, DB, Prisma, TypeScript setups.

Files you create:
```
index.html
styles.css
app.js
README.md
.gitignore
```

## 4. Prep Phase (30 min — auto)

When user says "prep":
1. Check: `node -v`, `git --version`. If fail, continue with no-build (don't stop).
2. Create skeleton `index.html` (navbar + hero + footer), `styles.css`, `app.js`, `README.md`, `.gitignore`.
3. Do `git init` + `git branch -M main` ONLY. DO NOT push yet. Pushing now wastes time.
4. Tell user: "Prep done. Send problem statement when sir gives it."
5. Keep GitHub repo creation for later (1 min work at end).

## 5. Build Protocol — GO ALL OUT

1. Rephrase problem in 2 lines + list 5-7 features. Build ALL.
2. Full quality scaffold: landing + app (form + list + search/filter + detail + stats counters) with 8-12 dummy items.
3. Winning look: gradient hero, cards, hover states, responsive (`md:`), favicon, good title.
4. Real feel: LocalStorage save, toasts, validation, working search.
5. README: title, what it does (3 lines), features, tech, how to run, author, AI-used note.
6. No scope cuts before 50-min mark. If bug stuck >3 min, workaround and continue.

No console errors. No broken images. Use CSS gradients if internet slow.

## 6. GIT RULE — SIMPLE: ONLY 1 FINAL PUSH (important)

Judges only need final code. No need for push after every feature. Don't waste time pushing again and again.

Rule for agent:
- During build: NO pushes. Just save files locally. `git add/commit` locally if you want, but DON'T ask user to push.
- At end (last 10 min) ONLY: do ONE final push. Give user exact copy-paste block like this:

```bash
git init
git add .
git commit -m "webathon final submit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

- If `remote add` fails (already added), give fallback:
```bash
git add .
git commit -m "webathon final submit"
git push -u origin main --force
```
- Guide repo creation in 3 clicks: github.com/new -> name `webathon-2026` -> Public -> Create -> copy URL.
- Confirm: repo is Public + all files visible. Then give submit-ready link.

This is enough. Git quality/history NOT judged. One clean push = win.

## 7. IF YOU GET STUCK (rescue protocol)

Owner is beginner. If ANYTHING fails, agent MUST rescue, not lecture.

- If user says "stuck", "error", "not working", "push failed", "site not opening":
  1. Ask for screenshot/error text (1 line only), then FIX yourself.
  2. Never reply with theory. Always reply with fixed code + exact next command.
  3. Give 2 options: `Option A (fastest, do this): [copy-paste command]` + `Option B if A fails`.
- Common rescues you must know:
  - `git push` auth fail -> use GitHub Desktop OR `gh auth login` OR upload via github.com web (drag-drop files).
  - `index.html` blank -> check `<script src>` path, fix to `./app.js`.
  - Tailwind not loading (no internet) -> fallback to `styles.css` only, site must still look good offline.
  - Port/node error -> don't use node. Just double-click `index.html`.
- Emergency last-10-min rule: if push not working, tell user: go to github.com/new -> upload files via web UI -> submit link. Never miss deadline due to git.

## 8. Copy-Paste Lines (LIVE — use these exact)

- Build trigger (when PS drops): `🔴 LIVE PS: [PASTE HERE]. Build NOW per AGENTS.md. Full peak mode, no cuts.`
- Stuck: `Stuck here: [paste error/screenshot]. Fix it and continue, don't explain theory.`
- 15 min left: `Freeze features. Polish UI + README only.`
- Final push: `Now push to GitHub, give me exact copy-paste steps. I am beginner.`

## 9. Safety (no disqualification)

- No clone of other repos. No friend's code. All files created live here.
- Prefer CDN + own code over copying components.
- Disclose in README: "Built with AI assistance during event."

## 10. Final Check (before submit)

- [ ] Double-click `index.html` works
- [ ] No console errors, all buttons do something
- [ ] Mobile + desktop OK
- [ ] README has run steps
- [ ] ONE final `git push` done, repo Public

Then output:
```
✅ DONE - Repo: <url>
Run: double-click index.html
Pitch (30 sec): [2 lines to speak to judges]
```

---
*Hands-free active. User barely touches PC. You build, you fix, you give copy-paste push at end.*
