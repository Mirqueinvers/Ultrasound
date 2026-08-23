import express from "express";
import cors from "cors";
import { config } from "./config.js";
import authRouter from "./routes/auth.js";
import patientsRouter from "./routes/patients.js";
import researchesRouter from "./routes/researches.js";
import journalRouter from "./routes/journal.js";
import protocolRouter from "./routes/protocol.js";
import statisticsRouter from "./routes/statistics.js";
import medisonRouter from "./routes/medison.js";
import appointmentsRouter from "./routes/appointments.js";
import doctorsRouter from "./routes/doctors.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check (без авторизации)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth: register/login открыты, остальные — через authMiddleware внутри роута
app.use("/api/auth", authRouter);

// JWT-защита всех остальных маршрутов /api
app.use("/api", authMiddleware);

app.use("/api/patients", patientsRouter);
app.use("/api/researches", researchesRouter);
app.use("/api/journal", journalRouter);
app.use("/api/researches", protocolRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/medison-mappings", medisonRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/doctors", doctorsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🩺 Ultrasound API server running on http://localhost:${config.port}`);
});