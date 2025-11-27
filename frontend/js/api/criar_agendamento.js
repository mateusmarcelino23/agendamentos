/* Função principal de inicialização: cria handlers e estado do wizard */
function initCriarAgendamento() {
  // inicializa todo o comportamento do formulário e wizard

  /* ---------- ESTADO E ELEMENTOS ---------- */
  let step = 1; // controla etapa atual do wizard

  const steps = document.querySelectorAll(".step"); // nó-lista de todas as sections de etapa
  const btnProximo = document.getElementById("btn-proximo");
  const btnVoltar = document.getElementById("btn-voltar");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const btnNovo = document.getElementById("btn-novo");
  const btnFecharFinal = document.getElementById("btn-fechar-final");
  const alertBox = document.getElementById("alert-agendamento");
  const form = document.getElementById("form-criar-agendamento");

  const ag_data = document.getElementById("ag_data");
  const ag_equipamento = document.getElementById("ag_equipamento");
  const ag_quantidade = document.getElementById("ag_quantidade");
  const ag_periodo = document.getElementById("ag_periodo");
  const ag_aula = document.getElementById("ag_aula");
  const resumoLista = document.getElementById("resumo-agendamento");

  /* ---------- HELPERS ---------- */
  function showAlert(msg, type = "danger") {
    alertBox.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  }

  function mostrarPasso(n) {
    steps.forEach((s) => s.classList.add("d-none"));
    const el = document.getElementById(`step-${n}`);
    if (el) el.classList.remove("d-none");

    btnVoltar.disabled = n === 1;
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
      // passo 2 agora valida período e aula antes de mostrar equipamentos
      if (!ag_periodo.value || !ag_aula.value) {
        showAlert("Selecione período e aula primeiro!");
        return false;
      }
    }
    if (n === 3) {
      if (!ag_quantidade.value || Number(ag_quantidade.value) < 1) {
        showAlert("Informe uma quantidade válida!");
        return false;
      }
    }
    return true;
  }

  /* ---------- CARREGA EQUIPAMENTOS DISPONÍVEIS ---------- */
  async function carregarEquipamentosDisponiveis(data, periodo, aula) {
    try {
      // busca todos os equipamentos cadastrados
      const resp = await fetch(
        "/agendamentos/backend/api/listar_equipamentos.php"
      );
      const json = await resp.json();
      ag_equipamento.innerHTML = `<option value="">Selecione...</option>`;

      if (!json || !Array.isArray(json.equipamentos)) {
        showAlert("Erro ao carregar equipamentos", "warning");
        return;
      }

      // Para cada equipamento, consulta a disponibilidade no horário selecionado
      for (const e of json.equipamentos) {
        const dispResp = await fetch(
          `/agendamentos/backend/api/disponibilidade.php?data=${encodeURIComponent(
            data
          )}&equipamento_id=${encodeURIComponent(
            e.id
          )}&periodo=${encodeURIComponent(periodo)}&aula=${encodeURIComponent(
            aula
          )}`
        );
        const disp = await dispResp.json();

        const disponivel = disp.disponivel ?? 0; // quantidade disponível no horário
        const opt = document.createElement("option");
        opt.value = e.id;

        // mostra somente equipamentos com quantidade > 0
        if (disponivel > 0) {
          opt.textContent = `${e.nome} (Disponível: ${disponivel})`;
          ag_equipamento.appendChild(opt);
        }
      }
    } catch (err) {
      console.error("Erro carregar equipamentos disponíveis:", err);
      showAlert("Falha ao carregar equipamentos do servidor.");
    }
  }

  /* ---------- RESUMO DO AGENDAMENTO ---------- */
  function preencherResumo() {
    resumoLista.innerHTML = "";
    const items = [
      { label: "Data", value: ag_data.value },
      {
        label: "Equipamento",
        value: ag_equipamento.options[ag_equipamento.selectedIndex]?.text || "",
      },
      { label: "Quantidade", value: ag_quantidade.value },
      { label: "Período", value: ag_periodo.value },
      { label: "Aula", value: ag_aula.value },
    ];
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `<b>${it.label}:</b> ${it.value}`;
      resumoLista.appendChild(li);
    });
  }

  /* ---------- CONSULTA DE DISPONIBILIDADE ---------- */
  async function consultarDisponibilidade(data, equipamento_id, periodo, aula) {
    const url = `/agendamentos/backend/api/disponibilidade.php?data=${encodeURIComponent(
      data
    )}&equipamento_id=${encodeURIComponent(
      equipamento_id
    )}&periodo=${encodeURIComponent(periodo)}&aula=${encodeURIComponent(aula)}`;
    try {
      const resp = await fetch(url);
      return await resp.json();
    } catch (err) {
      console.error("Erro disponibilidade:", err);
      return { error: "Falha ao verificar disponibilidade" };
    }
  }

  /* ---------- CRIAÇÃO DO AGENDAMENTO ---------- */
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

  /* ---------- HANDLERS DE NAVEGAÇÃO ---------- */
  btnProximo.addEventListener("click", async () => {
    alertBox.innerHTML = "";
    if (!validarPasso(step)) return;

    if (step === 2) {
      // quando usuário avançar do passo 2 -> 3, carrega equipamentos disponíveis
      await carregarEquipamentosDisponiveis(
        ag_data.value,
        ag_periodo.value,
        ag_aula.value
      );
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
    step = 1;
    alertBox.innerHTML = "";
    mostrarPasso(step);
  });

  btnFecharFinal.addEventListener("click", () => {
    location.reload();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = ag_data.value,
      eq = ag_equipamento.value,
      q = Number(ag_quantidade.value),
      p = ag_periodo.value,
      a = ag_aula.value;

    if (!d || !eq || !q || !p || !a) {
      showAlert("Dados incompletos");
      return;
    }

    const disp = await consultarDisponibilidade(d, eq, p, a);
    if (disp.error) {
      showAlert(disp.error);
      return;
    }
    if ((disp.disponivel ?? 0) < q) {
      showAlert(
        `Somente ${disp.disponivel ?? 0} unidade(s) disponíveis neste horário.`
      );
      return;
    }

    const res = await criarAgendamento({
      data: d,
      equipamento_id: eq,
      quantidade: q,
      periodo: p,
      aula: a,
    });
    if (res.error) {
      showAlert(res.error);
      return;
    }

    showAlert("Agendamento criado com sucesso!", "success");
    step = 5;
    mostrarPasso(step);
  });

  window.resetAgendamentoWizard = function () {
    form.reset();
    step = 1;
    alertBox.innerHTML = "";
    resumoLista.innerHTML = "";
    mostrarPasso(step);
  };

  const modal = document.getElementById("modalAgendamento");
  modal.addEventListener("hidden.bs.modal", () => {
    window.resetAgendamentoWizard();
  });

  /* ---------- INICIALIZAÇÃO ---------- */
  mostrarPasso(step);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCriarAgendamento);
} else {
  initCriarAgendamento();
}
