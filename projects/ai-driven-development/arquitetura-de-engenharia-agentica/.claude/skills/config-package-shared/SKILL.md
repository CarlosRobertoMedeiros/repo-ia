---
name: config-package-shared
description: Reconstrói o pacote compartilhado base da aplicação, concentrando contratos reutilizáveis, classes base, erros de domínio, casos de uso e validações consumidas pelo backend, frontend e módulos de negócio.
---

# Config Package Shared

Usar o script `scripts/rebuild-shared.js` para reconstruir `packages/shared` ou materializar uma variante derivada, como `packages/shared-v2`, de forma deterministica.

## Fluxo

1. Executar a partir da raiz do monorepo:

```bash
SKILL_SCRIPT="$(find . -maxdepth 6 -path "*/config-package-shared/scripts/rebuild-shared.js" ! -path "*/node_modules/*" | head -1)"
node "$SKILL_SCRIPT"
node "$SKILL_SCRIPT" --package-name shared-v2
```

2. O script deve:
   - recriar `packages/<package-name>` a partir de `assets/shared-template/`;
   - materializar primeiro o pacote com `@temp/shared`;
   - detectar dinamicamente o scope real a partir dos `package.json` da raiz, `apps/*`, `modules/*` e `packages/*`, sem fixar namespace de cliente;
   - renomear `packages/<package-name>/package.json` para `@<scope>/<package-name>`;
   - quando `package-name` for `shared`, adicionar ou normalizar `"@<scope>/shared": "*"` nos `package.json` de `apps/*` e `modules/*` que usam a base compartilhada;
   - quando `package-name` for diferente de `shared`, nao sobrescrever automaticamente dependencias internas existentes;
   - executar `npm i`;
   - validar com `npx turbo run build --filter=@<scope>/<package-name>`;
   - reportar o scope detectado, o pacote recriado e os workspaces atualizados.

## Base canonica

Toda a base deterministica fica dentro desta skill:

- `assets/shared-template/package.json`
- `assets/shared-template/tsconfig.json`
- `assets/shared-template/jest.config.ts`
- `assets/shared-template/src/**`
- `assets/shared-template/test/**`

Nao depender de templates, scripts ou pastas externas para reconstruir o pacote.

## Restricoes

- Nao copiar `dist`, `coverage`, `.turbo` ou `node_modules`.
- Nao embutir `@poupig` ou qualquer outro scope fixo nos arquivos-base da skill.
- Nao pular a deteccao dinamica de scope.
- Nao usar `file:` ou links locais ao normalizar a dependencia do pacote shared.
- Nao recriar os arquivos do pacote em tempo de execucao por geracao ad hoc; sempre copiar a base fiel de `assets/shared-template/`.
- Nao sobrescrever um pacote alternativo ja existente sem intencao explicita; para nomes diferentes de `shared`, falhar se `packages/<package-name>` ja existir.

## Manutencao

Quando `packages/shared` mudar e a skill precisar acompanhar a nova base canonica, atualizar primeiro os arquivos de `assets/shared-template/`, mantendo `@temp/shared` no `package.json` do template.
