# Brincar e Aprender

Plataforma web com cinco jogos educativos curtos para crianças com síndrome de Down,
desenhados com apoio de pedagogia, neuropediatria e design acessível:

| Jogo                | Rota             | Objetivo                |
| ------------------- | ---------------- | ----------------------- |
| Jogo das Cores      | `/jogos/cores`   | Percepção visual        |
| Encaixe das Formas  | `/jogos/formas`  | Discriminação visual    |
| Vamos Contar        | `/jogos/contar`  | Noção de número (1 a 5) |
| Memória dos Animais | `/jogos/memoria` | Memória de trabalho     |
| Jogo das Letras     | `/jogos/letras`  | Reconhecer letras       |

Princípios comuns: instruções faladas em português (síntese de voz do navegador) e
visuais ao mesmo tempo, alvos grandes, nenhum tempo limite, erro sem punição e
reforço positivo imediato. O app funciona offline após a primeira visita e pode ser
instalado como aplicativo em tablets e celulares.

**App publicado**: https://special-playtime-projects.lovable.app

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, roteamento por arquivos em `src/routes/`)
- Tailwind CSS 4 com tokens de cor em `src/styles.css`
- Fontes Baloo 2 e Nunito auto-hospedadas em `public/fonts/`
- Sem backend: toda a lógica roda no navegador

Estrutura principal:

```
src/
  routes/            páginas (index e jogos/*)
  components/        JogoLayout: cabeçalho, estrelas, mensagens e tela final
  hooks/useRodadas   máquina de estados compartilhada pelos jogos de alternativas
  lib/jogo.ts        voz, sons, embaralhamento e montagem de alternativas
public/
  sw.js              service worker (cache offline)
  manifest.webmanifest, icons/, og.png
```

## Desenvolvimento

O projeto usa [Bun](https://bun.sh) (há um `bun.lock`), mas npm também funciona.

```sh
bun install        # ou: npm install
bun run dev        # ou: npm run dev
bun run lint       # ESLint + Prettier
bun run build      # build de produção (Nitro)
```

## Lovable

Este projeto está conectado ao [Lovable](https://lovable.dev/projects/fdd25127-16d1-41e2-8485-d3fced4d2e92).
Commits enviados para `main` sincronizam com o editor. Evite reescrever histórico já publicado
(force push, rebase ou amend de commits enviados).
