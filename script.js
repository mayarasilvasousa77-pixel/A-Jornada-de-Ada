/* =====================================================================
   A Jornada de Ada Lovelace — lógica do jogo (JavaScript puro)

   ÍNDICE
     1. Dados das três fases (cenário, objetos, textos e perguntas)
     2. Estado do jogo e salvamento (localStorage)
     3. Entrada: teclado e joystick de celular
     4. Cenários: desenho estático (fundo) de cada fase
     5. Desenho dinâmico: obstáculos, objetos, porta e Ada
     6. Janela de pista e pergunta
     7. Laço principal (movimento, colisão, câmera)
     8. Fluxo do jogo: iniciar, fases, vitória, reiniciar
   Todo o conteúdo histórico vem do site de referência sobre Ada Lovelace.
   ===================================================================== */
'use strict';

/* ---------- 1. DADOS ---------- */
const MUNDO = { w: 1600, h: 900 };          // tamanho de cada cenário (unidades do jogo)
const LIM = { x0: 30, x1: 1570, y0: 250, y1: 880 }; // área onde Ada pode andar
const PONTOS_ACERTO = 100, PONTOS_SEGUNDA = 50;
const CHAVE_SAVE = 'ada_jornada_v2';

// Cada fase: tema do cenário, obstáculos [x,y,largura,altura,tipo], objetos (pistas) e porta.
// Cada pista: ícone, título, texto histórico, imagem (opcional) e pergunta (q, o = opções, c = índice certo, e = explicação).
const FASES = [
  { n: 1, tema: 'rua', nome: 'Londres e o nascimento de Ada', sub: 'Londres, 1815',
    missao: 'Explore as ruas de Londres e encontre as pistas sobre o nascimento e a infância de Ada.',
    inicio: { x: 800, y: 800 },
    obst: [
      { x: 290, y: 330, w: 22, h: 14, t: 'poste' }, { x: 790, y: 330, w: 22, h: 14, t: 'poste' }, { x: 1290, y: 330, w: 22, h: 14, t: 'poste' },
      { x: 140, y: 490, w: 90, h: 70, t: 'caixa' }, { x: 1360, y: 650, w: 110, h: 80, t: 'caixa' },
      { x: 560, y: 700, w: 50, h: 56, t: 'barril' }, { x: 615, y: 725, w: 50, h: 56, t: 'barril' },
      { x: 940, y: 520, w: 260, h: 120, t: 'carruagem' }, { x: 360, y: 570, w: 140, h: 40, t: 'banco' }],
    itens: [
      { id: 'a', x: 160, y: 340, ic: '📜', titulo: 'Uma menina nasce em Londres', img: 'ada-crianca.jpg',
        texto: 'Augusta Ada King, conhecida como Ada Lovelace, nasceu em Londres em 1815, no dia 10 de dezembro. Era filha do poeta Lord Byron e de Annabella Milbanke.',
        q: 'Em que cidade e em que ano Ada nasceu?', o: ['Paris, 1815', 'Londres, 1815', 'Londres, 1852', 'Edimburgo, 1843'], c: 1,
        e: 'Ada nasceu em Londres, em 10 de dezembro de 1815. O ano de 1852 é o de sua morte e 1843, o da publicação de suas notas.' },
      { id: 'b', x: 700, y: 640, ic: '📖', titulo: 'O poeta Lord Byron',
        texto: 'O pai de Ada era o poeta romântico Lord Byron. Os pais se separaram quando ela tinha poucos meses (1816) e Byron deixou a Inglaterra. Ada nunca conviveu com ele, que morreu na Grécia, em 1824.',
        q: 'O que aconteceu na relação entre Ada e o pai?', o: ['Ele a ensinou matemática', 'Ela nunca conviveu com ele', 'Moraram juntos até 1852', 'Ele a levou para a Grécia'], c: 1,
        e: 'Os pais se separaram poucos meses após o nascimento. Byron deixou a Inglaterra e Ada nunca chegou a conhecê-lo.' },
      { id: 'c', x: 1440, y: 440, ic: '🧮', titulo: 'Annabella Milbanke',
        texto: 'A mãe de Ada, Annabella Milbanke, era apaixonada por matemática e incentivou a filha a estudar ciências e lógica desde cedo.',
        q: 'Quem incentivou Ada a estudar ciências e lógica desde cedo?', o: ['Sua mãe, Annabella Milbanke', 'Seu pai, Lord Byron', 'Charles Babbage', 'Seu marido, William King'], c: 0,
        e: 'Foi a mãe, apaixonada por matemática. Byron não conviveu com Ada, e Babbage só a conheceu em 1833.' }]
  },
  { n: 2, tema: 'oficina', nome: 'O encontro com Charles Babbage', sub: 'Máquinas e engrenagens',
    missao: 'Na oficina de máquinas, encontre as 3 engrenagens e descubra a Máquina Analítica.',
    inicio: { x: 800, y: 810 },
    obst: [
      { x: 620, y: 430, w: 360, h: 170, t: 'maquina' },
      { x: 80, y: 300, w: 200, h: 80, t: 'mesa' }, { x: 1320, y: 300, w: 200, h: 80, t: 'mesa' }, { x: 100, y: 700, w: 200, h: 80, t: 'mesa' },
      { x: 1400, y: 700, w: 50, h: 56, t: 'barril' }],
    itens: [
      { id: 'a', x: 250, y: 520, ic: '⚙️', gear: true, titulo: 'Charles Babbage', img: 'maquina-analitica.jpg',
        texto: 'Charles Babbage idealizou a Máquina Analítica, o projeto que inspirou as famosas notas de Ada. Ele foi seu parceiro intelectual.',
        q: 'Quem idealizou a Máquina Analítica?', o: ['Lord Byron', 'Charles Babbage', 'Augustus De Morgan', 'Mary Somerville'], c: 1,
        e: 'Foi Charles Babbage. Ada colaborou intelectualmente com ele e escreveu notas sobre a máquina.' },
      { id: 'b', x: 1330, y: 520, ic: '⚙️', gear: true, titulo: 'A Máquina Analítica', img: 'maquina-analitica2.jpg',
        texto: 'Era um projeto de máquina mecânica de uso geral. Nunca foi concluída em vida de Babbage e Ada, mas antecipava conceitos importantes da computação. Parte da máquina, construída na década de 1830, está no Museu da Ciência, em Londres.',
        q: 'O que foi a Máquina Analítica?', o: ['Um projeto de máquina mecânica de uso geral', 'Um relógio de bolso', 'Uma máquina de voar', 'Um computador eletrônico'], c: 0,
        e: 'Era um projeto de máquina mecânica de uso geral, idealizado por Babbage e nunca concluído em vida deles.' },
      { id: 'c', x: 800, y: 730, ic: '⚙️', gear: true, titulo: 'As notas de 1843',
        texto: 'Em 1843, Ada publicou a tradução de um artigo de Luigi Menabrea sobre a Máquina Analítica, com notas bem maiores que o texto original. As notas vão de A a G: são sete.',
        q: 'Quantas notas Ada escreveu (de A a G)?', o: ['5', '6', '7', '8'], c: 2,
        e: 'De A a G são sete notas: A, B, C, D, E, F e G.' }]
  },
  { n: 3, tema: 'salao', nome: 'O legado de Ada', sub: 'Da Máquina Analítica ao mundo digital',
    missao: 'No grande salão, reúna as pistas finais sobre a contribuição de Ada para a computação.',
    inicio: { x: 800, y: 810 },
    obst: [
      { x: 260, y: 500, w: 50, h: 60, t: 'coluna' }, { x: 1290, y: 500, w: 50, h: 60, t: 'coluna' },
      { x: 500, y: 600, w: 140, h: 50, t: 'banco' }, { x: 960, y: 600, w: 140, h: 50, t: 'banco' }, { x: 770, y: 400, w: 60, h: 60, t: 'pedestal' }],
    itens: [
      { id: 'a', x: 150, y: 420, ic: '🎼', titulo: 'Máquinas além dos números', img: 'ada-pintura.jpg',
        texto: 'Ada imaginou que máquinas poderiam trabalhar com símbolos e, em princípio, criar música ou representar outras formas de informação.',
        q: 'Qual foi a grande visão de Ada sobre as máquinas?', o: ['Só serviam para somar números', 'Poderiam manipular símbolos e até criar música', 'Jamais seriam construídas', 'Substituiriam os livros'], c: 1,
        e: 'Ela viu que máquinas poderiam manipular símbolos, não apenas números.' },
      { id: 'b', x: 1440, y: 420, ic: '💻', titulo: 'A linguagem Ada',
        texto: 'Em 1980, o Departamento de Defesa dos EUA batizou a linguagem de programação Ada em sua homenagem. O padrão recebeu o número 1815, ano de seu nascimento.',
        q: 'Que número recebeu o padrão da linguagem Ada, igual ao ano de nascimento de Ada?', o: ['1815', '1843', '1852', '1980'], c: 0,
        e: 'O padrão leva o número 1815. 1980 é o ano em que a linguagem foi batizada.' },
      { id: 'c', x: 520, y: 780, ic: '🎓', titulo: 'O Dia de Ada Lovelace',
        texto: 'Desde 2009, celebra-se anualmente, na segunda terça-feira de outubro, o Dia de Ada Lovelace, que destaca as conquistas de mulheres na ciência e na tecnologia.',
        q: 'O que o Dia de Ada Lovelace destaca?', o: ['As conquistas de mulheres na ciência e na tecnologia', 'O aniversário da Máquina Analítica', 'A criação do primeiro jogo', 'O fim da Revolução Industrial'], c: 0,
        e: 'A celebração, criada em 2009, destaca as conquistas de mulheres na ciência e na tecnologia.' },
      { id: 'd', x: 1080, y: 780, ic: '🏆', titulo: 'A pioneira da programação', img: 'eniac.jpg',
        texto: 'As notas de 1843 descrevem um algoritmo para a Máquina Analítica, por isso Ada é frequentemente reconhecida como a primeira programadora. Historiadores debatem o título, mas ninguém discute a importância de suas notas. O ENIAC seguiu um padrão de cálculo semelhante ao elaborado por ela para os números de Bernoulli.',
        q: 'Por que Ada é lembrada como pioneira da programação?', o: ['Suas notas de 1843 descrevem um algoritmo para a Máquina Analítica', 'Ela construiu o primeiro computador eletrônico', 'Ela inventou a internet', 'Ela criou a linguagem Ada'], c: 0,
        e: 'Ela não construiu computadores nem criou a linguagem Ada (batizada décadas depois em sua homenagem). Seu marco são as notas de 1843.' }]
  }
];
// A porta dourada fica no centro da parede de cada cenário
const PORTA = { x: 752, y: 115, w: 96, h: 110 };
const TOTAL_PISTAS = FASES.reduce((s, f) => s + f.itens.length, 0);
// O monstro tem uma vida para cada desafio do jogo.
const VIDAS_INICIAIS_MONSTRO = TOTAL_PISTAS;
const PONTOS_MAX = TOTAL_PISTAS * PONTOS_ACERTO;

/* ---------- 2. ESTADO E SALVAMENTO ---------- */
const $ = (s) => document.querySelector(s);
const estado = {
  fase: 0,                                  // índice da fase atual (0 a 2)
  pontosFase: FASES.map(() => 0),              // pontos ganhos em cada fase
  resolvidas: FASES.map(() => []),         // ids das pistas já resolvidas em cada fase
  monstroVidas: VIDAS_INICIAIS_MONSTRO,     // vidas restantes do Monstro da Matemática
  completo: false                           // true quando a jornada termina
};
const pontosTotais = () => estado.pontosFase.reduce((a, b) => a + b, 0);
const pistasTotais = () => estado.resolvidas.reduce((s, r) => s + r.length, 0);

function salvar() { try { localStorage.setItem(CHAVE_SAVE, JSON.stringify(estado)); } catch (e) { /* sem localStorage */ } }
function carregar() {
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE_SAVE));
    if (d && Array.isArray(d.resolvidas) && d.resolvidas.length === FASES.length && Number.isInteger(d.fase) && d.fase >= 0 && d.fase < FASES.length) {
      // Compatibilidade com partidas salvas antes da chegada do monstro.
      const desafiosConcluidos = d.resolvidas.reduce((total, lista) => total + lista.length, 0);
      if (!Number.isInteger(d.monstroVidas)) d.monstroVidas = Math.max(0, VIDAS_INICIAIS_MONSTRO - desafiosConcluidos);
      d.monstroVidas = Math.max(0, Math.min(VIDAS_INICIAIS_MONSTRO, d.monstroVidas));
      Object.assign(estado, d); return true;
    }
  } catch (e) { /* save inválido: ignora */ }
  return false;
}
function zerar() { estado.fase = 0; estado.pontosFase = FASES.map(() => 0); estado.resolvidas = FASES.map(() => []); estado.monstroVidas = VIDAS_INICIAIS_MONSTRO; estado.completo = false; }

/* Estado temporário da fase em andamento */
let fase = null;                            // dados da fase atual (FASES[i])
let jogador = { x: 0, y: 0, dir: 'baixo', anda: false, t: 0 };
// O monstro é desenhado no próprio canvas e persegue Ada durante a exploração.
let monstro = { x: 120, y: 800, dir: 1, atingido: 0, derrotaTimer: 0 };
let fundo = null;                           // cenário pré-desenhado (canvas fora da tela)
let itens = [];                             // pistas ainda não resolvidas
let efeitos = [];                           // partículas e textos flutuantes
let camera = { x: 0, y: 0 };
let tempo = 0, avisoPorta = 0, emJogo = false, capturada = false;

/* ---------- 3. ENTRADA ---------- */
const teclas = {};
const joy = { x: 0, y: 0 };
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  teclas[k] = true;
  if (!$('#modal').hidden) {                // atalhos dentro da janela de pergunta
    if (/^[1-4]$/.test(k)) { const b = document.querySelectorAll('.opcao')[+k - 1]; if (b && !b.disabled) b.click(); }
    if (k === 'enter' && !$('#modal-btn').hidden) $('#modal-btn').click();
  } else if (k === 'escape' && emJogo) { $('#menu').hidden = !$('#menu').hidden; }
});
addEventListener('keyup', (e) => { teclas[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in teclas) teclas[k] = false; });

// Joystick virtual (celular): arrasta a bolinha para mover Ada
(function () {
  const base = $('#joystick'), bola = $('#joystick-bola');
  let ativo = false;
  const mover = (e) => {
    const r = base.getBoundingClientRect(), R = r.width / 2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
    const d = Math.hypot(dx, dy), lim = R - 25;
    if (d > lim) { dx = dx / d * lim; dy = dy / d * lim; }
    bola.style.transform = `translate(${dx}px,${dy}px)`;
    joy.x = Math.abs(dx) > 8 ? dx / lim : 0; joy.y = Math.abs(dy) > 8 ? dy / lim : 0;
  };
  const soltar = () => { ativo = false; joy.x = joy.y = 0; bola.style.transform = ''; };
  base.addEventListener('pointerdown', (e) => { ativo = true; base.setPointerCapture(e.pointerId); mover(e); });
  base.addEventListener('pointermove', (e) => { if (ativo) mover(e); });
  base.addEventListener('pointerup', soltar); base.addEventListener('pointercancel', soltar);
})();

/* ---------- 4. CENÁRIOS (fundo estático) ---------- */
const FOTOS = {};                           // imagens carregadas (usadas nos quadros do salão)
['ada-pintura', 'ada-crianca', 'ada-retrato', 'diagrama-bernoulli'].forEach((n) => { const i = new Image(); i.src = `imagens/${n}.jpg`; FOTOS[n] = i; });

function semente(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const ret = (c, cor, x, y, w, h) => { c.fillStyle = cor; c.fillRect(x, y, w, h); };

function construirFundo(f) {
  const cv = document.createElement('canvas'); cv.width = MUNDO.w; cv.height = MUNDO.h;
  const c = cv.getContext('2d'), r = semente(f.n * 97 + 3);
  ({ rua: fundoRua, oficina: fundoOficina, salao: fundoSalao })[f.tema](c, r);
  return cv;
}

// Fase 1: ruas de Londres ao entardecer, casas de tijolo e paralelepípedos
function fundoRua(c, r) {
  const g = c.createLinearGradient(0, 0, 0, 235); g.addColorStop(0, '#1a0c33'); g.addColorStop(1, '#6a2f55'); c.fillStyle = g; c.fillRect(0, 0, 1600, 235);
  const cores = ['#5b2237', '#4a1a2e', '#6b2a3e', '#3e1a40'];
  for (let x = -20; x < 1600;) {
    const w = 110 + (r() * 70 | 0), h = 140 + (r() * 60 | 0), y = 235 - h;
    ret(c, cores[r() * 4 | 0], x, y, w, h);
    c.fillStyle = '#22102e'; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + w / 2, y - 34); c.lineTo(x + w + 6, y); c.fill();
    c.fillRect(x + w * .2, y - 44, 14, 30);
    for (let wy = y + 16; wy < 190; wy += 38) for (let wx = x + 14; wx < x + w - 24; wx += 34) { ret(c, r() < .55 ? '#ffd36e' : '#2a1840', wx, wy, 18, 24); ret(c, '#22102e', wx + 8, wy, 2, 24); }
    x += w + 4;
  }
  ret(c, '#2b1d38', 0, 215, 1600, 22); ret(c, '#3a2d49', 0, 237, 1600, 663);
  for (let yy = 237, i = 0; yy < 900; yy += 24, i++) for (let xx = (i % 2) * 20 - 20; xx < 1600; xx += 40) ret(c, `hsl(270,${14 + r() * 8}%,${20 + r() * 9}%)`, xx + 1, yy + 1, 38, 22);
  ret(c, 'rgba(224,178,90,.10)', 0, 237, 1600, 90);
}
// Fase 2: oficina com paredes de tijolo, canos de latão e engrenagens
function fundoOficina(c, r) {
  ret(c, '#4a3a40', 0, 0, 1600, 235);
  for (let y = 0, i = 0; y < 215; y += 20, i++) for (let x = (i % 2) * 30 - 30; x < 1600; x += 60) { ret(c, `hsl(350,${12 + r() * 6}%,${24 + r() * 7}%)`, x + 1, y + 1, 58, 18); }
  for (const y of [50, 150]) { ret(c, '#8a6a3a', 0, y, 1600, 16); ret(c, '#c99a4a', 0, y + 2, 1600, 3); for (let x = 60; x < 1600; x += 200) ret(c, '#6a4a2a', x, y - 4, 14, 24); }
  for (const [x, y, rr] of [[200, 120, 50], [1400, 110, 60], [1100, 100, 36], [480, 100, 38]]) engrenagem(c, x, y, rr, 10, 0, '#7a5a3a');
  ret(c, '#2a1d30', 0, 215, 1600, 22); ret(c, '#463d50', 0, 237, 1600, 663);
  for (let y = 237; y < 900; y += 80) for (let x = 0; x < 1600; x += 80) { ret(c, `hsl(280,${10 + r() * 6}%,${24 + r() * 6}%)`, x + 2, y + 2, 76, 76); }
}
// Fase 3: grande salão com colunas, quadros reais de Ada e tapete vinho
function fundoSalao(c, r) {
  ret(c, '#4a1f30', 0, 0, 1600, 235);
  for (let x = 40; x < 1600; x += 320) { ret(c, '#d8c9a8', x, 0, 40, 215); ret(c, '#b8a888', x - 8, 0, 56, 18); ret(c, '#b8a888', x - 8, 200, 56, 15); }
  const quadros = [['ada-pintura', 200, 28, 100, 150], ['ada-crianca', 480, 40, 100, 120], ['ada-retrato', 1030, 28, 100, 150], ['diagrama-bernoulli', 1290, 50, 170, 110]];
  for (const [n, x, y, w, h] of quadros) { ret(c, '#e0b25a', x - 8, y - 8, w + 16, h + 16); ret(c, '#2a160d', x - 3, y - 3, w + 6, h + 6); const im = FOTOS[n]; if (im.complete && im.naturalWidth) c.drawImage(im, x, y, w, h); }
  ret(c, '#e0b25a', 0, 205, 1600, 10); ret(c, '#2a0f1c', 0, 215, 1600, 22);
  for (let y = 237, i = 0; y < 900; y += 80, i++) for (let x = 0, j = 0; x < 1600; x += 80, j++) ret(c, (i + j) % 2 ? '#cbbd9d' : '#e8dcc3', x, y, 80, 80);
  ret(c, 'rgba(29,15,51,.45)', 0, 237, 1600, 663);
  ret(c, '#e0b25a', 690, 237, 220, 663); ret(c, '#7a2338', 702, 237, 196, 663);
}

function engrenagem(c, x, y, rr, dentes, ang, cor) {
  c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = cor; c.beginPath();
  for (let i = 0; i < dentes * 2; i++) { const a = i / (dentes * 2) * Math.PI * 2, rad = i % 2 ? rr * .8 : rr; c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
  c.closePath(); c.fill(); c.fillStyle = 'rgba(20,8,40,.75)'; c.beginPath(); c.arc(0, 0, rr * .3, 0, 7); c.fill(); c.restore();
}

/* ---------- 5. DESENHO DINÂMICO ---------- */
const cv = $('#cena'), ctx = cv.getContext('2d');
let dpr = 1, W = 0, H = 0, esc = 1;
function redimensionar() {
  dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  // escala: o cenário ocupa a tela toda; a câmera acompanha Ada
  esc = Math.max(H / (W < 700 ? 560 : 720), W / MUNDO.w);
}
addEventListener('resize', redimensionar);

const poeira = Array.from({ length: 45 }, (_, i) => ({ x: (i * 397) % 1600, y: 240 + (i * 211) % 640, f: i * 1.7 }));

function desenharObstaculo(c, o) {
  const { x, y, w, h } = o, cx = x + w / 2;
  switch (o.t) {
    case 'caixa': ret(c, '#8a5a2a', x, y, w, h); ret(c, '#b07a3a', x, y, w, h * .35); c.strokeStyle = '#4a2c14'; c.lineWidth = 3; c.strokeRect(x, y, w, h); c.beginPath(); c.moveTo(x, y + h * .35); c.lineTo(x + w, y + h * .35); c.moveTo(x, y + h); c.lineTo(x + w, y + h * .35); c.stroke(); break;
    case 'barril': ret(c, '#7a4a22', x + 3, y + 8, w - 6, h - 12); c.fillStyle = '#9a6a32'; c.beginPath(); c.ellipse(cx, y + 8, w / 2 - 3, 8, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(cx, y + h - 4, w / 2 - 3, 8, 0, 0, 7); c.fill(); ret(c, '#e0b25a', x + 3, y + h * .35, w - 6, 4); ret(c, '#e0b25a', x + 3, y + h * .7, w - 6, 4); break;
    case 'estante': ret(c, '#3b2418', x, y, w, h); for (let k = 0; k < h / 40; k++) for (let b = x + 5; b < x + w - 8; b += 9) ret(c, ['#7a2338', '#e0b25a', '#3a1a5c', '#f3e7cf'][(b + k) % 4], b, y + 6 + k * 40, 7, 30); ret(c, '#5a3a26', x, y, w, 5); break;
    case 'mesa': ret(c, '#4a2c14', x + 8, y + h * .55, 12, h * .45); ret(c, '#4a2c14', x + w - 20, y + h * .55, 12, h * .45); ret(c, '#a06a38', x, y, w, h * .6); ret(c, '#c08a48', x, y, w, 8);
      ret(c, '#f3e7cf', x + 20, y + 14, 44, 28); ret(c, '#d8c9a8', x + 30, y + 10, 40, 28); ret(c, '#f3e7cf', x + w - 70, y + 16, 36, 24); ret(c, '#e0b25a', x + w / 2 - 3, y + 6, 6, 16);
      c.fillStyle = `rgba(255,${180 + Math.sin(tempo * 9 + x) * 40 | 0},60,.95)`; c.beginPath(); c.ellipse(x + w / 2, y + 3, 3, 6, 0, 0, 7); c.fill(); break;
    case 'banco': ret(c, '#3a2418', x + 6, y + h * .5, 8, h * .5); ret(c, '#3a2418', x + w - 14, y + h * .5, 8, h * .5); ret(c, '#7a2338', x, y, w, h * .6); ret(c, '#e0b25a', x, y, w, 4); break;
    case 'poste': { ret(c, '#2a1d30', x - 2, y + 2, w + 4, h - 2); ret(c, '#1a1020', x + w / 2 - 3, y - 110, 6, 120); ret(c, '#e0b25a', x + w / 2 - 9, y - 124, 18, 16);
      const g = c.createRadialGradient(cx, y - 116, 2, cx, y - 116, 150), p = .30 + Math.sin(tempo * 3 + x) * .04; g.addColorStop(0, `rgba(255,214,120,${p + .3})`); g.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = g; c.fillRect(cx - 150, y - 266, 300, 300); break; }
    case 'carruagem': ret(c, '#7a2338', x, y + 20, w, h - 40); ret(c, '#5a1426', x + 20, y - 24, w - 40, 50); ret(c, '#ffd36e', x + 40, y - 12, 50, 28); ret(c, '#ffd36e', x + w - 90, y - 12, 50, 28); ret(c, '#e0b25a', x, y + 20, w, 5);
      for (const wx of [x + 50, x + w - 50]) { c.fillStyle = '#1a1020'; c.beginPath(); c.arc(wx, y + h - 20, 26, 0, 7); c.fill(); c.strokeStyle = '#e0b25a'; c.lineWidth = 3; c.beginPath(); c.arc(wx, y + h - 20, 18, 0, 7); c.stroke(); } break;
    case 'coluna': ret(c, '#d8c9a8', x + 6, y - 90, w - 12, h + 90); ret(c, '#b8a888', x, y - 96, w, 14); ret(c, '#b8a888', x - 4, y + h - 10, w + 8, 12); break;
    case 'pedestal': ret(c, '#b8a888', x, y + 10, w, h - 10); ret(c, '#d8c9a8', x - 4, y, w + 8, 14); c.font = '34px serif'; c.textAlign = 'center'; c.fillText('📜', cx, y - 6 + Math.sin(tempo * 2) * 3); c.textAlign = 'left'; break;
    case 'maquina': { ret(c, '#4a3a3a', x, y, w, h); ret(c, '#6a5a4a', x, y, w, 22); ret(c, '#2a1d30', x + 14, y + 36, w - 28, h - 56);
      const vel = .3 + estado.resolvidas[1].length * 1.4;
      engrenagem(c, x + 90, y + 100, 52, 12, tempo * vel, '#e0b25a'); engrenagem(c, x + 180, y + 78, 36, 9, -tempo * vel * 1.45, '#c08a48'); engrenagem(c, x + 260, y + 105, 46, 11, tempo * vel * 1.1, '#e0b25a');
      for (let k = 0; k < 3; k++) { c.fillStyle = estado.resolvidas[1].length > k ? '#7fe09a' : '#7a2338'; c.beginPath(); c.arc(x + 40 + k * 28, y + 11, 7, 0, 7); c.fill(); } break; }
    default: ret(c, '#555', x, y, w, h);
  }
}

function desenharItem(c, it) {
  const bob = Math.sin(tempo * 3 + it.x) * 5, y = it.y - 26 + bob;
  const g = c.createRadialGradient(it.x, y, 4, it.x, y, 46); g.addColorStop(0, 'rgba(246,217,143,.75)'); g.addColorStop(1, 'rgba(246,217,143,0)');
  c.fillStyle = g; c.fillRect(it.x - 46, y - 46, 92, 92);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(it.x, it.y, 16 - bob * .4, 5, 0, 0, 7); c.fill();
  if (it.gear) engrenagem(c, it.x, y, 22, 9, tempo * 1.5, '#e0b25a');
  else { c.fillStyle = '#2a1447'; c.strokeStyle = '#e0b25a'; c.lineWidth = 3; c.beginPath(); c.arc(it.x, y, 22, 0, 7); c.fill(); c.stroke(); c.font = '24px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText(it.ic, it.x, y + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; }
  c.fillStyle = '#f6d98f'; c.font = '16px serif'; c.fillText('✦', it.x + 16, y - 20 + Math.sin(tempo * 5 + it.y) * 3);
}

function desenharPorta(c) {
  const { x, y, w, h } = PORTA, aberta = itens.length === 0;
  c.save();
  if (aberta) { const g = c.createRadialGradient(x + w / 2, y + h, 10, x + w / 2, y + h, 160 + Math.sin(tempo * 4) * 10); g.addColorStop(0, 'rgba(246,217,143,.7)'); g.addColorStop(1, 'rgba(246,217,143,0)'); c.fillStyle = g; c.fillRect(x - 160, y - 60, w + 320, h + 200); }
  c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + 40); c.arc(x + w / 2, y + 40, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath();
  c.fillStyle = aberta ? '#fff0c4' : '#2a1a10'; c.fill(); c.strokeStyle = '#e0b25a'; c.lineWidth = 7; c.stroke();
  c.font = '30px serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText(aberta ? '🚪' : '🔒', x + w / 2, y + 78); c.restore();
}

// Personagem do jogador (imagem)
const imgAda = new Image();
imgAda.src = 'imagens/personagem.png';

function desenharAda(c, j) {
  const bob = j.anda ? Math.abs(Math.sin(tempo * 12)) * -3 : 0; // pulinho ao andar
  c.fillStyle = 'rgba(0,0,0,.35)';                               // sombra
  c.beginPath(); c.ellipse(j.x, j.y, 20, 7, 0, 0, 7); c.fill();
  if (!imgAda.complete || !imgAda.naturalWidth) return;
  const h = 80, w = h * imgAda.naturalWidth / imgAda.naturalHeight; // h = altura na tela
  c.save();
  c.translate(j.x, j.y + bob);
  if (j.dir === 'esquerda') c.scale(-1, 1);                      // espelha ao ir para a esquerda
  c.drawImage(imgAda, -w / 2, -h, w, h);
  c.restore();
}

// Monstro da Matemática: criatura original desenhada em canvas, sem imagem externa.
function desenharMonstro(c, m) {
  const derrotando = estado.monstroVidas <= 0;
  const alpha = derrotando ? Math.max(0, m.derrotaTimer / 1.35) : 1;
  if (alpha <= 0) return;
  const bob = Math.sin(tempo * 7) * 4;
  c.save();
  c.globalAlpha = alpha;
  c.translate(m.x, m.y + bob);
  if (m.dir < 0) c.scale(-1, 1);

  // Sombra e pés
  c.fillStyle = 'rgba(0,0,0,.38)';
  c.beginPath(); c.ellipse(0, 0, 34, 9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#34204f';
  c.beginPath(); c.ellipse(-15, -7, 11, 9, -.2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(15, -7, 11, 9, .2, 0, Math.PI * 2); c.fill();

  // Braços
  c.strokeStyle = '#68449a'; c.lineWidth = 13; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-24, -43); c.quadraticCurveTo(-43, -31 + Math.sin(tempo * 8) * 3, -39, -20); c.stroke();
  c.beginPath(); c.moveTo(24, -43); c.quadraticCurveTo(43, -31 - Math.sin(tempo * 8) * 3, 39, -20); c.stroke();

  // Corpo arredondado
  const corpo = c.createRadialGradient(-10, -57, 5, 0, -38, 48);
  corpo.addColorStop(0, m.atingido > 0 ? '#fff0a8' : '#a77bd0');
  corpo.addColorStop(.55, '#70469d'); corpo.addColorStop(1, '#392252');
  c.fillStyle = corpo;
  c.beginPath();
  c.moveTo(-31, -15); c.quadraticCurveTo(-43, -35, -31, -60);
  c.quadraticCurveTo(-27, -83, 0, -80);
  c.quadraticCurveTo(29, -82, 33, -57);
  c.quadraticCurveTo(43, -31, 29, -14);
  c.quadraticCurveTo(0, 2, -31, -15); c.fill();
  c.strokeStyle = '#c49be9'; c.lineWidth = 2; c.stroke();

  // Chifrinhos
  c.fillStyle = '#e0b25a';
  c.beginPath(); c.moveTo(-24, -68); c.lineTo(-34, -91); c.lineTo(-8, -78); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(24, -68); c.lineTo(34, -91); c.lineTo(8, -78); c.closePath(); c.fill();

  // Olhos e pupilas voltadas para Ada
  c.fillStyle = '#fff5dc';
  c.beginPath(); c.ellipse(-12, -51, 8, 11, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(12, -51, 8, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#24152f';
  c.beginPath(); c.arc(-10, -50, 3.5, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(14, -50, 3.5, 0, Math.PI * 2); c.fill();

  // Sorriso e símbolo matemático no peito
  c.strokeStyle = '#24152f'; c.lineWidth = 2.5;
  c.beginPath(); c.arc(0, -34, 10, .15, Math.PI - .15); c.stroke();
  c.fillStyle = '#f6d98f'; c.font = 'bold 17px Georgia'; c.textAlign = 'center';
  c.fillText('∑', 0, -13);

  // Nome acima do personagem
  c.fillStyle = 'rgba(29,15,51,.9)';
  c.beginPath(); c.roundRect(-92, -122, 184, 24, 8); c.fill();
  c.fillStyle = '#f6d98f'; c.font = 'bold 13px Poppins, sans-serif'; c.textAlign = 'center';
  c.fillText('MONSTRO DA MATEMÁTICA', 0, -105);
  c.textAlign = 'left';
  c.restore();
}

function desenhar() {
  const c = ctx;
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = '#0f0620'; c.fillRect(0, 0, W, H);
  c.setTransform(dpr * esc, 0, 0, dpr * esc, -camera.x * dpr * esc, -camera.y * dpr * esc);
  c.drawImage(fundo, 0, 0);
  desenharPorta(c);
  // ordena por "linha do chão" para Ada passar na frente ou atrás dos objetos
  const lista = [...fase.obst.map((o) => ({ k: o.y + o.h, f: () => desenharObstaculo(c, o) })), ...itens.map((it) => ({ k: it.y, f: () => desenharItem(c, it) }))];
  if (estado.monstroVidas > 0 || monstro.derrotaTimer > 0) lista.push({ k: monstro.y, f: () => desenharMonstro(c, monstro) });
  lista.push({ k: jogador.y, f: () => desenharAda(c, jogador) });
  lista.sort((a, b) => a.k - b.k).forEach((e) => e.f());
  // poeira dourada flutuante
  for (const p of poeira) { c.fillStyle = `rgba(246,217,143,${.25 + Math.sin(tempo * 1.5 + p.f) * .2})`; c.beginPath(); c.arc(p.x + Math.sin(tempo * .4 + p.f) * 30, p.y + Math.cos(tempo * .5 + p.f) * 20, 2, 0, 7); c.fill(); }
  if (fase.tema === 'rua') for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(235,215,255,.05)'; c.beginPath(); c.ellipse(((i * 380 + tempo * 18) % 2000) - 200, 330 + (i % 3) * 200, 280, 50, 0, 0, 7); c.fill(); }
  for (const e of efeitos) { c.globalAlpha = Math.min(1, e.v * 1.5); if (e.txt) { c.fillStyle = '#f6d98f'; c.font = 'bold 34px Poppins, sans-serif'; c.textAlign = 'center'; c.fillText(e.txt, e.x, e.y); c.textAlign = 'left'; } else { c.fillStyle = e.cor; c.beginPath(); c.arc(e.x, e.y, 3, 0, 7); c.fill(); } c.globalAlpha = 1; }
  // seta guia: aponta para a próxima pista (ou para a porta, quando tudo foi resolvido)
  const alvo = itens.length ? itens.reduce((a, b) => Math.hypot(a.x - jogador.x, a.y - jogador.y) < Math.hypot(b.x - jogador.x, b.y - jogador.y) ? a : b) : { x: PORTA.x + PORTA.w / 2, y: PORTA.y + PORTA.h };
  const d = Math.hypot(alvo.x - jogador.x, alvo.y - jogador.y);
  if (d > 130) { const a = Math.atan2(alvo.y - (jogador.y - 30), alvo.x - jogador.x), r = 58 + Math.sin(tempo * 6) * 4; c.save(); c.translate(jogador.x + Math.cos(a) * r, jogador.y - 30 + Math.sin(a) * r); c.rotate(a); c.fillStyle = '#f6d98f'; c.beginPath(); c.moveTo(10, 0); c.lineTo(-7, -7); c.lineTo(-7, 7); c.fill(); c.restore(); }
  // vinheta (escurece as bordas da tela)
  c.setTransform(dpr, 0, 0, dpr, 0, 0); const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, 'rgba(10,4,25,0)'); v.addColorStop(1, 'rgba(10,4,25,.6)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}

/* ---------- 6. JANELA DE PISTA E PERGUNTA ---------- */
const embaralhar = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
function toast(txt) { const t = $('#toast'); t.textContent = txt; t.hidden = false; clearTimeout(toast.id); toast.id = setTimeout(() => { t.hidden = true; }, 2600); }

// Passo 1: mostra a informação histórica da pista
function abrirItem(it) {
  jogador.anda = false;
  const m = $('#modal'), img = $('#modal-img');
  m.hidden = false; img.hidden = !it.img; if (it.img) img.src = `imagens/${it.img}`;
  $('#modal-etiqueta').textContent = `Pista ${estado.resolvidas[estado.fase].length + 1} de ${fase.itens.length} · ${it.ic}`;
  $('#modal-titulo').textContent = it.titulo; $('#modal-texto').textContent = it.texto;
  $('#modal-opcoes').innerHTML = ''; $('#modal-feedback').textContent = '';
  const b = $('#modal-btn'); b.hidden = false; b.textContent = 'Resolver o desafio'; b.onclick = () => perguntar(it);
}
// Passo 2: pergunta com alternativas (acerto na 1ª = 100 pts; depois de errar = 50 pts)
function perguntar(it) {
  let erros = 0; const botoes = [], fb = $('#modal-feedback'), btn = $('#modal-btn'), caixa = $('#modal-opcoes');
  $('#modal-etiqueta').textContent = 'Desafio'; $('#modal-titulo').textContent = it.q; $('#modal-texto').textContent = ''; fb.textContent = ''; btn.hidden = true; caixa.innerHTML = '';
  embaralhar(it.o.map((_, i) => i)).forEach((idx, pos) => {
    const b = document.createElement('button'); b.className = 'opcao'; b.textContent = `${pos + 1}. ${it.o[idx]}`;
    b.onclick = () => {
      botoes.forEach((x) => { x.b.disabled = true; });
      if (idx === it.c) {
        const pts = erros ? PONTOS_SEGUNDA : PONTOS_ACERTO; b.classList.add('certa');
        fb.textContent = `✔ Correto! +${pts} pontos. ${it.e}`; btn.hidden = false; btn.textContent = 'Continuar'; btn.onclick = () => resolver(it, pts);
      } else { // resposta errada: mostra a explicação educativa e permite tentar de novo
        erros++; b.classList.add('errada'); fb.textContent = `✖ Ainda não. ${it.e}`; btn.hidden = false; btn.textContent = 'Tentar novamente';
        btn.onclick = () => { fb.textContent = ''; btn.hidden = true; botoes.forEach((x) => { if (!x.b.classList.contains('errada')) x.b.disabled = false; }); };
      }
    };
    caixa.append(b); botoes.push({ b });
  });
}
// Passo 3: pista resolvida — soma pontos, remove o objeto e salva
function resolver(it, pts) {
  $('#modal').hidden = true;
  const i = estado.fase; if (estado.resolvidas[i].includes(it.id)) return;
  estado.resolvidas[i].push(it.id); estado.pontosFase[i] += pts; itens = itens.filter((x) => x !== it);

  // Cada desafio concluído tira uma vida do Monstro da Matemática.
  estado.monstroVidas = Math.max(0, estado.monstroVidas - 1);
  monstro.atingido = .45;
  if (estado.monstroVidas === 0) monstro.derrotaTimer = 1.35;
  for (let k = 0; k < 26; k++) { const a = Math.random() * 6.28, s = 40 + Math.random() * 90; efeitos.push({ x: it.x, y: it.y - 26, vx: Math.cos(a) * s, vy: Math.sin(a) * s, v: 1, cor: k % 2 ? '#f6d98f' : '#e07a8e' }); }
  efeitos.push({ x: it.x, y: it.y - 60, vx: 0, vy: -40, v: 1.6, txt: `+${pts}` });
  for (let k = 0; k < 14; k++) {
    const a = Math.random() * Math.PI * 2, s = 35 + Math.random() * 65;
    efeitos.push({ x: monstro.x, y: monstro.y - 42, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 25, v: .85, cor: k % 2 ? '#c49be9' : '#f6d98f' });
  }
  if (estado.monstroVidas === 0) efeitos.push({ x: monstro.x, y: monstro.y - 115, vx: 0, vy: -25, v: 1.8, txt: 'DERROTADO!' });
  salvar(); atualizarHUD();
  if (estado.monstroVidas === 0) toast('🏆 Você derrotou o Monstro da Matemática!');
  else if (!itens.length) toast('✨ A porta dourada se abriu! Vá até ela.');
  else toast('✦ O Monstro da Matemática perdeu uma vida!');
}

/* ---------- 7. LAÇO PRINCIPAL ---------- */
const bloqueado = () => !$('#modal').hidden || !$('#menu').hidden || !$('#como').hidden || !$('#transicao').hidden;

function colide(px, py) { // caixa dos pés de Ada contra os obstáculos
  const x0 = px - 12, x1 = px + 12, y0 = py - 12, y1 = py;
  return fase.obst.some((o) => x1 > o.x && x0 < o.x + o.w && y1 > o.y && y0 < o.y + o.h);
}

// O monstro persegue Ada e a captura quando chega perto demais.
// Ada corre a 240; o monstro é rápido, mas nasce bem longe dela.
const VEL_MONSTRO = 150;     // velocidade inicial do monstro (mude aqui para facilitar ou dificultar)
const ESPERA_MONSTRO = 3;    // segundos parado no começo de cada fase
function atualizarMonstro(dt) {
  if (estado.monstroVidas <= 0) {
    monstro.derrotaTimer = Math.max(0, monstro.derrotaTimer - dt);
    return;
  }
  monstro.atingido = Math.max(0, monstro.atingido - dt);
  if (monstro.espera > 0) { monstro.espera -= dt; return; } // largada: monstro ainda parado
  const dx = jogador.x - monstro.x, dy = jogador.y - monstro.y;
  const distancia = Math.hypot(dx, dy);
  if (distancia > 0) {
    const velocidade = VEL_MONSTRO + (VIDAS_INICIAIS_MONSTRO - estado.monstroVidas) * 6; // acelera a cada desafio concluído
    const vx = dx / distancia * velocidade * dt;
    const vy = dy / distancia * velocidade * dt;
    const nx = Math.min(LIM.x1, Math.max(LIM.x0, monstro.x + vx));
    const ny = Math.min(LIM.y1, Math.max(LIM.y0, monstro.y + vy));
    // Tenta contornar obstáculos movendo primeiro na horizontal e depois na vertical.
    if (!colide(nx, monstro.y)) monstro.x = nx;
    if (!colide(monstro.x, ny)) monstro.y = ny;
    monstro.dir = dx >= 0 ? 1 : -1;
  }
}
function atualizar(dt) {
  tempo += dt;
  if (!bloqueado() && !capturada) {
    let ax = (teclas.d || teclas.arrowright ? 1 : 0) - (teclas.a || teclas.arrowleft ? 1 : 0) + joy.x;
    let ay = (teclas.s || teclas.arrowdown ? 1 : 0) - (teclas.w || teclas.arrowup ? 1 : 0) + joy.y;
    const m = Math.hypot(ax, ay); if (m > 1) { ax /= m; ay /= m; }
    jogador.anda = m > 0.05;
    if (jogador.anda) {
      jogador.dir = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'direita' : 'esquerda') : (ay > 0 ? 'baixo' : 'cima');
      const nx = Math.min(LIM.x1, Math.max(LIM.x0, jogador.x + ax * 240 * dt)); if (!colide(nx, jogador.y)) jogador.x = nx;
      const ny = Math.min(LIM.y1, Math.max(LIM.y0, jogador.y + ay * 240 * dt)); if (!colide(jogador.x, ny)) jogador.y = ny;
    }
    // O monstro continua perseguindo Ada enquanto ela explora o cenário.
    atualizarMonstro(dt);
    // Se o monstro encostar em Ada, a fase reinicia sem apagar pistas já concluídas.
    if (estado.monstroVidas > 0 && Math.hypot(jogador.x - monstro.x, jogador.y - monstro.y) < 48) {
      capturada = true;
      jogador.anda = false;
      $('#capturada').hidden = false;
      toast('O monstro alcançou Ada!');
    }
    // coleta automática ao chegar perto de um objeto
    for (const it of itens) if (Math.hypot(it.x - jogador.x, (it.y - 10) - jogador.y) < 40) { abrirItem(it); break; }
    // porta dourada
    if (jogador.y < LIM.y0 + 14 && jogador.x > PORTA.x - 10 && jogador.x < PORTA.x + PORTA.w + 10) {
      if (!itens.length) concluirFase();
      else if (tempo > avisoPorta) { toast(`A porta está trancada: faltam ${itens.length} pista(s).`); avisoPorta = tempo + 2.5; }
    }
  }
  for (const e of efeitos) { e.v -= dt; e.x += (e.vx || 0) * dt; e.y += (e.vy || 0) * dt; if (e.vx) { e.vx *= .96; e.vy *= .96; } }
  efeitos = efeitos.filter((e) => e.v > 0);
  // câmera suave, presa aos limites do cenário
  const vw = W / esc, vh = H / esc;
  const tx = Math.max(0, Math.min(MUNDO.w - vw, jogador.x - vw / 2)), ty = Math.max(0, Math.min(MUNDO.h - vh, jogador.y - vh / 2 - 20));
  camera.x += (tx - camera.x) * Math.min(1, dt * 7); camera.y += (ty - camera.y) * Math.min(1, dt * 7);
}
let ultimo = 0;
function laco(ts) {
  const dt = Math.min(.05, (ts - ultimo) / 1000 || 0); ultimo = ts;
  if (emJogo && fase) { atualizar(dt); desenhar(); }
  requestAnimationFrame(laco);
}

/* ---------- 8. FLUXO DO JOGO ---------- */
function mostrar(id) { ['tela-inicial', 'jogo', 'vitoria'].forEach((t) => $('#' + t).classList.toggle('ativa', t === id)); emJogo = id === 'jogo'; }

function atualizarHUD() {
  const i = estado.fase;
  $('#hud-fase').textContent = `${i + 1}/${FASES.length}`; $('#hud-pontos').textContent = pontosTotais();
  $('#hud-pistas').textContent = `${estado.resolvidas[i].length}/${FASES[i].itens.length}`;
  $('#hud-barra').style.width = (pistasTotais() / TOTAL_PISTAS * 100) + '%';
  const vidas = Math.max(0, estado.monstroVidas);
  $('#monstro-vidas').innerHTML = Array.from({ length: VIDAS_INICIAIS_MONSTRO }, (_, k) =>
    `<span class="${k < vidas ? 'vida-cheia' : 'vida-vazia'}">♥</span>`).join('');
  $('#monstro-contagem').textContent = `${vidas}/${VIDAS_INICIAIS_MONSTRO}`;
  $('#hud-monstro').classList.toggle('monstro-derrotado', vidas === 0);
  // painel de missão
  $('#missao-titulo').textContent = `Fase ${i + 1} · ${FASES[i].nome}`; $('#missao-desc').textContent = FASES[i].missao;
  const lista = $('#missao-lista'); lista.innerHTML = '';
  FASES[i].itens.forEach((it, k) => { const li = document.createElement('li'), ok = estado.resolvidas[i].includes(it.id); li.className = ok ? 'ok' : ''; li.textContent = ok ? it.titulo : `Pista misteriosa ${k + 1}`; lista.append(li); });
  const fim = document.createElement('li'); fim.className = estado.resolvidas[i].length === FASES[i].itens.length ? 'ok' : ''; fim.textContent = 'Atravessar a porta dourada'; lista.append(fim);
}

// Carrega o cenário, a posição de Ada e as pistas ainda não resolvidas de uma fase
function iniciarFase(i) {
  capturada = false; $('#capturada').hidden = true;
  estado.fase = i; fase = FASES[i]; fundo = construirFundo(fase);
  itens = fase.itens.filter((it) => !estado.resolvidas[i].includes(it.id)).map((it) => ({ ...it }));
  jogador = { x: fase.inicio.x, y: fase.inicio.y, dir: 'cima', anda: false };
  monstro = { x: 1540, y: 270, dir: -1, atingido: 0, derrotaTimer: 0, espera: ESPERA_MONSTRO };
  efeitos = []; redimensionar();
  camera.x = Math.max(0, Math.min(MUNDO.w - W / esc, jogador.x - W / esc / 2)); camera.y = Math.max(0, Math.min(MUNDO.h - H / esc, jogador.y - H / esc / 2));
  salvar(); atualizarHUD(); mostrar('jogo');
}
// Animação de transição entre fases
function irParaFase(i) {
  $('#trans-num').textContent = `FASE ${i + 1}`; $('#trans-nome').textContent = FASES[i].nome; $('#trans-sub').textContent = FASES[i].sub;
  $('#transicao').hidden = false;
  setTimeout(() => iniciarFase(i), 1300);
  setTimeout(() => { $('#transicao').hidden = true; if (!itens.length) toast('Você já resolveu todas as pistas: siga até a porta dourada.'); }, 2600);
}
function concluirFase() {
  if (!$('#transicao').hidden) return;
  const i = estado.fase;
  if (i < FASES.length - 1) { estado.fase = i + 1; salvar(); irParaFase(i + 1); }
  else { estado.completo = true; salvar(); mostrarVitoria(); }
}
function mostrarVitoria() {
  const p = pontosTotais(), pct = p / PONTOS_MAX, n = pct >= .85 ? 3 : pct >= .6 ? 2 : 1;
  $('#vit-pontos').textContent = p; $('#vit-pistas').textContent = `${pistasTotais()}/${TOTAL_PISTAS}`;
  $('#vit-estrelas').innerHTML = [1, 2, 3].map((k) => `<span class="${k <= n ? '' : 'vazia'}">★</span>`).join('');
  mostrar('vitoria');
}
function novoJogo() { zerar(); salvar(); irParaFase(0); }
function reiniciarFase() { const i = estado.fase; estado.resolvidas[i] = []; estado.pontosFase[i] = 0; iniciarFase(i); toast('Fase reiniciada.'); }
function irParaInicio() { $('#menu').hidden = true; $('#modal').hidden = true; mostrar('tela-inicial'); $('#btn-continuar').hidden = !(temSave() && !estado.completo); }
function temSave() { try { return !!localStorage.getItem(CHAVE_SAVE); } catch (e) { return false; } }
function criarBrilhos(el) { for (let k = 0; k < 30; k++) { const i = document.createElement('i'); i.style.left = Math.random() * 100 + '%'; i.style.animationDuration = 6 + Math.random() * 9 + 's'; i.style.animationDelay = -Math.random() * 12 + 's'; el.append(i); } }

/* ---------- Botões e inicialização ---------- */
$('#btn-jogar').onclick = novoJogo;
$('#btn-continuar').onclick = () => { carregar(); irParaFase(estado.fase); };
$('#btn-como').onclick = () => { $('#como').hidden = false; };
$('#btn-reiniciar').onclick = reiniciarFase;
$('#btn-tentar-novamente').onclick = () => iniciarFase(estado.fase);
$('#btn-capturada-menu').onclick = () => { $('#capturada').hidden = true; irParaInicio(); };
$('#btn-menu').onclick = () => { $('#menu').hidden = false; };
$('#menu-como').onclick = () => { $('#como').hidden = false; };
$('#menu-inicio').onclick = irParaInicio;
$('#btn-de-novo').onclick = novoJogo;
$('#btn-vit-inicio').onclick = irParaInicio;
document.querySelectorAll('[data-fechar]').forEach((b) => { b.onclick = () => { $('#' + b.dataset.fechar).hidden = true; }; });
criarBrilhos($('#brilhos')); criarBrilhos($('#brilhos2'));
if (carregar()) $('#btn-continuar').hidden = estado.completo;
addEventListener('resize', () => { if (fase) redimensionar(); });
redimensionar(); requestAnimationFrame(laco);
window.JogoAda = { estado, FASES, PORTA, LIM, get itens() { return itens; }, get jogador() { return jogador; }, abrirItem, resolver, iniciarFase, concluirFase, colide, get monstro() { return monstro; } }; // usado nos testes
