const express = require("express");
const router = express.Router();
const db = require("../db/db");

// ================= CRÉER UN RDV (avec vérification conflit) ================= //
router.post("/", (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  // 1. Vérifier que le créneau existe dans les disponibilités
  const availabilitySQL = `
    SELECT * FROM availability
    WHERE doctor_id = ?
    AND date = ?
    AND start_time <= ?
    AND end_time >= ?
  `;

  db.query(availabilitySQL, [doctor_id, appointment_date, appointment_time, appointment_time], (err, slots) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (slots.length === 0) {
      return res.status(400).json({ message: "Ce créneau n'est pas disponible pour ce médecin" });
    }

    // 2. Vérifier qu'aucun autre RDV existe au même moment
    const conflictSQL = `
      SELECT * FROM appointments
      WHERE doctor_id = ?
      AND appointment_date = ?
      AND appointment_time = ?
    `;

    db.query(conflictSQL, [doctor_id, appointment_date, appointment_time], (err, conflicts) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });

      if (conflicts.length > 0) {
        return res.status(409).json({ message: "Ce créneau est déjà réservé" });
      }

      // 3. Insérer le RDV
      const sql = `
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
        VALUES (?, ?, ?, ?, 'pending')
      `;

      db.query(sql, [patient_id, doctor_id, appointment_date, appointment_time], (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur serveur: " + err.message });
        res.status(201).json({ message: "Rendez-vous créé avec succès", id: result.insertId });
      });
    });
  });
});

// ================= VOIR TOUS LES RDV ================= //
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      appointments.id,
      appointments.appointment_date,
      appointments.appointment_time,
      appointments.status,
      patients.nom AS patient_nom,
      patients.prenom AS patient_prenom,
      doctors.nom AS doctor_nom,
      doctors.prenom AS doctor_prenom
    FROM appointments
    JOIN users AS patients ON appointments.patient_id = patients.id
    JOIN doctors ON appointments.doctor_id = doctors.id
    JOIN users AS doctors ON doctors.user_id = doctors.id
    ORDER BY appointments.appointment_date ASC, appointments.appointment_time ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur: " + err.message });
    res.json(result);
  });
});

module.exports = router;