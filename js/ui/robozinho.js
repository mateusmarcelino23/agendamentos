// Função para carregar animação Lottie do robozinho
function carregarRobo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  lottie.loadAnimation({
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "assets/animations/RobotSaludando.json",
  });
}

// Carrega o robozinho
carregarRobo("robozinho");
