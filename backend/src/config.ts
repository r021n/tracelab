const DEFAULT_PORT = 4000;

function parsePort(value: string | undefined): number {
  const port = Number(value ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${value}`);
  }

  return port;
}

export const config = {
  host: process.env.HOST ?? "127.0.0.1",
  port: parsePort(process.end.PORT),
} as const;
