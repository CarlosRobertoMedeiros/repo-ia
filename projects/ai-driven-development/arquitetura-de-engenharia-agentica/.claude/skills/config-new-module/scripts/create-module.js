#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const REQUIRED_WORKSPACES = ["apps/*", "modules/*", "packages/*"];
const ROOT_TS_NODE_VERSION = "^10.9.2";
const TEMPLATE_FILES = [
  "jest.config.ts",
  "package.json",
  "tsconfig.json",
  "src/index.ts",
  "test/index.test.ts",
];
const NESTJS_TEMPLATE_FILES = [
  { template: "module.ts", output: "__MODULE_NAME__.module.ts" },
  { template: "controller.ts", output: "__MODULE_NAME__.controller.ts" },
];
const FRONTEND_TEMPLATE_FILES = [
  {
    template: "route-page.tsx",
    output: path.join("app", "(private)", "__MODULE_NAME__", "page.tsx"),
  },
  {
    template: "page.tsx",
    output: path.join("modules", "__MODULE_NAME__", "pages", "__MODULE_NAME__.page.tsx"),
  },
  {
    template: "component.tsx",
    output: path.join(
      "modules",
      "__MODULE_NAME__",
      "components",
      "__MODULE_NAME__.component.tsx",
    ),
  },
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  const moduleName = args.module;
  const namespace = args.namespace;
  const workspaceRoot = args["workspace-root"] ?? "modules";
  const skipFrontend = Boolean(args["skip-frontend"]);
  const skipBackend = Boolean(args["skip-backend"]);
  const skipNestjs = Boolean(args["skip-nestjs"]);
  const addToModules = Boolean(args["add-to-modules"]);

  if (!moduleName) {
    fail("Informe --module <nome-do-modulo>.");
  }

  if (!namespace) {
    fail("Informe --namespace <namespace>. Nao execute a skill sem namespace.");
  }

  if (!/^[a-z0-9-]+$/.test(moduleName)) {
    fail("O nome do modulo deve usar apenas letras minusculas, numeros e hifens.");
  }

  if (!/^@[a-z0-9][a-z0-9-]*$/.test(namespace)) {
    fail("O namespace deve seguir o formato @escopo.");
  }

  if (!["modules", "packages"].includes(workspaceRoot)) {
    fail("Informe --workspace-root modules ou --workspace-root packages.");
  }

  const projectRoot = process.cwd();
  const rootPackagePath = path.join(projectRoot, "package.json");
  const frontendPackagePath = path.join(projectRoot, "apps", "frontend", "package.json");
  const backendPackagePath = path.join(projectRoot, "apps", "backend", "package.json");
  const appModulePath = path.join(projectRoot, "apps", "backend", "src", "app.module.ts");
  const frontendSrcDir = path.join(projectRoot, "apps", "frontend", "src");
  const workspaceDir = path.join(projectRoot, workspaceRoot);
  const moduleDir = path.join(workspaceDir, moduleName);
  const templateDir = path.resolve(__dirname, "..", "assets", "module-template");
  const nestjsTemplateDir = path.resolve(__dirname, "..", "assets", "nestjs-module-template");
  const frontendTemplateDir = path.resolve(__dirname, "..", "assets", "frontend-module-template");
  const packageName = `${namespace}/${moduleName}`;
  const moduleClassName = toPascalCase(moduleName);
  const moduleDisplayName = toDisplayName(moduleName);

  assertFileExists(rootPackagePath, "package.json raiz nao encontrado.");
  if (!skipFrontend) {
    assertFileExists(frontendPackagePath, "apps/frontend/package.json nao encontrado.");
    assertDirectoryExists(frontendSrcDir, "apps/frontend/src nao encontrado.");
  }
  if (!skipBackend) {
    assertFileExists(backendPackagePath, "apps/backend/package.json nao encontrado.");
  }
  if (!skipNestjs) {
    assertFileExists(appModulePath, "apps/backend/src/app.module.ts nao encontrado.");
  }

  if (!fs.existsSync(templateDir)) {
    fail(`Template do modulo nao encontrado em ${templateDir}.`);
  }

  if (!skipNestjs && !fs.existsSync(nestjsTemplateDir)) {
    fail(`Template NestJS nao encontrado em ${nestjsTemplateDir}.`);
  }

  if (!skipFrontend && !fs.existsSync(frontendTemplateDir)) {
    fail(`Template do frontend nao encontrado em ${frontendTemplateDir}.`);
  }

  if (fs.existsSync(moduleDir)) {
    fail(`O modulo ${moduleName} ja existe em ${workspaceRoot}/${moduleName}.`);
  }

  const nestjsModuleDir = path.join(projectRoot, "apps", "backend", "src", "modules", moduleName);
  if (!skipNestjs && fs.existsSync(nestjsModuleDir)) {
    fail(`O modulo NestJS ${moduleName} ja existe em apps/backend/src/modules/${moduleName}.`);
  }

  const frontendModuleDir = path.join(frontendSrcDir, "modules", moduleName);
  const frontendPrivateRouteDir = path.join(frontendSrcDir, "app", "(private)", moduleName);

  if (!skipFrontend && fs.existsSync(frontendModuleDir)) {
    fail(`O modulo frontend ${moduleName} ja existe em apps/frontend/src/modules/${moduleName}.`);
  }

  if (!skipFrontend && fs.existsSync(frontendPrivateRouteDir)) {
    fail(
      `A rota privada do modulo ${moduleName} ja existe em apps/frontend/src/app/(private)/${moduleName}.`,
    );
  }

  fs.mkdirSync(workspaceDir, { recursive: true });

  log(`Criando ${workspaceRoot}/${moduleName}`);
  fs.mkdirSync(moduleDir, { recursive: true });
  materializeTemplate(templateDir, moduleDir, {
    "__MODULE_NAME__": moduleName,
    "__NAMESPACE__": namespace,
    "__PACKAGE_NAME__": packageName,
  });

  log("Atualizando package.json raiz");
  const rootPackage = readJson(rootPackagePath);
  rootPackage.devDependencies = sortObjectKeys({
    ...(rootPackage.devDependencies ?? {}),
    "ts-node": ROOT_TS_NODE_VERSION,
  });
  rootPackage.workspaces = ensureWorkspaces(rootPackage.workspaces);
  writeJson(rootPackagePath, rootPackage);

  if (!skipFrontend) {
    log("Atualizando dependencia no frontend");
    updateWorkspaceDependency(frontendPackagePath, packageName);
  }

  if (!skipBackend) {
    log("Atualizando dependencia no backend");
    updateWorkspaceDependency(backendPackagePath, packageName);
  }

  if (!skipFrontend) {
    log(`Criando estrutura do modulo no frontend para ${moduleName}`);
    materializeFrontendTemplate(frontendTemplateDir, frontendSrcDir, {
      "__MODULE_NAME__": moduleName,
      "__MODULE_CLASS_NAME__": moduleClassName,
      "__MODULE_DISPLAY_NAME__": moduleDisplayName,
    });
  }

  if (!skipNestjs) {
    log(`Criando apps/backend/src/modules/${moduleName}`);
    materializeNestjsTemplate(nestjsTemplateDir, nestjsModuleDir, moduleName, moduleClassName);
  }

  if (!skipNestjs) {
    log("Registrando modulo no AppModule do backend");
    registerNestjsModule(appModulePath, moduleName, moduleClassName);
  }

  if (addToModules) {
    log("Atualizando dependencias dos modulos de negocio");
    updateModuleWorkspaceDependencies(projectRoot, packageName);
  }

  runCommand("npm", ["install"], projectRoot);
  runCommand("npm", ["run", "build"], projectRoot);
  runCommand("npm", ["run", "test", "--workspace", packageName], projectRoot);

  log(`Modulo ${packageName} criado com sucesso.`);
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === "--module") {
      args.module = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--namespace") {
      args.namespace = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--workspace-root") {
      args["workspace-root"] = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--skip-frontend") {
      args["skip-frontend"] = true;
      continue;
    }

    if (current === "--skip-backend") {
      args["skip-backend"] = true;
      continue;
    }

    if (current === "--skip-nestjs") {
      args["skip-nestjs"] = true;
      continue;
    }

    if (current === "--add-to-modules") {
      args["add-to-modules"] = true;
      continue;
    }

    if (current === "--help" || current === "-h") {
      printHelp();
      process.exit(0);
    }

    fail(`Argumento desconhecido: ${current}`);
  }

  return args;
}

function printHelp() {
  console.log(
    `Uso: node ${process.argv[1]} --module <nome> --namespace <escopo> [--workspace-root modules|packages] [--skip-frontend] [--skip-backend] [--skip-nestjs] [--add-to-modules]`,
  );
}

function assertFileExists(filePath, message) {
  if (!fs.existsSync(filePath)) {
    fail(message);
  }
}

function assertDirectoryExists(directoryPath, message) {
  if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    fail(message);
  }
}

function materializeTemplate(templateDir, targetDir, replacements) {
  for (const relativeFile of TEMPLATE_FILES) {
    const sourcePath = path.join(templateDir, relativeFile);
    const targetPath = path.join(targetDir, relativeFile);
    const targetParent = path.dirname(targetPath);

    assertFileExists(sourcePath, `Arquivo de template ausente: ${relativeFile}`);
    fs.mkdirSync(targetParent, { recursive: true });

    let content = fs.readFileSync(sourcePath, "utf8");
    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.split(placeholder).join(value);
    }

    fs.writeFileSync(targetPath, content, "utf8");
  }
}

function materializeFrontendTemplate(templateDir, frontendSrcDir, replacements) {
  for (const { template, output } of FRONTEND_TEMPLATE_FILES) {
    const sourcePath = path.join(templateDir, template);
    const outputPath = replacePlaceholders(output, replacements);
    const targetPath = path.join(frontendSrcDir, outputPath);
    const targetParent = path.dirname(targetPath);

    assertFileExists(sourcePath, `Arquivo de template do frontend ausente: ${template}`);
    fs.mkdirSync(targetParent, { recursive: true });

    let content = fs.readFileSync(sourcePath, "utf8");
    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.split(placeholder).join(value);
    }

    fs.writeFileSync(targetPath, content, "utf8");
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function ensureWorkspaces(currentValue) {
  const current = Array.isArray(currentValue) ? currentValue : [];
  const extras = current.filter((entry) => !REQUIRED_WORKSPACES.includes(entry));
  return [...new Set([...REQUIRED_WORKSPACES, ...extras])];
}

function updateWorkspaceDependency(packagePath, packageName) {
  const packageJson = readJson(packagePath);
  packageJson.dependencies = sortObjectKeys({
    ...(packageJson.dependencies ?? {}),
    [packageName]: "*",
  });
  writeJson(packagePath, packageJson);
}

function updateModuleWorkspaceDependencies(projectRoot, packageName) {
  const modulesDir = path.join(projectRoot, "modules");

  if (!fs.existsSync(modulesDir)) {
    return;
  }

  const entries = fs.readdirSync(modulesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packagePath = path.join(modulesDir, entry.name, "package.json");
    if (!fs.existsSync(packagePath)) {
      continue;
    }

    const packageJson = readJson(packagePath);
    if (packageJson.name === packageName) {
      continue;
    }

    packageJson.dependencies = sortObjectKeys({
      ...(packageJson.dependencies ?? {}),
      [packageName]: "*",
    });
    writeJson(packagePath, packageJson);
  }
}

function sortObjectKeys(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function runCommand(command, args, cwd) {
  log(`Executando: ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
    // On Windows, npm is a .cmd shim and cannot be spawned without a shell.
    shell: process.platform === "win32",
  });

  if (result.error) {
    fail(`Falha ao iniciar o comando: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`Falha ao executar: ${command} ${args.join(" ")}`);
  }
}

function toPascalCase(name) {
  return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

function toDisplayName(name) {
  return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function replacePlaceholders(value, replacements) {
  let result = value;

  for (const [placeholder, replacement] of Object.entries(replacements)) {
    result = result.split(placeholder).join(replacement);
  }

  return result;
}

function materializeNestjsTemplate(templateDir, targetDir, moduleName, moduleClassName) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const { template, output } of NESTJS_TEMPLATE_FILES) {
    const sourcePath = path.join(templateDir, template);
    const outputFileName = output.replace("__MODULE_NAME__", moduleName);
    const targetPath = path.join(targetDir, outputFileName);

    assertFileExists(sourcePath, `Arquivo de template NestJS ausente: ${template}`);

    let content = fs.readFileSync(sourcePath, "utf8");
    content = content.split("__MODULE_NAME__").join(moduleName);
    content = content.split("__MODULE_CLASS_NAME__").join(moduleClassName);

    fs.writeFileSync(targetPath, content, "utf8");
  }
}

function registerNestjsModule(appModulePath, moduleName, moduleClassName) {
  let content = fs.readFileSync(appModulePath, "utf8");

  // Word boundary: "AuthModule" must not match "JwtAuthModule".
  if (new RegExp(`(?<![A-Za-z0-9_])${moduleClassName}Module(?![A-Za-z0-9_])`).test(content)) {
    log(`Modulo ${moduleClassName}Module ja registrado no AppModule. Pulando.`);
    return;
  }

  // 1. Adicionar import apos o ultimo import existente
  const importStatement = `import { ${moduleClassName}Module } from './modules/${moduleName}/${moduleName}.module';`;
  const lines = content.split("\n");
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("import ")) lastImportIndex = i;
  }

  if (lastImportIndex === -1) {
    fail("Nao foi possivel encontrar imports em app.module.ts.");
  }

  lines.splice(lastImportIndex + 1, 0, importStatement);
  content = lines.join("\n");

  // 2. Adicionar modulo ao array imports via contagem de brackets
  const importsArrayStart = content.indexOf("imports: [");
  if (importsArrayStart === -1) {
    fail("Nao foi possivel encontrar imports: [ em app.module.ts.");
  }

  let depth = 0;
  let closingBracketPos = -1;

  for (let i = importsArrayStart + "imports: ".length; i < content.length; i += 1) {
    if (content[i] === "[") depth += 1;
    else if (content[i] === "]") {
      depth -= 1;
      if (depth === 0) {
        closingBracketPos = i;
        break;
      }
    }
  }

  if (closingBracketPos === -1) {
    fail("Nao foi possivel encontrar o fechamento do array imports em app.module.ts.");
  }

  const lineStart = content.lastIndexOf("\n", closingBracketPos) + 1;
  const indent = content.slice(lineStart, closingBracketPos);
  content = content.slice(0, lineStart) + indent + "  " + `${moduleClassName}Module,\n` + content.slice(lineStart);

  fs.writeFileSync(appModulePath, content, "utf8");
}

function log(message) {
  console.log(`[config-new-module] ${message}`);
}

function fail(message) {
  console.error(`[config-new-module] ${message}`);
  process.exit(1);
}

main();
