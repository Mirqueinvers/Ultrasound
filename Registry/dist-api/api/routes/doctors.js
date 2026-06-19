"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const validation_1 = require("../validation");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    const doctors = (0, db_1.getDoctors)();
    res.json(doctors);
});
router.post("/", (req, res) => {
    const errors = (0, validation_1.validateCreateDoctor)(req.body);
    if (errors.length > 0) {
        res.status(400).json((0, validation_1.formatValidationErrors)(errors));
        return;
    }
    const { name, maxPatientsPerDay, workDays } = req.body;
    const doctor = (0, db_1.createDoctor)(name, maxPatientsPerDay || 15, workDays || [1, 2, 3, 4, 5]);
    res.status(201).json(doctor);
});
router.put("/:id", (req, res) => {
    const errors = (0, validation_1.validateCreateDoctor)(req.body);
    if (errors.length > 0) {
        res.status(400).json((0, validation_1.formatValidationErrors)(errors));
        return;
    }
    const id = parseInt(req.params.id, 10);
    const { name, maxPatientsPerDay, workDays } = req.body;
    const doctor = (0, db_1.updateDoctor)(id, name, maxPatientsPerDay || 15, workDays || [1, 2, 3, 4, 5]);
    if (!doctor) {
        res.status(404).json({ error: "Doctor not found" });
        return;
    }
    res.json(doctor);
});
router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const deleted = (0, db_1.deleteDoctor)(id);
    if (!deleted) {
        res.status(404).json({ error: "Doctor not found" });
        return;
    }
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=doctors.js.map