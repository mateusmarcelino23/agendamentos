// carregar header
document.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const headerPath = "../../components/header.html";

  fetch(headerPath)
    .then((response) => {
      if (!response.ok) throw new Error("Não foi possível carregar o header.");
      return response.text();
    })
    .then((html) => {
      headerContainer.innerHTML = html;

      // Carrega o JS do header dinamicamente
      const script = document.createElement("script");
      script.src = "../../js/ui/header.js";
      script.onload = () => {
        // Opcional: podemos disparar alguma função de inicialização se header.js tiver
        if (typeof initHeader === "function") {
          initHeader(); // só se você definir initHeader dentro de header.js
        }
      };
      document.body.appendChild(script);
    })
    .catch((err) => console.error(err));
});
