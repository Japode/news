# japode news

O site do canal Japode no YouTube, em [japode.com.br](https://japode.com.br): uma página por
vídeo, com o vídeo, o texto, os termos, as fontes e os créditos das imagens.

## Como é feito

Vite e React 19, como [japode.com](https://japode.com) (`Japode/japode.github.io`),
prerenderizados por uma entrada SSR (`src/entry-server.tsx`) e `scripts/prerender.mjs`. O
visual é o dos artboards em `design/`, com um design system próprio em `src/design/`: os
tokens (`tokens.css`), a base e os componentes primitivos. Cada página é HTML estático que se
lê sem JavaScript; só o vídeo roda no navegador, como uma ilha (`src/islands.tsx`).

A página é `lang="pt-BR"` e toda URL canônica fica em `https://japode.com.br`
(`SITE.origin`, em `src/data/site.ts`). Há um tema só, o claro dos artboards. Os títulos usam Plus Jakarta Sans ExtraBold e os termos destacados
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
   preciso quando o título no YouTube difere do de `shots.json`. Se o vídeo também virou um
   Short, `--short <id> --short-title "<título>"` o põe na mesma página, com um quadro de
   `out/<vídeo>-short-pt-BR.mp4` (tirado com ffmpeg) como `short.jpg`. Rodar de novo sem
   mudança no marketing não muda nenhum arquivo.
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

## Um artigo sem vídeo

Um texto que não vem de nenhum vídeo é escrito aqui mesmo, numa pasta
`content/articles/<slug>/` (o slug vira o endereço: `japode.com.br/<slug>/`), com dois arquivos:

- `article.json`: o título, a linha de assunto (opcional) e as fontes, pelo menos uma:

  ```json
  {
    "title": "O título do artigo",
    "kicker": "Controle de versão",
    "sources": [
      { "text": "Quem publicou, \"o título do documento\"", "url": "https://...", "lang": "en", "published": "AAAA-MM-DD" }
    ]
  }
  ```

- `article.md`: o mesmo formato do artigo de um vídeo: front matter, um parágrafo de abertura
  (a primeira frase vira o resumo) e uma seção `##` por parte. Todo parágrafo com número tem
  link para a fonte, e um `[1]` vira um link para a caixa de fontes. Sem `approved:` é rascunho.

O artigo aprovado ganha a sua página (como a de um vídeo, sem o vídeo), um card na seção
"Artigos" da home, e entra no sitemap e no `llms.txt`. `npm run build` para com o campo que
falhou se o `article.json` não cabe, e um slug repetido (de outro artigo ou de um vídeo) também
para o build.

O plano está em [docs/ROADMAP.md](docs/ROADMAP.md), e o desenho de cada tarefa em
[docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md).
