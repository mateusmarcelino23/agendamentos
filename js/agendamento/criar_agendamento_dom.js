// criar_agendamento_dom.js
import { criarElemento } from "./criar_agendamento_helpers.js";

// Mostra o step atual do wizard
export function mostrarPasso(
  n,
  steps,
  btnVoltar,
  btnProximo,
  btnFinalizar,
  btnNovo,
  btnFecharFinal
) {
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

// Cria uma linha de aula
export function criarLinhaAula(
  listaAulas,
  atualizarEquipamentos,
  periodo = "",
  aula = ""
) {
  const linha = criarElemento("div", {
    className: "linha-aula row mt-2 align-items-end",
  });

  const divPeriodo = criarElemento("div", { className: "col-5" });
  const selectPeriodo = criarElemento("select", {
    className: "form-control ag_periodo",
  });
  selectPeriodo.innerHTML = `
    <option value="">Selecione...</option>
    <option value="manha">Manhã</option>
    <option value="tarde">Tarde</option>
    <option value="noite">Noite</option>
  `;
  selectPeriodo.value = periodo;
  divPeriodo.appendChild(selectPeriodo);

  const divAula = criarElemento("div", { className: "col-5" });
  const selectAula = criarElemento("select", {
    className: "form-control ag_aula",
  });
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

  const divBtn = criarElemento("div", { className: "col-2" });
  if (listaAulas.children.length > 0) {
    const btnRemover = criarElemento("button", {
      type: "button",
      className: "btn btn-danger btn-remover",
      textContent: "Remover",
    });
    btnRemover.addEventListener("click", () => {
      linha.remove();
      atualizarEquipamentos();
    });
    divBtn.appendChild(btnRemover);
  }

  linha.appendChild(divPeriodo);
  linha.appendChild(divAula);
  linha.appendChild(divBtn);
  listaAulas.appendChild(linha);
}
