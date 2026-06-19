import { Router } from "express";
import {
  getAppointmentsByDate,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../db";
import {
  validateCreateAppointment,
  validateUpdateAppointment,
  formatValidationErrors,
} from "../validation";

const router = Router();

router.get("/", (req, res) => {
  const date = req.query.date as string;
  if (!date) {
    res.status(400).json({ error: "date parameter is required" });
    return;
  }
  const appointments = getAppointmentsByDate(date);
  res.json(appointments);
});

router.post("/", (req, res) => {
  const errors = validateCreateAppointment(req.body);
  if (errors.length > 0) {
    res.status(400).json(formatValidationErrors(errors));
    return;
  }

  const { lastName, firstName, middleName, dateOfBirth, appointmentDate, studies, department } = req.body;

  const appointment = createAppointment(
    {
      last_name: lastName,
      first_name: firstName,
      middle_name: middleName || "",
      date_of_birth: dateOfBirth,
      department: department || "",
    },
    appointmentDate,
    studies
  );

  res.status(201).json(appointment);
});

router.put("/:id", (req, res) => {
  const errors = validateUpdateAppointment(req.body);
  if (errors.length > 0) {
    res.status(400).json(formatValidationErrors(errors));
    return;
  }

  const id = parseInt(req.params.id, 10);
  const { studies, lastName, firstName, middleName, dateOfBirth } = req.body;

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

router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const deleted = deleteAppointment(id);

  if (!deleted) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.json({ success: true });
});

export default router;