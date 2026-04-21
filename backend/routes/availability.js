const express = require("express");
const router = express.Router();
const db = require("../db/db");

// ================= AJOUTER DISPONIBILITÉ ================= //
router.post("/", (req, res) => {
  const { doctor_id, date, start_time, end_time } = req.body;

  if (!doctor_id || !date || !start_time || !end_time) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  // Vérifier chevauchement
  const conflictSQL = `
    SELECT * FROM availability
    WHERE doctor_id = ?
    AND date = ?
    AND (
      (start_time < ? AND end_time > ?)
      OR (start_time < ? AND end_time > ?)
      OR (start_time >= ? AND end_time <= ?)
    )
  `;

  db.query(conflictSQL, [
    doctor_id, date,
    end_time, start_time,
    end_time, start_time,
    start_time, end_time
  ], (err, conflicts) => {
    if (err) return res.status(500).json({ message: "Erreur serveur: " + err.message });

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Ce créneau chevauche une disponibilité existante" });
    }

    const sql = `INSERT INTO availability (doctor_id, date, start_time, end_time) VALUES (?, ?, ?, ?)`;

    db.query(sql, [doctor_id, date, start_time, end_time], (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur: " + err.message });
      res.status(201).json({ message: "Disponibilité ajoutée avec succès", id: result.insertId });
    });
  });
});

// ================= TOUTES LES DISPONIBILITÉS (futures) ================= //
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      availability.id,
      availability.date,
      availability.start_time,
      availability.end_time,
      availability.doctor_id,
      users.nom,
      users.prenom,
      doctors.specialite
    FROM availability
    JOIN doctors ON availability.doctor_id = doctors.id
    JOIN users ON doctors.user_id = users.id
    WHERE availability.date >= CURDATE()
    ORDER BY availability.date ASC, availability.start_time ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur: " + err.message });
    res.json(result);
  });
});

// ================= DISPONIBILITÉS PAR MÉDECIN (futures) ================= //
router.get("/:doctor_id", (req, res) => {
  const doctor_id = req.params.doctor_id;

  const sql = `
    SELECT 
      availability.id,
      availability.date,
      availability.start_time,
      availability.end_time,
      users.nom,
      users.prenom,
      doctors.specialite
    FROM availability
    JOIN doctors ON availability.doctor_id = doctors.id
    JOIN users ON doctors.user_id = users.id
    WHERE availability.doctor_id = ?
    AND availability.date >= CURDATE()
    ORDER BY availability.date ASC, availability.start_time ASC
  `;

  db.query(sql, [doctor_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur: " + err.message });
    res.json(result);
  });
});

module.exports = router;