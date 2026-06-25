// Função principal para carregar os dados da página de ferramentas
async function carregarFerramentas() {
  try {
    const response = await fetch("../../../backend/api/ferramentas.php", {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    const data = await response.json();

    if (data.error === "Usuário não autenticado") {
      window.location.href = "../../../";
      return;
    }

    // Preenche tabela de equipamentos
    preencherTabelaEquipamentos(data.equipamentos || []);

    // Atualiza os previews (mostra 3 últimas mensagens nas caixas)
    atualizarPreviewMensagensAdmin(data.mensagensAdmin || []);
    atualizarPreviewChatProfessores(data.chatProfessores || []);

    // Popula o conteúdo completo dos modais (mas NÃO abre o modal automaticamente)
    preencherChatProfessores(data.chatProfessores || []);
    // remover chamada: abrirModalMensagensAdmin(data.mensagensAdmin || []);

    if (typeof atualizarAlertas === "function" && data.alertas) {
      atualizarAlertas(data.alertas, data.alertasNaoLidas || 0);
    }
  } catch (error) {
    console.error("Erro ao carregar ferramentas:", error);
  }
}

// =======================================================
//  COMPONENTES BÁSICOS
// =======================================================

// Preenche tabela de equipamentos
function preencherTabelaEquipamentos(equipamentos) {
  const tbody = document.querySelector("#tabela-equipamentos tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!equipamentos?.length) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-muted">Nenhum equipamento encontrado.</td></tr>';
    return;
  }

  equipamentos.forEach((eq) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${eq.nome}</td>
      <td>${eq.tipo}</td>
      <td>${eq.quantidade}</td>
      <td>${eq.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// =======================================================
//  ALERTAR PROBLEMA (BOTÃO + MODAL + ENVIO)
// =======================================================

async function enviarAlertaProblema() {
  const equipamentoId = document.getElementById("alerta-equipamento").value;
  const descricao = document.getElementById("alerta-descricao").value.trim();

  if (!equipamentoId || !descricao) {
    alert("Preencha todos os campos antes de enviar!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("acao", "alerta");
    formData.append("equipamento_id", equipamentoId);
    formData.append("descricao", descricao);

    const response = await fetch("../../backend/api/ferramentas.php", {
      method: "POST",
      body: formData,
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    const result = await response.json();
    if (result.success) {
      alert("Alerta enviado com sucesso!");
      fecharModal("modal-alerta");
    } else {
      alert(result.error || "Erro ao enviar alerta.");
    }
  } catch (err) {
    console.error("Erro ao enviar alerta:", err);
  }
}

// =======================================================
//  MENSAGENS DO ADMIN
// =======================================================
function atualizarPreviewMensagensAdmin(mensagens) {
  const preview = document.getElementById("preview-mensagens-admin");
  if (!preview) return;

  preview.innerHTML = "";

  const ultimas = mensagens.slice(0, 3); // só mostra 3 últimas
  if (!ultimas.length) {
    preview.innerHTML = `<p class="text-muted">Nenhuma mensagem recebida.</p>`;
  } else {
    ultimas.forEach((m) => {
      const div = document.createElement("div");
      div.className = "mb-2";
      div.innerHTML = `
        <strong>${m.titulo}</strong>
        <p class="mb-0 text-truncate" style="max-width:100%">${m.mensagem}</p>
        <small class="text-muted">${formatarData(m.criado_em)}</small>
      `;
      preview.appendChild(div);
    });
  }
}

function atualizarMensagensAdmin(mensagens, naoLidas) {
  const btn = document.getElementById("btn-mensagens-admin");
  if (!btn) return;

  // Adiciona bolinha de notificação
  btn.classList.toggle("tem-novas", naoLidas > 0);

  btn.onclick = () => abrirModalMensagensAdmin(mensagens);
}

function abrirModalMensagensAdmin(mensagens) {
  const lista = document.getElementById("lista-mensagens-admin");
  const modal = document.getElementById("modal-mensagens-admin");
  if (!lista || !modal) return;

  lista.innerHTML = "";

  if (!mensagens?.length) {
    lista.innerHTML = `<p class="text-muted">Nenhuma mensagem recebida.</p>`;
  } else {
    mensagens.forEach((m) => {
      const item = document.createElement("div");
      item.className = "mensagem-item";
      item.innerHTML = `
        <strong>${m.titulo}</strong>
        <p>${m.mensagem}</p>
        <small class="text-muted">${formatarData(m.criado_em)}</small>
      `;
      lista.appendChild(item);
    });
  }

  modal.style.display = "block";
}

// =======================================================
//  CHAT ENTRE PROFESSORES
// =======================================================
function atualizarPreviewChatProfessores(chat) {
  const preview = document.getElementById("preview-chat-professores");
  if (!preview) return;

  preview.innerHTML = "";

  const ultimas = chat.slice(-3); // últimas 3 mensagens
  if (!ultimas.length) {
    preview.innerHTML = `<p class="text-muted">Nenhuma mensagem no chat.</p>`;
  } else {
    ultimas.forEach((msg) => {
      const div = document.createElement("div");
      div.className = "mb-2";
      div.innerHTML = `
        <strong>${msg.professor}</strong>:
        <p class="mb-0 text-truncate" style="max-width:100%">${msg.mensagem}</p>
        <small class="text-muted">${formatarData(msg.criado_em)}</small>
      `;
      preview.appendChild(div);
    });
  }
}

function preencherChatProfessores(chat) {
  const container = document.getElementById("chat-professores");
  if (!container) return;

  container.innerHTML = "";

  if (!chat?.length) {
    container.innerHTML = `<p class="text-muted">Nenhuma mensagem no chat.</p>`;
    return;
  }

  chat.forEach((msg) => {
    const div = document.createElement("div");
    div.className = "chat-msg";
    div.innerHTML = `
      <strong>${msg.professor}</strong>
      <p>${msg.titulo ? `<em>${msg.titulo}</em><br>` : ""}${msg.mensagem}</p>
      <small class="text-muted">${formatarData(msg.criado_em)}</small>
    `;
    container.appendChild(div);
  });
}

async function enviarMensagemProfessor() {
  const titulo = document.getElementById("chat-titulo").value.trim();
  const mensagem = document.getElementById("chat-mensagem").value.trim();

  if (!titulo || !mensagem) {
    alert("Preencha título e mensagem!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("acao", "mensagem_professor");
    formData.append("titulo", titulo);
    formData.append("mensagem", mensagem);

    const response = await fetch("../../backend/api/ferramentas.php", {
      method: "POST",
      body: formData,
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    const result = await response.json();
    if (result.success) {
      alert("Mensagem enviada com sucesso!");
      document.getElementById("chat-titulo").value = "";
      document.getElementById("chat-mensagem").value = "";
      carregarFerramentas(); // recarrega o chat
    } else {
      alert(result.error || "Erro ao enviar mensagem.");
    }
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  }
}

// =======================================================
//  MODAIS / AUXILIARES
// =======================================================

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

function formatarData(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

document.addEventListener("DOMContentLoaded", carregarFerramentas);
