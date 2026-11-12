# Valduga Aços — Construção e Estruturas Metálicas

Site institucional estático (HTML + CSS + JS puro). Sem build, sem dependências.

## Ver localmente

```bash
node serve.js
```

Abra http://localhost:4174

## Deploy (Vercel)

- Framework Preset: **Other**
- Build Command: *(vazio)*
- Output Directory: *(vazio / raiz)*

## Trocar fotos

**A galeria já usa fotos reais da Valduga.** As originais ficam em
`fotos-origem/galeria/` e as versões do site são geradas por script:

```bash
npm i --no-save sharp
node scripts/gerar-galeria.cjs
```

Para trocar uma foto, salve a nova em `fotos-origem/galeria/` com o mesmo nome e
rode o script. Para acrescentar, coloque o arquivo lá, inclua o nome na lista
`FOTOS` do script e adicione o `<figure>` na seção Galeria do `index.html`.

O script **nunca aumenta** uma foto: se a original for menor que 760 px, ele
gera no tamanho que der e avisa no fim. Essa lista de avisos é o que vale pedir
ao cliente em melhor resolução — hoje seis fotos estão abaixo de 460 px e
aparecem um pouco borradas na tela grande.

O resto das imagens (hero, produtos, faixa) ainda é de banco de imagens gratuito
(Pexels) e serve de marcador. Substitua os arquivos em `assets/img/` mantendo o
mesmo nome e a mesma proporção.

O mascote (`assets/img/mascote-valduga-*.webp`) aparece na faixa de orçamento,
dentro de um círculo: o render tem fundo escuro próprio, então o círculo serve
de moldura em vez de um recorte mal feito sobre o azul.

## Antes de ir ao ar

- Trocar o domínio de exemplo `https://www.valdugaacos.com.br/` em `index.html`
  (`canonical`, `og:url`), `robots.txt` e `sitemap.xml`.
- Conferir os telefones: (11) 99194-5659 e (11) 99194-5649.
