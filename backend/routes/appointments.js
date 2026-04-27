const express = require("express");
const router = express.Router();
const db = require("../db/db");

// ================= VOIR TOUS LES RDV ================= //
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      appointments.id,
      appointments.date,
      appointments.status,
      appointments.patient_id,
      appointments.doctor_id,
      CONCAT(patients.nom, ' ', patients.prenom) AS patient_name,
      CONCAT(doctors_users.nom, ' ', doctors_users.prenom) AS doctor_name,
      doctors.specialite
    FROM appointments
    JOIN users AS patients ON appointments.patient_id = patients.id
    JOIN doctors ON appointments.doctor_id = doctors.id
    JOIN users AS doctors_users ON doctors.user_id = doctors_users.id
    ORDER BY appointments.date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("GET Error:", err.message);
      return res.status(500).json({ message: err.message });
    }
    res.json(result || []);
  });
});

// ================= CRÉER UN RDV ================= //
router.post("/", (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  // ✅ Combine date + time en un seul datetime
  const datetime = `${appointment_date} ${appointment_time}:00`;

  // ✅ Vérifier conflit — même médecin même datetime
  const conflictSQL = `
    SELECT * FROM appointments
    WHERE doctor_id = ? AND date = ?
  `;

  db.query(conflictSQL, [doctor_id, datetime], (err, conflicts) => {
    if (err) return res.status(500).json({ message: "Erreur serveur: " + err.message });

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Ce créneau est déjà réservé" });
    }

    // ✅ Insérer le RDV
    const sql = `
      INSERT INTO appointments (patient_id, doctor_id, date, status)
      VALUES (?, ?, ?, 'confirmé')
    `;

    db.query(sql, [patient_id, doctor_id, datetime], (err, result) => {
      if (err) {
        console.error("Database Error:", err.message);
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ message: "Patient ou médecin n'existe pas" });
        }
        return res.status(500).json({ message: "Erreur serveur: " + err.message });
      }

      res.status(201).json({ message: "Rendez-vous créé avec succès", id: result.insertId });
    });
  });
});

// ================= ANNULER UN RDV ================= //
router.put("/cancel/:id", (req, res) => {
  const sql = "UPDATE appointments SET status = 'annulé' WHERE id = ? AND status = 'confirmé'";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé ou déjà annulé" });
    }

    res.json({ message: "Rendez-vous annulé avec succès" });
  });
});

// ================= SUPPRIMER UN RDV ================= //
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM appointments WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    res.json({ message: "Rendez-vous supprimé" });
  });
});

module.exports = router;