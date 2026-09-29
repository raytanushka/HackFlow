import path from "node:path";

const root = process.cwd();

export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || "0.0.0.0",
  databaseFile: path.resolve(root, process.env.DATABASE_FILE || "./data/hackflow.db"),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 7),
};
