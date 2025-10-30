fetch("../../backend/pages/dashboard.php", {
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
})
  .then((response) => response.json())
  .then((data) => {
    if (data.error === "Usuário não autenticado") {
      // Redireciona manualmente
      window.location.href = "../../";
      return;
    }

    // Nome do professor
    document.getElementById("bem-vindo").textContent = `Bem-vindo(a), ${
      data.primeiroNome || ""
    }`;

    // Próximo agendamento
    const prox = data.proximoAgendamento;
    document.querySelector("#card-proximo-agendamento .card-text").innerHTML =
      prox
        ? `${prox.nome_equip} - ${prox.data} - Aula(s): ${prox.aula}`
        : "Você ainda não possui agendamentos futuros.";

    // Total de equipamentos
    document.querySelector(
      "#card-equipamentos-disponiveis .card-text"
    ).innerText =
      data.totalEquipamentos > 0
        ? data.totalEquipamentos
        : "Nenhum equipamento disponível no momento.";

    // Pendências
    document.querySelector("#card-pendencias .card-text").innerText =
      "Sem pendências no momento";

    // Histórico
    document.querySelector("#card-historico .card-text").innerText =
      data.ultimosAgendamentos.length > 0
        ? `${data.ultimosAgendamentos.length} agendamento(s) recente(s)`
        : "Você ainda não possui agendamentos concluídos.";

    // Tabela de últimos agendamentos
    const tbody = document.querySelector("#tabela-ultimos-agendamentos tbody");
    tbody.innerHTML = "";
    if (data.ultimosAgendamentos.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="3" class="text-center text-muted">Nenhum agendamento encontrado.</td>';
      tbody.appendChild(tr);
    } else {
      data.ultimosAgendamentos.forEach((a) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${a.data}</td><td>${a.aula}</td><td>${a.nome_equip}</td>`;
        tbody.appendChild(tr);
      });
    }
  })
  .catch((err) => console.error(err));
