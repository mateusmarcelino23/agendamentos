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
    const animationJsonPath = "frontend/assets/animations/loading.json";

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

    const loaderHtml = await fetch("frontend/components/loader.html").then(
      (res) => res.text()
    );

    // Parse do HTML para poder executar scripts e aplicar estilos corretamente
    const doc = new DOMParser().parseFromString(loaderHtml, "text/html");

    // Injetar estilos no <head> se ainda não existirem
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href) {
        const already = Array.from(document.head.querySelectorAll("link")).some(
          (l) => l.href === link.href
        );
        if (!already) {
          const nl = document.createElement("link");
          nl.rel = "stylesheet";
          nl.href = href;
          document.head.appendChild(nl);
        }
      }
    });

    // Preparar scripts para executar — criamos novos elementos <script> e aguardamos o carregamento
    const scripts = Array.from(doc.querySelectorAll("script"));
    const scriptPromises = scripts.map((s) => {
      return new Promise((resolve) => {
        // Evitar recarregar o lottie-player se já foi pré-carregado
        if (
          s.src === lottieScriptSrc &&
          window.__loadedScripts &&
          window.__loadedScripts[s.src]
        ) {
          return resolve();
        }
        const ns = document.createElement("script");
        if (s.src) {
          ns.src = s.src;
          ns.onload = () => resolve();
          ns.onerror = () => resolve();
          document.body.appendChild(ns);
        } else {
          ns.textContent = s.textContent;
          document.body.appendChild(ns);
          resolve();
        }
      });
    });

    // Remover scripts e links do documento parseado para que não sejam duplicados quando inserirmos o HTML
    doc
      .querySelectorAll('script, link[rel="stylesheet"]')
      .forEach((e) => e.remove());

    // Se pré-carregamos o JSON, substituímos o atributo `src` do <lottie-player> para usar o Blob URL,
    // garantindo que a animação carregue imediatamente ao inserir o componente.
    if (animationBlobUrl) {
      const lp = doc.querySelector("lottie-player");
      if (lp) lp.setAttribute("src", animationBlobUrl);
    }

    // Assim que os scripts externos necessários estiverem carregados (ex: lottie-player),
    // criamos dinamicamente o <lottie-player> e o adicionamos ao placeholder.
    await Promise.all(scriptPromises);

    const placeholder = document.getElementById("lottie-placeholder");
    if (!placeholder) {
      console.error("#lottie-placeholder não encontrado");
      return;
    }

    // Criar e configurar o lottie-player usando o Blob URL (se disponível)
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
      console.error("ID #global-loader não encontrado dentro do loader.html");
      return;
    }

    // Pequeno delay antes de checar a sessão (deixar recursos estabilizarem)
    await new Promise((r) => setTimeout(r, 700));

    // Checa a sessão
    const res = await fetch("backend/api/check_session.php");
    const data = await res.json();

    if (data.logged_in) {
      // limpar blob url se existir
      if (animationBlobUrl) URL.revokeObjectURL(animationBlobUrl);
      window.location.href = "frontend/pages/dashboard.html";
    } else {
      // Pequeno fade-out visual (se quiser manter simples, remove diretamente)
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
