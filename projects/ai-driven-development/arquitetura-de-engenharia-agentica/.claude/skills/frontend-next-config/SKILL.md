---
name: frontend-next-config
description: Configura a estrutura compartilhada (shared/) e as rotas Next.js (grupos public/private com sidebar de navegação) em um projeto frontend de destino. Detecta automaticamente o namespace do monorepo, o caminho da skill e instala todas as dependências necessárias. Compatível com o padrão ApiErrorResponse do backend NestJS.
tools: Read, Glob, Grep, Bash, Write, Edit
---

# frontend-next-config

Recria a pasta `shared/` e a estrutura de rotas Next.js em qualquer projeto frontend de destino.  
Todos os arquivos necessários estão **embarcados** nesta skill em `assets/` — a skill é autossuficiente.

## Localização dos assets

Os assets desta skill estão **em caminho detectado automaticamente na Fase 0**:
```
{SKILL_DIR}/assets/
  shared/          ← pasta shared completa, genérica, pronta para copiar
  navigation/      ← templates de app-modules, rotas e sidebar navigation
  app/             ← templates de layouts e páginas de rota Next.js
```

---

## Fase 0 — Detectar ambiente (SEMPRE executar primeiro)

Esta fase nunca pula. Capture todas as variáveis antes de avançar.

### 0a. Raiz do projeto

```bash
git rev-parse --show-toplevel 2>/dev/null || pwd
```

Capture como `{PROJECT_ROOT}`.

### 0b. Caminho da skill

```bash
find "{PROJECT_ROOT}/.claude/skills" -maxdepth 1 -type d -name "frontend-next-config" 2>/dev/null | head -1
```

Capture como `{SKILL_DIR}`. Fallback: `{PROJECT_ROOT}/.claude/skills/frontend-next-config`.

### 0c. Namespace do pacote compartilhado

```bash
cat "{PROJECT_ROOT}/packages/shared/package.json" 2>/dev/null | grep '"name"' | head -1
```

Extraia o valor do campo `name` (ex: `@sdd/shared`, `@myapp/shared`) e capture como `{SHARED_PKG_NAME}`.  
Se `packages/shared/package.json` não existir, defina `{SHARED_PKG_NAME}` como vazio e pule instalação desse pacote.

### 0d. Diretório de destino padrão

```bash
find "{PROJECT_ROOT}/apps" -maxdepth 1 -type d -name "frontend" 2>/dev/null | head -1
```

Capture como `{DEST}` (padrão: `{PROJECT_ROOT}/apps/frontend`).  
Será sobrescrito se o usuário informar caminho diferente na Fase 2.

---

## Fase 1 — Ler contexto do projeto destino

Com `{DEST}` detectado, colete informações adicionais:

```bash
cat "{DEST}/package.json" | grep -E '"name"|"next"|"react"'
cat "{DEST}/tsconfig.json" | grep -A5 '"paths"'
ls "{DEST}/src/app/" 2>/dev/null
ls "{DEST}/src/" 2>/dev/null || ls "{DEST}/app/" 2>/dev/null
```

Capture:
- Versão do Next.js
- Alias de paths (`@/*` → `./src/*` ou `./app/*`)
- Se já existe pasta `shared/` no destino (pedir confirmação antes de sobrescrever)
- Se já existe estrutura `app/(private)/` ou `app/(public)/`

---

## Fase 2 — Coletar configuração interativa

Perguntar ao usuário (em português):

```
1. Qual é o caminho absoluto do projeto de DESTINO?
   (padrão detectado: {DEST})
   Pressione Enter para usar o padrão ou informe outro caminho.

2. O projeto tem autenticação com guard de rota?
   Se sim, qual é o componente/hook de guard? (ou "não sei" para deixar TODO comentado)
```

Se o usuário der respostas parciais, usar os padrões da skill sem inferir nada do projeto.

---

## Fase 3 — Copiar a pasta shared/

### 3a. Verificar existência prévia

```bash
ls "{DEST}/src/shared" 2>/dev/null && echo "HAS_SHARED" || echo "NO_SHARED"
```

Se `shared/` já existir: **avisar e pedir confirmação explícita** antes de sobrescrever.

### 3b. Copiar todos os arquivos de assets/shared/

```bash
cp -r "{SKILL_DIR}/assets/shared/." "{DEST}/src/shared/"
echo "shared/ copiada"
```

### 3c. Copiar globals.css com design system completo

Sobrescrever o globals.css padrão do Next.js com o design system dark da aplicação
(CSS variables para border, popover, muted, primary, accent, destructive, etc.):

```bash
cp "{SKILL_DIR}/assets/app/globals.css" "{DEST}/src/app/globals.css"
echo "globals.css substituído"
```

> **Importante:** este arquivo define todas as CSS variables que os componentes shadcn/radix
> usam (`border-border`, `bg-popover`, `bg-muted`, `bg-accent`, etc.). Sem ele, bordas e
> fundos dos dropdowns, dialogs e inputs aparecem brancos no tema escuro.

### 3d. Verificar alias de import

```bash
cat "{DEST}/tsconfig.json" | grep -A3 '"paths"'
```

Se o alias `@/*` não existir, adicionar em `compilerOptions.paths`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Todos os arquivos da `shared/` já usam `@/shared/...` — não alterar os imports internos.

---

## Fase 4 — Gerar arquivo de navegação

### 4a. Criar AppSidebarNavigation

Copiar `{SKILL_DIR}/assets/navigation/app-sidebar-navigation.template.tsx` para
`{DEST}/src/shared/navigation/app-sidebar-navigation.component.tsx`.

```bash
cp "{SKILL_DIR}/assets/navigation/app-sidebar-navigation.template.tsx" \
   "{DEST}/src/shared/navigation/app-sidebar-navigation.component.tsx"
echo "app-sidebar-navigation.component.tsx criado"
```

> **Atenção:** `shared/navigation/` contém **apenas** este componente genérico.
> Rotas e estrutura de módulos vivem diretamente no `(private)/layout.tsx` (Fase 5b).

---

## Fase 5 — Criar estrutura de rotas Next.js

### 5a. Root layout (TooltipProvider + metadados)

Sobrescrever o root layout gerado pelo Next.js com o template da skill:

```bash
cp "{SKILL_DIR}/assets/app/layout.template.tsx" "{DEST}/src/app/layout.tsx"
echo "root layout criado"
```

O template já inclui `TooltipProvider` envolvendo `{children}`, o que evita o erro
`Tooltip must be used within TooltipProvider` durante o prerender.

### 5b. Layout do grupo (private)

Criar `{DEST}/src/app/(private)/layout.tsx` a partir de
`{SKILL_DIR}/assets/app/(private)/layout.template.tsx`.

```bash
mkdir -p "{DEST}/src/app/(private)"
cp "{SKILL_DIR}/assets/app/(private)/layout.template.tsx" \
   "{DEST}/src/app/(private)/layout.tsx"
echo "(private)/layout.tsx criado"
```

Se o usuário informou um guard de autenticação, envolver `<AdminShell>` com ele.
Se disse "não sei", o template já tem o comentário `{/* TODO: adicionar guard de autenticação */}`.

### 5c. Layout do grupo (public)

```bash
mkdir -p "{DEST}/src/app/(public)"
cp "{SKILL_DIR}/assets/app/(public)/layout.template.tsx" \
   "{DEST}/src/app/(public)/layout.tsx"
echo "(public)/layout.tsx criado"
```

### 5d. Landing page raiz

```bash
cp "{SKILL_DIR}/assets/app/page.template.tsx" "{DEST}/src/app/page.tsx"
echo "landing page criada"
```

A landing page usa o nome "Aplicação" e todos os CTAs apontam para `/join`.

### 5e. Página de autenticação `/join`

```bash
mkdir -p "{DEST}/src/app/(public)/join"
cp "{SKILL_DIR}/assets/app/(public)/join/page.template.tsx" \
   "{DEST}/src/app/(public)/join/page.tsx"
echo "join/page.tsx criado"
```

Após copiar, substituir `DEFAULT_ROUTE_PLACEHOLDER` pela rota do dashboard de exemplo (`/example/dashboard`):

```bash
sed -i '' "s|DEFAULT_ROUTE_PLACEHOLDER|/example/dashboard|g" \
  "{DEST}/src/app/(public)/join/page.tsx"
```

> Em Linux omitir o `''` após `-i`: `sed -i "s/..."`

### 5f. Página dashboard do módulo de exemplo

```bash
mkdir -p "{DEST}/src/app/(private)/example/dashboard"
```

```tsx
// {DEST}/src/app/(private)/example/dashboard/page.tsx
import { EmptyDashboard } from '@/shared/components/ui/empty-dashboard';

export default function ExampleDashboardPage() {
  return <EmptyDashboard />;
}
```

---

## Fase 6 — Instalar dependências

Instalar as dependências necessárias para que os componentes da `shared/` funcionem.

### 6a. Identificar gerenciador de pacotes

```bash
ls "{PROJECT_ROOT}/package-lock.json" 2>/dev/null && echo "npm" || \
ls "{PROJECT_ROOT}/yarn.lock" 2>/dev/null && echo "yarn" || \
ls "{PROJECT_ROOT}/pnpm-lock.yaml" 2>/dev/null && echo "pnpm" || echo "npm"
```

Capture como `{PKG_MANAGER}`.

### 6b. Instalar dependências de produção

```bash
cd "{DEST}" && {PKG_MANAGER} install \
  lucide-react \
  recharts \
  clsx \
  tailwind-merge \
  class-variance-authority \
  sonner \
  react-hook-form \
  @hookform/resolvers \
  cmdk \
  react-day-picker \
  date-fns \
  @radix-ui/react-checkbox \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-label \
  @radix-ui/react-popover \
  @radix-ui/react-radio-group \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-slot \
  @radix-ui/react-tabs \
  @radix-ui/react-tooltip
```

### 6c. Instalar pacote shared do monorepo (se detectado)

Se `{SHARED_PKG_NAME}` foi detectado na Fase 0:

```bash
cd "{DEST}" && {PKG_MANAGER} install "{SHARED_PKG_NAME}"
```

> **Nota:** Em monorepos com workspaces (Turbo, nx, etc.), adicionar manualmente ao `package.json`
> do frontend `"{SHARED_PKG_NAME}": "*"` e rodar `{PKG_MANAGER} install` na raiz do projeto.

### 6d. Verificar instalação

```bash
ls "{DEST}/node_modules/lucide-react" 2>/dev/null && echo "OK lucide-react" || echo "FAIL lucide-react"
ls "{DEST}/node_modules/react-hook-form" 2>/dev/null && echo "OK react-hook-form" || echo "FAIL react-hook-form"
```

Se falhar, tentar instalar a partir da raiz do monorepo:
```bash
cd "{PROJECT_ROOT}" && {PKG_MANAGER} install
```

---

## Fase 7 — Verificação final

Após criar todos os arquivos e instalar dependências, executar verificação de sanidade:

```bash
ls "{DEST}/src/app/globals.css"
ls "{DEST}/src/app/layout.tsx"
ls "{DEST}/src/app/page.tsx"
ls "{DEST}/src/app/(private)/layout.tsx"
ls "{DEST}/src/app/(private)/example/dashboard/page.tsx"
ls "{DEST}/src/app/(public)/layout.tsx"
ls "{DEST}/src/app/(public)/join/page.tsx"
ls "{DEST}/src/shared/components/ui/sidebar-menu.component.tsx"
ls "{DEST}/src/shared/components/ui/empty-dashboard.tsx"
ls "{DEST}/src/shared/navigation/app-sidebar-navigation.component.tsx"
ls "{DEST}/src/shared/types/api-error.type.ts"
```

```bash
# Verificar que não há placeholders não substituídos
grep -r "DEFAULT_ROUTE_PLACEHOLDER\|APP_NAME_PLACEHOLDER\|SKILL_DIR\|PROJECT_ROOT" \
  "{DEST}/src/" 2>/dev/null | grep -v "node_modules\|\.bak"
```

Se encontrar referências a variáveis de template não substituídas, corrigir antes de reportar.

---

## Fase 8 — Relatório final

Exibir resumo estruturado:

```
✅ frontend-next-config concluído

📁 shared/ → {DEST}/src/shared/
   components/branding/app-logo.component.tsx     (ícone Layers lucide + nome: Aplicação)
   components/ui/                                  ({N} componentes + empty-dashboard.tsx)
   components/form/validator/                      (sistema de validação — compatível com ApiErrorResponse)
   context/shell.context.tsx
   hooks/                                          (2 hooks)
   i18n/                                           (pt + en)
   lib/class-name.util.ts
   navigation/
     app-sidebar-navigation.component.tsx          (componente genérico, orientado a props)
   template/admin-shell.component.tsx + public-boxed-layout.component.tsx
   types/api-error.type.ts                         (ApiErrorResponse — espelho do backend)
   util/color.util.ts
   index.ts

🎨  Design system (globals.css):
   Tema escuro fixo com CSS variables completas:
   --border, --popover, --muted, --primary (amber), --accent, --destructive, etc.
   Garante que dropdown, dialog, table e input tenham bordas e fundos corretos.

🗺️  Rotas criadas:
   app/layout.tsx                              → RootLayout com TooltipProvider
   app/globals.css                             → design system dark completo
   app/page.tsx                                → landing page (navbar + hero, CTAs → /join)
   app/(private)/layout.tsx                    → ShellProvider + AdminShell + APP_MODULES inline + onLogout → /
   app/(private)/example/dashboard/page.tsx    → EmptyDashboard
   app/(public)/layout.tsx                     → PublicBoxedLayout (exceto /join)
   app/(public)/join/page.tsx                  → página de auth com botão → /example/dashboard

📦 Dependências instaladas:
   lucide-react, recharts, clsx, tailwind-merge, class-variance-authority
   sonner, react-hook-form, @hookform/resolvers, cmdk
   react-day-picker, date-fns
   @radix-ui/react-* (checkbox, dialog, dropdown-menu, label, popover,
                      radio-group, select, separator, slot, tabs, tooltip)
   {SHARED_PKG_NAME} (pacote shared do monorepo)

⚠️  Compatibilidade com ApiErrorResponse
   O tipo ApiErrorResponse em shared/types/api-error.type.ts espelha exatamente
   o contrato do backend (statusCode, errors[], message?, details?, path?, timestamp).
   A função getErrorMessage() em shared/i18n/index.ts já trata { errors: string[] }
   nativamente — erros traduzíveis via i18n são traduzidos; mensagens brutas do
   servidor são exibidas como estão.

⚠️  Próximos passos:
   1. Conectar autenticação no (private)/layout.tsx (guard + dados do usuário)
   2. Substituir EmptyDashboard pelas páginas reais de cada módulo
   3. Personalizar hero text da landing page conforme o produto
   4. Implementar chamadas de API tipadas com ApiErrorResponse
```

---

## Fase 9 — Build de verificação e autocorreção

Após o relatório da Fase 8, executar o build para confirmar que o projeto compila sem erros.

### 9a. Rodar o build

```bash
cd "{DEST}" && {PKG_MANAGER} run build 2>&1
```

Se o build passar sem erros, reportar `✅ Build OK` e encerrar.

### 9b. Analisar erros e corrigir automaticamente

Se o build falhar, ler a saída completa e para cada erro aplicar as correções abaixo.
Após corrigir **todos** os erros encontrados, rodar o build novamente (máximo 3 tentativas).

#### Erros comuns e correções

**`Module not found: Can't resolve 'radix-ui'`**
Algum componente importa do pacote unificado `"radix-ui"` em vez dos pacotes escoped.
Substituir pelo pacote correto conforme o componente:
- `tooltip` → `import * as X from "@radix-ui/react-tooltip"`
- `popover` → `import * as X from "@radix-ui/react-popover"`
- `dialog` → `import * as X from "@radix-ui/react-dialog"`
- `dropdown-menu` → `import * as X from "@radix-ui/react-dropdown-menu"`
Padrão geral: `{ X } from "radix-ui"` → `* as X from "@radix-ui/react-{component}"`

**`Error: Tooltip must be used within TooltipProvider`**
O `TooltipProvider` não está envolvendo a árvore. Verificar se `app/layout.tsx` foi criado
a partir do template correto (Fase 5a). Se não, repetir o passo.

**`Module not found: Can't resolve '@/shared/...'`**
O alias `@/*` não aponta para `./src/*`. Verificar `tsconfig.json` e adicionar/corrigir:
```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

**`useRouter` / `usePathname` fora de Client Component**
Adicionar `'use client';` no topo do arquivo que usa esses hooks.

**`Export default` ausente em página**
Cada arquivo em `app/**/page.tsx` e `app/**/layout.tsx` precisa de `export default function`.
Verificar se o template foi copiado corretamente.

**Outros erros de TypeScript**
Ler a mensagem completa, identificar o arquivo e linha, corrigir o problema mínimo necessário
para o build passar. Não refatorar código além do estritamente necessário para a correção.

### 9c. Reportar resultado final

Se o build passar após correções:
```
✅ Build OK após {N} correção(ões) automática(s)
   Arquivos corrigidos: {lista}
```

Se após 3 tentativas ainda houver erros:
```
⚠️  Build com erros após 3 tentativas de correção automática
   Erros restantes:
   {lista de erros com arquivo:linha}
   Ação necessária: corrigir manualmente antes de prosseguir.
```

---

## Regras obrigatórias

- **Nunca** referenciar caminhos absolutos hardcoded na skill — usar sempre variáveis detectadas na Fase 0
- **Nunca** importar de projetos externos ou específicos nos arquivos gerados
- **Nunca** inferir nome do app, módulos ou rotas a partir do contexto do projeto
- **Sempre** usar os assets embarcados em `{SKILL_DIR}/assets/` como fonte
- **Confirmar** antes de sobrescrever arquivos existentes no destino
- **Manter** todos os imports `@/shared/...` intactos — não alterar o sistema de alias
- O `sidebar-menu.component.tsx` é o coração do sistema de navegação — nunca alterar sua lógica
- A instalação de dependências (Fase 6) é **obrigatória** — não reportar como concluído sem executá-la
- O build de verificação (Fase 9) é **obrigatório** — não reportar como concluído sem rodar o build e resolver todos os erros ou listar explicitamente o que restou
