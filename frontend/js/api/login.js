document.addEventListener("DOMContentLoaded", () => {
  // Atualiza o ano no footer, se existir
  const year = new Date().getFullYear();
  const elYear = document.getElementById("year");
  if (elYear) elYear.textContent = year;

  // Seleciona o botão único de login
  const btnLogin = document.getElementById("google-login-btn");

  // Adiciona classe de loading caso exista no CSS
  if (btnLogin) btnLogin.classList.add("loading");

  // Verifica login no backend
  fetch("/agendamentos/backend/api/login.php", {
    method: "GET",
    credentials: "include",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Dados recebidos:", data);

      // Se já estiver logado → redireciona
      if (data.logged_in) {
        window.location.href = data.redirect;
        return;
      }

      // Caso não esteja logado
      if (btnLogin) {
        btnLogin.classList.remove("loading");

        btnLogin.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = data.google_login_url;
        });
      }
    })
    .catch((err) => {
      console.error("Erro ao carregar login:", err);
      if (btnLogin) btnLogin.textContent = "Erro ao carregar";
    });
});
