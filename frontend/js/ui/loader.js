document.addEventListener("DOMContentLoaded", async function () {
  const loaderContainer = document.getElementById("loader");

  if (!loaderContainer) {
    console.error("Div #loader não encontrada no HTML");
    return;
  }

  // Inserir um overlay imediato (sem texto), com um placeholder para o Lottie
  const immediateHTML = `
    <div id="global-loader" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255, 255, 255, 1);z-index:99999">
      <div id="lottie-placeholder" style="width:150px;height:150px;display:flex;align-items:center;justify-content:center"></div>
    </div>
  `;
  loaderContainer.innerHTML = immediateHTML;

  try {
    // Pré-carrega o webcomponent do lottie e o JSON da animação em paralelo para exibir imediatamente
    const lottieScriptSrc =
      "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
    const animationJsonPath = "../../assets/animations/loading.json";

    const loadScriptOnce = (src) => {
      if (!window.__loadedScripts) window.__loadedScripts = {};
      if (window.__loadedScripts[src]) return window.__loadedScripts[src];
      window.__loadedScripts[src] = new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
      });
      return window.__loadedScripts[src];
    };

    let animationBlobUrl = null;
    const prefetchAnimation = async () => {
      try {
        const r = await fetch(animationJsonPath, { cache: "no-store" });
        if (!r.ok) return null;
        const blob = await r.blob();
        animationBlobUrl = URL.createObjectURL(blob);
        return animationBlobUrl;
      } catch (e) {
        console.warn("Falha ao pré-carregar animação Lottie:", e);
        return null;
      }
    };

    // Inicia pré-carregamento do script e do JSON
    await Promise.all([loadScriptOnce(lottieScriptSrc), prefetchAnimation()]);

    // Criar e configurar o lottie-player usando o Blob URL (se disponível)
    const placeholder = document.getElementById("lottie-placeholder");
    if (!placeholder) {
      console.error("#lottie-placeholder não encontrado");
      return;
    }

    const lp = document.createElement("lottie-player");
    if (animationBlobUrl) lp.setAttribute("src", animationBlobUrl);
    else lp.setAttribute("src", "frontend/assets/animations/loading.json");
    lp.setAttribute("background", "transparent");
    lp.setAttribute("speed", "1");
    lp.style.width = "150px";
    lp.style.height = "150px";
    lp.setAttribute("loop", "");
    lp.setAttribute("autoplay", "");
    placeholder.appendChild(lp);

    const loader = document.getElementById("global-loader");
    if (!loader) {
      console.error("ID #global-loader não encontrado");
      return;
    }

    // Pequeno delay antes de checar a sessão (deixar recursos estabilizarem)
    await new Promise((r) => setTimeout(r, 700));

    // Checa a sessão
    const res = await fetch("../../../backend/api/check_session.php");
    const data = await res.json();

    if (!data.logged_in) {
      // Caso a sessão não exista, redireciona para o login
      if (animationBlobUrl) URL.revokeObjectURL(animationBlobUrl);
      window.location.href = "../../../";
    } else {
      // Caso a sessão exista, simplesmente remove o loader
      try {
        loader.style.transition = "opacity 220ms ease";
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.remove();
          if (animationBlobUrl) URL.revokeObjectURL(animationBlobUrl);
        }, 240);
      } catch (e) {
        loader.remove();
        if (animationBlobUrl) URL.revokeObjectURL(animationBlobUrl);
      }
    }
  } catch (err) {
    console.error("Erro ao carregar loader ou checar sessão", err);
    const loader = document.getElementById("global-loader");
    if (loader) loader.remove();
  }
});
