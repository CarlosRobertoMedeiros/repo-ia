# Produto

## Nome do projeto

Cadastro Base

## Visão geral

Sistema web simples para organizar a base de clientes de um pequeno negócio, substituindo planilhas ou anotações espalhadas por um cadastro estruturado.

## Problema que resolve

Hoje o cadastro de clientes é feito de forma manual, o que gera:

- dados incompletos
- dificuldade para localizar clientes
- duplicidade de cadastro
- falta de padrão nas informações registradas

## Para quem

- atendente
- equipe administrativa
- pequeno negócio que precisa manter uma base simples de clientes

## Capacidades principais

- cadastrar clientes
- listar clientes
- visualizar dados de cadastro
- editar clientes
- inativar clientes
- impedir duplicidade de e-mail

## Regras de negócio mais estáveis

- todo cliente deve ter nome
- todo cliente deve ter e-mail
- e-mail não pode se repetir
- cliente pode estar ativo ou inativo
- telefone é opcional
- observações cadastrais podem existir sem alterar a identidade principal do cliente

## Linguagem comum do time

- **cliente** — pessoa cadastrada no sistema
- **cadastro** — registro de dados do cliente
- **dados cadastrais** — conjunto de informações do cliente
- **cliente ativo** — cliente disponível para uso normal no sistema
- **cliente inativo** — cliente mantido no histórico, mas fora do fluxo principal
- **inativação** — ação de retirar um cliente do fluxo ativo sem apagar seu histórico
