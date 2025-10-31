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
    });
  });

  // Ajustes visuais mobile
  setTimeout(() => {
    const svg = document.querySelector(
      ".sidebar-item:nth-child(3) .animacao-mobile svg"
    );
    if (svg) {
      svg.style.transform = "scale(0.8)";
      svg.style.transformOrigin = "center";
    }
  }, 500);

  setTimeout(() => {
    const svg = document.querySelector(
      ".sidebar-item:last-child .animacao-mobile svg"
    );
    if (svg) {
      svg.style.transform = "scale(0.7)";
      svg.style.transformOrigin = "center";
    }
  }, 500);

  // Menu mobile
  const theToggle = document.getElementById("toggle");
  const menu = document.getElementById("menu");
  if (theToggle && menu) {
    theToggle.onclick = (e) => {
      e.preventDefault();
      theToggle.classList.toggle("on");
      menu.classList.toggle("on");
    };
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
    });

    const menuItem = animDiv.closest(".nav-menu__item");
    if (!menuItem) return;
    const link = menuItem.querySelector("a");

    // Hover
    menuItem.addEventListener("mouseover", () => anim.play());
    menuItem.addEventListener("mouseout", () => {
      if (!link.classList.contains("active-page")) anim.stop();
    });

    // Página atual
    if (link.getAttribute("href") === window.location.pathname) {
      anim.play();
      link.classList.add("active-page");
    }
  });

  // Ajustes visuais desktop
  setTimeout(() => {
    const svg = document.querySelector(
      ".nav-menu__item:nth-child(3) .animacao svg"
    );
    if (svg) {
      svg.style.transform = "scale(0.8)";
      svg.style.transformOrigin = "center";
    }
  }, 500);

  setTimeout(() => {
    const svg = document.querySelector(
      ".nav-menu__item:last-child .animacao svg"
    );
    if (svg) {
      svg.style.transform = "scale(0.7)";
      svg.style.transformOrigin = "center";
    }
  }, 500);
}

// Executa imediatamente, caso o script seja carregado após o DOM
// initHeader();
