import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";

type GeneratedFile = {
  path: string;
  contents: string;
};

type GenerationResult = {
  appName: string;
  spec: string;
  createdAt: string;
  files: GeneratedFile[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeSafeName(input: string) {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-\s_]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.length ? base.slice(0, 50) : "generated-app";
}

function mockGenerateNext15App({ appName, spec }: { appName: string; spec: string }): GeneratedFile[] {
  const pkg = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint"
    },
    dependencies: {
      next: "^15.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0"
    },
    devDependencies: {
      typescript: "^5.7.2",
      tailwindcss: "^3.4.15",
      autoprefixer: "^10.4.20",
      postcss: "^8.4.49",
      "@types/node": "^22.10.2",
      "@types/react": "^19.0.1",
      "@types/react-dom": "^19.0.1"
    }
  };

  const layoutTsx = `export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>{children}</body>
    </html>
  );
}
`;

  const pageTsx = `const SPEC = ${JSON.stringify(spec)};

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Page(_props: Props) {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Generated Next.js 15 App</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        This is a mock output from Agent Battalion.
      </p>
      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Spec</h2>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            background: "#0b1220",
            color: "#e5e7eb",
            borderRadius: 10,
            overflowX: "auto",
          }}
        >
{SPEC}
        </pre>
      </section>
    </main>
  );
}
`;

  const tailwindConfig = `import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;

  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;

  return [
    { path: "package.json", contents: JSON.stringify(pkg, null, 2) + "\n" },
    { path: "app/layout.tsx", contents: layoutTsx },
    { path: "app/page.tsx", contents: pageTsx },
    { path: "tailwind.config.ts", contents: tailwindConfig },
    { path: "next.config.js", contents: nextConfig }
  ];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(express.json({ limit: "2mb" }));

const publicDir = path.resolve(__dirname, "../../public");
app.use(express.static(publicDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

io.on("connection", (socket) => {
  socket.emit("progress", {
    runId: null,
    stage: "connected",
    message: "Connected to Agent Battalion server",
    percent: 0
  });

  socket.on(
    "generate_app",
    async (payload: { spec?: string; appName?: string } | undefined, ack?: (r: any) => void) => {
      const spec = (payload?.spec ?? "").toString().trim();
      const appName = makeSafeName((payload?.appName ?? "agent-battalion-app").toString());
      const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      if (!spec) {
        const err = { ok: false, error: "spec is required" };
        if (ack) ack(err);
        socket.emit("generation_error", { runId, ...err });
        return;
      }

      const emit = (stage: string, message: string, percent: number) => {
        socket.emit("progress", { runId, stage, message, percent });
      };

      try {
        emit("queued", "Queued generation run", 3);
        await sleep(250);

        emit("analyzing", "Analyzing spec", 12);
        await sleep(450);

        emit("planning", "Planning file structure", 28);
        await sleep(500);

        emit("generating", "Generating Next.js 15 scaffold", 55);
        await sleep(650);

        const files = mockGenerateNext15App({ appName, spec });

        emit("finalizing", "Finalizing output", 85);
        await sleep(300);

        const result: GenerationResult = {
          appName,
          spec,
          createdAt: new Date().toISOString(),
          files
        };

        emit("done", `Generated ${files.length} files`, 100);
        socket.emit("generation_result", { runId, ok: true, result });
        if (ack) ack({ ok: true, runId });
      } catch (e: any) {
        const msg = e?.message ?? "Unknown error";
        socket.emit("generation_error", { runId, ok: false, error: msg });
        if (ack) ack({ ok: false, runId, error: msg });
      }
    }
  );
});

const port = Number(process.env.PORT || 4000);
server.on("error", (err: any) => {
  if (err?.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Set PORT to a free port (e.g. PORT=4001) and retry.`
    );
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});
server.listen(port, () => {
  console.log(`Agent Battalion web server listening on http://localhost:${port}`);
});
