---
name: config-project-fullstack
description: Deterministically create a new Turbo monorepo from zero in the current directory with an apps/frontend Next.js app on port 3000 and an apps/backend NestJS app on port 4000, including CORS, @nestjs/config, .env.example and .env files, optional workspace package namespace rewriting, and a guard against rerunning inside an already-created workspace.
---

# Config Project Fullstack

Use the script at `scripts/create-project.js` instead of replaying the scaffold steps manually.

## Workflow

1. Read `references/script-contract.md` if the request is about flags, safety guarantees, or namespace behavior.
2. Run:

```bash
node "$(find . -maxdepth 6 -path "*/config-project-fullstack/scripts/create-project.js" ! -path "*/node_modules/*" | head -1)" [--namespace @scope] [--force-clean]
```

3. Always run the script from the folder that should become the project root. The final project must be created in the current directory, not in a sibling or nested destination folder.
4. Prefer `--namespace @scope` when the user wants all workspace packages renamed to the same npm scope.
5. Prefer `--force-clean` only when the current directory already contains a workspace created by this skill and the user clearly wants that generated structure recreated from zero.
6. After the script finishes, verify the resulting workspace paths in the current directory and report what was created.

## Behavior

- Create the Turbo repo with npm.
- Use the current directory as the final workspace destination.
- Refuse to run again in a directory that already contains the generated fullstack workspace unless `--force-clean` is explicitly supplied.
- Preserve pre-existing files and directories in the current directory when they do not conflict with generated project paths.
- Remove the default `apps/*` created by Turbo.
- Create `apps/frontend` with `create-next-app`.
- Ensure Nest CLI exists, create `apps/backend`, install `@nestjs/config`, and patch the backend bootstrap files.
- Create `.env.example` and `.env` for frontend and backend.
- Reinstall workspace dependencies at the root to refresh the lockfile after scaffolding and namespace updates.
- Rewrite package names and local package references when `--namespace` is provided.

## Constraints

- Keep the workflow deterministic and do not change the scaffold order unless the script itself is being updated.
- Do not create the final project in another folder. The final workspace must land in the current directory only.
- Refuse conflicting project paths in the current directory unless `--force-clean` is explicitly supplied.
- Do not move, delete, or rewrite unrelated non-conflicting files or directories that already exist in the current directory.
- Do not create extra documentation files beyond the skill resources already present.
