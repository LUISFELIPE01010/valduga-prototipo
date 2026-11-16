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

As originais ficam em `fotos-origem/` e as versões do site são geradas por
script:

```bash
npm i --no-save sharp
node scripts/gerar-imagens.cjs
node scripts/versionar.cjs
```

Os dois comandos andam juntos: o segundo carimba um `?v=<hash>` em cada
endereço de imagem do `index.html`. Sem ele, quem já visitou o site continua
vendo a **foto antiga** por até 24 h, porque o `vercel.json` manda o navegador
guardar as imagens e o nome do arquivo não muda quando a foto muda.

O script cuida de cinco grupos, cada um com sua pasta, proporção e larguras:

| grupo | origem | destino | proporção | larguras |
|---|---|---|---|---|
| obra (topo no computador) | `fotos-origem/hero-obra.png` | `assets/img/` | 16:9 | 760 / 1200 / 1672 |
| arte (topo no celular) | `fotos-origem/hero-arte.webp` | `assets/img/` | **sem corte** | 440 / 700 / 1122 |
| sobre | `fotos-origem/patio-aberto.webp` | `assets/img/` | 5:4 | 700 / 1100 |
| produtos | `fotos-origem/produtos/` | `assets/img/produtos/` | 4:3 | 460 / 760 |
| galeria | `fotos-origem/galeria/` | `assets/img/galeria/` | 4:3 | 460 / 760 |

O topo usa **duas** imagens, trocadas por `<picture>`:

- **computador** (`hero-obra`): a arte na deitada, cobrindo o topo inteiro, com o
  texto e os botões do site por cima. O texto e os botões que vinham desenhados
  na arte foram apagados — não por reconstrução de pixel, e sim estendendo o
  próprio véu azul-escuro dela até depois do texto (script em
  `scripts/veu-arte.cjs`). Por isso o capacete aparece saindo do escuro: ele fica
  em parte sob esse véu.
- **celular** (`hero-arte`): o cartaz em pé, inteiro (`semCorte: true`), como imagem
  do topo, com o texto logo abaixo.

A arte deitada tem **1672 px**. Acima disso o navegador amplia (em tela 4K ela
fica um pouco mole). Se pedirem a arte em 2560 px, é só trocar o arquivo de
origem e acrescentar a largura na lista do grupo.

A foto do letreiro (`fotos-origem/hero-galpao.webp`) saiu do site quando o cartaz
virou o fundo. Ela continua guardada ali: para voltar a usá-la, recrie o grupo
`HERO` no script.

Para trocar uma foto, salve a nova na pasta do grupo com o mesmo nome e rode o
script. Para acrescentar uma da galeria, coloque o arquivo lá, inclua o nome na
lista `GALERIA_FOTOS` do script e adicione o `<figure>` na seção Galeria do
`index.html`.

O script **nunca aumenta** uma foto: se a original for menor que a largura
pedida, ele gera no tamanho que der e avisa no fim. Essa lista de avisos é o que
vale pedir ao cliente em melhor resolução — hoje seis fotos da galeria estão
abaixo de 460 px e aparecem um pouco borradas na tela grande.

**O que já é material da Valduga:** o cartaz que faz o fundo do topo, a foto do "Sobre nós", os **seis** quadros de "Nossos
produtos" e a galeria inteira. **O que ainda é de banco de imagens gratuito
(Pexels)** e serve de marcador: as duas fotos de serviços
(`servico-vigas-*`, `servico-vergalhoes-*`) e a faixa escura
(`faixa-aco-*`). Substitua os arquivos em `assets/img/` mantendo o mesmo nome e
a mesma proporção — ou traga-os para o `fotos-origem/` e para o script, como foi
feito com a hero, o "Sobre nós" e os produtos.

O mascote (`assets/img/mascote-valduga-*.webp`) aparece na faixa de orçamento,
dentro de um círculo: o render tem fundo escuro próprio, então o círculo serve
de moldura em vez de um recorte mal feito sobre o azul.

## Antes de ir ao ar

- Trocar o domínio de exemplo `https://www.valdugaacos.com.br/` em `index.html`
  (`canonical`, `og:url`), `robots.txt` e `sitemap.xml`.
- Conferir os telefones: (11) 4612-3879.
