<!--
Template de spec para gerar o perfil de comunicação de um influenciador do YouTube Shorts.

Como usar:
1. Copie este arquivo para `.spec/perfil-<conta>/spec.md`.
2. Troque `{{conta}}` pelo handle da conta, sem o @ (ex.: fabriciopacholok).
3. Preencha a seção "Observações" com as particularidades do canal (idioma, cortes com convidados,
   vídeos sem fala etc.), ou apague a seção se não houver nenhuma.
4. Apague este comentário.
-->
# Geração do Perfil de Comunicação do {{conta}}

## Tarefas

### Fase 1: obtenção dos dados

- [ ] Obter a lista de vídeos shorts do Youtube da conta @{{conta}} usando o MCP `resources\mcps\youtube-shorts`

- [ ] Obter os 3 melhores shorts do youtube da conta @{{conta}} usando o MCP `resources\mcps\youtube-shorts-top-video-downloads`

- [ ] Transcrever os vídeos usando o MCP `resources\mcps\video-transcricao`

### Fase 2: análise das transcrições

- [ ] Dentro da pasta das transcrições executar a skill `.claude\skills\youtube-shorts-analise-ganchos` e criar um arquivo para armazenar o resultado da análise em `youtube-shorts-analise-gancho.md`

- [ ] Dentro da pasta das transcrições executar a skill `.claude\skills\youtube-shorts-analise-retencao` e criar um arquivo para armazenar o resultado da análise em `youtube-shorts-analise-retencao.md`

- [ ] Dentro da pasta das transcrições executar a skill `.claude\skills\youtube-shorts-analise-storytelling` e criar um arquivo para armazenar o resultado da análise em `youtube-shorts-analise-storytelling.md`

- [ ] Dentro da pasta das transcrições executar a skill `.claude\skills\youtube-shorts-analise-vocabulario` e criar um arquivo para armazenar o resultado da análise em `youtube-shorts-analise-vocabulario.md`

- [ ] Gere o arquivo final do perfil de comunicação usando a skill `.claude\skills\youtube-shorts-analise-perfil-comunicacao` com base nas análises anteriores

## Observações

- {{particularidades do canal: idioma dos vídeos, cortes com convidados (separar a fala do criador), vídeos só com música/sem fala (apoiar o perfil em títulos e descrições do lista_shorts.csv e declarar confiança baixa) etc.}}
