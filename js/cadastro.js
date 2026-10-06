// ===========================================================
// cadastro.js
// Responsável por validar o formulário e salvar os dados
// do jogador no Web Storage (localStorage) antes da partida.
// ===========================================================

// Pega os elementos do formulário
const formCadastro = document.getElementById("form-cadastro");
const campoNome = document.getElementById("nome");
const campoNivel = document.getElementById("nivel");
const campoCor = document.getElementById("corNavio");
const mensagemErro = document.getElementById("mensagem-erro");

// Evento disparado quando o jogador clica em "Iniciar partida"
formCadastro.addEventListener("submit", function (evento) {
  // Impede o navegador de recarregar a página
  evento.preventDefault();

  const nome = campoNome.value.trim();
  const nivel = campoNivel.value;
  const cor = campoCor.value;

  // ----- Validação dos campos -----
  if (nome.length < 2) {
    mostrarErro("Digite um nome com pelo menos 2 letras.");
    return;
  }

  if (nivel === "") {
    mostrarErro("Selecione um nível de dificuldade.");
    return;
  }

  // Se passou pela validação, limpa qualquer mensagem de erro antiga
  mensagemErro.textContent = "";

  // Monta o objeto do jogador
  const jogador = {
    nome: nome,
    nivel: nivel,
    cor: cor
  };

  // Salva no localStorage como texto (JSON)
  localStorage.setItem("jogador", JSON.stringify(jogador));

  // Vai para a tela do jogo
  window.location.href = "jogo.html";
});

// Função simples para exibir mensagens de erro na tela
function mostrarErro(texto) {
  mensagemErro.textContent = texto;
}
