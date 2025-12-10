// criar_agendamento_equipamentos.js
import { criarElemento } from "./criar_agendamento_helpers.js";
import {
  listarEquipamentos,
  verificarDisponibilidade,
} from "./criar_agendamento_api.js";

export async function atualizarEquipamentos(
  listaAulas,
  listaEquipamentos,
  ag_data
) {
  listaEquipamentos.innerHTML = "";
  const linhasAulas = listaAulas.querySelectorAll(".linha-aula");
  const data = ag_data.value;

  for (const linha of linhasAulas) {
    const periodo = linha.querySelector(".ag_periodo").value;
    const aula = linha.querySelector(".ag_aula").value;
    if (!periodo || !aula) continue;

    const divLinha = criarElemento("div", {
      className: "linha-equipamento mt-3",
    });
    const label = criarElemento("label");
    label.textContent = `Turno: ${periodo} | Aula: ${aula}`;
    divLinha.appendChild(label);

    const select = criarElemento("select", {
      className: "form-control ag_equipamento mt-1",
      innerHTML: `<option value="">Carregando...</option>`,
    });
    divLinha.appendChild(select);

    const inputQtd = criarElemento("input", {
      type: "number",
      className: "form-control mt-2 ag_quantidade",
      value: 1,
    });
    inputQtd.min = 1;
    divLinha.appendChild(inputQtd);

    listaEquipamentos.appendChild(divLinha);

    try {
      const json = await listarEquipamentos();
      select.innerHTML = `<option value="">Selecione...</option>`;
      if (json?.equipamentos) {
        for (const e of json.equipamentos) {
          const disp = await verificarDisponibilidade(
            data,
            e.id,
            periodo,
            aula
          );
          if ((disp.disponivel ?? 0) > 0) {
            const opt = criarElemento("option");
            opt.value = e.id;
            opt.textContent = `${e.nome} (Disponível: ${disp.disponivel})`;
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
