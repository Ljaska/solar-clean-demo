import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const staticEntries = [
  "index.html",
  "apply.html",
  "privacy.html",
  "terms.html",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "css",
  "js",
  "images",
  "icons",
  "favicon",
  ".openai"
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of staticEntries) {
  await cp(resolve(root, entry), resolve(dist, entry), { recursive: true });
}

await mkdir(resolve(dist, "server"), { recursive: true });
await writeFile(
  resolve(dist, "server", "index.js"),
  `export default {
  async fetch(request, env) {
    if (env?.ASSETS?.fetch) return env.ASSETS.fetch(request);
    return new Response("SolarSpark static assets are not bound.", { status: 503 });
  }
};
`,
  "utf8"
);

console.log("SolarSpark production files written to dist/");
