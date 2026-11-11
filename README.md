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

## Um vídeo novo

Os fatos de um vídeo vêm do repositório privado marketing, que o build no GitHub Actions não
lê; por isso são copiados para `content/videos/<slug>/`, nunca redigitados.

1. No marketing, rode o build do vídeo até o fim: ele escreve a descrição do YouTube, o
   `out/plan.json` e a thumbnail que a importação lê.
2. Publique o vídeo no YouTube e anote o id (`youtu.be/<id>`) e a data.
3. Importe, nesta máquina:

   ```
   node scripts/import-video.mjs D:\Git\viglet\marketing\japode\<vídeo> <slug> --youtube <id> --published <AAAA-MM-DD> --title "<título no YouTube>"
   ```

   Escreve `video.json` (capítulos com os tempos, a narração sem as marcas da voz, os termos
   com a definição, as fontes e os créditos das imagens) e `thumbnail.jpg`. O `--title` só é
   preciso quando o título no YouTube difere do de `shots.json`. Rodar de novo sem mudança no
   marketing não muda nenhum arquivo.
4. `npm run build`: um `video.json` que não cabe no tipo `Video` (`src/data/videos.ts`) para o
   build, com o campo que falhou.
5. O artigo (`content/videos/<slug>/article.md`) é escrito a partir do vídeo e das fontes: um
   parágrafo de abertura que responde à busca do vídeo (sua primeira frase vira o resumo na
   home e a descrição da página), depois uma seção `##` por capítulo, com o título do
   capítulo, e todo número com link para a fonte. Ele abre com front matter, e só entra na
   página depois que o Alexandre o aprova escrevendo a data:

   ```
   ---
   approved: AAAA-MM-DD
   ---
   ```

   Sem `approved:`, o artigo é um rascunho: fica no repositório e em nenhuma página.
6. Commit, e o Alexandre faz o push: o workflow publica o site.

O plano está em [docs/ROADMAP.md](docs/ROADMAP.md), e o desenho de cada tarefa em
[docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md).
