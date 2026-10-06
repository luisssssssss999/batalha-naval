// ===========================================================
// jogo.js
// Lógica principal da Batalha Naval:
// monta o tabuleiro, posiciona os navios, controla cliques,
// pontuação, vidas e o fim da partida.
// ===========================================================

// ----- Configurações de cada nível -----
// tamanho = lado do tabuleiro (tamanho x tamanho)
// vidas   = quantas "águas" o jogador pode errar
// navios  = tamanho de cada navio que será posicionado
const CONFIGURACOES = {
  facil:    { tamanho: 8,  vidas: 5, navios: [4, 3, 3, 2, 2] },
  medio:    { tamanho: 10, vidas: 4, navios: [5, 4, 3, 3, 2] },
  dificil:  { tamanho: 12, vidas: 3, navios: [5, 4, 4, 3, 3, 2, 2] }
};

const PONTOS_POR_ACERTO = 10;
const PONTOS_BONUS_NAVIO_COMPLETO = 20;
const TAMANHO_MAXIMO_RANKING = 10;

// ----- Variáveis do estado da partida -----
let tabuleiroDados = [];   // matriz com os dados de cada célula
let listaNavios = [];      // lista dos navios posicionados
let pontuacao = 0;
let vidasRestantes = 0;
let jogoTerminado = false;
let jogadorAtual = null;

// ----- Elementos da tela -----
const elementoTabuleiro = document.getElementById("tabuleiro");
const elementoInfoNome = document.getElementById("info-nome");
const elementoInfoNivel = document.getElementById("info-nivel");
const elementoInfoPontos = document.getElementById("info-pontos");
const elementoInfoVidas = document.getElementById("info-vidas");
const painelFim = document.getElementById("fim-de-jogo");
const tituloFim = document.getElementById("titulo-fim");
const textoFim = document.getElementById("texto-fim");
const botaoRanking = document.getElementById("btn-ranking");
const botaoJogarNovamente = document.getElementById("btn-jogar-novamente");

iniciarPartida();

// ===========================================================
// Função principal que prepara tudo para uma nova partida
// ===========================================================
function iniciarPartida() {
  // Recupera os dados do jogador salvos na tela de cadastro
  const dadosSalvos = localStorage.getItem("jogador");

  if (!dadosSalvos) {
    // Se não houver jogador cadastrado, volta para o formulário
    window.location.href = "index.html";
    return;
  }

  jogadorAtual = JSON.parse(dadosSalvos);
  const config = CONFIGURACOES[jogadorAtual.nivel];

  // Mostra as informações do jogador no cabeçalho
  elementoInfoNome.textContent = jogadorAtual.nome;
  elementoInfoNivel.textContent = jogadorAtual.nivel;

  pontuacao = 0;
  vidasRestantes = config.vidas;
  jogoTerminado = false;
  atualizarPlacar();

  criarTabuleiroVazio(config.tamanho);
  posicionarNavios(config.navios, config.tamanho);
  desenharTabuleiro(config.tamanho, jogadorAtual.cor);
}

// ===========================================================
// Cria a matriz de dados do tabuleiro (sem navios ainda)
// ===========================================================
function criarTabuleiroVazio(tamanho) {
  tabuleiroDados = [];

  for (let linha = 0; linha < tamanho; linha++) {
    const novaLinha = [];
    for (let coluna = 0; coluna < tamanho; coluna++) {
      novaLinha.push({
        temNavio: false,
        revelada: false,
        idNavio: null
      });
    }
    tabuleiroDados.push(novaLinha);
  }
}

// ===========================================================
// Posiciona os navios de forma aleatória, sem sobreposição
// ===========================================================
function posicionarNavios(tamanhosNavios, tamanhoTabuleiro) {
  listaNavios = [];

  for (let i = 0; i < tamanhosNavios.length; i++) {
    const tamanhoNavio = tamanhosNavios[i];
    let posicionado = false;

    // Tenta posições aleatórias até o navio caber sem sobrepor outro
    while (!posicionado) {
      const horizontal = Math.random() < 0.5;
      const linha = Math.floor(Math.random() * tamanhoTabuleiro);
      const coluna = Math.floor(Math.random() * tamanhoTabuleiro);

      const celulas = calcularCelulasDoNavio(linha, coluna, tamanhoNavio, horizontal);

      if (celulas && celulasLivres(celulas, tamanhoTabuleiro)) {
        // Marca as células escolhidas como pertencentes a este navio
        for (let c = 0; c < celulas.length; c++) {
          const pos = celulas[c];
          tabuleiroDados[pos.linha][pos.coluna].temNavio = true;
          tabuleiroDados[pos.linha][pos.coluna].idNavio = i;
        }

        listaNavios.push({
          id: i,
          tamanho: tamanhoNavio,
          acertos: 0
        });

        posicionado = true;
      }
    }
  }
}

// Calcula as células que um navio ocuparia a partir de uma posição inicial
function calcularCelulasDoNavio(linha, coluna, tamanho, horizontal) {
  const celulas = [];

  for (let i = 0; i < tamanho; i++) {
    const l = horizontal ? linha : linha + i;
    const c = horizontal ? coluna + i : coluna;
    celulas.push({ linha: l, coluna: c });
  }

  return celulas;
}

// Verifica se todas as células estão dentro do tabuleiro e livres
function celulasLivres(celulas, tamanhoTabuleiro) {
  for (let i = 0; i < celulas.length; i++) {
    const pos = celulas[i];

    if (pos.linha < 0 || pos.linha >= tamanhoTabuleiro) return false;
    if (pos.coluna < 0 || pos.coluna >= tamanhoTabuleiro) return false;
    if (tabuleiroDados[pos.linha][pos.coluna].temNavio) return false;
  }

  return true;
}

// ===========================================================
// Desenha o tabuleiro na tela (cria os elementos <div>)
// ===========================================================
function desenharTabuleiro(tamanho, corFrota) {
  elementoTabuleiro.innerHTML = "";
  elementoTabuleiro.style.gridTemplateColumns = "repeat(" + tamanho + ", 1fr)";
  elementoTabuleiro.style.maxWidth = (tamanho * 42) + "px";
  elementoTabuleiro.style.setProperty("--cor-frota", corFrota);

  for (let linha = 0; linha < tamanho; linha++) {
    for (let coluna = 0; coluna < tamanho; coluna++) {
      const celula = document.createElement("div");
      celula.className = "celula";
      celula.dataset.linha = linha;
      celula.dataset.coluna = coluna;

      celula.addEventListener("click", function () {
        revelarCelula(linha, coluna, celula);
      });

      elementoTabuleiro.appendChild(celula);
    }
  }
}

// ===========================================================
// Trata o clique em uma célula do tabuleiro
// ===========================================================
function revelarCelula(linha, coluna, elementoCelula) {
  if (jogoTerminado) return;

  const dadosCelula = tabuleiroDados[linha][coluna];

  // Ignora cliques em células já reveladas
  if (dadosCelula.revelada) return;

  dadosCelula.revelada = true;

  if (dadosCelula.temNavio) {
    // Acertou um navio
    elementoCelula.classList.add("navio-acertado");
    elementoCelula.textContent = "X";
    pontuacao += PONTOS_POR_ACERTO;

    const navio = listaNavios[dadosCelula.idNavio];
    navio.acertos++;

    // Se todas as partes do navio foram encontradas, dá pontos bônus
    if (navio.acertos === navio.tamanho) {
      pontuacao += PONTOS_BONUS_NAVIO_COMPLETO;
    }
  } else {
    // Errou, encontrou água
    elementoCelula.classList.add("agua-revelada");
    elementoCelula.textContent = "";
    vidasRestantes--;
  }

  atualizarPlacar();
  verificarFimDeJogo();
}

// Atualiza os números mostrados no cabeçalho
function atualizarPlacar() {
  elementoInfoPontos.textContent = pontuacao;
  elementoInfoVidas.textContent = vidasRestantes;
}

// ===========================================================
// Verifica se o jogo acabou (vitória ou derrota)
// ===========================================================
function verificarFimDeJogo() {
  if (vidasRestantes <= 0) {
    encerrarPartida(false);
    return;
  }

  const todosNaviosAfundados = listaNavios.every(function (navio) {
    return navio.acertos === navio.tamanho;
  });

  if (todosNaviosAfundados) {
    encerrarPartida(true);
  }
}

// Encerra a partida, mostra o resultado e salva no ranking se possível
function encerrarPartida(venceu) {
  jogoTerminado = true;

  if (venceu) {
    tituloFim.textContent = "Vitória";
    textoFim.textContent = jogadorAtual.nome + ", você afundou toda a frota inimiga com " + pontuacao + " pontos!";
  } else {
    tituloFim.textContent = "Fim de jogo";
    textoFim.textContent = jogadorAtual.nome + ", suas vidas acabaram. Pontuação final: " + pontuacao + ".";
  }

  salvarNoRankingSePossivel(jogadorAtual.nome, pontuacao);

  painelFim.classList.remove("escondido");
}

// ===========================================================
// Salva a pontuação no Web Storage caso ela entre no top 10
// ===========================================================
function salvarNoRankingSePossivel(nome, pontos) {
  const rankingSalvo = localStorage.getItem("ranking");
  let ranking = rankingSalvo ? JSON.parse(rankingSalvo) : [];

  const cabeNoRanking = ranking.length < TAMANHO_MAXIMO_RANKING ||
    pontos > ranking[ranking.length - 1].pontos;

  if (!cabeNoRanking) return;

  ranking.push({ nome: nome, pontos: pontos, data: new Date().toLocaleDateString() });

  // Ordena da maior para a menor pontuação
  ranking.sort(function (a, b) {
    return b.pontos - a.pontos;
  });

  // Mantém apenas os melhores resultados
  ranking = ranking.slice(0, TAMANHO_MAXIMO_RANKING);

  localStorage.setItem("ranking", JSON.stringify(ranking));
}

// ----- Botões da tela de fim de jogo -----
botaoRanking.addEventListener("click", function () {
  window.location.href = "ranking.html";
});

botaoJogarNovamente.addEventListener("click", function () {
  window.location.href = "index.html";
});
