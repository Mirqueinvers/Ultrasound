"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const validation_1 = require("../validation");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    const date = req.query.date;
    if (!date) {
        res.status(400).json({ error: "date parameter is required" });
        return;
    }
    const appointments = (0, db_1.getAppointmentsByDate)(date);
    res.json(appointments);
});
router.post("/", (req, res) => {
    const errors = (0, validation_1.validateCreateAppointment)(req.body);
    if (errors.length > 0) {
        res.status(400).json((0, validation_1.formatValidationErrors)(errors));
        return;
    }
    const { lastName, firstName, middleName, dateOfBirth, appointmentDate, studies, department } = req.body;
    const appointment = (0, db_1.createAppointment)({
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName || "",
        date_of_birth: dateOfBirth,
        department: department || "",
    }, appointmentDate, studies);
    res.status(201).json(appointment);
});
router.put("/:id", (req, res) => {
    const errors = (0, validation_1.validateUpdateAppointment)(req.body);
    if (errors.length > 0) {
        res.status(400).json((0, validation_1.formatValidationErrors)(errors));
        return;
    }
    const id = parseInt(req.params.id, 10);
    const { studies, lastName, firstName, middleName, dateOfBirth } = req.body;
    const patientData = {};
    if (lastName !== undefined)
        patientData.last_name = lastName;
    if (firstName !== undefined)
        patientData.first_name = firstName;
    if (middleName !== undefined)
        patientData.middle_name = middleName;
    if (dateOfBirth !== undefined)
        patientData.date_of_birth = dateOfBirth;
    const hasPatientData = Object.keys(patientData).length > 0;
    const appointment = (0, db_1.updateAppointment)(id, studies, hasPatientData ? patientData : undefined);
    if (!appointment) {
        res.status(404).json({ error: "Appointment not found" });
        return;
    }
    res.json(appointment);
});
router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const deleted = (0, db_1.deleteAppointment)(id);
    if (!deleted) {
        res.status(404).json({ error: "Appointment not found" });
        return;
    }
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=appointments.js.map