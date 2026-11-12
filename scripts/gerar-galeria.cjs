#!/usr/bin/env node
/* ============================================================================
   gerar-galeria.cjs — gera assets/img/galeria/ a partir de fotos-origem/.

   Quando rodar: sempre que trocar ou acrescentar uma foto da galeria.

     npm i --no-save sharp
     node scripts/gerar-galeria.cjs

   Cada foto sai em WebP, em 4:3, em duas larguras (460 e 760). O script NUNCA
   aumenta a foto: se a original for menor que a largura pedida, ele gera no
   tamanho que a original tem e avisa no fim. Foto pequena fica borrada na tela,
   entao a lista de avisos e o que pedir para o cliente mandar de novo.

   Para trocar uma foto: salve a nova em fotos-origem/galeria/ com o mesmo nome
   e rode o script. Para acrescentar, adicione na lista FOTOS abaixo e tambem no
   index.html (secao Galeria).

     foco — onde o corte 4:3 deve se apoiar: 'centre' (padrao), 'top',
            'bottom', ou um numero de 0 (topo) a 1 (base).
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAIZ = path.resolve(__dirname, '..');
const ORIGEM = path.join(RAIZ, 'fotos-origem/galeria');
const DESTINO = path.join(RAIZ, 'assets/img/galeria');
const LARGURAS = [460, 760];
const PROPORCAO = 4 / 3;

/* nome do arquivo gerado  <-  arquivo de origem */
const FOTOS = {
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

fs.mkdirSync(DESTINO, { recursive: true });

(async () => {
  const avisos = [];
  let total = 0, n = 0;

  for (const [nome, cfg] of Object.entries(FOTOS)) {
    const entrada = path.join(ORIGEM, cfg.de);
    if (!fs.existsSync(entrada)) throw new Error('falta a foto de origem: ' + entrada);
    const m = await sharp(entrada).metadata();

    // maior largura possivel sem esticar a foto: o corte 4:3 pode ser limitado
    // pela largura OU pela altura da original
    const maxLargura = Math.min(m.width, Math.round(m.height * PROPORCAO));

    for (const w of LARGURAS) {
      const largura = Math.min(w, maxLargura);
      const altura = Math.round(largura / PROPORCAO);
      const pos = typeof cfg.foco === 'number'
        ? Math.round(cfg.foco * 100) + '% 50%'  // nao usado pelo sharp; ver abaixo
        : (cfg.foco || 'centre');

      let img = sharp(entrada);
      if (typeof cfg.foco === 'number') {
        // corta na altura exata antes de redimensionar
        let cw = m.width, ch = Math.round(cw / PROPORCAO);
        if (ch > m.height) { ch = m.height; cw = Math.round(ch * PROPORCAO); }
        const left = Math.round((m.width - cw) / 2);
        const top = Math.max(0, Math.min(m.height - ch, Math.round(m.height * cfg.foco - ch / 2)));
        img = img.extract({ left, top, width: cw, height: ch });
      }
      const arq = path.join(DESTINO, `${nome}-${w}.webp`);
      await img.resize({ width: largura, height: altura, fit: 'cover', position: typeof cfg.foco === 'number' ? 'centre' : pos, kernel: 'lanczos3' })
        .webp({ quality: 82 }).toFile(arq);
      total += fs.statSync(arq).size; n++;

      if (largura < w) avisos.push(`${nome}: pedido ${w}px, a original so da ${largura}px`);
    }
  }

  console.log(n + ' arquivos gerados em assets/img/galeria/  (' + (total / 1024).toFixed(0) + ' kB)');
  if (avisos.length) {
    console.log('\nFOTOS PEQUENAS (vao aparecer borradas; vale pedir a original maior):');
    for (const a of [...new Set(avisos)]) console.log('  - ' + a);
  }
})();
