// Função principal que carrega todos os dados do relatório
async function carregarRelatorios() {
  try {
    // Faz a requisição AJAX para o backend (relatorios.php)
    const response = await fetch("../../backend/api/relatorios.php", {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    // Converte a resposta em JSON
    const data = await response.json();

    // Se o usuário não estiver autenticado, redireciona para o login
    if (data.error === "Usuário não autenticado") {
      window.location.href = "../../";
      return;
    }

    // Atualiza os cards gerais do sistema
    atualizarCardsSistema(data.sistema.cards);

    // Atualiza os cards específicos do professor logado
    atualizarCardsProfessor(data.professor.cards);

    // Atualiza os rankings (professores, equipamentos e turnos)
    atualizarRankings(data.rankings);

    // Carrega as bibliotecas do Google Charts
    google.charts.load("current", { packages: ["corechart", "bar"] });

    // Quando o Google Charts estiver pronto, desenha os gráficos
    google.charts.setOnLoadCallback(() => {
      desenharGraficosSistema(data.sistema.graficos);
      desenharGraficosProfessor(data.professor.graficos);
    });
  } catch (error) {
    console.error("Erro ao carregar relatórios:", error);
  }
}

// Atualiza os cards de resumo do sistema
function atualizarCardsSistema(cards) {
  document.getElementById("card-total-mes").textContent = cards.totalMes || 0;
  document.getElementById("card-concluidos").textContent =
    cards.concluidos || 0;
  document.getElementById("card-cancelados").textContent =
    cards.cancelados || 0;
  document.getElementById("card-equipamento").textContent = `${
    cards.equipamentoMaisUsado.nome || "-"
  } (${cards.equipamentoMaisUsado.total || 0})`;
}

// Atualiza os cards de resumo pessoais do professor logado
function atualizarCardsProfessor(cards) {
  document.getElementById("meus-total").textContent = cards.total || 0;
  document.getElementById("meus-concluidos").textContent =
    cards.concluidos || 0;
  document.getElementById("meus-cancelados").textContent =
    cards.cancelados || 0;
  document.getElementById("meu-equipamento").textContent = `${
    cards.equipamentoMaisUsado.nome || "-"
  } (${cards.equipamentoMaisUsado.total || 0})`;
}

// Atualiza as listas de rankings no HTML
function atualizarRankings(rankings) {
  // Ranking de professores
  const listaProfs = document.getElementById("ranking-professores");
  listaProfs.innerHTML = "";
  rankings.professores.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${p.nome} — ${p.total}`;
    listaProfs.appendChild(li);
  });

  // Ranking de equipamentos
  const listaEquip = document.getElementById("ranking-equipamentos");
  listaEquip.innerHTML = "";
  rankings.equipamentos.forEach((e, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${e.nome} — ${e.total}`;
    listaEquip.appendChild(li);
  });

  // Ranking de turnos
  const listaTurnos = document.getElementById("ranking-turnos");
  listaTurnos.innerHTML = "";
  rankings.turnos.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${
      t.periodo.charAt(0).toUpperCase() + t.periodo.slice(1)
    } — ${t.total}`;
    listaTurnos.appendChild(li);
  });
}

// Desenha todos os gráficos do sistema (dados globais)
function desenharGraficosSistema(graficos) {
  if (!graficos) return;

  // Gráfico de status geral do sistema
  desenharPizza(
    "grafico-status-sistema",
    graficos.status,
    "Agendamentos por Status"
  );

  // Gráfico por tipo de equipamento (laboratório ou guardião)
  desenharPizza(
    "grafico-tipo-sistema",
    graficos.tipoEquipamento,
    "Agendamentos por Tipo de Equipamento",
    "tipo"
  );

  // Gráfico de agendamentos por período (manhã, tarde, noite)
  desenharPizza(
    "grafico-periodos-sistema",
    graficos.periodos,
    "Agendamentos por Período",
    "periodo"
  );

  // Gráfico de linha mostrando evolução diária de agendamentos
  desenharLinha(
    "grafico-evolucao",
    graficos.evolucao,
    "Evolução Diária dos Agendamentos"
  );
}

// Desenha os gráficos pessoais do professor logado
function desenharGraficosProfessor(graficos) {
  if (!graficos) return;

  // Gráfico de status dos agendamentos do professor
  desenharPizza(
    "grafico-status-professor",
    graficos.status,
    "Meus Agendamentos por Status"
  );

  // Gráfico de barras com os equipamentos mais usados pelo professor
  desenharBarras(
    "grafico-equip-professor",
    graficos.equipamentos,
    "Meus Equipamentos Mais Usados"
  );

  // Gráfico de pizza com a distribuição dos turnos do professor
  desenharPizza(
    "grafico-periodos-professor",
    graficos.periodos,
    "Meus Agendamentos por Período",
    "periodo"
  );
}

// Desenha gráfico de pizza com base nos dados fornecidos
function desenharPizza(elementId, dados, titulo, chave = "status") {
  const mapStatus = { 0: "Pendente", 1: "Concluído", 2: "Cancelado" };

  const dataTable = new google.visualization.DataTable();
  dataTable.addColumn("string", "Categoria");
  dataTable.addColumn("number", "Total");

  dados.forEach((d) => {
    let nome = d[chave];
    if (chave === "status") nome = mapStatus[d.status] || "Outro";
    if (nome) dataTable.addRow([nome, parseInt(d.total)]);
  });

  const chart = new google.visualization.PieChart(
    document.getElementById(elementId)
  );
  chart.draw(dataTable, {
    title: titulo,
    height: 300,
    animation: { startup: true, duration: 800, easing: "out" }, // animação de entrada
  });
}

// Desenha gráfico de barras verticais
function desenharBarras(elementId, dados, titulo) {
  const dataTable = new google.visualization.DataTable();
  dataTable.addColumn("string", "Nome");
  dataTable.addColumn("number", "Total");
  dados.forEach((d) => dataTable.addRow([d.nome, parseInt(d.total)]));

  const chart = new google.visualization.ColumnChart(
    document.getElementById(elementId)
  );
  chart.draw(dataTable, {
    title: titulo,
    height: 300,
    animation: { startup: true, duration: 800, easing: "out" },
  });
}

// Desenha gráfico de linha para exibir evolução ao longo dos dias
function desenharLinha(elementId, dados, titulo) {
  const dataTable = new google.visualization.DataTable();
  dataTable.addColumn("string", "Dia");
  dataTable.addColumn("number", "Agendamentos");
  dados.forEach((d) => dataTable.addRow([`Dia ${d.dia}`, parseInt(d.total)]));

  const chart = new google.visualization.LineChart(
    document.getElementById(elementId)
  );
  chart.draw(dataTable, {
    title: titulo,
    height: 300,
    curveType: "function",
    legend: { position: "bottom" },
    animation: { startup: true, duration: 1000, easing: "out" },
  });
}

// Executa automaticamente quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", carregarRelatorios);

// Faz rolar até a seção da âncora após o carregamento
window.addEventListener("load", () => {
  // Só rola se a navegação NÃO for um reload
  const navEntries = performance.getEntriesByType("navigation");
  const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

  if (!isReload && window.location.hash) {
    const destino = document.querySelector(window.location.hash);
    if (destino) {
      setTimeout(() => {
        destino.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600); // ajusta o delay conforme o carregamento da página
    }
  }
});
