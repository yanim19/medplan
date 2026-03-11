const express = require('express');
const router = express.Router();

// voir les créneaux
router.get('/', (req, res) => {
  res.json([
    { doctor: "Dr Ali", date: "10/02/2026 10:00" },
    { doctor: "Dr Sana", date: "10/02/2026 14:00" }
  ]);
});

// réserver
router.post('/', (req, res) => {
  const { doctor, date } = req.body;

  // normalement vérifier si dispo
  res.json({ message: "Rendez-vous confirmé" });
});

// annuler
router.delete('/', (req, res) => {
  res.json({ message: "Rendez-vous annulé" });
});

module.exports = router;