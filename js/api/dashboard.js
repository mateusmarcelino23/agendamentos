// Função principal para carregar os dados do dashboard
async function carregarDashboard() {
  try {
    const response = await fetch("../../backend/api/dashboard.php", {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    const data = await response.json();

    // Se o usuário não estiver autenticado, redireciona
    if (data.error === "Usuário não autenticado") {
      window.location.href = "../../";
      return;
    }

    // Atualiza os containers principais
    atualizarSaudacao(data.primeiroNome);
    atualizarInformacoesRapidas(data);
    preencherTabelaAgendamentos(data.ultimosAgendamentos);
    mostrarUtilizacaoAtual(data.utilizacaoAtual);
    preencherCalendario(data.datasComAgendamento);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
}

// Atualiza o texto de boas-vindas
function atualizarSaudacao(nome) {
  const elemento = document.getElementById("bem-vindo");
  if (elemento) elemento.textContent = `Bem-vindo(a), ${nome || "Professor"}`;
}

// Atualiza os 3 containers com informações rápidas
function atualizarInformacoesRapidas(data) {
  // Próximo agendamento
  const prox = data.proximoAgendamento;
  const cardProx = document.querySelector(
    "#card-proximo-agendamento .card-text"
  );
  if (cardProx) {
    cardProx.innerHTML = prox
      ? `${prox.equipamento} - ${formatarData(prox.data)} - Aula ${prox.aula}`
      : "Você ainda não possui agendamentos futuros.";
  }

  // Total de agendamentos da semana
  const cardSemana = document.querySelector("#card-total-semana .card-text");
  if (cardSemana) {
    cardSemana.innerText =
      data.totalAgendamentosSemana > 0
        ? `${data.totalAgendamentosSemana}`
        : "Nenhum agendamento nesta semana.";
  }

  // Total de agendamentos do professor
  const cardTotalProf = document.querySelector(
    "#card-total-professor .card-text"
  );
  if (cardTotalProf) {
    cardTotalProf.innerText =
      data.totalAgendamentosProfessor > 0
        ? `${data.totalAgendamentosProfessor}`
        : "Nenhum agendamento registrado.";
  }
}

// Preenche a tabela de últimos agendamentos
function preencherTabelaAgendamentos(agendamentos) {
  const tbody = document.querySelector("#tabela-ultimos-agendamentos tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!agendamentos || agendamentos.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="4" class="text-center text-muted">Nenhum agendamento encontrado.</td>';
    tbody.appendChild(tr);
    return;
  }

  agendamentos.forEach((a) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.professor}</td>
      <td>${a.equipamento}</td>
      <td>${formatarData(a.data)}</td>
      <td>${a.aula} (${a.periodo})</td>
    `;
    tbody.appendChild(tr);
  });
}

// Mostra quem está usando os equipamentos neste momento
function mostrarUtilizacaoAtual(utilizacoes) {
  const container = document.querySelector("#utilizacao-atual");
  if (!container) return;

  if (!utilizacoes || utilizacoes.length === 0) {
    container.innerHTML = `<p class="text-muted">Nenhum equipamento em uso agora.</p>`;
    return;
  }

  container.innerHTML = utilizacoes
    .map(
      (u) =>
        `<p><strong>${u.professor}</strong> está usando <em>${u.equipamento}</em> (Aula ${u.aula}, ${u.periodo}).</p>`
    )
    .join("");
}

// Preenche o calendário do mês atual
function preencherCalendario(datas) {
  inicializarCalendario(datas);
}

// Quando o dia é clicado no calendário
function abrirDetalhesDoDia(dataSelecionada) {
  alert(`Exibindo agendamentos do dia ${formatarData(dataSelecionada)}.`);
  // Aqui você pode abrir um modal ou redirecionar para nova página
  // window.location.href = `/frontend/novo_agendamento.php?data=${dataSelecionada}`;
}

// Formata a data em padrão brasileiro sem problemas de fuso horário
function formatarData(isoDate) {
  if (!isoDate) return '';

  // Quebra a string "YYYY-MM-DD" em partes
  const [year, month, day] = isoDate.split('-').map(Number);

  // Cria uma data no fuso local
  const date = new Date(year, month - 1, day); // meses vão de 0 a 11

  // Formata para "seg, 25/11"
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}


async function verificarAgendamentoAtivo() {
  try {
    const res = await fetch(
      "../../backend/api/verificar_agendamento_ativo.php",
      {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      }
    );
    const agendamento = await res.json();
    const container = document.getElementById("mensagem-agendamento");

    if (!agendamento) {
      container.classList.add("d-none");
      return;
    }

    container.classList.remove("d-none");
    container.innerHTML = `
      <p>Você tem um agendamento para <strong>${agendamento.equipamento}</strong> na aula ${agendamento.aula} agora.</p>
      <button onclick="usarEquipamento(${agendamento.id}, 'irei')" class="btn btn-primary me-2">Irei utilizar</button>
      <button onclick="usarEquipamento(${agendamento.id}, 'em_uso')" class="btn btn-success me-2">Estou utilizando</button>
      <button onclick="usarEquipamento(${agendamento.id}, 'cancelar')" class="btn btn-danger">Cancelar</button>
    `;
  } catch (err) {
    console.error("Erro ao verificar agendamento ativo:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();
  verificarAgendamentoAtivo();
});

async function usarEquipamento(agendamentoId, acao) {
  try {
    const formData = new FormData();
    formData.append("agendamento_id", agendamentoId);
    formData.append("acao", acao);

    const res = await fetch(
      "../../backend/api/atualizar_equipamento.php",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await res.json();
    if (result.success) {
      alert("Status do equipamento atualizado!");
      // Recarrega a utilização atual
      carregarDashboard();
      verificarAgendamentoAtivo(); // Atualiza o container
    } else {
      alert("Erro ao atualizar equipamento.");
    }
  } catch (err) {
    console.error("Erro ao atualizar equipamento:", err);
  }
}

function abrirDetalhesDoDia(dataSelecionada, detalhes) {
  const container = document.getElementById("utilizacao-atual");
  container.innerHTML = ""; // limpa antes

  if (detalhes && detalhes.length > 0) {
    detalhes.forEach((u) => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${u.professor}</strong> está usando <em>${u.equipamento}</em> (Aula ${u.aula}, ${u.periodo}).`;
      container.appendChild(p);
    });

    const btn = document.createElement("button");
    btn.className = "btn btn-primary mt-2";
    btn.textContent = "Agendar também neste dia";
    btn.onclick = () => alert(`Abrir modal para agendar em ${dataSelecionada}`);
    container.appendChild(btn);
  } else {
    const btn = document.createElement("button");
    btn.className = "btn btn-success mt-2";
    btn.textContent = "Agendar neste dia";
    btn.onclick = () => alert(`Abrir modal para agendar em ${dataSelecionada}`);
    container.appendChild(btn);
  }
}

// Executa assim que a página carregar
document.addEventListener("DOMContentLoaded", carregarDashboard);
