# Script Contract

Use `scripts/create-project.js` for all project creation work.

## Command

```bash
node "$(find . -maxdepth 6 -path "*/config-project-fullstack/scripts/create-project.js" ! -path "*/node_modules/*" | head -1)" [--namespace @scope] [--force-clean] [--dry-run]
```

## Guarantees

- Create the workspace in the current directory as the final destination.
- Scaffold a Turbo workspace with npm using the exact sequence requested by the user.
- Produce `apps/frontend` on port `3000`.
- Produce `apps/backend` on port `4000` with `ConfigModule.forRoot({ isGlobal: true })` and `app.enableCors()`.
- Create both `.env.example` and `.env` in frontend and backend.
- Refresh dependencies at the root after the workspace is patched.

## Safety

- Refuse to use the filesystem root as the target directory.
- Refuse to rerun in a directory that already contains the managed fullstack workspace unless `--force-clean` is present.
- Preserve existing files and directories that do not conflict with the generated project paths.
- Refuse to overwrite conflicting paths in the current directory unless `--force-clean` is present.
- Reject invalid namespaces that are not valid npm scopes such as `@acme`.

## Namespace Rules

- Rename the root package and every workspace package to the provided scope.
- Preserve the package slug when an existing package already has a scoped name.
- Rename local dependency keys across `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`.
