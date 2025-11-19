document.addEventListener("DOMContentLoaded", () => {
  // Seleciona o formulário, botão e área de mensagens
  const form = document.getElementById("form-criar-agendamento");
  const btnSalvar = document.getElementById("btn-salvar-agendamento");
  const alertBox = document.getElementById("alert-agendamento");

  // Função para exibir mensagens (erro/sucesso)
  function showAlert(msg, type = "danger") {
    alertBox.innerHTML = `
            <div class="alert alert-${type}">${msg}</div>
        `;
  }

  // -------------------------------
  // 1️⃣ FUNÇÃO PARA CONSULTAR DISPONIBILIDADE
  // -------------------------------
  async function consultarDisponibilidade(data, equipamento_id, periodo, aula) {
    // Monta a URL com parâmetros GET
    const url = `/agendamentos/backend/api/disponibilidade.php?data=${encodeURIComponent(
      data
    )}&equipamento_id=${equipamento_id}&periodo=${periodo}&aula=${aula}`;

    // Faz a requisição GET
    const resp = await fetch(url);

    // Converte a resposta para JSON
    const json = await resp.json();

    // Retorna o conteúdo para quem chamou
    return json;
  }

  // -------------------------------
  // 2️⃣ FUNÇÃO PARA CRIAR AGENDAMENTO (POST)
  // -------------------------------
  async function criarAgendamento(
    data,
    equipamento_id,
    quantidade,
    periodo,
    aula
  ) {
    // Chama create.php enviando JSON por POST
    const resp = await fetch("/agendamentos/backend/api/create.php", {
      method: "POST", // importante!
      headers: { "Content-Type": "application/json" }, // envia como JSON
      body: JSON.stringify({
        // corpo da requisição
        data,
        equipamento_id,
        quantidade,
        periodo,
        aula,
      }),
    });

    // Retorna o JSON da resposta
    return await resp.json();
  }

  // -------------------------------
  // 3️⃣ EVENTO DE ENVIO DO FORMULÁRIO
  // -------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // impede recarregamento da página

    alertBox.innerHTML = ""; // limpa mensagens anteriores

    // Pega os valores digitados/selecionados
    const data = document.getElementById("ag_data").value;
    const equipamento_id = document.getElementById("ag_equipamento").value;
    const quantidade = document.getElementById("ag_quantidade").value;
    const periodo = document.getElementById("ag_periodo").value;
    const aula = document.getElementById("ag_aula").value;

    // Validação simples
    if (!data || !equipamento_id || !quantidade || !periodo || !aula) {
      showAlert("Preencha todos os campos!");
      return;
    }

    // Desabilita o botão enquanto faz o processo
    btnSalvar.disabled = true;
    btnSalvar.innerText = "Verificando...";

    // -------------------------------
    // 4️⃣ CONSULTA DISPONIBILIDADE
    // -------------------------------
    const disp = await consultarDisponibilidade(
      data,
      equipamento_id,
      periodo,
      aula
    );

    // Se o backend respondeu com erro
    if (disp.error) {
      showAlert(disp.error);
      btnSalvar.disabled = false;
      btnSalvar.innerText = "Salvar";
      return;
    }

    // Se o horário já está ocupado
    if (disp.disponivel === false) {
      showAlert("Este horário já está ocupado!");
      btnSalvar.disabled = false;
      btnSalvar.innerText = "Salvar";
      return;
    }

    // -------------------------------
    // 5️⃣ ENVIAR AGENDAMENTO
    // -------------------------------
    btnSalvar.innerText = "Salvando...";

    const res = await criarAgendamento(
      data,
      equipamento_id,
      quantidade,
      periodo,
      aula
    );

    // Se o backend deu erro ao criar
    if (res.error) {
      showAlert(res.error);
      btnSalvar.disabled = false;
      btnSalvar.innerText = "Salvar";
      return;
    }

    // Sucesso!
    showAlert("Agendamento criado com sucesso!", "success");

    // Limpa o formulário
    form.reset();

    // Remove o alerta depois de 3s
    setTimeout(() => {
      alertBox.innerHTML = "";
    }, 3000);

    // Reabilita o botão
    btnSalvar.disabled = false;
    btnSalvar.innerText = "Salvar";
  });
});
