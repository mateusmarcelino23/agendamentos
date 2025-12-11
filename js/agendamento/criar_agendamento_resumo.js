// criar_agendamento_resumo.js
import { criarElemento } from "./criar_agendamento_helpers.js";

export function preencherResumo(
  listaAulas,
  listaEquipamentos,
  resumoLista,
  ag_data
) {
  resumoLista.innerHTML = "";
  const data = ag_data.value;
  const linhasAulas = listaAulas.querySelectorAll(".linha-aula");
  const linhasEquip = listaEquipamentos.querySelectorAll(".linha-equipamento");

  linhasAulas.forEach((linha, i) => {
    const eqLinha = linhasEquip[i];
    if (!eqLinha) return;

    const p = linha.querySelector(".ag_periodo").value;
    const a = linha.querySelector(".ag_aula").value;

    const eqSelect = eqLinha.querySelector(".ag_equipamento");
    const eq = eqSelect ? eqSelect.selectedOptions[0]?.text || "" : "";
    const qtdInput = eqLinha.querySelector(".ag_quantidade");
    const qtd = qtdInput ? qtdInput.value : "";

    const li = criarElemento("li", { className: "list-group-item" });
    li.innerHTML = `<b>Data:</b> ${data} <br><b>Turno:</b> ${p} <b>Aula:</b> ${a} <br><b>Equipamento:</b> ${eq} <b>Quantidade:</b> ${qtd}`;
    resumoLista.appendChild(li);
  });
}
