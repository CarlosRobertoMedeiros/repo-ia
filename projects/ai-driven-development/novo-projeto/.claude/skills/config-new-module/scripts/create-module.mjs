#!/usr/bin/env node
/**
 * config-new-module
 *
 * Cria, de forma determinística, um novo módulo de negócio em modules/<nome>
 * dentro do monorepo (Turborepo + npm workspaces), a partir dos arquivos de
 * ../assets, e o liga aos apps frontend e backend.
 *
 * Uso (sempre a partir da raiz do monorepo):
 *   node create-module.mjs --name <nome-do-modulo> --namespace <@escopo>
 *   node create-module.mjs <nome-do-modulo> <@escopo>   (posicionais: o que começa com @ é o namespace)
 *
 * O namespace é OBRIGATÓRIO. Nada existente é apagado: se modules/<nome> já
 * existir, o script aborta.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 9;
let currentStep = 0;

const BASE_ENV = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: '1',
  TURBO_TELEMETRY_DISABLED: '1',
  DO_NOT_TRACK: '1',
  npm_config_yes: 'true',
  npm_config_fund: 'false',
  npm_config_audit: 'false',
};

function step(title) {
  currentStep += 1;
  console.log(`\n=== [${currentStep}/${TOTAL_STEPS}] ${title} ===`);
}

function fail(message) {
  console.error(`\n✖ ERRO${currentStep ? ` no passo ${currentStep}` : ''}: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✔ ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

/** Executa um comando de shell de forma síncrona; aborta se o exit code != 0. */
function run(command, cwd) {
  console.log(`$ ${command}   (cwd: ${cwd})`);
  const result = spawnSync(command, { cwd, stdio: 'inherit', shell: true, env: BASE_ENV });
  if (result.error) fail(`falha ao executar "${command}": ${result.error.message}`);
  if (result.status !== 0) fail(`comando "${command}" terminou com código ${result.status}`);
}

const exists = (p) => fs.existsSync(p);
const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail(`não foi possível ler o JSON ${p}: ${e.message}`);
  }
};
const writeJson = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

const USAGE = 'Uso: create-module.mjs --name <nome-do-modulo> --namespace <@escopo>';

function parseArgs(argv) {
  const opts = { name: null, namespace: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name') opts.name = argv[++i];
    else if (a.startsWith('--name=')) opts.name = a.slice(7);
    else if (a === '--namespace') opts.namespace = argv[++i];
    else if (a.startsWith('--namespace=')) opts.namespace = a.slice(12);
    else if (a.startsWith('@') && !opts.namespace) opts.namespace = a;
    else if (!a.startsWith('-') && !opts.name) opts.name = a;
    else fail(`argumento desconhecido: "${a}". ${USAGE}`);
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS_DIR = path.join(SKILL_DIR, 'assets');
const ASSET_FILES = ['jest.config.ts', 'tsconfig.json', 'package.json', 'src/index.ts', 'test/index.test.ts'];

const opts = parseArgs(process.argv.slice(2));
const root = process.cwd();
const modulesDir = path.join(root, 'modules');
const rootPkgPath = path.join(root, 'package.json');
const appPkgPaths = ['frontend', 'backend'].map((app) => path.join(root, 'apps', app, 'package.json'));

// 1. Pré-requisitos ----------------------------------------------------------
step('Verificando pré-requisitos');

assert(opts.namespace, `o namespace não foi informado; a skill não é executada sem ele. ${USAGE}`);
assert(/^@[a-z0-9][a-z0-9._-]*$/.test(opts.namespace), `namespace inválido: "${opts.namespace}" (esperado algo como @meu-projeto, em minúsculas)`);
ok(`namespace: ${opts.namespace}`);

assert(opts.name, `o nome do módulo não foi informado. ${USAGE}`);
assert(/^[a-z][a-z0-9-]*$/.test(opts.name), `nome de módulo inválido: "${opts.name}" (use kebab-case minúsculo, ex.: auth, user-profile)`);
ok(`módulo: ${opts.name}`);

const packageName = `${opts.namespace}/${opts.name}`;
const moduleDir = path.join(modulesDir, opts.name);

assert(exists(rootPkgPath), `package.json não encontrado em ${root}. Execute a partir da raiz do monorepo.`);
for (const p of appPkgPaths) assert(exists(p), `arquivo não encontrado: ${p}. O monorepo precisa ter apps/frontend e apps/backend.`);
ok('raiz do monorepo com apps/frontend e apps/backend');

for (const f of ASSET_FILES) assert(exists(path.join(ASSETS_DIR, f)), `asset da skill ausente: ${path.join(ASSETS_DIR, f)}`);
ok('assets da skill presentes');

assert(!exists(moduleDir), `o módulo já existe: ${moduleDir}. Remova-o manualmente ou use outro nome (o script nunca apaga nada).`);
ok(`modules/${opts.name} ainda não existe`);

for (const p of appPkgPaths) {
  const appName = readJson(p).name || '';
  if (appName.startsWith('@') && !appName.startsWith(`${opts.namespace}/`)) {
    console.log(`⚠ aviso: ${path.relative(root, p)} usa o nome "${appName}", com namespace diferente de ${opts.namespace}`);
  }
}

// 2. Pasta modules -----------------------------------------------------------
step('Garantindo a pasta modules/');
if (exists(modulesDir)) {
  ok('modules/ já existe');
} else {
  fs.mkdirSync(modulesDir);
  ok('modules/ criada');
}

// 3. Arquivos do módulo ------------------------------------------------------
step(`Criando modules/${opts.name} a partir dos assets`);
for (const f of ASSET_FILES) {
  const src = path.join(ASSETS_DIR, f);
  const dest = path.join(moduleDir, f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (f === 'package.json') {
    const content = fs
      .readFileSync(src, 'utf8')
      .replaceAll('{{NAMESPACE}}', opts.namespace)
      .replaceAll('{{MODULE}}', opts.name);
    fs.writeFileSync(dest, content, 'utf8');
  } else {
    fs.copyFileSync(src, dest);
  }
  ok(`modules/${opts.name}/${f}`);
}
assert(readJson(path.join(moduleDir, 'package.json')).name === packageName, `o package.json do módulo não ficou com o nome ${packageName}`);
ok(`nome do pacote: ${packageName}`);

// 4. Dependência nos apps ----------------------------------------------------
step(`Adicionando "${packageName}": "*" no frontend e no backend`);
for (const p of appPkgPaths) {
  const pkg = readJson(p);
  pkg.dependencies = { ...(pkg.dependencies || {}), [packageName]: '*' };
  writeJson(p, pkg);
  ok(path.relative(root, p));
}

// 5. Package.json da raiz ----------------------------------------------------
step('Ajustando o package.json da raiz (ts-node e workspaces)');
{
  const pkg = readJson(rootPkgPath);

  if (pkg.dependencies && 'ts-node' in pkg.dependencies) {
    delete pkg.dependencies['ts-node'];
    if (Object.keys(pkg.dependencies).length === 0) delete pkg.dependencies;
    ok('ts-node removido de dependencies (vai para devDependencies)');
  }
  if (!pkg.devDependencies || !pkg.devDependencies['ts-node']) {
    pkg.devDependencies = { 'ts-node': '^10.9.2', ...(pkg.devDependencies || {}) };
    ok('ts-node ^10.9.2 adicionado em devDependencies');
  } else {
    ok(`ts-node já está em devDependencies (${pkg.devDependencies['ts-node']})`);
  }

  const ws = Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces?.packages;
  assert(Array.isArray(ws), 'o package.json da raiz não declara "workspaces" como lista');
  for (const w of ['apps/*', 'packages/*', 'modules/*']) {
    if (!ws.includes(w)) {
      ws.push(w);
      ok(`workspace "${w}" adicionado`);
    }
  }
  ok(`workspaces: ${JSON.stringify(ws)}`);

  writeJson(rootPkgPath, pkg);
}

// 6. Saídas do turbo ---------------------------------------------------------
step('Garantindo "dist/**" nas saídas do build no turbo.json');
{
  const turboPath = path.join(root, 'turbo.json');
  if (!exists(turboPath)) {
    console.log('⚠ aviso: turbo.json não encontrado; passo ignorado');
  } else {
    const turbo = readJson(turboPath);
    const build = turbo.tasks?.build ?? turbo.pipeline?.build;
    if (!build) {
      console.log('⚠ aviso: tarefa "build" não encontrada no turbo.json; passo ignorado');
    } else {
      build.outputs = Array.isArray(build.outputs) ? build.outputs : [];
      if (build.outputs.includes('dist/**')) {
        ok('"dist/**" já está nas saídas');
      } else {
        build.outputs.unshift('dist/**');
        writeJson(turboPath, turbo);
        ok('"dist/**" adicionado (o módulo é consumido via dist/index.js)');
      }
    }
  }
}

// 7. Instalação --------------------------------------------------------------
step('Instalando as dependências (npm install)');
run('npm install', root);
assert(exists(path.join(root, 'node_modules', ...packageName.split('/'), 'package.json')), `o workspace ${packageName} não foi linkado em node_modules`);
ok(`${packageName} linkado em node_modules`);

// 8. Build -------------------------------------------------------------------
step('Executando o build do projeto (npm run build)');
run('npm run build', root);
assert(exists(path.join(moduleDir, 'dist', 'index.js')), `modules/${opts.name}/dist/index.js não foi gerado pelo build`);
ok(`modules/${opts.name}/dist gerado`);

// 9. Testes ------------------------------------------------------------------
step(`Executando os testes do módulo (npm test -w ${packageName})`);
run(`npm test -w ${packageName}`, root);

console.log(`
=== Resumo ===
Módulo criado em: ${moduleDir}
  pacote: ${packageName}
  dependência adicionada em: apps/frontend, apps/backend
  build e testes: OK

✔ CONCLUÍDO COM SUCESSO`);
