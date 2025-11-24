/* Função principal de inicialização: cria handlers e estado do wizard */
function initCriarAgendamento() {
  // inicializa todo o comportamento do formulário e wizard

  /* ---------- ESTADO E ELEMENTOS ---------- */
  let step = 1; // controla etapa atual do wizard

  const steps = document.querySelectorAll(".step"); // nó-lista de todas as sections de etapa
  const btnProximo = document.getElementById("btn-proximo"); // botão próximo usado para avançar passos
  const btnVoltar = document.getElementById("btn-voltar"); // botão voltar para retroceder passo
  const btnFinalizar = document.getElementById("btn-finalizar"); // botão finalizar visível no passo 4
  const btnNovo = document.getElementById("btn-novo"); // botão para reiniciar após sucesso
  const btnFecharFinal = document.getElementById("btn-fechar-final"); // botão para fechar + recarregar após sucesso
  const alertBox = document.getElementById("alert-agendamento"); // área para exibir mensagens
  const form = document.getElementById("form-criar-agendamento"); // form que contém os campos

  /* Inputs específicos obtidos por ID para evitar reliance em variáveis globais do navegador */
  const ag_data = document.getElementById("ag_data");
  const ag_equipamento = document.getElementById("ag_equipamento");
  const ag_quantidade = document.getElementById("ag_quantidade");
  const ag_periodo = document.getElementById("ag_periodo");
  const ag_aula = document.getElementById("ag_aula");
  const resumoLista = document.getElementById("resumo-agendamento");

  /* ---------- HELPERS ---------- */
  function showAlert(msg, type = "danger") {
    // exibe mensagem breve na área de alertas
    alertBox.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  }

  function mostrarPasso(n) {
    // exibe somente a etapa 'n' e ajusta visibilidade dos botões
    steps.forEach((s) => s.classList.add("d-none")); // esconde todas as etapas
    const el = document.getElementById(`step-${n}`); // pega a etapa atual
    if (el) el.classList.remove("d-none"); // exibe a etapa atual se existir

    btnVoltar.disabled = n === 1; // desabilita voltar no primeiro passo
    btnProximo.classList.toggle("d-none", n >= 4); // esconde "Próximo" nos passos 4 e 5
    btnFinalizar.classList.toggle("d-none", n !== 4); // mostra "Finalizar" somente no passo 4
    btnNovo.classList.toggle("d-none", n !== 5); // mostra "Fazer outro" somente no passo 5
    btnFecharFinal.classList.toggle("d-none", n !== 5); // mostra "Fechar" somente no passo 5
    if (n === 5) {
      btnVoltar.classList.add("d-none"); // esconde botão Voltar
      document.getElementById("btn-cancelar-modal").classList.add("d-none"); // esconde botão Cancelar
      btnNovo.classList.remove("d-none"); // mostra botão "Fazer outro"
      btnFecharFinal.classList.remove("d-none"); // mostra botão "Fechar"
    } else {
      btnVoltar.classList.remove("d-none"); // mostra botão Voltar nos outros passos
      document.getElementById("btn-cancelar-modal").classList.remove("d-none"); // mostra botão Cancelar
      btnNovo.classList.add("d-none"); // esconde botão "Fazer outro"
      btnFecharFinal.classList.add("d-none"); // esconde botão "Fechar"
    }
  }

  /* validações específicas de cada passo; evita avançar sem preencher campos necessários */
  function validarPasso(n) {
    if (n === 1) {
      if (!ag_data.value) {
        showAlert("Selecione uma data!");
        return false;
      }
      // opcional: validar se a data não é passada
      const hoje = new Date();
      const sel = new Date(ag_data.value + "T00:00:00");
      if (sel < new Date(hoje.toDateString())) {
        showAlert("Data inválida (passada).");
        return false;
      }
    }
    if (n === 2) {
      if (!ag_equipamento.value) {
        showAlert("Selecione um equipamento!");
        return false;
      }
      if (!ag_quantidade.value || Number(ag_quantidade.value) < 1) {
        showAlert("Informe uma quantidade válida!");
        return false;
      }
    }
    if (n === 3) {
      if (!ag_periodo.value || !ag_aula.value) {
        showAlert("Selecione período e aula!");
        return false;
      }
    }
    return true;
  }

  /* ---------- CARREGA EQUIPAMENTOS DINAMICAMENTE ---------- */
  async function carregarEquipamentos() {
    // busca equipamentos atualizados do backend
    try {
      const resp = await fetch(
        "/agendamentos/backend/api/listar_equipamentos.php"
      ); // endpoint que retorna JSON de equipamentos
      const json = await resp.json();
      ag_equipamento.innerHTML = `<option value="">Selecione...</option>`;
      if (json && Array.isArray(json.equipamentos)) {
        json.equipamentos.forEach((e) => {
          const opt = document.createElement("option");
          opt.value = e.id;
          opt.textContent = `${e.nome} (${e.quantidade})`;
          ag_equipamento.appendChild(opt);
        });
      } else {
        showAlert("Erro ao carregar equipamentos", "warning");
      }
    } catch (err) {
      console.error("Erro listar_equipamentos:", err); // log para debug
      showAlert("Falha ao carregar equipamentos do servidor.");
    }
  }

  /* ---------- RESUMO DO AGENDAMENTO (PASSO 4) ---------- */
  function preencherResumo() {
    // monta o resumo exibido no passo 4
    resumoLista.innerHTML = "";
    const items = [
      { label: "Data", value: ag_data.value },
      {
        label: "Equipamento",
        value: ag_equipamento.options[ag_equipamento.selectedIndex]?.text || "",
      },
      { label: "Quantidade", value: ag_quantidade.value },
      { label: "Período", value: ag_periodo.value },
      { label: "Aula", value: ag_aula.value },
    ];
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `<b>${it.label}:</b> ${it.value}`;
      resumoLista.appendChild(li);
    });
  }

  /* ---------- CONSULTA DE DISPONIBILIDADE ---------- */
  async function consultarDisponibilidade(data, equipamento_id, periodo, aula) {
    // consulta se já existe conflito no backend
    const url = `/agendamentos/backend/api/disponibilidade.php?data=${encodeURIComponent(
      data
    )}&equipamento_id=${encodeURIComponent(
      equipamento_id
    )}&periodo=${encodeURIComponent(periodo)}&aula=${encodeURIComponent(aula)}`;
    try {
      const resp = await fetch(url);
      return await resp.json();
    } catch (err) {
      console.error("Erro disponibilidade:", err);
      return { error: "Falha ao verificar disponibilidade" };
    }
  }

  /* ---------- CRIAÇÃO DO AGENDAMENTO (POST JSON) ---------- */
  async function criarAgendamento(payload) {
    // envia JSON ao endpoint de criação
    try {
      const resp = await fetch("/agendamentos/backend/api/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // indica JSON para backend
        body: JSON.stringify(payload),
      });
      return await resp.json();
    } catch (err) {
      console.error("Erro create:", err);
      return { error: "Falha na requisição de criação" };
    }
  }

  /* ---------- HANDLERS DE NAVEGAÇÃO ---------- */
  btnProximo.addEventListener("click", async () => {
    // avança do passo atual para o próximo
    alertBox.innerHTML = ""; // limpa alertas anteriores
    if (!validarPasso(step)) return; // impede avançar sem validar

    // comportamento extra: antes de avançar do passo 3 para 4, podemos checar disponibilidade
    if (step === 3) {
      // checar disponibilidade antes de permitir ir para confirmação
      const d = ag_data.value,
        eq = ag_equipamento.value,
        p = ag_periodo.value,
        a = ag_aula.value;
      const disp = await consultarDisponibilidade(d, eq, p, a);
      if (disp.error) {
        showAlert(disp.error);
        return;
      }
      if (disp.ocupado) {
        showAlert("Este horário já está ocupado para este equipamento.");
        return;
      }
    }

    step++;
    if (step === 4) preencherResumo(); // preparar resumo ao entrar no passo 4
    mostrarPasso(step); // atualizar UI
  });

  btnVoltar.addEventListener("click", () => {
    // retrocede uma etapa
    alertBox.innerHTML = "";
    if (step > 1) step--;
    mostrarPasso(step);
  });

  btnNovo.addEventListener("click", () => {
    // reinicia wizard mantendo modal aberto
    form.reset();
    step = 1;
    alertBox.innerHTML = "";
    mostrarPasso(step);
  });

  btnFecharFinal.addEventListener("click", () => {
    // fecha e recarrega para forçar atualização da lista de agendamentos
    location.reload();
  });

  /* ---------- SUBMIT: FINALIZAÇÃO DO AGENDAMENTO ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // impede comportamento padrão do form

    // coleta valores
    const d = ag_data.value,
      eq = ag_equipamento.value,
      q = Number(ag_quantidade.value),
      p = ag_periodo.value,
      a = ag_aula.value;

    // valida novamente no submit por segurança
    if (!d || !eq || !q || !p || !a) {
      showAlert("Dados incompletos");
      return;
    }

    // verifica disponibilidade antes de criar (duplicidade de checagem é intencional)
    const disp = await consultarDisponibilidade(d, eq, p, a);
    if (disp.error) {
      showAlert(disp.error);
      return;
    }
    if (disp.ocupado) {
      showAlert("Este horário já está ocupado para este equipamento.");
      return;
    }

    // envia criação
    const res = await criarAgendamento({
      data: d,
      equipamento_id: eq,
      quantidade: q,
      periodo: p,
      aula: a,
    });
    if (res.error) {
      showAlert(res.error);
      return;
    }

    showAlert("Agendamento criado com sucesso!", "success"); // confirma sucesso
    step = 5; // vai para tela de conclusão
    mostrarPasso(step);
  });

  /* ---------- INICIALIZAÇÃO ---------- */
  mostrarPasso(step); // mostra passo inicial
  carregarEquipamentos(); // carrega equipamentos ao iniciar
}

/* Compatibilidade com carregamento dinâmico: executa init imediatamente se DOM já estiver pronto */
if (document.readyState === "loading") {
  // se DOM ainda não pronto, aguarda evento
  document.addEventListener("DOMContentLoaded", initCriarAgendamento);
} else {
  // se DOM já carregado (script injetado depois), inicia imediatamente
  initCriarAgendamento();
}
