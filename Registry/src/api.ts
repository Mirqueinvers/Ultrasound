import express from "express";
import {
  initDb,
  getAppointmentsByDate,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "./db";

const PORT = 3456;

export function startApiServer() {
  initDb();

  const app = express();
  app.use(express.json());

  // CORS для запросов с десктопа
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (_req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Получить записи на дату
  app.get("/api/appointments", (req, res) => {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ error: "date parameter is required" });
      return;
    }
    const appointments = getAppointmentsByDate(date);
    res.json(appointments);
  });

  // Создать запись
  app.post("/api/appointments", (req, res) => {
    const { lastName, firstName, middleName, dateOfBirth, appointmentDate, studies, department } = req.body;

    if (!lastName || !firstName || !dateOfBirth || !appointmentDate || !studies) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const appointment = createAppointment(
      { last_name: lastName, first_name: firstName, middle_name: middleName || "", date_of_birth: dateOfBirth, department: department || "" },
      appointmentDate,
      studies
    );

    res.status(201).json(appointment);
  });

  // Обновить запись (исследования + данные пациента)
  app.put("/api/appointments/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { studies, lastName, firstName, middleName, dateOfBirth } = req.body;

    if (!studies) {
      res.status(400).json({ error: "studies field is required" });
      return;
    }

    const patientData: Record<string, string> = {};
    if (lastName !== undefined) patientData.last_name = lastName;
    if (firstName !== undefined) patientData.first_name = firstName;
    if (middleName !== undefined) patientData.middle_name = middleName;
    if (dateOfBirth !== undefined) patientData.date_of_birth = dateOfBirth;

    const hasPatientData = Object.keys(patientData).length > 0;

    const appointment = updateAppointment(id, studies, hasPatientData ? patientData : undefined);
    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json(appointment);
  });

  // Удалить запись
  app.delete("/api/appointments/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const deleted = deleteAppointment(id);

    if (!deleted) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({ success: true });
  });

  // Doctors CRUD
  app.get("/api/doctors", (_req, res) => {
    const doctors = getDoctors();
    res.json(doctors);
  });

  app.post("/api/doctors", (req, res) => {
    const { name, maxPatientsPerDay, workDays } = req.body;
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const doctor = createDoctor(name, maxPatientsPerDay || 15, workDays || [1,2,3,4,5]);
    res.status(201).json(doctor);
  });

  app.put("/api/doctors/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, maxPatientsPerDay, workDays } = req.body;
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const doctor = updateDoctor(id, name, maxPatientsPerDay || 15, workDays || [1,2,3,4,5]);
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    res.json(doctor);
  });

  app.delete("/api/doctors/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const deleted = deleteDoctor(id);
    if (!deleted) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    res.json({ success: true });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Registry API server running on http://0.0.0.0:${PORT}`);
  });
}
