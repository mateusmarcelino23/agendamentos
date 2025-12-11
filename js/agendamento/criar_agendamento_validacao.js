// criar_agendamento_validacao.js
import { showAlert } from "./criar_agendamento_helpers.js";

export function validarPasso(
  step,
  ag_data,
  listaAulas,
  listaEquipamentos,
  alertBox
) {
  if (step === 1) {
    if (!ag_data.value) {
      showAlert(alertBox, "Selecione uma data!");
      return false;
    }
    const hojeStr = new Date().toISOString().split("T")[0];
    if (ag_data.value < hojeStr) {
      showAlert(alertBox, "Data inválida (passada).");
      return false;
    }
  }

  if (step === 2) {
    const linhas = listaAulas.querySelectorAll(".linha-aula");
    if (linhas.length === 0) {
      showAlert(alertBox, "Adicione ao menos uma aula!");
      return false;
    }
    const combinacoes = new Set();
    for (const linha of linhas) {
      const p = linha.querySelector(".ag_periodo").value;
      const a = linha.querySelector(".ag_aula").value;
      if (!p || !a) {
        showAlert(alertBox, "Preencha período e aula em todas as linhas!");
        return false;
      }
      const key = `${p}-${a}`;
      if (combinacoes.has(key)) {
        showAlert(alertBox, "Não repita o mesmo período e aula!");
        return false;
      }
      combinacoes.add(key);
    }
  }

  if (step === 3) {
    const linhas = listaEquipamentos.querySelectorAll(".linha-equipamento");
    for (const linha of linhas) {
      const eq = linha.querySelector(".ag_equipamento").value;
      const qtd = Number(linha.querySelector(".ag_quantidade").value);
      if (!eq || !qtd || qtd < 1) {
        showAlert(alertBox, "Escolha equipamento e quantidade válidos!");
        return false;
      }
    }
  }

  return true;
}
