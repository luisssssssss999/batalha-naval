// ===========================================================
// ranking.js
// Lê o ranking salvo no Web Storage e exibe na tela,
// ordenado da maior para a menor pontuação.
// ===========================================================

const listaRanking = document.getElementById("lista-ranking");
const avisoRankingVazio = document.getElementById("ranking-vazio");
const botaoNovoJogo = document.getElementById("btn-novo-jogo");

const rankingSalvo = localStorage.getItem("ranking");
const ranking = rankingSalvo ? JSON.parse(rankingSalvo) : [];

if (ranking.length === 0) {
  avisoRankingVazio.classList.remove("escondido");
} else {
  // O ranking já é salvo ordenado, mas ordenamos de novo por garantia
  ranking.sort(function (a, b) {
    return b.pontos - a.pontos;
  });

  for (let i = 0; i < ranking.length; i++) {
    const item = document.createElement("li");
    const posicao = i + 1;

    item.innerHTML =
      "<span>" + posicao + "º - " + ranking[i].nome + "</span>" +
      "<span>" + ranking[i].pontos + " pts</span>";

    listaRanking.appendChild(item);
  }
}

botaoNovoJogo.addEventListener("click", function () {
  window.location.href = "index.html";
});
