# japode news

O site do canal Japode no YouTube, em [japode.com.br](https://japode.com.br): uma página por
vídeo, com o vídeo, o texto, os termos, as fontes e os créditos das imagens.

## Como é feito

Igual a [japode.com](https://japode.com) (`Japode/japode.github.io`), para que os dois sites
Japode sejam uma coisa só de manter: Vite e React 19, prerenderizados por uma entrada SSR
(`src/entry-server.tsx`) e `scripts/prerender.mjs`, com `@viglet/viglet-design-system` no tom
verde (`src/tone.css`, copiado de japode.com) e Tailwind 4. Cada página é HTML estático que se
lê sem JavaScript; só o botão de tema roda no navegador, como uma ilha (`src/islands.tsx`).

O que muda é a língua e a letra. A página é `lang="pt-BR"`, toda URL canônica fica em
`https://japode.com.br` (`SITE.origin`, em `src/data/site.ts`) e o tema é guardado em
`japode-news-theme`. Os títulos usam Plus Jakarta Sans ExtraBold e os termos destacados
SemiBold (`.jn-term`), a letra em que os vídeos desenham suas palavras-chave, no verde da
marca. A marca em `public/logo.svg` é uma cópia de `marca/logo/japode.svg` do repositório
visibility, nunca redesenhada; o favicon, o manifest e os ícones PNG saem dela.

```
npm install
npm run dev     # cada rota renderizada pela mesma entrada SSR do build
npm run build   # tsc, build do cliente e do SSR, prerender e scripts/verify.mjs
```

`scripts/verify.mjs` confere o `dist/` contra cada tarefa entregue e diz a qual tarefa pertence
cada falha.

O plano está em [docs/ROADMAP.md](docs/ROADMAP.md), e o desenho de cada tarefa em
[docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md).
