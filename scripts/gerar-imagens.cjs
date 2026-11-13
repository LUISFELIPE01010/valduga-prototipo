#!/usr/bin/env node
/* ============================================================================
   gerar-imagens.cjs — gera as imagens do site a partir de fotos-origem/.

   Quando rodar: sempre que trocar ou acrescentar uma foto.

     npm i --no-save sharp
     node scripts/gerar-imagens.cjs

   Sao tres grupos, cada um com sua pasta, proporcao e larguras:

     hero     -> assets/img/           16:9,  760 / 1200 / 1536
     produtos -> assets/img/produtos/  4:3,   460 / 760
     galeria  -> assets/img/galeria/   4:3,   460 / 760

   Tudo sai em WebP. O script NUNCA aumenta a foto: se a original for menor que
   a largura pedida, ele gera no tamanho que a original tem e avisa no fim. Foto
   pequena fica borrada na tela, entao a lista de avisos e o que pedir para o
   cliente mandar de novo.

   Para trocar uma foto: salve a nova em fotos-origem/<grupo>/ com o mesmo nome
   e rode o script. Para acrescentar uma da galeria, inclua na lista GALERIA
   abaixo e tambem no index.html (secao Galeria).

     foco — onde o corte deve se apoiar: 'centre' (padrao), 'top', 'bottom',
            ou um numero de 0 (topo) a 1 (base).
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAIZ = path.resolve(__dirname, '..');

/* a foto grande do topo da pagina */
const HERO = {
  pasta: '', destino: '', proporcao: 16 / 9, larguras: [760, 1200, 1536],
  fotos: { 'hero-galpao': { de: 'hero-galpao.webp' } },
};

/* os seis quadros de "Nossos produtos" */
const PRODUTOS = {
  pasta: 'produtos', destino: 'produtos', proporcao: 4 / 3, larguras: [460, 760],
  fotos: {
    'perfis': { de: 'perfis.jpg' },
    'tubos':  { de: 'tubos.jpg' },
  },
};

/* nome do arquivo gerado  <-  arquivo de origem */
const GALERIA_FOTOS = {
  'corte-dobra-estribos':  { de: 'corte-dobra-estribos.jpg' },
  'corte-dobra-barras':    { de: 'corte-dobra-barras.jpg' },
  'corte-dobra-lote':      { de: 'corte-dobra-lote.jpg' },
  'corte-dobra-etiquetas': { de: 'corte-dobra-etiquetas.jpg' },
  'armacao-baldrame':      { de: 'armacao-baldrame.jpg', foco: 0.45 },
  'armacao-laje':          { de: 'armacao-laje.jpg' },
  'armacao-fundacao':      { de: 'armacao-fundacao.jpg' },
  'armacao-estribos':      { de: 'armacao-estribos.jpg' },
  'armacao-viga':          { de: 'armacao-viga.jpg' },
  'estaca-armada':         { de: 'estaca-armada.jpg' },
  'estaca-gaiola':         { de: 'estaca-gaiola.jpg' },
  'estacas-armadas':       { de: 'estacas-armadas.jpg' },
  'arames-torcidos':       { de: 'arames-torcidos.jpg' },
  'telas-soldadas':        { de: 'telas-soldadas.jpg' },
  'tubos':                 { de: 'tubos.jpg' },
  'metalon':               { de: 'metalon.jpg' },
  'perfil-w':              { de: 'perfil-w.jpg' },
};

const GALERIA = {
  pasta: 'galeria', destino: 'galeria', proporcao: 4 / 3, larguras: [460, 760],
  fotos: GALERIA_FOTOS,
};

const avisos = [];
let total = 0, n = 0;

async function gerarGrupo(grupo) {
  const ORIGEM = path.join(RAIZ, 'fotos-origem', grupo.pasta);
  const DESTINO = path.join(RAIZ, 'assets/img', grupo.destino);
  fs.mkdirSync(DESTINO, { recursive: true });

  for (const [nome, cfg] of Object.entries(grupo.fotos)) {
    const entrada = path.join(ORIGEM, cfg.de);
    if (!fs.existsSync(entrada)) throw new Error('falta a foto de origem: ' + entrada);
    const m = await sharp(entrada).metadata();

    // maior largura possivel sem esticar a foto: o corte pode ser limitado
    // pela largura OU pela altura da original
    const maxLargura = Math.min(m.width, Math.round(m.height * grupo.proporcao));

    for (const w of grupo.larguras) {
      const largura = Math.min(w, maxLargura);
      const altura = Math.round(largura / grupo.proporcao);

      let img = sharp(entrada);
      if (typeof cfg.foco === 'number') {
        // corta na altura exata antes de redimensionar
        let cw = m.width, ch = Math.round(cw / grupo.proporcao);
        if (ch > m.height) { ch = m.height; cw = Math.round(ch * grupo.proporcao); }
        const left = Math.round((m.width - cw) / 2);
        const top = Math.max(0, Math.min(m.height - ch, Math.round(m.height * cfg.foco - ch / 2)));
        img = img.extract({ left, top, width: cw, height: ch });
      }
      const arq = path.join(DESTINO, `${nome}-${w}.webp`);
      await img.resize({
        width: largura, height: altura, fit: 'cover',
        position: typeof cfg.foco === 'number' ? 'centre' : (cfg.foco || 'centre'),
        kernel: 'lanczos3',
      }).webp({ quality: 82 }).toFile(arq);
      total += fs.statSync(arq).size; n++;

      if (largura < w) avisos.push(`${nome}: pedido ${w}px, a original so da ${largura}px`);
    }
  }
}

(async () => {
  for (const grupo of [HERO, PRODUTOS, GALERIA]) await gerarGrupo(grupo);

  console.log(n + ' arquivos gerados em assets/img/  (' + (total / 1024).toFixed(0) + ' kB)');
  if (avisos.length) {
    console.log('\nFOTOS PEQUENAS (vao aparecer borradas; vale pedir a original maior):');
    for (const a of [...new Set(avisos)]) console.log('  - ' + a);
  }
})();
