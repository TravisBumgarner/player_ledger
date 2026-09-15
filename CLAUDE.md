# Working in this repo

## Comments

**Prefer clean code over explained code.** A clear name, a small function, or an
early return beats a paragraph describing an unclear one. Reach for a comment
only when the code cannot carry the meaning itself.

**Be concise.** One or two lines. A `const` does not need a preamble. If a
comment is longer than the code it describes, it is wrong — either the code
needs restructuring or the comment needs deleting.

Worth a comment:

- A non-obvious *why* — a workaround, an ordering constraint, a deliberate
  trade-off, something that looks wrong but isn't.
- A security-relevant invariant that a future edit could silently break.

Not worth a comment:

- Restating the code in English.
- Section banners, decorative dividers, numbered step headers.
- Narrating a design decision at length. That belongs in the commit message,
  which is read on purpose. Code comments are read by accident, forever, by
  someone trying to do something else.

Volume is itself a problem: a wall of comments buries the two lines that
actually mattered, and reviewers stop reading all of them.

## Pre-commit

**Never pass `--no-verify`, and never set `HUSKY=0`.** The hook is `npx
lint-staged`, `npm run check`, `npm run typecheck`, `npm test`, run under
`sh -e`, so the first failure stops the commit. That is the entire point of it.

Every later gate — CI, review, a deploy preflight — reports the same failures
the hook would have. Switch the first one off and the rest become noise that
gets merged past.

The hook is fast, and it is right. When it fails, fix what it found. If the
failure looks unrelated to the change in hand, say so rather than stepping
around it — an unrelated failure already sitting on `main` is itself the news.

## Branches and PRs

**Branch off `main`. Never stack a PR on another branch.** If the base merges
first, the stacked PR merges into a branch that is already spent, GitHub reports
it MERGED, and `main` never receives it. **A promise in a PR body to retarget
later is not a mechanism.** Nobody reads it at merge time, including the person
who wrote it.

So when a dependency is real, the answer is not to stack:

- **Wait for the base to merge, then branch from `main`.** This is almost always
  right, and the wait is usually shorter than the recovery.
- If the work genuinely cannot wait, build it on the base branch and open **one**
  PR from that branch to `main` carrying both. One merge, one destination.
- Ask Travis rather than inventing a third option.

Two habits that go with it:

- Push a branch before starting anything that depends on it. An unpushed commit
  reaches the remote only as somebody else's ancestor.
- **After a PR merges, verify the change is on `main`** — `git log origin/main`
  or check for a file it added. The merge badge says a merge happened, not where
  it went.

Recovery, if it happens: nothing is lost. Branch from `main`, merge the stranded
branch, open one PR. No cherry-picking.

## Tests

**Do not add a test without asking first.** Propose what you want to cover and
why, and wait. This is not a formality — left alone I write a great many tests
that assert nothing anyone would ever be hurt by, and the volume then hides the
few that matter.

A test earns its place when the bug it catches would be **silent, permanent, or
visible to the wrong person**:

- Authorization rules, and anything deciding what one user may see of another's
  data.
- Migrations, where a snapshot disagreeing with its DDL drops a constraint
  quietly and forever.
- Anything append-only. A wrong row that cannot be edited later.
- Server-side limits and refusals — a byte cap, a duration cap, input that
  parses as perfectly good data but isn't.

A test does not earn its place for asserting that a button is disabled before a
required field is typed, that a dialog opens, that a label is monospace, or that
a component renders the props it was handed. Those break loudly, in the app, and
are fixed in a minute.

**Authorization is a backend concern.** Queries filter and routes check. A
frontend test of who-sees-what is testing that a list renders the rows it was
given, which is not the thing anyone is worried about. Test the rule once where
it lives, and test the API applying it.

## Design

**`_design/WIREFRAME_UI.md` is the house style for every screen.** Read it before
writing any UI — **including its Standing deviations section**, if it has one,
which overrides rules in the body.

Do not "upgrade" a wireframe screen with rounded corners or accent hues — the
low-chroma is the point, not a stage to pass through. A screen leaves this
language only when Travis says so.

**The theme carries the language; components do not.** Put styling in the MUI
theme — palette, typography, shape, and `components.*` defaults and variants —
so every surface inherits it and anything built later is correct without anyone
remembering to make it so.

A per-component `sx` is a last resort, and it is for **layout**: this box is
240px wide, this row is a grid. It is not for restating what the theme already
says. A colour, a radius, a border weight or a font written into a component is
a place the language can drift.

If something cannot be expressed in the theme, that is worth saying out loud
rather than working around quietly — usually it means the theme is missing a
variant that several places want.

## Migrations

The database is SQLite (`better-sqlite3`), the schema is
`packages/api/src/db/schema.ts`, and migrations live in `packages/api/drizzle`.

**Read the SQL drizzle-kit generates before committing it.** It is a diff tool,
not an oracle, and it can emit SQL that disagrees with its own snapshot. Every
later diff then compares against a snapshot describing a constraint the database
does not have, so nothing ever re-adds it.

**SQLite cannot alter most column properties in place.** Changing a column's
type, nullability, default, or a foreign key makes drizzle-kit rebuild the table:
create `__new_x`, copy rows, drop `x`, rename. Read that copy statement — a
column it leaves out is data it throws away. The rebuild runs with
`PRAGMA foreign_keys=OFF`, so it cannot be relied on to catch orphaned rows.

**A rename cannot be generated non-interactively.** `drizzle-kit generate`
prompts to disambiguate "renamed" from "dropped and recreated" and dies without
a TTY — and a dropped-and-recreated table takes every row with it. Hand-write
the migration, derive the next `meta/NNNN_snapshot.json` from its predecessor,
append to `meta/_journal.json`, then run `drizzle-kit generate` again: it must
report "No schema changes", which is what proves the two agree.

Adding `NOT NULL` to a populated table needs a default or a backfill first.

## Commits and PRs

Prose over bullet-dumps, and explain *why* rather than listing what changed —
the diff already lists what changed. This is where design reasoning belongs.
