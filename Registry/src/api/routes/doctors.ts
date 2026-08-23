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

router.get("/", async (_req, res) => {
  const doctors = await getDoctors();
  res.json(doctors);
});

router.post("/", async (req, res) => {
  const errors = validateCreateDoctor(req.body);
  if (errors.length > 0) {
    res.status(400).json(formatValidationErrors(errors));
    return;
  }

  const { name, maxPatientsPerDay, workDays } = req.body;
  const doctor = await createDoctor(name, maxPatientsPerDay || 15, workDays || [1, 2, 3, 4, 5]);
  res.status(201).json(doctor);
});

router.put("/:id", async (req, res) => {
  const errors = validateCreateDoctor(req.body);
  if (errors.length > 0) {
    res.status(400).json(formatValidationErrors(errors));
    return;
  }

  const id = req.params.id;
  const { name, maxPatientsPerDay, workDays } = req.body;
  const doctor = await updateDoctor(id, name, maxPatientsPerDay || 15, workDays || [1, 2, 3, 4, 5]);

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(doctor);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const deleted = await deleteDoctor(id);

  if (!deleted) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
