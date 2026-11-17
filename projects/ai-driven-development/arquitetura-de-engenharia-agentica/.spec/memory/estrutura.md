# Estrutura do Projeto

## Estrutura alvo do repositório

```text
.specs/
  changes/
  memory/
  shared/
  templates/
apps/
  frontend/
  backend/
modules/
  customer/
packages/
  shared/
```

## Responsabilidades

- `.specs/changes` — specs de mudanças específicas
- `.specs/memory` — contexto global do projeto
- `.specs/shared` — convenções reutilizáveis entre specs
- `.specs/templates` — modelos para criar novas mudanças
- `apps/frontend` — telas, formulários e integração com a API (Next.js)
- `apps/backend` — controllers, módulos NestJS e infraestrutura
- `modules/<dominio>` — regras de negócio por domínio
- `packages/shared` — contratos e utilitários reaproveitáveis por front e back

## Organização de módulos

- um módulo por área de negócio relevante
- regras de negócio primeiro, detalhes técnicos depois

## Limites entre camadas

- o front-end não conhece banco de dados
- o back-end expõe casos de uso via API
- regras de negócio não dependem diretamente da interface web
- a spec descreve a mudança **antes** da implementação

## Convenções para `apps/frontend/src/shared`

- `shared` contém apenas código reutilizável e sem acoplamento ao estado ou configuração da aplicação atual
- configurações, navegação, chaves de storage e dados específicos do projeto ficam na camada da aplicação (`app`), fora de `shared`
- contextos e providers reutilizáveis e agnósticos ao projeto podem viver em `shared`
- stores, contextos e providers ligados a autenticação, sessão, regras de negócio, rotas, tenant ou permissões devem ficar em `app`
- a pasta `shared/components/ui` é exceção: componentes originados do **shadcn/ui** podem manter a convenção original da biblioteca
- estas convenções podem evoluir quando houver necessidade explícita do time, desde que permaneçam consistentes dentro do contexto alterado
