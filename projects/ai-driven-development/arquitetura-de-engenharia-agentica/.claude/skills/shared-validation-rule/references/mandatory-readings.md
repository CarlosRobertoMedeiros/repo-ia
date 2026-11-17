# Leituras Obrigatorias

Leia estes arquivos do projeto antes de criar uma nova regra:

1. `packages/shared/src/validation/validation-rule.interface.ts`
2. `packages/shared/src/validation/validation-field.interface.ts`
3. `packages/shared/src/validation/validator.ts`
4. `packages/shared/src/validation/rule.utils.ts`
5. `packages/shared/src/validation/index.ts`
6. `packages/shared/src/validation/rules/index.ts`
7. `packages/shared/src/validation/rules/required.rule.ts`
8. `packages/shared/src/validation/rules/email.rule.ts`
9. `packages/shared/src/validation/rules/min-length.rule.ts`
10. `packages/shared/src/validation/rules/range-length.rule.ts`
11. `packages/shared/src/validation/rules/strong-password.rule.ts`
12. `packages/shared/src/validation/rules/person-name.rule.ts`
13. `packages/shared/test/validation/rules/required.rule.test.ts`
14. `packages/shared/test/validation/rules/email.rule.test.ts`
15. `packages/shared/test/validation/rules/min-length.rule.test.ts`
16. `packages/shared/test/validation/rules/range-length.rule.test.ts`
17. `packages/shared/test/validation/rules/security-rules.test.ts`
18. `packages/shared/test/validation/rules/string-rules.test.ts`

Objetivo de cada bloco:

- Interfaces e `Validator`: confirmar o contrato publico e o formato final do erro.
- `rule.utils.ts`: identificar helpers reaproveitaveis e evitar duplicacao.
- `rules/index.ts`, `validation/index.ts` e `src/index.ts`: manter exports consistentes.
- Regras de referencia: replicar o estilo de construtor, validacao, erro e tratamento de vazio.
- Testes de referencia: replicar o estilo do projeto e fechar cobertura observavel.

Se a implementacao exigir novo helper em `rule.utils.ts`, leia e atualize tambem:

- `packages/shared/test/validation/rule.utils.test.ts`

Se precisar comprovar a integracao com o montador de erros:

- `packages/shared/test/validation/validator.test.ts`
- `packages/shared/src/index.ts` para confirmar a cadeia final de exports do pacote
