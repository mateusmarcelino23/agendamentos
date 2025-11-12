// Função para carregar animação Lottie do robozinho
function carregarRobo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  lottie.loadAnimation({
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "frontend/assets/animations/RobotSaludando.json",
  });
}

// Carrega os dois robozinhos
carregarRobo("robozinho");
carregarRobo("desktop-robozinho");
