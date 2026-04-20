const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Voir tous les rendez-vous
router.get("/", (req, res) => {
  const sql = `
    SELECT appointments.*, 
           CONCAT(users.nom, ' ', users.prenom) AS patient_name,
           doctors.specialite
    FROM appointments
    JOIN users ON appointments.patient_id = users.id
    JOIN doctors ON appointments.doctor_id = doctors.id
    ORDER BY appointments.date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("GET Error:", err);
      return res.status(500).json([]);
    }
    res.json(result || []);
  });
});

// Créer un rendez-vous
router.post("/", (req, res) => {
  console.log("=== NEW APPOINTMENT REQUEST ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  
  const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;
  
  // Validation
  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    console.log("Missing fields");
    return res.status(400).json({ 
      message: "Champs manquants. Veuillez fournir: patient_id, doctor_id, appointment_date, appointment_time" 
    });
  }
  
  // Create datetime string
  const datetime = `${appointment_date} ${appointment_time}:00`;
  console.log(`Creating appointment: patient=${patient_id}, doctor=${doctor_id}, datetime=${datetime}`);
  
  const sql = "INSERT INTO appointments (patient_id, doctor_id, date, status) VALUES (?, ?, ?, 'confirmé')";
  
  db.query(sql, [patient_id, doctor_id, datetime], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          message: "Patient ou médecin n'existe pas. Patient ID: " + patient_id + ", Doctor ID: " + doctor_id 
        });
      }
      
      return res.status(500).json({ 
        message: "Erreur serveur: " + err.message,
        code: err.code
      });
    }
    
    console.log("✅ Appointment created! ID:", result.insertId);
    res.json({ 
      message: "Rendez-vous créé avec succès",
      id: result.insertId 
    });
  });
});

// Annuler un rendez-vous (PUT - pour update le statut)
router.put("/cancel/:id", (req, res) => {
  const id = req.params.id;
  console.log("Cancelling appointment ID:", id);
  
  const sql = "UPDATE appointments SET status = 'annulé' WHERE id = ? AND status = 'confirmé'";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Cancel Error:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé ou déjà annulé" });
    }
    
    res.json({ message: "Rendez-vous annulé avec succès" });
  });
});

// Supprimer définitivement un rendez-vous (DELETE)
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  console.log("Deleting appointment ID:", id);
  
  const sql = "DELETE FROM appointments WHERE id = ? AND status = 'annulé'";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete Error:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé ou non annulé" });
    }
    
    res.json({ message: "Rendez-vous supprimé définitivement" });
  });
});

module.exports = router;