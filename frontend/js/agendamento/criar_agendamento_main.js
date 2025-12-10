// criar_agendamento_main.js
import { showAlert } from "./criar_agendamento_helpers.js";
import { mostrarPasso, criarLinhaAula } from "./criar_agendamento_dom.js";
import { validarPasso } from "./criar_agendamento_validacao.js";
import { atualizarEquipamentos } from "./criar_agendamento_equipamentos.js";
import { preencherResumo } from "./criar_agendamento_resumo.js";
import {
  criarAgendamento,
  verificarDisponibilidade,
} from "./criar_agendamento_api.js";

export function initCriarAgendamento() {
  let step = 1;
  const MAX_AULAS = 6;

  const steps = document.querySelectorAll(".step");
  const btnProximo = document.getElementById("btn-proximo");
  const btnVoltar = document.getElementById("btn-voltar");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const btnNovo = document.getElementById("btn-novo");
  const btnFecharFinal = document.getElementById("btn-fechar-final");
  const alertBox = document.getElementById("alert-agendamento");
  const form = document.getElementById("form-criar-agendamento");
  const ag_data = document.getElementById("ag_data");
  const listaAulas = document.getElementById("lista-aulas");
  const btnAdicionarAula = document.getElementById("btn-adicionar-aula");
  const listaEquipamentos = document.getElementById("lista-equipamentos");
  const resumoLista = document.getElementById("resumo-agendamento");

  // Handlers
  btnAdicionarAula.addEventListener("click", () => {
    if (listaAulas.children.length >= MAX_AULAS) {
      showAlert(alertBox, `Máximo de ${MAX_AULAS} aulas por turno`);
      return;
    }
    criarLinhaAula(listaAulas, () =>
      atualizarEquipamentos(listaAulas, listaEquipamentos, ag_data)
    );
  });

  btnProximo.addEventListener("click", async () => {
    alertBox.innerHTML = "";
    if (!validarPasso(step, ag_data, listaAulas, listaEquipamentos, alertBox))
      return;

    if (step === 2) {
      btnProximo.disabled = true;
      const originalText = btnProximo.textContent;
      btnProximo.textContent = "Carregando...";
      try {
        await atualizarEquipamentos(listaAulas, listaEquipamentos, ag_data);
      } catch (err) {
        showAlert(alertBox, "Erro ao carregar equipamentos!");
      }
      btnProximo.disabled = false;
      btnProximo.textContent = originalText;
    }

    step++;
    if (step === 4)
      preencherResumo(listaAulas, listaEquipamentos, resumoLista, ag_data);
    mostrarPasso(
      step,
      steps,
      btnVoltar,
      btnProximo,
      btnFinalizar,
      btnNovo,
      btnFecharFinal
    );
  });

  btnVoltar.addEventListener("click", () => {
    alertBox.innerHTML = "";
    if (step > 1) step--;
    mostrarPasso(
      step,
      steps,
      btnVoltar,
      btnProximo,
      btnFinalizar,
      btnNovo,
      btnFecharFinal
    );
  });
  btnNovo.addEventListener("click", () => {
    form.reset();
    listaAulas.innerHTML = "";
    listaEquipamentos.innerHTML = "";
    resumoLista.innerHTML = "";
    step = 1;
    mostrarPasso(
      step,
      steps,
      btnVoltar,
      btnProximo,
      btnFinalizar,
      btnNovo,
      btnFecharFinal
    );
  });
  btnFecharFinal.addEventListener("click", () => location.reload());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";

    const data = ag_data.value;
    const linhasEquip =
      listaEquipamentos.querySelectorAll(".linha-equipamento");
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

    for (const item of payload) {
      const disp = await verificarDisponibilidade(
        item.data,
        item.equipamento_id,
        item.periodo,
        item.aula
      );
      if ((disp.disponivel ?? 0) < item.quantidade) {
        showAlert(
          alertBox,
          `Equipamento ${item.equipamento_id} tem apenas ${disp.disponivel} unidade(s) disponível(is) para ${item.periodo} - Aula ${item.aula}`
        );
        return;
      }
    }

    const res = await criarAgendamento(payload);
    if (res.error) {
      showAlert(alertBox, res.error);
      return;
    }

    showAlert(alertBox, "Agendamento criado com sucesso!", "success");
    step = 5;
    mostrarPasso(
      step,
      steps,
      btnVoltar,
      btnProximo,
      btnFinalizar,
      btnNovo,
      btnFecharFinal
    );
  });

  const modal = document.getElementById("modalAgendamento");
  modal.addEventListener("hidden.bs.modal", () => {
    form.reset();
    listaAulas.innerHTML = "";
    listaEquipamentos.innerHTML = "";
    resumoLista.innerHTML = "";
    step = 1;
    mostrarPasso(
      step,
      steps,
      btnVoltar,
      btnProximo,
      btnFinalizar,
      btnNovo,
      btnFecharFinal
    );
  });

  window.resetAgendamentoWizard = function () {
    form.reset();
    listaAulas.innerHTML = "";
    listaEquipamentos.innerHTML = "";
    resumoLista.innerHTML = "";
    step = 1;
    ag_data.removeAttribute("readonly");
    criarLinhaAula(listaAulas, () =>
      atualizarEquipamentos(listaAulas, listaEquipamentos, ag_data)
    );
    mostrarPasso(
      step,
      steps,
      btnVoltar,
      btnProximo,
      btnFinalizar,
      btnNovo,
      btnFecharFinal
    );
  };

  window.abrirAgendamentoComData = function (dataISO) {
    window.resetAgendamentoWizard();
    ag_data.value = dataISO;
    ag_data.setAttribute("readonly", true);
    step = 2;
    mostrarPasso(
      step,
      steps,
      btnVoltar,
      btnProximo,
      btnFinalizar,
      btnNovo,
      btnFecharFinal
    );
    atualizarEquipamentos(listaAulas, listaEquipamentos, ag_data);
    new bootstrap.Modal(modal).show();
  };

  criarLinhaAula(listaAulas, () =>
    atualizarEquipamentos(listaAulas, listaEquipamentos, ag_data)
  );
  mostrarPasso(
    step,
    steps,
    btnVoltar,
    btnProximo,
    btnFinalizar,
    btnNovo,
    btnFecharFinal
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initCriarAgendamento());
} else {
  initCriarAgendamento();
}
