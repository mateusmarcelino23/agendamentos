// criar_agendamento_api.js
export async function listarEquipamentos() {
  const resp = await fetch("/agendamentos/backend/api/listar_equipamentos.php");
  return await resp.json();
}

export async function verificarDisponibilidade(
  data,
  equipamento_id,
  periodo,
  aula
) {
  const resp = await fetch(
    `/agendamentos/backend/api/disponibilidade.php?data=${encodeURIComponent(
      data
    )}&equipamento_id=${encodeURIComponent(
      equipamento_id
    )}&periodo=${encodeURIComponent(periodo)}&aula=${encodeURIComponent(aula)}`
  );
  return await resp.json();
}

export async function criarAgendamento(payload) {
  try {
    const resp = await fetch("/agendamentos/backend/api/create.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await resp.json();
  } catch (err) {
    console.error("Erro create:", err);
    return { error: "Falha na requisição de criação" };
  }
}
