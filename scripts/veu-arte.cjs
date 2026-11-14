/* Rodado uma vez para preparar fotos-origem/hero-obra.png a partir da arte
   original (que vinha com o texto e os botoes desenhados):

     node scripts/veu-arte.cjs <arte-original> fotos-origem/hero-obra.png 790 970 90

   Cobre o texto desenhado na arte com o proprio fundo dela.
   O fundo e estimado por AMOSTRAGEM ROBUSTA: numa janela larga em volta de
   cada ponto, fica so com os pixels mais escuros (as letras sao as claras) e
   tira a media. Isso mantem o degrade, horizontal e vertical, e ignora o texto.
   Uso: node veu2.cjs <entrada> <saida.png> <x1> <x2> [xInicio]               */
const sharp = require('sharp');
const [ENTRADA, SAIDA] = [process.argv[2], process.argv[3]];
const X1 = Number(process.argv[4]), X2 = Number(process.argv[5]), XI = Number(process.argv[6] || 92);
const JX = 130, JY = 78, PASSO_X = 16, PASSO_Y = 8, FRACAO = 0.30;

(async () => {
  const { data, info } = await sharp(ENTRADA).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const at = (x, y) => (y * W + x) * C;
  const suave = (t) => t * t * (3 - 2 * t);

  // grade de pontos com o fundo estimado
  const gxs = [], gys = [];
  for (let x = 0; x <= X2 + JX; x += PASSO_X) gxs.push(Math.min(W - 1, x));
  for (let y = 0; y <= H; y += PASSO_Y) gys.push(Math.min(H - 1, y));
  const grade = new Float32Array(gxs.length * gys.length * 3);

  for (let gi = 0; gi < gxs.length; gi++) for (let gj = 0; gj < gys.length; gj++) {
    const cx = gxs[gi], cy = gys[gj];
    const amostras = [];
    for (let y = Math.max(0, cy - JY); y <= Math.min(H - 1, cy + JY); y += 2)
      for (let x = Math.max(0, cx - JX); x <= Math.min(W - 1, cx + JX); x += 3) {
        const i = at(x, y);
        amostras.push([.2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2], data[i], data[i + 1], data[i + 2]]);
      }
    amostras.sort((a, b) => a[0] - b[0]);
    const n = Math.max(1, Math.round(amostras.length * FRACAO));
    let r = 0, g = 0, b = 0;
    for (let k = 0; k < n; k++) { r += amostras[k][1]; g += amostras[k][2]; b += amostras[k][3]; }
    const p = (gi * gys.length + gj) * 3;
    grade[p] = r / n; grade[p + 1] = g / n; grade[p + 2] = b / n;
  }

  const naGrade = (x, y, c) => {
    const fx = x / PASSO_X, fy = y / PASSO_Y;
    const i0 = Math.min(gxs.length - 1, Math.floor(fx)), i1 = Math.min(gxs.length - 1, i0 + 1);
    const j0 = Math.min(gys.length - 1, Math.floor(fy)), j1 = Math.min(gys.length - 1, j0 + 1);
    const tx = fx - i0, ty = fy - j0;
    const v = (i, j) => grade[(i * gys.length + j) * 3 + c];
    return (v(i0, j0) * (1 - tx) + v(i1, j0) * tx) * (1 - ty) + (v(i0, j1) * (1 - tx) + v(i1, j1) * tx) * ty;
  };

  const saida = Buffer.from(data);
  for (let y = 0; y < H; y++) for (let x = XI; x < Math.min(W, X2); x++) {
    let a = x <= X1 ? 1 : 1 - suave((x - X1) / (X2 - X1));
    if (x < XI + 4) a *= suave((x - XI) / 4);
    const i = at(x, y);
    for (let c = 0; c < 3; c++) saida[i + c] = Math.round(data[i + c] * (1 - a) + naGrade(x, y, c) * a);
  }

  await sharp(saida, { raw: { width: W, height: H, channels: C } }).png().toFile(SAIDA);
  console.log(`ok -> ${SAIDA} (opaco ate ${X1}, some em ${X2})`);
})();
