document.querySelectorAll(".shortcut-card").forEach((card) => {
  const link = card.getAttribute("href");
  if (!link) return;

  card.addEventListener("click", (e) => {
    e.preventDefault(); // previne navegação imediata
    card.classList.add("touch-feedback"); // aplica efeito visual

    setTimeout(() => {
      card.classList.remove("touch-feedback"); // remove efeito
    }, 200); // mesma duração da animação

    setTimeout(() => {
      window.location.href = link; // redireciona após animação
    }, 200);
  });
});