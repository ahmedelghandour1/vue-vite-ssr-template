import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
// import "../polyfills/fetch-polyfill.mjs";

// eslint-disable-next-line
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// eslint-disable-next-line
export async function createServer(root = process.cwd(), hmrPort = 3000) {
  const manifest = {};
  const app = express();

  const vite = await createViteServer({
    base: "/",
    root,
    logLevel: isTest ? "error" : "info",
    appType: "custom",
    server: {
      middlewareMode: true,
      https: true,
      watch: {
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100,
      },
      hmr: {
        port: hmrPort,
      },
    },
  });
  app.use(vite.middlewares);
  console.info("vite is created!");

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;
      let template = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);

      const { render } = await vite.ssrLoadModule("/src/entry-server.ts");

      const [appHtml, preloadLinks, state, teleports, ssrState] = await render(url, manifest, req);
      console.log(state);
      const html = template
        .replace(`<!--app-preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)
        .replace(`<!--app-teleports-->`, (teleports && teleports["#teleported"]) || "")
        .replace(`/*app-ssr-data*/`, `window.INITIAL_DATA = ${state}`)
        .replace(`/*app-ssr-state-for-reset*/`, `window.INITIAL_STATE_FOR_RESET = ${ssrState}`);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app, vite };
}

if (!isTest) {
  const PORT = 8080;
  createServer().then(async ({ app }) => {
    const https = await import("https");
    const options = {
      key: fs.readFileSync("./certificate/key.pem"),
      cert: fs.readFileSync("./certificate/certificate.pem"),
    };
    https.createServer(options, app).listen(PORT, "127.0.0.1", 511, () => {
      console.info(`You can navigate to https://localhost:${PORT}`);
    });
  });
}
