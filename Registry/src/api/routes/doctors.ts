import { Router } from "express";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../db";
import {
  validateCreateDoctor,
  formatValidationErrors,
} from "../validation";

const router = Router();

router.get("/", (_req, res) => {
  const doctors = getDoctors();
  res.json(doctors);
});

router.post("/", (req, res) => {
  const errors = validateCreateDoctor(req.body);
  if (errors.length > 0) {
    res.status(400).json(formatValidationErrors(errors));
    return;
  }

  const { name, maxPatientsPerDay, workDays } = req.body;
  const doctor = createDoctor(name, maxPatientsPerDay || 15, workDays || [1, 2, 3, 4, 5]);
  res.status(201).json(doctor);
});

router.put("/:id", (req, res) => {
  const errors = validateCreateDoctor(req.body);
  if (errors.length > 0) {
    res.status(400).json(formatValidationErrors(errors));
    return;
  }

  const id = parseInt(req.params.id, 10);
  const { name, maxPatientsPerDay, workDays } = req.body;
  const doctor = updateDoctor(id, name, maxPatientsPerDay || 15, workDays || [1, 2, 3, 4, 5]);

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(doctor);
});

router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const deleted = deleteDoctor(id);

  if (!deleted) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json({ success: true });
});

export default router;