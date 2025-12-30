function initHeader() {
  // ---- Header Mobile ----
  const animacoesMobile = document.querySelectorAll(".animacao-mobile");
  animacoesMobile.forEach((animDiv) => {
    const anim = lottie.loadAnimation({
      container: animDiv,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: animDiv.dataset.path,
    });

    anim.addEventListener("DOMLoaded", () => {
      const paths = animDiv.querySelectorAll(
        "path, circle, rect, polygon, line"
      );
      paths.forEach((p) => {
        p.setAttribute("fill", "#ff8c00");
        p.setAttribute("stroke", "#ff8c00");
      });

      // Ajuste adicional: se for animação específica, reduz visualmente o SVG
      try {
        const svg = animDiv.querySelector("svg");
        if (svg && animDiv.dataset.path) {
          const p = animDiv.dataset.path.toLowerCase();
          if (p.endsWith("report.json")) {
            svg.style.transformOrigin = "50% 50%";
            svg.style.transform = "scale(0.85)"; // reduzir levemente
            svg.style.width = "auto";
            svg.style.height = "auto";
            svg.style.display = "block";
          }
          if (p.endsWith("users.json")) {
            svg.style.transformOrigin = "50% 50%";
            svg.style.transform = "scale(0.75)"; // reduzir um pouco mais
            svg.style.width = "auto";
            svg.style.height = "auto";
            svg.style.display = "block";
          }
        }
      } catch (e) {
        console.error("Erro ao ajustar escala do SVG Lottie:", e);
      }
    });
  });

  // -------------------------------
  // Menu mobile
  const theToggle = document.getElementById("toggle");
  const menu = document.getElementById("menu");
  const menuItems = document.querySelectorAll("#menu .sidebar-item"); // itens do menu

  // Funções de animação em onda
  function animarMenu() {
    menuItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("on-show");
      }, index * 100); // intervalo de 100ms entre itens
    });
  }

  function resetAnimacaoMenu() {
    menuItems.forEach((item) => item.classList.remove("on-show"));
  }

  if (theToggle && menu) {
    theToggle.onclick = (e) => {
      e.preventDefault();
      theToggle.classList.toggle("on");
      menu.classList.toggle("on");

      if (menu.classList.contains("on")) {
        animarMenu(); // anima quando abre
      } else {
        resetAnimacaoMenu(); // reseta quando fecha
      }
    };
  }

  // -------------------------------
  // Redirecionamento com delay
  menuItems.forEach((item) => {
    const link = item.querySelector("a");
    if (link) {
      link.addEventListener("click", (e) => {
        // Ignora links que não têm href real
        if (link.href === "#" || link.onclick) return;

        e.preventDefault();
        item.classList.add("clicked"); // efeito visual opcional
        const href = link.href;

        setTimeout(() => {
          window.location.href = href;
        }, 800); // espera animação
      });
    }
  });

  // -------------------------------
  // Conta Mobile
  const contaMenuMobile = document.querySelector(".conta-menu-mobile");
  if (contaMenuMobile) {
    const contaDropdownMobile = contaMenuMobile.querySelector(
      ".conta-dropdown-mobile"
    );

    contaMenuMobile.addEventListener("click", (e) => {
      e.stopPropagation(); // evita fechar imediatamente
      const aberto = contaDropdownMobile.style.display === "block";
      contaDropdownMobile.style.display = aberto ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!contaMenuMobile.contains(e.target)) {
        contaDropdownMobile.style.display = "none";
      }
    });

    // ======== FETCH PARA CARREGAR DADOS DO PROFESSOR ========
    if (contaDropdownMobile) {
      fetch("../../backend/api/get_professor.php")
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
            return;
          }

          const fotoElement =
            contaDropdownMobile.querySelector(".foto-professor");
          const nomeElement =
            contaDropdownMobile.querySelector(".nome-professor");

          if (fotoElement)
            fotoElement.src = data.foto || "../assets/img/default.png";
          if (nomeElement) nomeElement.textContent = data.nome;
        })
        .catch((err) =>
          console.error("Erro ao buscar dados do professor:", err)
        );
    }
  }

  // ---- Header Desktop ----
  const animacoesDesktop = document.querySelectorAll(".animacao");

  animacoesDesktop.forEach((animDiv) => {
    const anim = lottie.loadAnimation({
      container: animDiv,
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: animDiv.dataset.path,
    });

    anim.addEventListener("DOMLoaded", () => {
      const paths = animDiv.querySelectorAll(
        "path, circle, rect, polygon, line"
      );
      paths.forEach((p) => {
        p.setAttribute("fill", "#ff8c00");
        p.setAttribute("stroke", "#ff8c00");
      });
      // Ajuste adicional para desktop (mesma lógica)
      try {
        const svg = animDiv.querySelector("svg");
        if (svg && animDiv.dataset.path) {
          const p = animDiv.dataset.path.toLowerCase();
          if (p.endsWith("report.json")) {
            svg.style.transformOrigin = "50% 50%";
            svg.style.transform = "scale(0.85)";
            svg.style.width = "auto";
            svg.style.height = "auto";
            svg.style.display = "block";
          }
          if (p.endsWith("users.json")) {
            svg.style.transformOrigin = "50% 50%";
            svg.style.transform = "scale(0.75)";
            svg.style.width = "auto";
            svg.style.height = "auto";
            svg.style.display = "block";
          }
        }
      } catch (e) {
        console.error("Erro ao ajustar escala do SVG Lottie (desktop):", e);
      }
    });

    const menuItem = animDiv.closest(".nav-menu__item");
    if (!menuItem) return;

    const link = menuItem.querySelector("a");
    const isContaMenu = menuItem.classList.contains("conta-menu-desktop");

    const linkPath = new URL(link.getAttribute("href"), window.location.href)
      .pathname;
    const currentPath = window.location.pathname;
    const isCurrentPage = !isContaMenu && linkPath === currentPath;

    // Se estiver na página atual, mantém a animação sempre ativa
    if (isCurrentPage) {
      anim.play();
      link.classList.add("active-page");
    }

    // Hover (todos)
    menuItem.addEventListener("mouseenter", () => {
      anim.play();
    });

    menuItem.addEventListener("mouseleave", () => {
      if (!isCurrentPage) {
        // só para se não for a página atual
        anim.stop();
      }
    });
  });

  // ==== Conta Desktop ====
  const contaDesktop = document.querySelector(
    ".conta-menu-desktop .conta-info"
  );
  if (contaDesktop) {
    contaDesktop.style.userSelect = "none";
    contaDesktop.style.pointerEvents = "none";

    // ======== FETCH PARA CARREGAR DADOS DO PROFESSOR ========
    fetch("../../backend/api/get_professor.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
          return;
        }

        const fotoElement = contaDesktop.querySelector(".foto-professor");
        const nomeElement = contaDesktop.querySelector(".nome-professor");

        if (fotoElement)
          fotoElement.src = data.foto || "../assets/img/default.png";
        if (nomeElement) nomeElement.textContent = data.nome;
      })
      .catch((err) => console.error("Erro ao buscar dados do professor:", err));
  }
}
