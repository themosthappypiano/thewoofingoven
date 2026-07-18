import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const scanRoots = ["client", "server", "shared", "storage.json"];
const sourceExtensions = new Set([".html", ".json", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const ignoredDirectories = new Set(["node_modules", "dist", "build", ".git"]);
const imageUrlPattern = /(?:https?:\/\/[^\s"'`<>]+|\/images\/[^\s"'`<>]+)/g;
const imagePathPattern = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^\s"'`<>]*)?$/i;
const timeoutMs = Number(process.env.IMAGE_CHECK_TIMEOUT_MS || 15_000);
const concurrency = Number(process.env.IMAGE_CHECK_CONCURRENCY || 6);

function collectFiles(path) {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return sourceExtensions.has(extname(path)) ? [path] : [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    return collectFiles(join(path, entry.name));
  });
}

const references = new Map();
for (const file of scanRoots.flatMap((path) => collectFiles(join(root, path)))) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(imageUrlPattern)) {
    const url = match[0].replace(/[),;]+$/, "");
    if (!imagePathPattern.test(url)) continue;
    const line = content.slice(0, match.index).split("\n").length;
    const locations = references.get(url) || [];
    locations.push(`${relative(root, file)}:${line}`);
    references.set(url, locations);
  }
}

async function check([url, locations]) {
  if (url.startsWith("/")) {
    const localPath = join(root, "client/public", url);
    return existsSync(localPath)
      ? { url, locations, ok: true, detail: "local" }
      : { url, locations, ok: false, detail: `missing local file: ${relative(root, localPath)}` };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "The-Woofing-Oven-image-monitor/1.0", range: "bytes=0-65535" },
    });
    const contentType = response.headers.get("content-type") || "unknown content type";
    const ok = response.ok && contentType.toLowerCase().startsWith("image/");
    return { url, locations, ok, detail: `${response.status} ${contentType}` };
  } catch (error) {
    return { url, locations, ok: false, detail: error.name === "AbortError" ? "timed out" : error.message };
  } finally {
    clearTimeout(timer);
  }
}

const queue = [...references.entries()];
const results = [];
async function worker() {
  while (queue.length) results.push(await check(queue.shift()));
}
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));

const broken = results.filter((result) => !result.ok).sort((a, b) => a.url.localeCompare(b.url));
console.log(`Checked ${results.length} unique image URLs (${results.filter((result) => result.detail === "local").length} local).`);
if (broken.length) {
  console.error(`\n${broken.length} broken image URL(s):`);
  for (const item of broken) {
    console.error(`\n- ${item.url}\n  ${item.detail}\n  used at ${item.locations.join(", ")}`);
  }
  process.exitCode = 1;
} else {
  console.log("All image URLs are reachable and return image content.");
}
