/* Função principal de inicialização do wizard */
function initCriarAgendamento() {
  /* ---------- ESTADO ---------- */
  let step = 1; // etapa atual do wizard
  const MAX_AULAS = 6; // limite de aulas por turno

  /* ---------- ELEMENTOS FIXOS ---------- */
  const steps = document.querySelectorAll(".step"); // lista de todos os steps
  const btnProximo = document.getElementById("btn-proximo"); // botão próximo
  const btnVoltar = document.getElementById("btn-voltar"); // botão anterior
  const btnFinalizar = document.getElementById("btn-finalizar"); // botão finalizar
  const btnNovo = document.getElementById("btn-novo"); // botão novo agendamento
  const btnFecharFinal = document.getElementById("btn-fechar-final"); // botão fechar final
  const alertBox = document.getElementById("alert-agendamento"); // div de alertas
  const form = document.getElementById("form-criar-agendamento"); // formulário principal
  const ag_data = document.getElementById("ag_data"); // input de data
  const listaAulas = document.getElementById("lista-aulas"); // container de linhas de aula
  const btnAdicionarAula = document.getElementById("btn-adicionar-aula"); // botão adicionar aula
  const listaEquipamentos = document.getElementById("lista-equipamentos"); // container de equipamentos
  const resumoLista = document.getElementById("resumo-agendamento"); // container de resumo

  /* ---------- HELPERS ---------- */
  // exibe alerta
  function showAlert(msg, type = "danger") {
    alertBox.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  }

  // mostra o step atual
  function mostrarPasso(n) {
    steps.forEach((s) => s.classList.add("d-none")); // oculta todos os steps
    const el = document.getElementById(`step-${n}`);
    if (el) el.classList.remove("d-none"); // mostra o step atual

    btnVoltar.disabled = n === 1; // desabilita voltar no primeiro passo
    btnProximo.classList.toggle("d-none", n >= 4);
    btnFinalizar.classList.toggle("d-none", n !== 4);
    btnNovo.classList.toggle("d-none", n !== 5);
    btnFecharFinal.classList.toggle("d-none", n !== 5);

    if (n === 5) {
      btnVoltar.classList.add("d-none");
      document.getElementById("btn-cancelar-modal").classList.add("d-none");
      btnNovo.classList.remove("d-none");
      btnFecharFinal.classList.remove("d-none");
    } else {
      btnVoltar.classList.remove("d-none");
      document.getElementById("btn-cancelar-modal").classList.remove("d-none");
      btnNovo.classList.add("d-none");
      btnFecharFinal.classList.add("d-none");
    }
  }

  // cria uma nova linha de aula (passo 2)
  function criarLinhaAula(periodo = "", aula = "") {
    const linha = document.createElement("div");
    linha.className = "linha-aula row mt-2 align-items-end";

    // Select de período
    const divPeriodo = document.createElement("div");
    divPeriodo.className = "col-5";
    const selectPeriodo = document.createElement("select");
    selectPeriodo.className = "form-control ag_periodo";
    selectPeriodo.innerHTML = `
      <option value="">Selecione...</option>
      <option value="manha">Manhã</option>
      <option value="tarde">Tarde</option>
      <option value="noite">Noite</option>
    `;
    selectPeriodo.value = periodo;
    divPeriodo.appendChild(selectPeriodo);

    // Select de aula
    const divAula = document.createElement("div");
    divAula.className = "col-5";
    const selectAula = document.createElement("select");
    selectAula.className = "form-control ag_aula";
    selectAula.innerHTML = `
      <option value="">Selecione...</option>
      <option value="1">1ª Aula</option>
      <option value="2">2ª Aula</option>
      <option value="3">3ª Aula</option>
      <option value="4">4ª Aula</option>
      <option value="5">5ª Aula</option>
      <option value="6">6ª Aula</option>
    `;
    selectAula.value = aula;
    divAula.appendChild(selectAula);

    // Botão remover
    const divBtn = document.createElement("div");
    divBtn.className = "col-2";
    if (listaAulas.children.length > 0) {
      const btnRemover = document.createElement("button");
      btnRemover.type = "button";
      btnRemover.className = "btn btn-danger btn-remover";
      btnRemover.textContent = "Remover";
      btnRemover.addEventListener("click", () => {
        linha.remove(); // remove linha
        atualizarEquipamentos(); // atualiza passo 3
      });
      divBtn.appendChild(btnRemover);
    }

    linha.appendChild(divPeriodo);
    linha.appendChild(divAula);
    linha.appendChild(divBtn);

    listaAulas.appendChild(linha);
  }

  // cria linhas de equipamentos para cada aula (passo 3)
  async function atualizarEquipamentos() {
    listaEquipamentos.innerHTML = ""; // limpa container

    const linhasAulas = listaAulas.querySelectorAll(".linha-aula");
    const data = ag_data.value;

    for (const linha of linhasAulas) {
      const periodo = linha.querySelector(".ag_periodo").value;
      const aula = linha.querySelector(".ag_aula").value;
      if (!periodo || !aula) continue;

      // cria container da linha
      const divLinha = document.createElement("div");
      divLinha.className = "linha-equipamento mt-3";

      // label Turno/Aula
      const label = document.createElement("label");
      label.textContent = `Turno: ${periodo} | Aula: ${aula}`;
      divLinha.appendChild(label);

      // select de equipamento
      const select = document.createElement("select");
      select.className = "form-control ag_equipamento mt-1";
      select.innerHTML = `<option value="">Carregando...</option>`;
      divLinha.appendChild(select);

      // input de quantidade
      const inputQtd = document.createElement("input");
      inputQtd.type = "number";
      inputQtd.min = 1;
      inputQtd.value = 1;
      inputQtd.className = "form-control mt-2 ag_quantidade";
      divLinha.appendChild(inputQtd);

      listaEquipamentos.appendChild(divLinha);

      // popula equipamentos disponíveis
      try {
        const resp = await fetch(
          "/agendamentos/backend/api/listar_equipamentos.php"
        );
        const json = await resp.json();
        select.innerHTML = `<option value="">Selecione...</option>`;
        if (json?.equipamentos) {
          for (const e of json.equipamentos) {
            const dispResp = await fetch(
              `/agendamentos/backend/api/disponibilidade.php?data=${encodeURIComponent(
                data
              )}&equipamento_id=${encodeURIComponent(
                e.id
              )}&periodo=${encodeURIComponent(
                periodo
              )}&aula=${encodeURIComponent(aula)}`
            );
            const disp = await dispResp.json();
            const disponivel = disp.disponivel ?? 0;
            if (disponivel > 0) {
              const opt = document.createElement("option");
              opt.value = e.id;
              opt.textContent = `${e.nome} (Disponível: ${disponivel})`;
              select.appendChild(opt);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar equipamentos:", err);
        select.innerHTML = `<option value="">Erro ao carregar</option>`;
      }
    }
  }

  // valida passo atual
  function validarPasso(n) {
    if (n === 1) {
      if (!ag_data.value) {
        showAlert("Selecione uma data!");
        return false;
      }
      const hojeStr = new Date().toISOString().split("T")[0];
      if (ag_data.value < hojeStr) {
        showAlert("Data inválida (passada).");
        return false;
      }
    }
    if (n === 2) {
      const linhas = listaAulas.querySelectorAll(".linha-aula");
      if (linhas.length === 0) {
        showAlert("Adicione ao menos uma aula!");
        return false;
      }
      const combinacoes = new Set();
      for (const linha of linhas) {
        const p = linha.querySelector(".ag_periodo").value;
        const a = linha.querySelector(".ag_aula").value;
        if (!p || !a) {
          showAlert("Preencha período e aula em todas as linhas!");
          return false;
        }
        const key = `${p}-${a}`;
        if (combinacoes.has(key)) {
          showAlert("Não repita o mesmo período e aula!");
          return false;
        }
        combinacoes.add(key);
      }
    }
    if (n === 3) {
      const linhas = listaEquipamentos.querySelectorAll(".linha-equipamento");
      for (const linha of linhas) {
        const eq = linha.querySelector(".ag_equipamento").value;
        const qtd = Number(linha.querySelector(".ag_quantidade").value);
        if (!eq || !qtd || qtd < 1) {
          showAlert("Escolha equipamento e quantidade válidos!");
          return false;
        }
      }
    }
    return true;
  }

  // preenche resumo (passo 4)
  function preencherResumo() {
    resumoLista.innerHTML = ""; // limpa o container de resumo
    const data = ag_data.value;
    const linhasAulas = listaAulas.querySelectorAll(".linha-aula");
    const linhasEquip =
      listaEquipamentos.querySelectorAll(".linha-equipamento");

    // percorre cada linha de aula
    linhasAulas.forEach((linha, i) => {
      const eqLinha = linhasEquip[i]; // tenta pegar a linha de equipamento correspondente
      if (!eqLinha) return; // se não existir linha de equipamento correspondente, pula

      // pega período e aula da linha de aula
      const p = linha.querySelector(".ag_periodo").value;
      const a = linha.querySelector(".ag_aula").value;

      // pega equipamento e quantidade da linha de equipamento
      const eqSelect = eqLinha.querySelector(".ag_equipamento");
      const eq = eqSelect ? eqSelect.selectedOptions[0]?.text || "" : "";
      const qtdInput = eqLinha.querySelector(".ag_quantidade");
      const qtd = qtdInput ? qtdInput.value : "";

      // cria item de lista para o resumo
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `<b>Data:</b> ${data} <br><b>Turno:</b> ${p} <b>Aula:</b> ${a} <br><b>Equipamento:</b> ${eq} <b>Quantidade:</b> ${qtd}`;

      resumoLista.appendChild(li); // adiciona ao container de resumo
    });
  }

  // cria agendamento via API
  async function criarAgendamento(payload) {
    try {
      const resp = await fetch("/agendamentos/backend/api/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await resp.json();
    } catch (err) {
      console.error("Erro create:", err);
      return { error: "Falha na requisição de criação" };
    }
  }

  /* ---------- HANDLERS ---------- */
  btnAdicionarAula.addEventListener("click", () => {
    if (listaAulas.children.length >= MAX_AULAS) {
      showAlert(`Máximo de ${MAX_AULAS} aulas por turno`);
      return;
    }
    criarLinhaAula();
  });

  btnProximo.addEventListener("click", async () => {
    alertBox.innerHTML = "";

    if (!validarPasso(step)) return;

    // se for do passo 2 → 3
    if (step === 2) {
      // bloqueia o botão
      btnProximo.disabled = true;
      const originalText = btnProximo.textContent;
      btnProximo.textContent = "Carregando...";

      try {
        await atualizarEquipamentos(); // gera linhas de equipamento
      } catch (err) {
        console.error(err);
        showAlert("Erro ao carregar equipamentos!");
      }

      // libera o botão
      btnProximo.disabled = false;
      btnProximo.textContent = originalText;
    }

    step++;
    if (step === 4) preencherResumo();
    mostrarPasso(step);
  });

  btnVoltar.addEventListener("click", () => {
    alertBox.innerHTML = "";
    if (step > 1) step--;
    mostrarPasso(step);
  });

  btnNovo.addEventListener("click", () => {
    form.reset();
    listaAulas.innerHTML = "";
    listaEquipamentos.innerHTML = "";
    resumoLista.innerHTML = "";
    step = 1;
    mostrarPasso(step);
  });

  btnFecharFinal.addEventListener("click", () => {
    location.reload();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";

    const data = ag_data.value;
    const linhasEquip =
      listaEquipamentos.querySelectorAll(".linha-equipamento");

    // monta payload de agendamentos
    const payload = [];
    for (const linha of linhasEquip) {
      const periodoAulaIndex = Array.from(listaEquipamentos.children).indexOf(
        linha
      );
      const aulaLinha = listaAulas.children[periodoAulaIndex];
      const periodo = aulaLinha.querySelector(".ag_periodo").value;
      const aula = aulaLinha.querySelector(".ag_aula").value;
      const equipamento_id = linha.querySelector(".ag_equipamento").value;
      const quantidade = Number(linha.querySelector(".ag_quantidade").value);

      payload.push({ data, periodo, aula, equipamento_id, quantidade });
    }

    // valida disponibilidade de cada equipamento
    for (const item of payload) {
      const resp = await fetch(
        `/agendamentos/backend/api/disponibilidade.php?data=${encodeURIComponent(
          item.data
        )}&equipamento_id=${encodeURIComponent(
          item.equipamento_id
        )}&periodo=${encodeURIComponent(
          item.periodo
        )}&aula=${encodeURIComponent(item.aula)}`
      );
      const disp = await resp.json();
      if ((disp.disponivel ?? 0) < item.quantidade) {
        showAlert(
          `Equipamento ${item.equipamento_id} tem apenas ${disp.disponivel} unidade(s) disponível(is) para ${item.periodo} - Aula ${item.aula}`
        );
        return;
      }
    }

    // envia payload para criar agendamento
    const res = await criarAgendamento(payload);
    if (res.error) {
      showAlert(res.error);
      return;
    }

    showAlert("Agendamento criado com sucesso!", "success");
    step = 5;
    mostrarPasso(step);
  });

  // reseta wizard ao fechar modal
  const modal = document.getElementById("modalAgendamento");
  modal.addEventListener("hidden.bs.modal", () => {
    form.reset();
    listaAulas.innerHTML = "";
    listaEquipamentos.innerHTML = "";
    resumoLista.innerHTML = "";
    step = 1;
    mostrarPasso(step);
  });

  // Função global para resetar o wizard externamente
  window.resetAgendamentoWizard = function () {
    form.reset();
    listaAulas.innerHTML = "";
    listaEquipamentos.innerHTML = "";
    resumoLista.innerHTML = "";
    step = 1;

    // remove travamento da data
    ag_data.removeAttribute("readonly");

    // recria linha inicial
    criarLinhaAula();
    mostrarPasso(step);
  };

  // Abre modal já com data definida e pula para o passo 2
  window.abrirAgendamentoComData = function (dataISO) {
    // zera estado
    window.resetAgendamentoWizard();

    // define a data
    ag_data.value = dataISO;

    // trava edição (opcional)
    ag_data.setAttribute("readonly", true);

    // pula para o passo 2
    step = 2;
    mostrarPasso(step);

    // atualiza equipamentos conforme a data
    atualizarEquipamentos();

    // exibe modal
    const modal = new bootstrap.Modal(
      document.getElementById("modalAgendamento")
    );
    modal.show();
  };

  /* ---------- INICIALIZAÇÃO ---------- */
  criarLinhaAula(); // cria linha inicial
  mostrarPasso(step);
}

/* ---------- CARREGA JS QUANDO DOM ESTÁ PRONTO ---------- */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCriarAgendamento);
} else {
  initCriarAgendamento();
}
