export async function handler(event) {
  const url =
    "https://saee.free.nf" +
    event.path.replace("/.netlify/functions/api-proxy", "");
  const response = await fetch(url, {
    method: event.httpMethod,
    headers: { "Content-Type": "application/json" },
    body: event.body,
  });
  const data = await response.text();

  return {
    statusCode: response.status,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: data,
  };
}
