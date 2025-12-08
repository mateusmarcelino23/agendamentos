document.addEventListener("DOMContentLoaded", () => {
  const modalPath = "/agendamentos/frontend/components/criar_agendamento.html";

  fetch(modalPath)
    .then((response) => response.text())
    .then((html) => {
      // Insere o modal no DOM
      document.body.insertAdjacentHTML("beforeend", html);

      // Carrega o JS funcional do modal com cache-busting
      const script = document.createElement("script");
      script.src = `/agendamentos/frontend/js/api/criar_agendamento.js?ts=${Date.now()}`;
      script.onload = () => {
        // ---------- RESET AUTOMÁTICO AO FECHAR ----------
        const modal = document.getElementById("modalAgendamento");
        if (modal) {
          modal.addEventListener("hidden.bs.modal", () => {
            if (typeof window.resetAgendamentoWizard === "function") {
              window.resetAgendamentoWizard();
            }
          });
        }
      };
      document.body.appendChild(script);
    })
    .catch((err) => {
      console.error("Erro ao carregar o modal:", err);
    });
});
