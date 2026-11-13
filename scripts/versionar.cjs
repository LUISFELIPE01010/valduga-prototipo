#!/usr/bin/env node
/* ============================================================================
   versionar.cjs — carimba a versao de cada imagem no index.html.

     node scripts/versionar.cjs

   POR QUE ISSO EXISTE
   -------------------
   O vercel.json manda o navegador guardar as imagens por 24 h. Como os nomes
   dos arquivos nao mudam quando a foto muda (metalon-760.webp continua
   metalon-760.webp), quem ja visitou o site continuava vendo a FOTO ANTIGA por
   ate um dia, mesmo com o arquivo novo ja publicado.

   A solucao: cada endereco de imagem no index.html ganha um "?v=" com um
   pedacinho do hash do proprio arquivo. Trocou a foto, muda o hash, muda o
   endereco, e o navegador baixa a nova na hora. Nao trocou, o endereco fica
   igual e o cache continua valendo.

   RODE SEMPRE DEPOIS DE gerar-imagens.cjs.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.resolve(__dirname, '..');
const HTML = path.join(RAIZ, 'index.html');

const versao = (rel) => {
  const arq = path.join(RAIZ, rel);
  if (!fs.existsSync(arq)) { faltando.add(rel); return null; }
  return crypto.createHash('md5').update(fs.readFileSync(arq)).digest('hex').slice(0, 8);
};

const faltando = new Set();
const vistos = new Set();
let html = fs.readFileSync(HTML, 'utf8');

html = html.replace(
  /assets\/img\/[A-Za-z0-9/_.-]+\.(?:webp|png|jpg|jpeg|svg|ico)(\?v=[0-9a-f]+)?/g,
  (tudo, qs) => {
    const rel = qs ? tudo.slice(0, -qs.length) : tudo;
    const v = versao(rel);
    if (!v) return tudo;
    vistos.add(rel);
    return `${rel}?v=${v}`;
  }
);

fs.writeFileSync(HTML, html);
console.log(`${vistos.size} imagens carimbadas no index.html`);
if (faltando.size) {
  console.log('\nREFERENCIAS SEM ARQUIVO (confira o nome no index.html):');
  for (const f of faltando) console.log('  - ' + f);
}
