import express from "express";
import type { NextFunction, Request, Response } from "express";
import { initDb } from "./db";
import { corsMiddleware } from "./api/middleware/cors";
import { apiConfig } from "./api/config";
import appointmentsRouter from "./api/routes/appointments";
import doctorsRouter from "./api/routes/doctors";

export async function startApiServer() {
  // Этап 3.2: initDb больше не создаёт локальную БД sql.js — настраивает
  // адрес центрального API и входит сервисной учёткой регистратуры.
  await initDb();

  const app = express();
  app.use(express.json());
  app.use(corsMiddleware);

  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/doctors", doctorsRouter);

  // Express 5 пробрасывает ошибки из async-обработчиков сюда.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Registry API error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: message });
  });

  app.listen(apiConfig.port, apiConfig.host, () => {
    console.log(`Registry API server running on http://${apiConfig.host}:${apiConfig.port}`);
  });
}
