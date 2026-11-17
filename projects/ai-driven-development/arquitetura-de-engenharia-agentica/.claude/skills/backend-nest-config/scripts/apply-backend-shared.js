#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SKILL_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(SKILL_DIR, 'assets');
const TEMPLATE_DIR = path.join(ASSETS_DIR, 'shared-template');
const BACKEND_DIR = path.join(process.cwd(), 'apps', 'backend');
const BACKEND_SRC = path.join(BACKEND_DIR, 'src');
const SHARED_TARGET = path.join(BACKEND_SRC, 'shared');

const RUNTIME_DEPS = [
  '@nestjs/config',
  '@nestjs/jwt',
  '@nestjs/passport',
  'passport',
  'passport-jwt',
];
const DEV_DEPS = ['@types/passport-jwt'];

const ENV_VARS = [
  { key: 'JWT_SECRET', envValue: 'dev-secret-change-me', exampleValue: '' },
  { key: 'JWT_EXPIRES_IN', envValue: '1d', exampleValue: '1d' },
];

function log(marker, msg) {
  console.log(`[${marker}] ${msg}`);
}

function fail(msg) {
  console.error(`[FAIL] ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { force: false };
  for (const arg of argv.slice(2)) {
    if (arg === '--force') args.force = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else fail(`Flag desconhecida: ${arg}`);
  }
  return args;
}

function ensureBackend() {
  if (!fs.existsSync(path.join(BACKEND_DIR, 'package.json'))) {
    fail('apps/backend/package.json não encontrado. Rode config-project-fullstack antes.');
  }
  if (!fs.existsSync(path.join(BACKEND_SRC, 'app.module.ts'))) {
    fail('apps/backend/src/app.module.ts não encontrado.');
  }
}

function detectScope() {
  const rootPkg = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(rootPkg)) {
    const content = JSON.parse(fs.readFileSync(rootPkg, 'utf8'));
    if (typeof content.name === 'string' && content.name.startsWith('@')) {
      return content.name.split('/')[0];
    }
  }
  const backendPkg = JSON.parse(
    fs.readFileSync(path.join(BACKEND_DIR, 'package.json'), 'utf8'),
  );
  if (typeof backendPkg.name === 'string' && backendPkg.name.startsWith('@')) {
    return backendPkg.name.split('/')[0];
  }
  fail('Não foi possível detectar o scope npm do workspace.');
}

function hasDbModule() {
  return fs.existsSync(path.join(BACKEND_SRC, 'db', 'db.module.ts'));
}

async function copyTree(src, dest, scope) {
  const entries = await fsp.readdir(src, { withFileTypes: true });
  await fsp.mkdir(dest, { recursive: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyTree(s, d, scope);
    } else if (entry.isFile()) {
      let content = await fsp.readFile(s, 'utf8');
      content = content.replace(/__SCOPE__/g, scope);
      await fsp.writeFile(d, content, 'utf8');
      log('FILE_WRITE', path.relative(process.cwd(), d));
    }
  }
}

async function writeFromTemplate(templateName, targetPath, scope) {
  let content = await fsp.readFile(path.join(ASSETS_DIR, templateName), 'utf8');
  content = content.replace(/__SCOPE__/g, scope);
  await fsp.writeFile(targetPath, content, 'utf8');
  log('FILE_WRITE', path.relative(process.cwd(), targetPath));
}

function isDefaultScaffold(filePath, markers) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return markers.every((m) => content.includes(m));
}

function isAlreadyPatched(filePath, markers) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return markers.every((m) => content.includes(m));
}

async function patchAppModule(scope, force) {
  const target = path.join(BACKEND_SRC, 'app.module.ts');
  const patchedMarkers = [
    'APP_FILTER',
    'APP_GUARD',
    'JwtAuthModule',
    'ApiExceptionFilter',
  ];

  if (isAlreadyPatched(target, patchedMarkers) && !force) {
    log('SKIP', 'app.module.ts já contém APP_FILTER/APP_GUARD/JwtAuthModule');
    return;
  }

  const templateName = hasDbModule()
    ? 'app-module.template.ts'
    : 'app-module-no-db.template.ts';

  const content = fs.readFileSync(target, 'utf8');
  const looksCustom =
    !content.includes('AppController') ||
    !content.includes('AppService') ||
    content.length > 2000;

  if (looksCustom && !force) {
    log(
      'RISK',
      'app.module.ts parece customizado — pulando. Use --force para sobrescrever.',
    );
    return;
  }

  await writeFromTemplate(templateName, target, scope);
}

async function patchAppController(scope, force) {
  const target = path.join(BACKEND_SRC, 'app.controller.ts');
  if (!fs.existsSync(target)) return;

  if (isAlreadyPatched(target, ['@Public()', 'shared/decorators/public.decorator'])) {
    log('SKIP', 'app.controller.ts já tem @Public()');
    return;
  }

  const defaultMarkers = ['getHello', 'AppService', "@Controller()"];
  if (!isDefaultScaffold(target, defaultMarkers) && !force) {
    log(
      'RISK',
      'app.controller.ts parece customizado — pulando @Public(). Use --force para sobrescrever.',
    );
    return;
  }

  await writeFromTemplate('app-controller.template.ts', target, scope);
}

async function ensureEnvVars() {
  for (const file of ['.env', '.env.example']) {
    const target = path.join(BACKEND_DIR, file);
    let content = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    const isExample = file === '.env.example';
    let changed = false;
    for (const { key, envValue, exampleValue } of ENV_VARS) {
      const regex = new RegExp(`^${key}=`, 'm');
      if (!regex.test(content)) {
        const value = isExample ? exampleValue : envValue;
        if (content.length && !content.endsWith('\n')) content += '\n';
        content += `${key}="${value}"\n`;
        changed = true;
      }
    }
    if (changed) {
      await fsp.writeFile(target, content, 'utf8');
      log('FILE_UPDATE', path.relative(process.cwd(), target));
    }
  }
}

function readBackendDeps() {
  const pkgPath = path.join(BACKEND_DIR, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return {
    pkg,
    deps: pkg.dependencies || {},
    devDeps: pkg.devDependencies || {},
  };
}

function resolveMissingDeps(scope) {
  const { deps, devDeps } = readBackendDeps();
  const missingRuntime = RUNTIME_DEPS.filter((d) => !deps[d]);
  if (!deps[`${scope}/shared`]) missingRuntime.push(`${scope}/shared`);
  const missingDev = DEV_DEPS.filter((d) => !devDeps[d]);
  return { missingRuntime, missingDev };
}

function runNpm(args, label) {
  log('CMD', `npm ${args.join(' ')}`);
  const res = spawnSync('npm', args, { stdio: 'inherit', cwd: process.cwd(), shell: process.platform === 'win32' });
  if (res.status !== 0) fail(`${label} falhou (exit ${res.status})`);
}

function installDeps(scope) {
  const { missingRuntime, missingDev } = resolveMissingDeps(scope);
  if (missingRuntime.length === 0 && missingDev.length === 0) {
    log('SKIP', 'Dependências já instaladas');
    return;
  }
  if (missingRuntime.length > 0) {
    runNpm(
      ['install', '--workspace', 'apps/backend', ...missingRuntime],
      'Install runtime deps',
    );
  }
  if (missingDev.length > 0) {
    runNpm(
      ['install', '--workspace', 'apps/backend', '-D', ...missingDev],
      'Install dev deps',
    );
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(
      'Uso: node apply-backend-shared.js [--force]\n' +
        '  --force  Sobrescreve app.module.ts / app.controller.ts mesmo se parecerem customizados.',
    );
    return;
  }

  ensureBackend();
  const scope = detectScope();
  log('STEP', `Scope detectado: ${scope}`);

  log('STEP', 'Instalando dependências');
  installDeps(scope);

  log('STEP', 'Copiando apps/backend/src/shared/');
  if (fs.existsSync(SHARED_TARGET)) {
    log('RISK', `Sobrescrevendo conteúdo existente em ${path.relative(process.cwd(), SHARED_TARGET)}`);
  }
  await copyTree(TEMPLATE_DIR, SHARED_TARGET, scope);

  log('STEP', 'Patch app.module.ts');
  await patchAppModule(scope, args.force);

  log('STEP', 'Patch app.controller.ts');
  await patchAppController(scope, args.force);

  log('STEP', 'Ajustando .env / .env.example');
  await ensureEnvVars();

  log('STEP', 'Validando build do backend');
  runNpm(['--workspace', 'apps/backend', 'run', 'build'], 'Backend build');

  log('DONE', 'backend-nest-config aplicado com sucesso');
}

main().catch((err) => fail(err.stack || err.message));
