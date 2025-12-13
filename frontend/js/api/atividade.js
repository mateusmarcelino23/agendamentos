// Função principal para carregar os dados da página de atividade
async function carregarAtividade() {
  try {
    const response = await fetch("../../backend/api/atividade.php", {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    const data = await response.json();

    if (data.error === "Usuário não autenticado") {
      window.location.href = "../../";
      return;
    }

    // Atualiza o agendamento ativo
    mostrarAgendamentoAtivo(data.agendamentoAtivo);

    // Preenche a tabela do histórico mensal
    preencherHistoricoMensal(data.historicoMensal);

    // Preenche os cards detalhados
    atualizarCardsDetalhados(data.cardsDetalhados);
  } catch (error) {
    console.error("Erro ao carregar atividade:", error);
  }
}

// Mostra se há agendamento ativo agora
function mostrarAgendamentoAtivo(agendamento) {
  const container = document.querySelector("#agendamento-ativo");
  if (!container) return;

  if (!agendamento) {
    container.innerHTML = `<p class="text-muted">Nenhum agendamento ativo agora.</p>`;
    return;
  }

  container.innerHTML = `
    <p><strong>Agendamento Ativo:</strong> ${agendamento.equipamento} - Aula ${
    agendamento.aula
  } (${agendamento.periodo})</p>
    <p>Status: ${formatarStatus(agendamento.status)}</p>
  `;
}

// Preenche a tabela de histórico mensal
function preencherHistoricoMensal(agendamentos) {
  const tbody = document.querySelector("#tabela-historico-mensal tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!agendamentos || agendamentos.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="6" class="text-center text-muted">Nenhum agendamento registrado neste mês.</td>';
    tbody.appendChild(tr);
    return;
  }

  agendamentos.forEach((a) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatarData(a.data)}</td>
      <td>${a.aula} (${a.periodo})</td>
      <td>${a.equipamento_id}</td>
      <td>${formatarStatus(a.status)}</td>
      <td>
        ${
          a.status === 0
            ? `<button class="btn btn-success btn-sm" onclick="concluirAgendamento(${a.id})">Concluir</button>`
            : "-"
        }
      </td>
      <td>
        ${
          a.status === 0
            ? `<button class="btn btn-danger btn-sm" onclick="cancelarAgendamento(${a.id})">Cancelar</button>`
            : "-"
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Atualiza os cards detalhados
function atualizarCardsDetalhados(cards) {
  const container = document.querySelector("#cards-detalhados");
  if (!container) return;

  container.innerHTML = "";
  cards.forEach((card) => {
    const div = document.createElement("div");
    div.className = "col-md-3 mb-3";
    div.innerHTML = `
      <div class="card text-white bg-info h-100">
        <div class="card-body">
          <h5 class="card-title">${card.titulo}</h5>
          <p class="card-text">${card.valor}</p>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

// Concluir agendamento via AJAX
async function concluirAgendamento(id) {
  if (!confirm("Deseja realmente concluir este agendamento?")) return;

  try {
    const response = await fetch(
      `../../../backend/api/concluir_agendamento.php?id=${id}`,
      {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      }
    );

    const result = await response.json();
    if (result.success) {
      alert("Agendamento concluído com sucesso!");
      carregarAtividade(); // Recarrega os dados
    } else {
      alert("Erro ao concluir agendamento.");
    }
  } catch (error) {
    console.error("Erro ao concluir agendamento:", error);
  }
}

// Cancelar agendamento via AJAX
async function cancelarAgendamento(id) {
  if (!confirm("Deseja realmente cancelar este agendamento?")) return;

  try {
    const response = await fetch(
      `../../../backend/api/cancelar_agendamento.php?id=${id}`,
      {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      }
    );

    const result = await response.json();
    if (result.success) {
      alert("Agendamento cancelado com sucesso!");
      carregarAtividade(); // Recarrega os dados
    } else {
      alert("Erro ao cancelar agendamento.");
    }
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
  }
}

// Formata o status do agendamento
function formatarStatus(status) {
  switch (status) {
    case 0:
      return "Pendente";
    case 1:
      return "Concluído";
    case 2:
      return "Cancelado";
    default:
      return "Desconhecido";
  }
}

// Formata a data em padrão brasileiro
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

// Executa assim que a página carregar
document.addEventListener("DOMContentLoaded", carregarAtividade);
