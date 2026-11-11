# Geração do Perfil de Comunicação do marcioatalla

## Tarefas

### Fase 1: obtenção dos dados

- [ ] Obter a lista de vídeos shorts do Youtube da conta @marcioatalla usando o MCP `resources\mcps\youtube-shorts`

- [ ] Obter os 3 melhores shorts do youtube  da conta @marcioatalla usando o MCP `resources\mcps\youtube-shorts-top-video-downloads`

- [ ] Transcrever os vídeo usando o MCP  `resources\mcps\video-transcricao`

### Fase 2: análise das transcrições

- [ ] Dentro da pasta das transcrições executar a skill `.claude\skills\youtube-shorts-analise-ganchos` e criar um arquivo para armazenar o resultado da análise em `youtube-shorts-analise-gancho.md`

- [ ] Dentro da pasta das transcrições executar a skill `.claude\skills\youtube-shorts-analise-retencao` e criar um arquivo para armazenar o resultado da análise em `youtube-shorts-analise-retencao.md`

- [ ] Dentro da pasta das transcrições executar a skill `.claude\skills\youtube-shorts-analise-storytelling` e criar um arquivo para armazenar o resultado da análise em `youtube-shorts-analise-storytelling.md`

- [ ] Dentro da pasta das transcrições executar a skill `.claude\skills\youtube-shorts-analise-vocabulario` e criar um arquivo para armazenar o resultado da análise em `youtube-shorts-analise-vocabulario.md`

- [ ] Gere o arquivo final do perfil de comunicação usando a skill `.claude\skills\youtube-shorts-analise-perfil-comunicacao` com base nas análises anteriores no arquivo perfil-marcioatalla.md

## Observações

- Parte dos shorts do canal são cortes de conversas com convidados (ex.: "trecho da conversa com a Dra. Luciana Haddad"). Nas análises, separe a fala do Marcio Atalla da fala dos convidados: só a dele conta para o perfil de voz.
