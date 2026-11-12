#!/usr/bin/env node
/**
 * config-project-fullstack
 *
 * Cria, do zero e de forma determinística, um monorepo Turborepo (npm) com:
 *   - apps/frontend : Next.js (src-dir)          -> porta 3000
 *   - apps/backend  : NestJS + @nestjs/config    -> porta 4000 (lida do .env)
 *
 * Uso:
 *   node setup.mjs [--name <projeto>] [--namespace <@escopo>] [--skip-verify]
 *   node setup.mjs @meu-escopo            (argumento posicional iniciado com @ = namespace)
 *
 * O projeto é criado em <diretório atual>/<projeto>. Nada existente é apagado:
 * se a pasta de destino já existir, o script aborta.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

const IS_WIN = process.platform === 'win32';
const TOTAL_STEPS = 14;
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
delete BASE_ENV.PORT; // evita que um PORT do shell interfira nas portas padrão

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

/** Executa e retorna se teve sucesso (sem abortar). */
function tryRun(command, cwd) {
  const result = spawnSync(command, { cwd, stdio: 'pipe', shell: true, env: BASE_ENV, encoding: 'utf8' });
  return { ok: result.status === 0, stdout: (result.stdout || '').trim() };
}

const exists = (p) => fs.existsSync(p);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
const writeText = (p, content) => fs.writeFileSync(p, content, 'utf8');

function isPortInUse(port) {
  const probe = (host) =>
    new Promise((resolve) => {
      const socket = net.connect({ port, host });
      socket.setTimeout(1000);
      socket.once('connect', () => { socket.destroy(); resolve(true); });
      socket.once('timeout', () => { socket.destroy(); resolve(false); });
      socket.once('error', () => resolve(false));
    });
  return Promise.all([probe('127.0.0.1'), probe('::1')]).then((r) => r.some(Boolean));
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForHttp(url, timeoutMs, child) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) return { ok: false, reason: `processo encerrou com código ${child.exitCode}` };
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      const body = await res.text();
      if (res.ok) return { ok: true, body };
    } catch {
      /* ainda subindo */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { ok: false, reason: `timeout de ${timeoutMs / 1000}s aguardando ${url}` };
}

function startProcess(args, cwd) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: BASE_ENV,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: !IS_WIN,
  });
  let output = '';
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  child.getOutput = () => output;
  return child;
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  const exited = new Promise((r) => child.once('exit', r));
  if (IS_WIN) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); }
  }
  await Promise.race([exited, new Promise((r) => setTimeout(r, 10000))]);
}

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { name: 'projeto-exemplo', namespace: null, verify: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name') opts.name = argv[++i];
    else if (a.startsWith('--name=')) opts.name = a.slice(7);
    else if (a === '--namespace') opts.namespace = argv[++i];
    else if (a.startsWith('--namespace=')) opts.namespace = a.slice(12);
    else if (a === '--skip-verify') opts.verify = false;
    else if (a.startsWith('@')) opts.namespace = a;
    else fail(`argumento desconhecido: "${a}". Uso: setup.mjs [--name <projeto>] [--namespace <@escopo>] [--skip-verify]`);
  }

  if (!opts.name || !/^[a-z0-9][a-z0-9._-]*$/.test(opts.name)) {
    fail(`nome de projeto inválido: "${opts.name}" (use letras minúsculas, números, ".", "_" ou "-")`);
  }
  if (opts.namespace !== null) {
    let ns = String(opts.namespace || '').trim();
    if (!ns.startsWith('@')) ns = `@${ns}`;
    if (!/^@[a-z0-9][a-z0-9._-]*$/.test(ns)) {
      fail(`namespace inválido: "${opts.namespace}" (ex.: @minha-empresa)`);
    }
    opts.namespace = ns;
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Conteúdos fixos (exatamente conforme o passo a passo)
// ---------------------------------------------------------------------------

const APP_MODULE_TS = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
`;

const MAIN_TS = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
`;

const FRONTEND_ENV = 'NEXT_PUBLIC_API_URL=http://localhost:4000\n';
const BACKEND_ENV = 'PORT=4000\n';

// ---------------------------------------------------------------------------
// Namespace
// ---------------------------------------------------------------------------

const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', '.turbo', '.git', 'coverage', 'build']);
const TEXT_EXT = new Set(['.json', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.mts', '.cts', '.md', '.css']);

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else if (TEXT_EXT.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function workspacePackageJsons(root) {
  const result = [];
  for (const group of ['apps', 'packages']) {
    const groupDir = path.join(root, group);
    if (!exists(groupDir)) continue;
    for (const entry of fs.readdirSync(groupDir, { withFileTypes: true })) {
      const pj = path.join(groupDir, entry.name, 'package.json');
      if (entry.isDirectory() && exists(pj)) result.push(pj);
    }
  }
  return result;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function applyNamespace(root, ns) {
  const pkgFiles = workspacePackageJsons(root);
  const renames = new Map(); // nome antigo -> nome novo
  for (const pj of pkgFiles) {
    const name = readJson(pj).name;
    assert(name, `package.json sem "name": ${pj}`);
    const base = name.includes('/') ? name.split('/')[1] : name;
    renames.set(name, `${ns}/${base}`);
  }

  // 1) package.json: campo "name" e chaves de dependências (raiz + workspaces)
  const allPkgJsons = [path.join(root, 'package.json'), ...pkgFiles];
  const depFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  for (const pj of allPkgJsons) {
    const data = readJson(pj);
    if (pj !== allPkgJsons[0] && renames.has(data.name)) data.name = renames.get(data.name);
    for (const field of depFields) {
      if (!data[field]) continue;
      const rebuilt = {};
      for (const [dep, version] of Object.entries(data[field])) {
        rebuilt[renames.has(dep) ? renames.get(dep) : dep] = version;
      }
      data[field] = rebuilt;
    }
    writeJson(pj, data);
  }

  // 2) Demais arquivos: substitui apenas nomes com escopo (ex.: @repo/ui, @repo/eslint-config/next-js)
  const scoped = [...renames.entries()].filter(([oldName]) => oldName.startsWith('@'));
  if (scoped.length) {
    const files = [
      ...['apps', 'packages'].flatMap((g) => (exists(path.join(root, g)) ? listFiles(path.join(root, g)) : [])),
      ...['README.md', 'turbo.json'].map((f) => path.join(root, f)).filter(exists),
    ];
    for (const file of files) {
      const original = fs.readFileSync(file, 'utf8');
      let content = original;
      for (const [oldName, newName] of scoped) {
        content = content.replace(new RegExp(`${escapeRe(oldName)}(?![A-Za-z0-9._-])`, 'g'), newName);
      }
      if (content !== original) writeText(file, content);
    }
  }

  return renames;
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const baseDir = process.cwd();
  const root = path.join(baseDir, opts.name);
  const appsDir = path.join(root, 'apps');
  const frontendDir = path.join(appsDir, 'frontend');
  const backendDir = path.join(appsDir, 'backend');

  console.log('config-project-fullstack');
  console.log(`  diretório base : ${baseDir}`);
  console.log(`  projeto        : ${root}`);
  console.log(`  namespace      : ${opts.namespace ?? '(não informado — mantém os nomes padrão)'}`);
  console.log(`  verificação    : ${opts.verify ? 'sim' : 'não'}`);

  // -------------------------------------------------------------------------
  step('Verificações de segurança (pré-requisitos)');
  const [major, minor] = process.versions.node.split('.').map(Number);
  assert(major > 20 || (major === 20 && minor >= 9), `Node.js >= 20.9 é obrigatório (atual: ${process.versions.node})`);
  ok(`Node.js ${process.versions.node}`);
  const npmV = tryRun('npm --version', baseDir);
  assert(npmV.ok, 'npm não encontrado no PATH');
  ok(`npm ${npmV.stdout}`);
  assert(tryRun('npx --version', baseDir).ok, 'npx não encontrado no PATH');
  ok('npx disponível');
  assert(!exists(root), `a pasta de destino já existe: ${root}. Remova-a manualmente ou use --name com outro nome (o script nunca apaga projetos existentes).`);
  ok('pasta de destino não existe');
  try {
    fs.accessSync(baseDir, fs.constants.W_OK);
  } catch {
    fail(`sem permissão de escrita em ${baseDir}`);
  }
  ok('permissão de escrita no diretório base');
  if (opts.verify) {
    for (const port of [3000, 4000]) {
      assert(!(await isPortInUse(port)), `a porta ${port} já está em uso. Libere-a antes (ou use --skip-verify).`);
    }
    ok('portas 3000 e 4000 livres');
  }

  // -------------------------------------------------------------------------
  step(`Criar monorepo Turborepo: npx create-turbo@latest ${opts.name} -m npm`);
  run(`npx --yes create-turbo@latest ${opts.name} -m npm`, baseDir);
  assert(exists(path.join(root, 'package.json')), 'package.json da raiz não foi criado');
  assert(exists(path.join(root, 'turbo.json')), 'turbo.json não foi criado');
  assert(exists(appsDir), 'pasta apps/ não foi criada');
  ok('monorepo criado');

  // -------------------------------------------------------------------------
  step('Remover apps padrão: rm -rf apps/*');
  for (const entry of fs.readdirSync(appsDir)) {
    fs.rmSync(path.join(appsDir, entry), { recursive: true, force: true });
  }
  assert(fs.readdirSync(appsDir).length === 0, 'apps/ não ficou vazia');
  ok('apps/ vazia');

  // -------------------------------------------------------------------------
  step('Criar frontend: npx create-next-app@latest frontend --yes --src-dir');
  run('npx --yes create-next-app@latest frontend --yes --src-dir --use-npm', appsDir);
  assert(exists(path.join(frontendDir, 'package.json')), 'apps/frontend/package.json não foi criado');
  assert(exists(path.join(frontendDir, 'src')), 'apps/frontend/src não foi criado (--src-dir)');
  ok('frontend Next.js criado');

  // -------------------------------------------------------------------------
  step('Instalar Nest CLI: npm i -g @nestjs/cli');
  run('npm i -g @nestjs/cli', baseDir);
  const nestV = tryRun('nest --version', baseDir);
  assert(nestV.ok, 'comando "nest" não ficou disponível no PATH após a instalação global');
  ok(`Nest CLI ${nestV.stdout}`);

  // -------------------------------------------------------------------------
  step('Criar backend: nest new backend -g -p npm');
  run('nest new backend -g -p npm', appsDir);
  assert(exists(path.join(backendDir, 'package.json')), 'apps/backend/package.json não foi criado');
  assert(exists(path.join(backendDir, 'src', 'main.ts')), 'apps/backend/src/main.ts não foi criado');
  assert(exists(path.join(backendDir, 'src', 'app.module.ts')), 'apps/backend/src/app.module.ts não foi criado');
  ok('backend NestJS criado');

  // -------------------------------------------------------------------------
  step('Instalar @nestjs/config no backend');
  run('npm install @nestjs/config', backendDir);
  assert(readJson(path.join(backendDir, 'package.json')).dependencies?.['@nestjs/config'], '@nestjs/config não está nas dependências do backend');
  ok('@nestjs/config instalado');

  // -------------------------------------------------------------------------
  step('Alterar apps/backend/src/app.module.ts e apps/backend/src/main.ts');
  // O Nest CLI 12+ gera o projeto como ESM ("type": "module"), que exige extensão .js nos imports relativos.
  const isEsm = readJson(path.join(backendDir, 'package.json')).type === 'module';
  const fixImports = (src) => (isEsm ? src.replace(/from '(\.\/[^']+)'/g, "from '$1.js'") : src);
  writeText(path.join(backendDir, 'src', 'app.module.ts'), fixImports(APP_MODULE_TS));
  writeText(path.join(backendDir, 'src', 'main.ts'), fixImports(MAIN_TS));
  if (isEsm) console.log('  backend em ESM: imports relativos com extensão .js');
  assert(fs.readFileSync(path.join(backendDir, 'src', 'app.module.ts'), 'utf8').includes('ConfigModule.forRoot'), 'app.module.ts não foi alterado');
  assert(fs.readFileSync(path.join(backendDir, 'src', 'main.ts'), 'utf8').includes('app.enableCors()'), 'main.ts não foi alterado');
  ok('ConfigModule global, CORS habilitado e porta padrão 4000');

  // -------------------------------------------------------------------------
  step('Adicionar script "dev": "nest start --watch" em apps/backend/package.json');
  {
    const pj = path.join(backendDir, 'package.json');
    const data = readJson(pj);
    data.scripts = { ...data.scripts, dev: 'nest start --watch' };
    writeJson(pj, data);
    assert(readJson(pj).scripts.dev === 'nest start --watch', 'script dev não foi adicionado');
  }
  ok('script dev adicionado');

  // -------------------------------------------------------------------------
  step('Criar arquivos .env.example e .env (frontend e backend)');
  writeText(path.join(frontendDir, '.env.example'), FRONTEND_ENV);
  fs.copyFileSync(path.join(frontendDir, '.env.example'), path.join(frontendDir, '.env'));
  writeText(path.join(backendDir, '.env.example'), BACKEND_ENV);
  fs.copyFileSync(path.join(backendDir, '.env.example'), path.join(backendDir, '.env'));
  for (const f of [
    path.join(frontendDir, '.env.example'), path.join(frontendDir, '.env'),
    path.join(backendDir, '.env.example'), path.join(backendDir, '.env'),
  ]) {
    assert(exists(f), `arquivo não criado: ${f}`);
  }
  ok('apps/frontend/.env(.example) e apps/backend/.env(.example) criados');

  // -------------------------------------------------------------------------
  step('Sincronizar dependências do workspace: npm install (raiz)');
  run('npm install', root);
  ok('dependências sincronizadas');

  // -------------------------------------------------------------------------
  step('Aplicar namespace aos pacotes');
  if (opts.namespace) {
    const renames = applyNamespace(root, opts.namespace);
    for (const [from, to] of renames) console.log(`  ${from} -> ${to}`);
    run('npm install', root);
    for (const pj of workspacePackageJsons(root)) {
      const name = readJson(pj).name;
      assert(name.startsWith(`${opts.namespace}/`), `pacote não renomeado: ${pj} (${name})`);
      assert(exists(path.join(root, 'node_modules', ...name.split('/'))), `workspace ${name} não foi linkado em node_modules`);
    }
    ok(`namespace ${opts.namespace} aplicado a ${renames.size} pacote(s)`);
  } else {
    ok('namespace não informado — etapa ignorada');
  }

  // -------------------------------------------------------------------------
  step('Verificação final (build, backend lendo .env na porta 4000, frontend na porta 3000)');
  if (!opts.verify) {
    ok('verificação ignorada (--skip-verify)');
  } else {
    run('npx turbo run build', root);
    const backendMain = path.join(backendDir, 'dist', 'main.js');
    assert(exists(backendMain), 'apps/backend/dist/main.js não foi gerado pelo build');
    assert(exists(path.join(frontendDir, '.next')), 'apps/frontend/.next não foi gerado pelo build');

    // (a) Prova que o backend lê o .env: sobe com PORT temporário vindo apenas do arquivo .env
    const envFile = path.join(backendDir, '.env');
    const originalEnv = fs.readFileSync(envFile, 'utf8');
    const tempPort = await getFreePort();
    writeText(envFile, `PORT=${tempPort}\n`);
    let child = startProcess([backendMain], backendDir);
    let res;
    try {
      res = await waitForHttp(`http://localhost:${tempPort}`, 60000, child);
    } finally {
      await stopProcess(child);
      writeText(envFile, originalEnv);
    }
    assert(res.ok, `backend não respondeu na porta lida do .env (${tempPort}): ${res.reason}\n${child.getOutput()}`);
    assert(fs.readFileSync(envFile, 'utf8') === BACKEND_ENV, 'apps/backend/.env não foi restaurado');
    ok(`backend leu PORT=${tempPort} do .env (ConfigModule funcionando)`);

    // (b) Backend na porta 4000 com o .env final
    child = startProcess([backendMain], backendDir);
    try {
      res = await waitForHttp('http://localhost:4000', 60000, child);
    } finally {
      await stopProcess(child);
    }
    assert(res.ok, `backend não respondeu em http://localhost:4000: ${res.reason}\n${child.getOutput()}`);
    ok(`backend respondeu em http://localhost:4000 -> "${res.body.trim().slice(0, 60)}"`);

    // (c) Frontend na porta 3000 (porta padrão do Next.js)
    const nextBin = createRequire(path.join(frontendDir, 'package.json')).resolve('next/dist/bin/next');
    child = startProcess([nextBin, 'start'], frontendDir);
    try {
      res = await waitForHttp('http://localhost:3000', 90000, child);
    } finally {
      await stopProcess(child);
    }
    assert(res.ok, `frontend não respondeu em http://localhost:3000: ${res.reason}\n${child.getOutput()}`);
    ok('frontend respondeu em http://localhost:3000');
  }

  // -------------------------------------------------------------------------
  step('Resumo');
  const fe = readJson(path.join(frontendDir, 'package.json')).name;
  const be = readJson(path.join(backendDir, 'package.json')).name;
  console.log(`Projeto criado em: ${root}`);
  console.log(`  frontend (${fe}) -> http://localhost:3000`);
  console.log(`  backend  (${be}) -> http://localhost:4000`);
  console.log(`Para rodar tudo: cd ${opts.name} && npm run dev`);
  console.log('\n✔ CONCLUÍDO COM SUCESSO');
}

main().catch((err) => fail(err?.stack || String(err)));
