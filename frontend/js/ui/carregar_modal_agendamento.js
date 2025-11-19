document.addEventListener("DOMContentLoaded", () => {
  // Caminho do arquivo HTML do modal
  const modalPath = "/agendamentos/frontend/components/criar_agendamento.html";

  // Busca o arquivo
  fetch(modalPath)
    .then((response) => response.text())
    .then((html) => {
      // Insere o modal no final do body
      document.body.insertAdjacentHTML("beforeend", html);
    })
    .catch((err) => {
      console.error("Erro ao carregar o modal:", err);
    });
});
