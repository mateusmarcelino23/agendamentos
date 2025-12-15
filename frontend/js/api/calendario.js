let calendarioInstance;

function abrirDetalhesDoDia(data, detalhes) {
  const container = document.getElementById("detalhes-container");
  const titulo = container.querySelector(".modal-title");
  const body = container.querySelector(".modal-body");
  const footer = container.querySelector(".modal-footer");

  body.innerHTML = "";
  footer.innerHTML = "";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataSelecionada = new Date(data + "T00:00:00");
  dataSelecionada.setHours(0, 0, 0, 0);

  const isPast = dataSelecionada < hoje;

  titulo.textContent = `Agendamentos em ${data}`;

  if (detalhes.length === 0) {
    if (isPast) {
      body.innerHTML = `<p>Não houve agendamentos neste dia.</p>`;
    } else {
      body.innerHTML = `<p>Nenhum agendamento neste dia.</p>`;

      const btn = document.createElement("button");
      btn.className = "btn btn-primary mt-2";
      btn.textContent = "Agendar neste dia";
      btn.onclick = () => {
        const modalDetalhesEl = document.getElementById("detalhes-container");
        const modalDetalhes = bootstrap.Modal.getInstance(modalDetalhesEl);
        if (modalDetalhes) modalDetalhes.hide();

        abrirAgendamentoComData(data);
      };
      footer.appendChild(btn);
    }
  } else {
    const tabela = document.createElement("table");
    tabela.className = "table table-sm";

    tabela.innerHTML = `
      <thead>
        <tr>
          <th>Professor</th>
          <th>Período</th>
          <th>Aula</th>
          <th>Equipamento</th>
        </tr>
      </thead>
      <tbody>
        ${detalhes
          .map(
            (d) => `
          <tr>
            <td>${d.professor}</td>
            <td>${d.periodo}</td>
            <td>${d.aula}</td>
            <td>${d.equipamento}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

    body.appendChild(tabela);

    if (!isPast) {
      const btn = document.createElement("button");
      btn.className = "btn btn-primary mt-2";
      btn.textContent = "Agendar também neste dia";
      btn.onclick = () => {
        const modalDetalhesEl = document.getElementById("detalhes-container");
        const modalDetalhes = bootstrap.Modal.getInstance(modalDetalhesEl);
        if (modalDetalhes) modalDetalhes.hide();

        abrirAgendamentoComData(data);
      };
      footer.appendChild(btn);
    }
  }

  const modal = new bootstrap.Modal(container);
  modal.show();
}

async function inicializarCalendario() {
  try {
    const res = await fetch("../../backend/api/get_agendamentos.php");
    const data = await res.json();

    if (!data.success) {
      console.error("Erro ao carregar agendamentos");
      return;
    }

    const datasComAgendamento = data.agendamentos;

    const calendarioEl = document.getElementById("calendario");
    if (!calendarioEl) return;

    const eventos = datasComAgendamento.map((d) => ({
      title: `${d.total} agendamento(s)`,
      start: d.data,
      allDay: true,
      extendedProps: { detalhes: d.detalhes },
    }));

    calendarioInstance = new FullCalendar.Calendar(calendarioEl, {
      locale: "pt-br",
      initialView: "dayGridMonth",
      height: 500,
      events: eventos,
      buttonText: {
        today: "Hoje",
        month: "Mês",
        week: "Semana",
        day: "Dia",
        list: "Lista",
      },
      dateClick: function (info) {
        const evento = eventos.find((e) => e.start === info.dateStr);
        abrirDetalhesDoDia(
          info.dateStr,
          evento ? evento.extendedProps.detalhes : []
        );
      },
      eventClick: function (info) {
        abrirDetalhesDoDia(
          info.event.startStr,
          info.event.extendedProps.detalhes
        );
      },
    });

    calendarioInstance.render();
  } catch (err) {
    console.error("Erro ao inicializar calendário:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarCalendario();
});
