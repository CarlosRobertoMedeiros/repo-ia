#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const VALID_MODES = new Set(["crud", "example"]);

const COMMON_FILES = [
  {
    template: path.join("assets", "common", "model", "entity.ts.tpl"),
    output: ({ aggregateName }) =>
      path.join("model", `${aggregateName}.entity.ts`),
  },
  {
    template: path.join("assets", "common", "model", "index.ts.tpl"),
    output: () => path.join("model", "index.ts"),
  },
  {
    template: path.join("assets", "common", "provider", "repository.ts.tpl"),
    output: ({ aggregateName }) =>
      path.join("provider", `${aggregateName}.repository.ts`),
  },
  {
    template: path.join("assets", "common", "provider", "index.ts.tpl"),
    output: () => path.join("provider", "index.ts"),
  },
  {
    template: path.join("assets", "common", "aggregate", "index.ts.tpl"),
    output: () => "index.ts",
  },
];

const MODE_FILES = {
  crud: [
    {
      template: path.join("assets", "usecase", "crud", "create.usecase.ts.tpl"),
      output: ({ aggregateName }) => path.join("usecase", `create-${aggregateName}.usecase.ts`),
      exportLine: ({ aggregateName }) => `export * from "./create-${aggregateName}.usecase";`,
    },
    {
      template: path.join("assets", "usecase", "crud", "update.usecase.ts.tpl"),
      output: ({ aggregateName }) => path.join("usecase", `update-${aggregateName}.usecase.ts`),
      exportLine: ({ aggregateName }) => `export * from "./update-${aggregateName}.usecase";`,
    },
    {
      template: path.join("assets", "usecase", "crud", "delete.usecase.ts.tpl"),
      output: ({ aggregateName }) => path.join("usecase", `delete-${aggregateName}.usecase.ts`),
      exportLine: ({ aggregateName }) => `export * from "./delete-${aggregateName}.usecase";`,
    },
    {
      template: path.join("assets", "usecase", "crud", "find-by-id.usecase.ts.tpl"),
      output: ({ aggregateName }) =>
        path.join("usecase", `find-${aggregateName}-by-id.usecase.ts`),
      exportLine: ({ aggregateName }) => `export * from "./find-${aggregateName}-by-id.usecase";`,
    },
    {
      template: path.join("assets", "usecase", "crud", "find-page.usecase.ts.tpl"),
      output: ({ aggregateName }) =>
        path.join("usecase", `find-${aggregateName}-page.usecase.ts`),
      exportLine: ({ aggregateName }) => `export * from "./find-${aggregateName}-page.usecase";`,
    },
  ],
  example: [
    {
      template: path.join("assets", "usecase", "example", "create.usecase.ts.tpl"),
      output: ({ aggregateName }) => path.join("usecase", `create-${aggregateName}.usecase.ts`),
      exportLine: ({ aggregateName }) => `export * from "./create-${aggregateName}.usecase";`,
    },
  ],
};

function main() {
  const args = parseArgs(process.argv.slice(2));
  const moduleName = args.module;
  const aggregateInput = args.aggregate;
  const mode = args.mode;

  if (!moduleName) {
    fail("Informe --module <nome-do-modulo>.");
  }

  if (!aggregateInput) {
    fail("Informe --aggregate <nome-do-agregado>.");
  }

  if (!mode) {
    fail('Informe --mode <crud|example>. Se o pedido nao trouxer isso, pergunte: "Deseja criar a base de usecases em \\"crud\\" ou \\"example\\"?"');
  }

  if (!VALID_MODES.has(mode)) {
    fail("O modo deve ser crud ou example.");
  }

  if (!/^[a-z0-9-]+$/.test(moduleName)) {
    fail("O modulo deve usar o nome exato da pasta existente em modules/<modulo>.");
  }

  const aggregateName = toKebabCase(aggregateInput);

  if (!aggregateName) {
    fail("Nao foi possivel normalizar o nome do agregado.");
  }

  const projectRoot = process.cwd();
  const skillRoot = path.resolve(__dirname, "..");
  const moduleDir = path.join(projectRoot, "modules", moduleName);
  const moduleSrcDir = path.join(moduleDir, "src");
  const moduleIndexPath = path.join(moduleSrcDir, "index.ts");
  const aggregateDir = path.join(moduleSrcDir, aggregateName);

  assertDirectoryExists(moduleDir, `O modulo ${moduleName} nao existe em modules/${moduleName}.`);
  assertDirectoryExists(
    moduleSrcDir,
    `O modulo ${moduleName} precisa conter modules/${moduleName}/src.`,
  );
  assertFileExists(
    moduleIndexPath,
    `O arquivo modules/${moduleName}/src/index.ts nao foi encontrado.`,
  );

  if (fs.existsSync(aggregateDir)) {
    fail(`O agregado ${aggregateName} ja existe em modules/${moduleName}/src/${aggregateName}.`);
  }

  const sharedPackage = args.sharedPackage || resolveSharedPackageName(projectRoot);

  if (!sharedPackage) {
    fail(
      "Nao foi possivel resolver o nome do pacote compartilhado. Informe --shared-package <nome> ou garanta que packages/shared/package.json exista com a chave 'name'.",
    );
  }

  const replacements = {
    "__AGGREGATE_NAME__": aggregateName,
    "__AGGREGATE_CLASS_NAME__": toPascalCase(aggregateName),
    "__AGGREGATE_REPOSITORY_NAME__": `${toPascalCase(aggregateName)}Repository`,
    "__AGGREGATE_VARIABLE_NAME__": toCamelCase(aggregateName),
    "__SHARED_PACKAGE__": sharedPackage,
  };

  log(`Criando agregado ${aggregateName} em modules/${moduleName}/src/${aggregateName}`);
  fs.mkdirSync(path.join(aggregateDir, "model"), { recursive: true });
  fs.mkdirSync(path.join(aggregateDir, "provider"), { recursive: true });
  fs.mkdirSync(path.join(aggregateDir, "usecase"), { recursive: true });

  for (const file of COMMON_FILES) {
    const templatePath = path.join(skillRoot, file.template);
    const outputPath = path.join(aggregateDir, file.output({ aggregateName }));
    materializeTemplate(templatePath, outputPath, replacements);
  }

  const modeFiles = MODE_FILES[mode];

  for (const file of modeFiles) {
    const templatePath = path.join(skillRoot, file.template);
    const outputPath = path.join(aggregateDir, file.output({ aggregateName }));
    materializeTemplate(templatePath, outputPath, replacements);
  }

  const usecaseIndexTemplatePath = path.join(
    skillRoot,
    "assets",
    "common",
    "usecase",
    "index.ts.tpl",
  );
  materializeTemplate(
    usecaseIndexTemplatePath,
    path.join(aggregateDir, "usecase", "index.ts"),
    {
      ...replacements,
      "__USECASE_EXPORTS__": modeFiles.map((file) => file.exportLine({ aggregateName })).join("\n"),
    },
  );

  updateModuleIndex(moduleIndexPath, aggregateName);

  log(`Agregado ${aggregateName} criado com sucesso.`);
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

    if (current === "--aggregate") {
      args.aggregate = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--mode") {
      args.mode = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--shared-package") {
      args.sharedPackage = argv[index + 1];
      index += 1;
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
    `Uso: node ${process.argv[1]} --module <nome-do-modulo> --aggregate <nome-do-agregado> --mode <crud|example>`,
  );
}

function materializeTemplate(templatePath, outputPath, replacements) {
  assertFileExists(templatePath, `Template nao encontrado: ${templatePath}`);
  const template = fs.readFileSync(templatePath, "utf8");
  const content = applyReplacements(template, replacements);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, ensureTrailingNewline(content));
}

function resolveSharedPackageName(projectRoot) {
  const sharedPackageJsonPath = path.join(projectRoot, "packages", "shared", "package.json");
  if (!fs.existsSync(sharedPackageJsonPath)) {
    return null;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(sharedPackageJsonPath, "utf8"));
    return typeof parsed.name === "string" && parsed.name.length > 0 ? parsed.name : null;
  } catch {
    return null;
  }
}

function applyReplacements(template, replacements) {
  return Object.entries(replacements).reduce((content, [key, value]) => {
    return content.split(key).join(String(value));
  }, template);
}

function updateModuleIndex(moduleIndexPath, aggregateName) {
  const exportLine = `export * from "./${aggregateName}";`;
  const content = fs.readFileSync(moduleIndexPath, "utf8");

  if (content.includes(exportLine)) {
    return;
  }

  const normalized = content.trimEnd();
  const nextContent = normalized.length === 0 ? exportLine : `${normalized}\n\n${exportLine}`;

  fs.writeFileSync(moduleIndexPath, `${nextContent}\n`);
}

function toKebabCase(value) {
  return String(value)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toPascalCase(value) {
  return toKebabCase(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toCamelCase(value) {
  const pascalCase = toPascalCase(value);

  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}

function ensureTrailingNewline(content) {
  return content.endsWith("\n") ? content : `${content}\n`;
}

function assertDirectoryExists(directoryPath, message) {
  if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    fail(message);
  }
}

function assertFileExists(filePath, message) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    fail(message);
  }
}

function log(message) {
  console.log(`[module-aggregate] ${message}`);
}

function fail(message) {
  console.error(`[module-aggregate] ${message}`);
  process.exit(1);
}

main();
