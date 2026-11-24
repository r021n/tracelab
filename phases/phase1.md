# Fase 1 — Project Initialization

**Target:** membuat struktur `frontend/` dan `backend/` terpisah, lalu menjalankan keduanya.
**DoD:** frontend terbuka di browser dan backend berjalan tanpa error.

Fase ini **belum** memakai GraphQL. GraphQL Yoga baru masuk di Fase 2. Di sini backend hanya berupa HTTP server kecil dengan endpoint `/health`.

## Versi stabil yang dipakai (per November 2026)

| Tool | Versi |
|---|---|
| Node.js | 24 LTS (diuji di 24.21.0) |
| npm | 11.x (diuji di 11.19.0) |
| Vite | 8.3.8 |
| React | 19.3.1 |
| TypeScript | 7.0.2 |
| oxlint | 1.94.0 |

Cek prasyarat dari root project:

```bash
node -v   # v24.21.0
npm -v    # 11.19.0
```

Kalau Node masih di bawah 24, upgrade dulu (misalnya lewat `nvm`).

---

## Struktur akhir Fase 1

```text
tracelab/
├── package.json              # npm workspaces + script root
├── .gitignore
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── .oxlintrc.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       └── index.css
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config.ts         # konfigurasi host/port
│       ├── app.ts            # routing HTTP
│       ├── server.ts         # start server
│       └── index.ts          # entry point
└── phases/
    └── phase1.md
```

---

## Langkah 1 — Scaffold frontend

Jalankan dari root `tracelab/`:

```bash
npm create vite@latest frontend -- --template react-ts
```

Output yang muncul:

```text
create-vite v9.3.4

◇  Scaffolding project in /.../tracelab/frontend...
└  Done. Now run:

  cd frontend
  npm install
  npm run dev
```

**Jangan** jalankan `npm install` di dalam `frontend/` dulu. Instalasi dilakukan sekali dari root pada Langkah 5.

---

## Langkah 2 — Buat root workspace

### `package.json` (root)

Buat file `/tracelab/package.json`:

```json
{
  "name": "tracelab",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "workspaces": [
    "frontend",
    "backend"
  ],
  "engines": {
    "node": ">=24.0.0"
  },
  "scripts": {
    "dev:backend": "npm run dev --workspace backend",
    "dev:frontend": "npm run dev --workspace frontend",
    "build": "npm run build --workspace backend && npm run build --workspace frontend",
    "lint": "npm run lint --workspace backend && npm run lint --workspace frontend",
    "typecheck": "npm run typecheck --workspace backend && npm run typecheck --workspace frontend"
  }
}
```

Satu `npm install` di root akan meng-install dependency `frontend` dan `backend` sekaligus.

### `.gitignore` (root)

```gitignore
node_modules/
dist/
coverage/
*.log
.env
.env.*
!.env.example
.DS_Store
```

---

## Langkah 3 — Buat backend

### `backend/package.json`

```json
{
  "name": "backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "lint": "oxlint src",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@types/node": "^24.19.2",
    "oxlint": "^1.90.0",
    "typescript": "~7.0.2"
  }
}
```

Node 24 bisa menjalankan TypeScript langsung (type stripping), jadi tidak perlu `tsx` atau `ts-node` untuk development.

### `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "rewriteRelativeImportExtensions": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

### `backend/src/config.ts`

```ts
const DEFAULT_PORT = 4000;

function parsePort(value: string | undefined): number {
  const port = Number(value ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${value}`);
  }

  return port;
}

export const config = {
  host: process.env.HOST ?? '127.0.0.1',
  port: parsePort(process.env.PORT),
} as const;
```

### `backend/src/app.ts`

```ts
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function handleRequest(request: IncomingMessage, response: ServerResponse): void {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok', service: 'tracelab-backend' });
    return;
  }

  sendJson(response, 404, { error: 'Not Found' });
}

export function createApp() {
  return createServer(handleRequest);
}
```

Pembagian tanggung jawab: `config.ts` hanya mengurus konfigurasi, `app.ts` hanya mengurus request/response, `server.ts` hanya mengurus lifecycle server, dan `index.ts` hanya menjadi entry point.

### `backend/src/server.ts`

```ts
import { createApp } from './app.ts';
import { config } from './config.ts';

export function startServer() {
  const server = createApp();

  server.listen(config.port, config.host, () => {
    console.log(`Backend ready at http://${config.host}:${config.port}`);
  });

  return server;
}
```

### `backend/src/index.ts`

```ts
import { startServer } from './server.ts';

startServer();
```

> Impor memakai ekstensi `.ts` karena Node menjalankan file TypeScript secara langsung. Saat build, TypeScript mengubahnya menjadi `.js` di `dist/`.

---

## Langkah 4 — Rapikan frontend

### 4a. `frontend/index.html`

Ubah `lang` dan `title`:

```html
<html lang="id">
```

```html
<title>TraceLab</title>
```

### 4b. `frontend/src/App.tsx`

Ganti seluruh isinya dengan:

```tsx
const features = [
  { title: 'Frontend', detail: 'React + Vite + TypeScript' },
  { title: 'Backend', detail: 'Node.js + TypeScript' },
] as const

function App() {
  return (
    <main className="app">
      <header className="hero">
        <span className="eyebrow">TraceLab · Milestone 1</span>
        <h1>API Incident &amp; Dependency Explorer</h1>
        <p className="lead">
          Fondasi project siap. Frontend dan backend berjalan terpisah di lingkungan lokal.
        </p>
      </header>

      <section className="status-grid" aria-label="Application status">
        {features.map((feature) => (
          <article key={feature.title} className="status-card">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <h2>{feature.title}</h2>
              <p>{feature.detail}</p>
            </div>
            <span className="status-label">Ready</span>
          </article>
        ))}
      </section>

      <footer className="footer">Fase 1 selesai. Berikutnya: First GraphQL Server.</footer>
    </main>
  )
}

export default App
```

### 4c. `frontend/src/index.css`

Ganti seluruh isinya dengan:

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e8edf5;
  background: #0b1120;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 0%, rgb(56 130 246 / 22%), transparent 45%),
    radial-gradient(circle at 90% 15%, rgb(16 185 129 / 14%), transparent 40%),
    #0b1120;
}

#root {
  min-height: 100vh;
}

.app {
  width: min(880px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 5rem 0 3rem;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 1rem;
  color: #7dd3fc;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1 {
  max-width: 17ch;
  margin: 0;
  font-size: clamp(2.25rem, 6vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.lead {
  max-width: 56ch;
  margin: 1.25rem 0 0;
  color: #94a3b8;
  font-size: 1.05rem;
  line-height: 1.7;
}

.status-grid {
  display: grid;
  gap: 1rem;
  margin-top: 3rem;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid #1e293b;
  border-radius: 14px;
  background: rgb(15 23 42 / 78%);
}

.status-card h2 {
  margin: 0;
  font-size: 1rem;
}

.status-card p {
  margin: 0.25rem 0 0;
  color: #94a3b8;
  font-size: 0.875rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 5px rgb(52 211 153 / 12%);
}

.status-label {
  margin-left: auto;
  color: #34d399;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.footer {
  margin-top: 2.5rem;
  color: #64748b;
  font-size: 0.875rem;
}
```

### 4d. Hapus file demo Vite

```bash
rm -rf frontend/src/App.css frontend/src/assets frontend/README.md
```

`frontend/src/main.tsx` tidak perlu diubah.

### 4e. Tambah script typecheck

Di `frontend/package.json`, tambahkan satu baris setelah `"lint"` (baris `"preview"` yang sudah ada jangan dihapus):

```json
"lint": "oxlint",
"typecheck": "tsc -b",
```

---

## Langkah 5 — Install dependency

Dari root `tracelab/`:

```bash
npm install
```

Output yang muncul (jumlah paket bisa sedikit berbeda):

```text
added 30 packages, and audited 33 packages in 8s

9 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Akan terbentuk `package-lock.json` dan satu folder `node_modules/` di root.

---

## Langkah 6 — Jalankan backend

**Terminal 1**, dari root:

```bash
npm run dev:backend
```

Output:

```text
> tracelab@0.1.0 dev:backend
> npm run dev --workspace backend

> backend@0.1.0 dev
> node --watch src/index.ts

Backend ready at http://127.0.0.1:4000
```

**Terminal 2**, uji endpoint:

```bash
curl http://127.0.0.1:4000/health
```

Output:

```json
{"status":"ok","service":"tracelab-backend"}
```

Uji route yang tidak ada:

```bash
curl -i http://127.0.0.1:4000/unknown
```

Output inti:

```text
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8

{"error":"Not Found"}
```

Biarkan Terminal 1 berjalan. Tekan `Ctrl+C` untuk berhenti.

---

## Langkah 7 — Jalankan frontend

**Terminal 2** (terminal baru), dari root:

```bash
npm run dev:frontend
```

Output:

```text
> tracelab@0.1.0 dev:frontend
> npm run dev --workspace frontend

> frontend@0.0.0 dev
> vite

  VITE v8.3.8  ready in 86 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Buka `http://localhost:5173/` di browser. Yang tampil:

- Judul **API Incident & Dependency Explorer**
- Dua kartu status **Frontend** dan **Backend** dengan label **Ready**
- Footer **Fase 1 selesai. Berikutnya: First GraphQL Server.**

Tekan `Ctrl+C` untuk berhenti.

---

## Langkah 8 — Quality check

Dari root, jalankan:

```bash
npm run lint
npm run typecheck
npm run build
```

Output yang diharapkan:

```text
# npm run lint
> oxlint src
> oxlint
# (tidak ada error)

# npm run typecheck
# (tidak ada output error)

# npm run build
vite v8.3.8 building client environment for production...
✓ 16 modules transformed.
✓ built in ...
```

Build menghasilkan:

- `backend/dist/` berisi JavaScript hasil kompilasi.
- `frontend/dist/` berisi aset produksi.

Cek backend hasil build (opsional):

```bash
PORT=4100 npm run start --workspace backend
# Backend ready at http://127.0.0.1:4100
```

---

## Checklist DoD

- [ ] `frontend/` dan `backend/` terpisah dan masing-masing punya `package.json`.
- [ ] Satu `npm install` dari root berhasil tanpa vulnerability.
- [ ] `npm run dev:backend` menampilkan `Backend ready at http://127.0.0.1:4000`.
- [ ] `GET /health` mengembalikan `{"status":"ok","service":"tracelab-backend"}`.
- [ ] `npm run dev:frontend` menampilkan `Local: http://localhost:5173/`.
- [ ] Halaman TraceLab terbuka di browser.
- [ ] `npm run lint`, `npm run typecheck`, dan `npm run build` lolos.

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `EADDRINUSE` port 4000 | `lsof -ti :4000 \| xargs kill` lalu jalankan ulang |
| `EADDRINUSE` port 5173 | `lsof -ti :5173 \| xargs kill` lalu jalankan ulang |
| `Cannot find name 'process'` | Pastikan `types: ["node"]` ada di `backend/tsconfig.json` |
| `ERR_UNKNOWN_FILE_EXTENSION` | Pastikan Node ≥ 24 dan `"type": "module"` ada di `backend/package.json` |
| Browser terbuka tapi halaman kosong | Cek error di terminal Vite dan Console browser |

---

## Referensi

- Vite Getting Started: https://vite.dev/guide/
- Node.js Modules: TypeScript: https://nodejs.org/api/typescript.html
- npm Workspaces: https://docs.npmjs.com/cli/v11/using-npm/workspaces
- React 19: https://react.dev/
