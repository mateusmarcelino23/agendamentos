// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
  // Obtém o ano atual e atualiza os elementos correspondentes no rodapé
  const year = new Date().getFullYear();

  const elYear = document.getElementById("year");
  if (elYear) elYear.textContent = year;

  const elYearDesktop = document.getElementById("year-desktop");
  if (elYearDesktop) elYearDesktop.textContent = year;

  // Seleciona os botões de login (versão mobile e desktop)
  const btnMobile = document.getElementById("google-login-btn");
  const btnDesktop = document.getElementById("google-login-btn-desktop");

  // Adiciona uma classe de carregamento temporária, se existir estilo definido no CSS
  if (btnMobile) btnMobile.classList.add("loading");
  if (btnDesktop) btnDesktop.classList.add("loading");

  // Realiza a requisição ao backend para verificar o status de login
  fetch("backend/api/login.php", {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((res) => res.json()) // Converte a resposta em JSON
    .then((data) => {
      console.log("Dados recebidos:", data);

      // Se o usuário já estiver logado, redireciona para o dashboard
      if (data.logged_in) {
        window.location.href = data.redirect;
        return;
      }

      // Caso o usuário não esteja logado, define o comportamento dos botões
      if (btnMobile) {
        btnMobile.classList.remove("loading");
        // Redireciona o usuário para o login do Google ao clicar
        btnMobile.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = data.google_login_url;
        });
      }

      if (btnDesktop) {
        btnDesktop.classList.remove("loading");
        // Redireciona o usuário para o login do Google ao clicar
        btnDesktop.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = data.google_login_url;
        });
      }
    })
    .catch((err) => {
      // Exibe erros no console e atualiza o texto dos botões em caso de falha
      console.error("Erro ao carregar login:", err);
      if (btnMobile) btnMobile.textContent = "Erro ao carregar";
      if (btnDesktop) btnDesktop.textContent = "Erro ao carregar";
    });
});
