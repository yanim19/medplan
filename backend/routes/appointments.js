const express = require("express");
const router = express.Router();
const db = require("../db/db");


// Voir tous les rendez-vous
router.get("/", (req, res) => {

  const sql = `
    SELECT appointments.*, users.name AS patient, doctors.speciality
    FROM appointments
    JOIN users ON appointments.patient_id = users.id
    JOIN doctors ON appointments.doctor_id = doctors.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });

});


// Créer un rendez-vous
router.post("/create", (req, res) => {

  const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

  const sql = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [patient_id, doctor_id, appointment_date, appointment_time], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json({ message: "Rendez-vous créé avec succès" });

  });

});


// Annuler un rendez-vous
router.delete("/:id", (req, res) => {

  const id = req.params.id;

  const sql = "DELETE FROM appointments WHERE id = ?";

  db.query(sql, [id], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json({ message: "Rendez-vous supprimé" });

  });

});

module.exports = router;