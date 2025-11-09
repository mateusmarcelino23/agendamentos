// Função principal para carregar os dados do relatório
async function carregarRelatorios() {
  try {
    const response = await fetch("../../backend/api/relatorios.php", {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    const data = await response.json();

    if (data.error === "Usuário não autenticado") {
      window.location.href = "../../";
      return;
    }

    // Atualiza os cards do topo
    atualizarCards(data.cards);

    // Carrega os gráficos do Google Charts
    google.charts.load("current", { packages: ["corechart", "bar"] });
    google.charts.setOnLoadCallback(() => {
      desenharGraficos(data.graficos);
    });
  } catch (error) {
    console.error("Erro ao carregar relatórios:", error);
  }
}

// Atualiza os 4 cards do topo
function atualizarCards(cards) {
  const cardTotal = document.getElementById("card-total-mes");
  const cardConcluidos = document.getElementById("card-concluidos");
  const cardCancelados = document.getElementById("card-cancelados");
  const cardEquipamento = document.getElementById("card-equipamento");

  if (cardTotal) cardTotal.textContent = cards.totalMes || 0;
  if (cardConcluidos) cardConcluidos.textContent = cards.concluidos || 0;
  if (cardCancelados) cardCancelados.textContent = cards.cancelados || 0;
  if (cardEquipamento)
    cardEquipamento.textContent = `${cards.equipamentoMaisUsado.nome} (${cards.equipamentoMaisUsado.total})`;
}

// Desenha todos os gráficos
function desenharGraficos(graficos) {
  if (!graficos) return;

  // 1️⃣ Equipamentos mais usados - gráfico de barras
  const dataEquip = new google.visualization.DataTable();
  dataEquip.addColumn("string", "Equipamento");
  dataEquip.addColumn("number", "Agendamentos");
  graficos.equipamentosRanking.forEach((e) => {
    dataEquip.addRow([e.nome, parseInt(e.total)]);
  });
  const chartEquip = new google.visualization.ColumnChart(
    document.getElementById("grafico-equipamentos")
  );
  chartEquip.draw(dataEquip, {
    title: "Equipamentos mais usados",
    height: 300,
  });

  // 2️⃣ Professores mais ativos - gráfico de barras horizontais
  const dataProf = new google.visualization.DataTable();
  dataProf.addColumn("string", "Professor");
  dataProf.addColumn("number", "Agendamentos");
  graficos.professoresRanking.forEach((p) => {
    dataProf.addRow([p.nome, parseInt(p.total)]);
  });
  const chartProf = new google.visualization.BarChart(
    document.getElementById("grafico-professores")
  );
  chartProf.draw(dataProf, {
    title: "Professores mais ativos",
    height: 300,
    bars: "horizontal",
  });

  // 3️⃣ Agendamentos por período - gráfico de pizza
  const dataPeriodo = new google.visualization.DataTable();
  dataPeriodo.addColumn("string", "Período");
  dataPeriodo.addColumn("number", "Total");
  graficos.periodos.forEach((p) => {
    dataPeriodo.addRow([
      p.periodo.charAt(0).toUpperCase() + p.periodo.slice(1),
      parseInt(p.total),
    ]);
  });
  const chartPeriodo = new google.visualization.PieChart(
    document.getElementById("grafico-periodos")
  );
  chartPeriodo.draw(dataPeriodo, {
    title: "Agendamentos por período",
    height: 300,
  });

  // 4️⃣ Agendamentos por tipo de equipamento - gráfico de pizza
  const dataTipo = new google.visualization.DataTable();
  dataTipo.addColumn("string", "Tipo");
  dataTipo.addColumn("number", "Total");
  graficos.tipoEquipamento.forEach((t) => {
    const tipo = t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1);
    dataTipo.addRow([tipo, parseInt(t.total)]);
  });
  const chartTipo = new google.visualization.PieChart(
    document.getElementById("grafico-tipo")
  );
  chartTipo.draw(dataTipo, {
    title: "Agendamentos por tipo de equipamento",
    height: 300,
  });

  // 5️⃣ Agendamentos por status - gráfico de pizza
  const dataStatus = new google.visualization.DataTable();
  dataStatus.addColumn("string", "Status");
  dataStatus.addColumn("number", "Total");
  const statusMap = { 0: "Pendente", 1: "Concluído", 2: "Cancelado" };
  graficos.statusAgendamentos.forEach((s) => {
    dataStatus.addRow([statusMap[s.status] || "Outro", parseInt(s.total)]);
  });
  const chartStatus = new google.visualization.PieChart(
    document.getElementById("grafico-status")
  );
  chartStatus.draw(dataStatus, {
    title: "Agendamentos por status",
    height: 300,
  });
}

// Executa ao carregar a página
document.addEventListener("DOMContentLoaded", carregarRelatorios);