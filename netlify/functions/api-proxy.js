export async function handler(event) {
  // Trata requisições do tipo OPTIONS (usadas em verificações CORS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
      },
      body: "OK",
    };
  }

  // Monta a URL de destino substituindo o prefixo da função pelo domínio do backend
  const url =
    "https://saee.free.nf" +
    event.path.replace("/.netlify/functions/api-proxy", "");

  try {
    // Define as opções da requisição
    const options = {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        host: undefined, // Remove o cabeçalho Host para evitar conflito com o servidor de destino
      },
    };

    // Só inclui o corpo da requisição se o método permitir
    if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
      options.body = event.body;
    }

    // Executa a requisição ao backend
    const response = await fetch(url, options);

    // Lê a resposta como texto (pode ser JSON ou HTML dependendo do backend)
    const text = await response.text();

    // Retorna a resposta original do backend com os cabeçalhos CORS aplicados
    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
      },
      body: text,
    };
  } catch (err) {
    // Retorna erro 502 caso o servidor de destino não responda
    console.error("Erro no proxy:", err);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Bad Gateway", details: err.message }),
    };
  }
}
