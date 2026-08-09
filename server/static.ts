import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (req, res, next) => {
    fs.promises
      .readFile(path.resolve(distPath, "index.html"), "utf-8")
      .then((html) => {
        res.type("html").send(html);
      })
      .catch(next);
  });
}
