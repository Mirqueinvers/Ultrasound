import express from "express";
import { initDb } from "./db";
import { corsMiddleware } from "./api/middleware/cors";
import { apiConfig } from "./api/config";
import appointmentsRouter from "./api/routes/appointments";
import doctorsRouter from "./api/routes/doctors";

export async function startApiServer() {
  await initDb();

  const app = express();
  app.use(express.json());
  app.use(corsMiddleware);

  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/doctors", doctorsRouter);

  app.listen(apiConfig.port, apiConfig.host, () => {
    console.log(`Registry API server running on http://${apiConfig.host}:${apiConfig.port}`);
  });
}