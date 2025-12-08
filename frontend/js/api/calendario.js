let calendarioInstance;

// Função para abrir modal com detalhes do dia
function abrirDetalhesDoDia(data, detalhes) {
  const container = document.getElementById("detalhes-container");
  const titulo = container.querySelector(".modal-title");
  const body = container.querySelector(".modal-body");
  const footer = container.querySelector(".modal-footer");

  body.innerHTML = "";
  footer.innerHTML = "";

  const hoje = new Date();
  const dataSelecionada = new Date(data + "T00:00:00");

  if (dataSelecionada < hoje) {
    // Dias passados
    titulo.textContent = `Data ${data}`;
    if (detalhes.length > 0) {
      body.innerHTML = `<p>Detalhes não disponíveis para datas passadas.</p>`;
    } else {
      body.innerHTML = `<p>Não houve agendamentos neste dia.</p>`;
    }
  } else {
    // Dias atuais/futuros
    titulo.textContent = `Agendamentos em ${data}`;
    if (detalhes.length > 0) {
      // Lista todos os agendamentos
      const tabela = document.createElement("table");
      tabela.className = "table table-sm";
      tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Aula</th>
                        <th>Período</th>
                        <th>Quantidade</th>
                        <th>Equipamento</th>
                    </tr>
                </thead>
                <tbody>
                    ${detalhes
                      .map(
                        (d) => `
                        <tr>
                            <td>${d.aula}</td>
                            <td>${d.periodo}</td>
                            <td>${d.quantidade}</td>
                            <td>${d.equipamento}</td>
                        </tr>`
                      )
                      .join("")}
                </tbody>
            `;
      body.appendChild(tabela);

      // Botão agendar
      const btn = document.createElement("button");
      btn.className = "btn btn-primary mt-2";
      btn.textContent = "Agendar";
      btn.onclick = () => alert(`Abrir formulário para agendar em ${data}`);
      footer.appendChild(btn);
    } else {
      body.innerHTML = `<p>Nenhum agendamento neste dia.</p>`;
      const btn = document.createElement("button");
      btn.className = "btn btn-primary mt-2";
      btn.textContent = "Agendar neste dia";
      btn.onclick = () => alert(`Abrir formulário para agendar em ${data}`);
      footer.appendChild(btn);
    }
  }

  // Abrir modal (Bootstrap)
  const modal = new bootstrap.Modal(container);
  modal.show();
}

// Inicializa o calendário
async function inicializarCalendario() {
  try {
    const res = await fetch("/agendamentos/backend/api/get_agendamentos.php");
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

// Inicializa automaticamente ao carregar o script
document.addEventListener("DOMContentLoaded", () => {
  inicializarCalendario();
});
