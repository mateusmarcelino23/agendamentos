// Função para ajustar a altura do conteúdo principal
function ajustarAlturaConteudo() {
  const conteudo = document.querySelector(".conteudo-principal");
  const footer = document.querySelector("#footer");
  const alturaTela = window.innerHeight;
  const alturaConteudo = conteudo.offsetHeight + footer.offsetHeight;

  if (alturaConteudo < alturaTela) {
    // aumenta a altura do conteúdo para forçar rolagem
    const diferenca = alturaTela - footer.offsetHeight + 100;
    conteudo.style.minHeight = diferenca + "px";
  } else {
    conteudo.style.minHeight = "auto";
  }
}

// Carrega o footer
fetch("../components/footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
    // Ajusta a altura do conteúdo depois que o footer foi carregado
    ajustarAlturaConteudo();
  })
  .catch((error) => console.error("Erro ao carregar o footer:", error));

// Também ajusta ao redimensionar a tela
window.addEventListener("resize", ajustarAlturaConteudo);
