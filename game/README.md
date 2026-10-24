# Pipinha’s Game

Jogo web 2D de ação, tiro e roguelike em Phaser 3 + TypeScript + Vite.

## Requisitos

- Node.js 20+ (recomendado LTS)
- npm

## Instalação

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev -- --host 0.0.0.0
```

Acesse a URL exibida no terminal, normalmente:

- http://localhost:5173/

## Build de produção

```bash
npm run build
```

## Preview da build

```bash
npm run preview -- --host 0.0.0.0
```

## Deploy na Vercel

1. Conecte o repositório ao Vercel.
2. Se o projeto estiver em subdiretório, defina a pasta raiz como `game`.
3. O projeto já inclui `vite.config.ts` com `base: './'` e `vercel.json` para fallback SPA.
4. Use o comando de build padrão do Vite (`npm run build`).
5. Em seguida, utilize a pasta `dist` gerada pelo Vite.
6. Configure o framework como `Vite` no painel da Vercel.

Isso deixa o jogo compatível com hospedagem estática e rota SPA em produção.

## Etapa atual

A base funcional da etapa 1 foi implementada com:

- Vite + TypeScript
- Phaser 3 integrado
- estrutura de scenes e arquitetura inicial
- resolução e canvas adaptativos
- menu principal funcional
- cena de jogo com movimentação do player e mira pelo mouse

Este projeto está preparado para evoluir para inimigos, armas, upgrades e boss na etapa 2 em diante.
