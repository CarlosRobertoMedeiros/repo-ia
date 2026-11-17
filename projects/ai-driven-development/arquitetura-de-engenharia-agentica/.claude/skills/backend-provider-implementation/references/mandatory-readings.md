# Mandatory Readings

Leia estes arquivos exatamente nesta ordem antes de implementar o provider:

1. o arquivo alvo em `modules/<modulo>/src/**/provider/*.provider.ts`
2. os tipos relacionados importados pelo provider alvo
3. `modules/auth/src/user/provider/crypto.provider.ts`
4. `apps/backend/src/modules/auth/bcrypt.crypto.ts`
5. `apps/backend/src/modules/auth/auth.module.ts`
6. `apps/backend/src/modules/<modulo>/<modulo>.module.ts`
7. o controller ou ponto de uso no backend, quando ele ajudar a entender a injecao da classe concreta

Extraia dessas leituras:

- o contrato exato que precisa ser cumprido
- o nome real do modulo inferido pelo path
- a convencao local de naming dos arquivos concretos do backend
- como o backend injeta classes concretas e as repassa para casos de uso do dominio
- se ja existe biblioteca instalada que resolve o problema

Antes de editar, confirme tambem:

- se a interface alvo esta inequivoca
- se o modulo backend correspondente ja existe
- se a implementacao deve ficar na raiz do modulo backend
- se existe um consumidor Nest que precisara trocar abstracao por classe concreta

Se qualquer leitura obrigatoria falhar, pare e relate claramente o bloqueio.
