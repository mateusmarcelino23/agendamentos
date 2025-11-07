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
  const calendario = document.querySelector("#calendario");
  if (!calendario) return;

  // Exemplo simples: marca os dias com agendamentos
  datas.forEach((d) => {
    const dia = new Date(d.data).getDate();
    const celula = calendario.querySelector(`[data-dia="${dia}"]`);
    if (celula) {
      celula.classList.add("tem-agendamento");
      celula.title = `${d.total} agendamento(s) neste dia`;
      celula.addEventListener("click", () => abrirDetalhesDoDia(d.data));
    }
  });
}

// Quando o dia é clicado no calendário
function abrirDetalhesDoDia(dataSelecionada) {
  alert(`Exibindo agendamentos do dia ${formatarData(dataSelecionada)}.`);
  // Aqui você pode abrir um modal ou redirecionar para nova página
  // window.location.href = `/frontend/novo_agendamento.php?data=${dataSelecionada}`;
}

// Formata a data em padrão brasileiro
function formatarData(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

// Executa assim que a página carregar
document.addEventListener("DOMContentLoaded", carregarDashboard);
