import express from "express";

import authRoutes from "./routes/auth.routes.js";
import judgeRoutes from "./routes/judge.routes.js";
import organizerRoutes from "./routes/organizer.routes.js";
import projectRoutes from "./routes/project.routes.js";
import exportRoutes from "./routes/export.routes.js";
import eventRoutes from "./routes/event.routes.js";
import teamRoutes from "./routes/team.routes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorHandler.js";

import { config } from "./config/config.js";

export const app = express();

app.disable("x-powered-by");

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    config.frontendOrigin
  );

  res.setHeader(
    "Access-Control-Allow-Credentials",
    "true"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// --------------------------------------------------
// BODY PARSER
// --------------------------------------------------

app.use(express.json({ limit: "1mb" }));

// --------------------------------------------------
// HEALTH
// --------------------------------------------------

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hackflow-judging-backend",
  });
});

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

app.use("/api/auth", authRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api/judge", judgeRoutes);

app.use("/api/organizer", organizerRoutes);

app.use("/api/export.csv", exportRoutes);

app.use("/projects", projectRoutes);

// --------------------------------------------------
// ERROR HANDLING
// --------------------------------------------------

app.use(notFound);

app.use(errorHandler);