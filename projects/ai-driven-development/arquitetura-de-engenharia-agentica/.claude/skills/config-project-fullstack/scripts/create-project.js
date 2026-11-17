#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const FRONTEND_ENV = "NEXT_PUBLIC_API_URL=http://localhost:4000\n";
const BACKEND_ENV = "PORT=4000\n";
const DEFAULT_GENERATED_TOP_LEVEL_ENTRIES = [
  ".gitignore",
  "README.md",
  "apps",
  "package-lock.json",
  "package.json",
  "packages",
  "turbo.json",
  "tsconfig.json",
];
const WORKSPACE_MARKERS = [
  "package.json",
  "turbo.json",
  path.join("apps", "frontend", "package.json"),
  path.join("apps", "backend", "package.json"),
];
const APP_MODULE_CONTENT = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
\timports: [
\t\tConfigModule.forRoot({
\t\t\tisGlobal: true,
\t\t}),
\t],
\tcontrollers: [AppController],
\tproviders: [AppService],
})
export class AppModule {}
`;
const MAIN_TS_CONTENT = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
\tconst app = await NestFactory.create(AppModule);
\tapp.enableCors();
\tawait app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
`;

main();

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }
    if (options.selfTest) {
      runSelfTest();
      return;
    }

    const targetDir = path.resolve(process.cwd());
    const projectSlug = validateProjectSlug(slugify(path.basename(targetDir)) || "app");

    validateTargetDirectory(targetDir);
    validateNamespace(options.namespace);

    const log = createLogger(options.dryRun);
    log.step(`Current directory: ${targetDir}`);
    log.step(`Workspace slug: ${projectSlug}`);
    if (options.namespace) {
      log.step(`Namespace: ${options.namespace}`);
    }

    const existingWorkspace = detectManagedWorkspace(targetDir);
    if (existingWorkspace && !options.forceClean) {
      throw new Error(
        `Current directory already contains a fullstack workspace created by this skill: ${targetDir}`
      );
    }

    ensureCommand("node", ["--version"], targetDir, options.dryRun);
    ensureCommand("npm", ["--version"], targetDir, options.dryRun);
    ensureCommand("npx", ["--version"], targetDir, options.dryRun);

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "config-project-fullstack-"));
    const scaffoldDir = path.join(tempRoot, projectSlug);

    try {
      runCommand("npx", ["create-turbo@latest", projectSlug, "-m", "npm"], {
        cwd: tempRoot,
        dryRun: options.dryRun,
        label: "Creating Turbo workspace in a temporary directory",
      });

      const appsDir = path.join(scaffoldDir, "apps");
      ensureDirectoryExists(appsDir, "Turbo apps directory", options.dryRun);
      cleanDirectoryChildren(appsDir, options.dryRun);

      runCommand("npx", ["create-next-app@latest", "frontend", "--yes", "--src-dir", "--use-npm"], {
        cwd: appsDir,
        dryRun: options.dryRun,
        label: "Creating Next.js frontend",
      });

      if (!commandExists("nest")) {
        runCommand("npm", ["i", "-g", "@nestjs/cli"], {
          cwd: tempRoot,
          dryRun: options.dryRun,
          label: "Installing Nest CLI globally",
        });
      } else {
        log.step("Nest CLI already available globally");
      }

      runCommand("nest", ["new", "backend", "-g", "-p", "npm"], {
        cwd: appsDir,
        dryRun: options.dryRun,
        label: "Creating NestJS backend",
      });

      const backendDir = path.join(scaffoldDir, "apps", "backend");
      runCommand("npm", ["install", "@nestjs/config"], {
        cwd: backendDir,
        dryRun: options.dryRun,
        label: "Installing backend config module",
      });

      writeFile(path.join(backendDir, "src", "app.module.ts"), APP_MODULE_CONTENT, options.dryRun);
      writeFile(path.join(backendDir, "src", "main.ts"), MAIN_TS_CONTENT, options.dryRun);
      ensureBackendDevScript(path.join(backendDir, "package.json"), options.dryRun);
      ensureBackendCommonJs(backendDir, options.dryRun);

      const frontendDir = path.join(scaffoldDir, "apps", "frontend");
      ensureEnvFiles(frontendDir, FRONTEND_ENV, options.dryRun);
      ensureEnvFiles(backendDir, BACKEND_ENV, options.dryRun);

      const generatedEntries = listCopyableTopLevelEntries(scaffoldDir, options.dryRun);
      if (options.forceClean) {
        if (!existingWorkspace) {
          throw new Error(
            "Refusing --force-clean because the current directory does not look like a workspace created by this skill"
          );
        }
        removeGeneratedEntries(targetDir, generatedEntries, options.dryRun);
      } else {
        ensureNoConflictingEntries(targetDir, generatedEntries);
      }

      copyGeneratedWorkspace(scaffoldDir, targetDir, options.dryRun);

      if (options.namespace) {
        rewriteWorkspaceNamespace(targetDir, options.namespace, options.dryRun);
      }

      runCommand("npm", ["install"], {
        cwd: targetDir,
        dryRun: options.dryRun,
        label: "Refreshing root workspace dependencies",
      });

      log.step(`Created workspace entries in current directory: ${generatedEntries.join(", ")}`);
      log.step("Project configured successfully");
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`\n[error] ${error.message}`);
    process.exit(1);
  }
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    forceClean: false,
    help: false,
    namespace: null,
    selfTest: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--force-clean") {
      options.forceClean = true;
      continue;
    }
    if (arg === "--self-test") {
      options.selfTest = true;
      continue;
    }
    if (arg === "--namespace") {
      index += 1;
      options.namespace = requireValue(arg, argv[index]);
      continue;
    }
    if (arg.startsWith("--")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
    throw new Error(`Unexpected argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node ${process.argv[1]} [--namespace @scope] [--force-clean] [--dry-run]

Options:
  --namespace   Rename workspace packages to an npm scope such as @acme
  --force-clean Remove only the generated project paths in the current directory before scaffolding again
  --dry-run     Print the planned operations without executing them
  --self-test   Run internal tests for namespace rewriting and argument parsing
  --help        Show this help message
`);
}

function createLogger(dryRun) {
  return {
    step(message) {
      const prefix = dryRun ? "[dry-run]" : "[step]";
      console.log(`${prefix} ${message}`);
    },
  };
}

function requireValue(flag, value) {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function validateProjectSlug(projectSlug) {
  if (!projectSlug) {
    throw new Error("Project slug could not be derived from the current directory name");
  }
  return projectSlug;
}

function validateNamespace(namespace) {
  if (!namespace) {
    return;
  }
  if (!/^@[a-z0-9][a-z0-9._-]*$/i.test(namespace)) {
    throw new Error(`Invalid namespace '${namespace}'. Expected npm scope format like @acme`);
  }
}

function validateTargetDirectory(targetDir) {
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Current directory does not exist: ${targetDir}`);
  }
  if (!fs.statSync(targetDir).isDirectory()) {
    throw new Error(`Current path is not a directory: ${targetDir}`);
  }

  const normalizedTarget = path.resolve(targetDir);
  if (normalizedTarget === path.parse(normalizedTarget).root) {
    throw new Error("Refusing to use the filesystem root as the target directory");
  }
}

function ensureCommand(command, args, cwd, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Checking command: ${command} ${args.join(" ")}`);
    return;
  }
  const result = spawnSync(command, args, { cwd, encoding: "utf8", shell: process.platform === "win32" });
  if (result.error) {
    throw new Error(`Command not available: ${command}`);
  }
  if (result.status !== 0) {
    throw new Error(`Command check failed: ${command} ${args.join(" ")}`);
  }
}

function commandExists(command) {
  const result = spawnSync(command, ["--version"], { encoding: "utf8", shell: process.platform === "win32" });
  return !result.error && result.status === 0;
}

function runCommand(command, args, options) {
  const { cwd, dryRun, label } = options;
  const pretty = `${command} ${args.join(" ")}`;

  if (dryRun) {
    console.log(`[dry-run] ${label}: ${pretty}`);
    return;
  }

  console.log(`[run] ${label}: ${pretty}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw new Error(`Failed to run '${pretty}': ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Command exited with status ${result.status}: ${pretty}`);
  }
}

function removeDirectory(targetDir, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Removing existing target: ${targetDir}`);
    return;
  }
  fs.rmSync(targetDir, { recursive: true, force: true });
}

function ensureDirectoryExists(dirPath, label, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Validating directory: ${dirPath}`);
    return;
  }
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`${label} not found: ${dirPath}`);
  }
}

function cleanDirectoryChildren(dirPath, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Cleaning contents of ${dirPath}`);
    return;
  }
  const children = fs.readdirSync(dirPath);
  for (const child of children) {
    const childPath = path.join(dirPath, child);
    fs.rmSync(childPath, { recursive: true, force: true });
  }
}

function detectManagedWorkspace(targetDir) {
  if (!WORKSPACE_MARKERS.every((relativePath) => fs.existsSync(path.join(targetDir, relativePath)))) {
    return false;
  }

  try {
    const packageJson = readJson(path.join(targetDir, "package.json"));
    return workspaceConfigIncludes(packageJson.workspaces, "apps/*") &&
      workspaceConfigIncludes(packageJson.workspaces, "packages/*");
  } catch (error) {
    return false;
  }
}

function workspaceConfigIncludes(workspaces, entry) {
  if (Array.isArray(workspaces)) {
    return workspaces.includes(entry);
  }
  if (workspaces && Array.isArray(workspaces.packages)) {
    return workspaces.packages.includes(entry);
  }
  return false;
}

function listCopyableTopLevelEntries(scaffoldDir, dryRun) {
  if (dryRun || !fs.existsSync(scaffoldDir)) {
    return [...DEFAULT_GENERATED_TOP_LEVEL_ENTRIES];
  }

  return fs
    .readdirSync(scaffoldDir)
    .filter((entry) => !shouldSkipCopy(path.join(scaffoldDir, entry)))
    .sort();
}

function ensureNoConflictingEntries(targetDir, entries) {
  const conflicts = entries.filter((entry) => fs.existsSync(path.join(targetDir, entry)));
  if (conflicts.length > 0) {
    throw new Error(
      `Current directory already contains conflicting entries: ${conflicts.join(
        ", "
      )}. Move them away or use --force-clean to replace only the generated project paths`
    );
  }
}

function removeGeneratedEntries(targetDir, entries, dryRun) {
  for (const entry of entries) {
    const targetPath = path.join(targetDir, entry);
    if (!fs.existsSync(targetPath)) {
      continue;
    }
    removeDirectory(targetPath, dryRun);
  }
}

function copyGeneratedWorkspace(scaffoldDir, targetDir, dryRun) {
  const entries = listCopyableTopLevelEntries(scaffoldDir, dryRun);
  for (const entry of entries) {
    const sourcePath = path.join(scaffoldDir, entry);
    const targetPath = path.join(targetDir, entry);
    copyPath(sourcePath, targetPath, dryRun);
  }
}

function copyPath(sourcePath, targetPath, dryRun) {
  if (shouldSkipCopy(sourcePath)) {
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] Copying ${sourcePath} -> ${targetPath}`);
    return;
  }

  const stat = fs.lstatSync(sourcePath);
  if (stat.isDirectory()) {
    fs.mkdirSync(targetPath, { recursive: true });
    for (const child of fs.readdirSync(sourcePath)) {
      copyPath(path.join(sourcePath, child), path.join(targetPath, child), dryRun);
    }
    return;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

function shouldSkipCopy(entryPath) {
  const name = path.basename(entryPath);
  return shouldSkipDirectory(name) || name === ".git";
}

function writeFile(filePath, content, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Writing ${filePath}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function ensureEnvFiles(dirPath, content, dryRun) {
  writeFile(path.join(dirPath, ".env.example"), content, dryRun);
  writeFile(path.join(dirPath, ".env"), content, dryRun);
}

function ensureBackendDevScript(packageJsonPath, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Patching ${packageJsonPath} with dev script`);
    return;
  }
  const packageJson = readJson(packageJsonPath);
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.dev = "nest start --watch";
  writeJson(packageJsonPath, packageJson);
}

// Recent Nest CLI versions scaffold the backend as ESM ("type": "module" + nodenext),
// which requires explicit ".js" extensions on relative imports. All project skills
// generate extensionless imports, so force the backend back to CommonJS.
function ensureBackendCommonJs(backendDir, dryRun) {
  const packageJsonPath = path.join(backendDir, "package.json");
  if (dryRun) {
    console.log(`[dry-run] Forcing CommonJS module format in ${packageJsonPath}`);
    return;
  }
  const packageJson = readJson(packageJsonPath);
  if (packageJson.type === "module") {
    delete packageJson.type;
    if (packageJson.scripts && typeof packageJson.scripts["test:e2e"] === "string") {
      packageJson.scripts["test:e2e"] = packageJson.scripts["test:e2e"].replace(
        /vitest\.config\.e2e\.ts\b/,
        "vitest.config.e2e.mts"
      );
    }
    writeJson(packageJsonPath, packageJson);
  }
  // Vitest configs use ESM syntax; keep them ESM via the .mts extension.
  for (const name of ["vitest.config", "vitest.config.e2e"]) {
    const tsPath = path.join(backendDir, `${name}.ts`);
    if (fs.existsSync(tsPath)) {
      fs.renameSync(tsPath, path.join(backendDir, `${name}.mts`));
    }
  }
}

function rewriteWorkspaceNamespace(rootDir, namespace, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] Rewriting workspace package names under ${rootDir} to ${namespace}`);
    return;
  }

  const packageJsonFiles = findPackageJsonFiles(rootDir);
  const renameMap = new Map();

  for (const packageJsonPath of packageJsonFiles) {
    const packageJson = readJson(packageJsonPath);
    const nextName = computeScopedPackageName(packageJsonPath, packageJson.name, rootDir, namespace);
    if (packageJson.name && nextName && packageJson.name !== nextName) {
      renameMap.set(packageJson.name, nextName);
    }
  }

  for (const packageJsonPath of packageJsonFiles) {
    const packageJson = readJson(packageJsonPath);
    const nextName = computeScopedPackageName(packageJsonPath, packageJson.name, rootDir, namespace);
    if (nextName) {
      packageJson.name = nextName;
    }
    renameDependencyBlock(packageJson, "dependencies", renameMap);
    renameDependencyBlock(packageJson, "devDependencies", renameMap);
    renameDependencyBlock(packageJson, "peerDependencies", renameMap);
    renameDependencyBlock(packageJson, "optionalDependencies", renameMap);
    writeJson(packageJsonPath, packageJson);
  }

  rewritePackageReferencesInFiles(rootDir, renameMap);
}

// Package names are also referenced outside package.json (e.g. tsconfig "extends"
// and eslint config imports such as "@repo/eslint-config/react-internal").
function rewritePackageReferencesInFiles(rootDir, renameMap) {
  if (renameMap.size === 0) {
    return;
  }
  const filePattern = /^(tsconfig.*\.json|.*\.(mjs|cjs|js|ts|tsx|mts|cts))$/;
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const replacements = [...renameMap.entries()].map(([from, to]) => ({
    regex: new RegExp(`(["'])${escape(from)}(?=["'/])`, "g"),
    to,
  }));

  for (const baseDir of ["apps", "packages"]) {
    const absoluteBase = path.join(rootDir, baseDir);
    if (!fs.existsSync(absoluteBase)) {
      continue;
    }
    walk(absoluteBase, (entryPath, dirent) => {
      if (dirent.isDirectory()) {
        return shouldSkipDirectory(dirent.name) ? "skip" : undefined;
      }
      if (!dirent.isFile() || !filePattern.test(dirent.name)) {
        return undefined;
      }
      const original = fs.readFileSync(entryPath, "utf8");
      let updated = original;
      for (const { regex, to } of replacements) {
        updated = updated.replace(regex, `$1${to}`);
      }
      if (updated !== original) {
        fs.writeFileSync(entryPath, updated);
      }
      return undefined;
    });
  }
}

function findPackageJsonFiles(rootDir) {
  const results = [];
  walk(rootDir, (entryPath, dirent) => {
    if (dirent.isDirectory()) {
      if (shouldSkipDirectory(dirent.name)) {
        return "skip";
      }
      return;
    }
    if (dirent.isFile() && dirent.name === "package.json") {
      results.push(entryPath);
    }
  });
  return results.sort();
}

function walk(currentDir, visitor) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);
    const result = visitor(entryPath, entry);
    if (result === "skip") {
      continue;
    }
    if (entry.isDirectory()) {
      walk(entryPath, visitor);
    }
  }
}

function shouldSkipDirectory(name) {
  return name === "node_modules" || name === ".git" || name === ".next" || name === "dist" || name === ".turbo";
}

function computeScopedPackageName(packageJsonPath, currentName, rootDir, namespace) {
  const relativeDir = path.relative(rootDir, path.dirname(packageJsonPath));
  const defaultSlug = slugify(path.basename(path.dirname(packageJsonPath)));

  if (relativeDir === "") {
    return `${namespace}/${slugify(path.basename(rootDir))}`;
  }

  if (typeof currentName === "string" && currentName.startsWith("@") && currentName.includes("/")) {
    return `${namespace}/${currentName.split("/")[1]}`;
  }

  if (typeof currentName === "string" && currentName.trim()) {
    return `${namespace}/${slugify(currentName.replace(/^@/, "").split("/").pop())}`;
  }

  return `${namespace}/${defaultSlug}`;
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function renameDependencyBlock(packageJson, field, renameMap) {
  if (!packageJson[field]) {
    return;
  }
  const nextBlock = {};
  for (const [dependencyName, version] of Object.entries(packageJson[field])) {
    const nextName = renameMap.get(dependencyName) || dependencyName;
    nextBlock[nextName] = version;
  }
  packageJson[field] = nextBlock;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function runSelfTest() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "config-project-fullstack-"));
  try {
    const appDir = path.join(tempRoot, "apps", "frontend");
    const pkgDir = path.join(tempRoot, "packages", "shared");
    fs.mkdirSync(appDir, { recursive: true });
    fs.mkdirSync(pkgDir, { recursive: true });

    writeJson(path.join(tempRoot, "package.json"), {
      name: "demo-root",
      private: true,
      workspaces: ["apps/*", "packages/*"],
    });
    writeJson(path.join(tempRoot, "turbo.json"), {
      $schema: "https://turbo.build/schema.json",
    });
    writeJson(path.join(appDir, "package.json"), {
      name: "frontend",
      dependencies: {
        "@repo/shared": "workspace:*",
      },
      devDependencies: {
        "@repo/typescript-config": "*",
      },
    });
    const backendDir = path.join(tempRoot, "apps", "backend");
    fs.mkdirSync(backendDir, { recursive: true });
    writeJson(path.join(backendDir, "package.json"), {
      name: "backend",
    });
    writeJson(path.join(pkgDir, "package.json"), {
      name: "@repo/shared",
    });
    const tsConfigDir = path.join(tempRoot, "packages", "typescript-config");
    fs.mkdirSync(tsConfigDir, { recursive: true });
    writeJson(path.join(tsConfigDir, "package.json"), {
      name: "@repo/typescript-config",
    });

    fs.writeFileSync(
      path.join(pkgDir, "tsconfig.json"),
      '{ "extends": "@repo/typescript-config/react-library.json" }\n'
    );
    fs.writeFileSync(
      path.join(pkgDir, "eslint.config.mjs"),
      'import { config } from "@repo/eslint-config/react-internal";\nimport x from "@repo/shared";\n'
    );

    rewriteWorkspaceNamespace(tempRoot, "@acme", false);

    const sharedTsConfig = fs.readFileSync(path.join(pkgDir, "tsconfig.json"), "utf8");
    assert(
      sharedTsConfig.includes('"@acme/typescript-config/react-library.json"'),
      "tsconfig extends should be renamed"
    );
    const sharedEslint = fs.readFileSync(path.join(pkgDir, "eslint.config.mjs"), "utf8");
    assert(sharedEslint.includes('"@acme/shared"'), "Source imports should be renamed");
    assert(
      sharedEslint.includes('"@repo/eslint-config/react-internal"'),
      "Packages absent from the workspace must not be renamed"
    );

    const rootPackage = readJson(path.join(tempRoot, "package.json"));
    const frontendPackage = readJson(path.join(appDir, "package.json"));
    const sharedPackage = readJson(path.join(pkgDir, "package.json"));

    assert(
      rootPackage.name === "@acme/" + slugify(path.basename(tempRoot)),
      "Root package should be scoped"
    );
    assert(frontendPackage.name === "@acme/frontend", "Frontend package should be scoped");
    assert(frontendPackage.dependencies["@acme/shared"] === "workspace:*", "Dependency key should be renamed");
    assert(frontendPackage.devDependencies["@acme/typescript-config"] === "*", "Dev dependency key should be renamed");
    assert(sharedPackage.name === "@acme/shared", "Scoped package should preserve slug");

    const args = parseArgs(["--namespace", "@acme", "--dry-run"]);
    assert(args.namespace === "@acme", "Namespace parsing failed");
    assert(args.dryRun === true, "Dry-run parsing failed");
    assertThrows(() => parseArgs(["demo"]), "Unexpected argument should be rejected");
    assert(detectManagedWorkspace(tempRoot) === true, "Managed workspace detection failed");

    console.log("[ok] Self-test passed");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch (error) {
    threw = true;
  }
  if (!threw) {
    throw new Error(message);
  }
}
