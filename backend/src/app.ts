import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
): void {
  const url = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "localhost"}`,
  );

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { status: "ok", service: "tracelab-backend" });
    return;
  }

  sendJson(response, 404, { error: "Not Found" });
}

export function createApp() {
  return createServer(handleRequest);
}
