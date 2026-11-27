# watch-and-learn

Portfolio language-learning app, Chinese (Mandarin, Simplified) first.
Overview: @README.md. Session flow: @docs/architecture.md.
Decisions live in docs/adr/ (trimmed MADR 4). Read the relevant ADR before
changing architecture. New decisions get a new ADR; never rewrite an
accepted one.

## Stack

- pnpm 12 workspaces + Turborepo; package scope `@wal/`
- apps/: desktop (Electron + electron-vite + React), api (NestJS),
  web (Next.js), mobile (Expo, review only). Desktop is being started now.
- packages/: config (strict tsconfig base, ESLint preset
  `@wal/config/eslint`, Prettier), types (zod)
- TypeScript 6, strict. Do not upgrade to TS 7: typescript-eslint doesn't
  support it.
- Node 26 via fnm (`.node-version`)
- Postgres 18 in Docker (`infra/docker-compose.yml`)

## Commands

- `pnpm turbo run build lint typecheck`: what CI runs
- `pnpm format` / `pnpm format:check`
- `pnpm db:up` / `pnpm db:down` / `pnpm db:logs`
- `pnpm --filter <package> <script>`: run a script in one package

## Conventions

- Conventional Commits, enforced by commitlint (`feat:`, `fix:`, `docs:`,
  `chore:`, ...)
- Husky pre-commit runs lint-staged. Every package with an ESLint config
  has its own `.lintstagedrc.json`.
- LF line endings; Prettier formats everything.
- Build-script approvals go in `allowBuilds` in `pnpm-workspace.yaml`.
- In apps/desktop, workspace packages and renderer libraries go in
  `devDependencies` so electron-vite bundles them.
- Only text is stored, never audio (ADR 0002).

## Windows environment

- Native Windows (not WSL), PowerShell, Cursor.
- Use `where.exe`, not `where`.
- Never create files with PowerShell `echo` or `>` (writes UTF-16). Use file
  editing tools.
- Git hooks need fnm's PATH to find pnpm. Run git from a terminal where fnm
  is active.

## How to work with me

I'm a recent CS grad learning these tools.

- Go one step at a time. After each step, stop and wait for me.
- Before editing, explain what each tool or file does, why it was chosen,
  and what it does for the project. Assume no prior knowledge.
- Give a time estimate for each step.
- Look up current versions and docs instead of relying on memory.
- End each step with a checklist: every change made and what it's for.
- Don't commit or push unless I ask. I review diffs first.
