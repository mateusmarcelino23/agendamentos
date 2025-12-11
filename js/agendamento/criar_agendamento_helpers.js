// criar_agendamento_helpers.js
export function showAlert(container, msg, type = "danger") {
  container.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}

// Função utilitária para criar elementos com classe e tipo
export function criarElemento(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.type) el.type = options.type;
  if (options.value) el.value = options.value;
  if (options.textContent) el.textContent = options.textContent;
  if (options.innerHTML) el.innerHTML = options.innerHTML;
  return el;
}
