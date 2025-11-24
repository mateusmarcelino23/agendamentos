document.addEventListener("DOMContentLoaded", () => {
  const modalPath = "/agendamentos/frontend/components/criar_agendamento.html";

  fetch(modalPath)
    .then((response) => response.text())
    .then((html) => {
      // Insere o modal no DOM
      document.body.insertAdjacentHTML("beforeend", html);

      // Agora que o HTML foi carregado, carregamos o JS funcional
      const script = document.createElement("script");
      script.src = "/agendamentos/frontend/js/api/criar_agendamento.js";
      document.body.appendChild(script);
    })
    .catch((err) => {
      console.error("Erro ao carregar o modal:", err);
    });
});
