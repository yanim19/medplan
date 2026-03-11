const express = require('express');
const router = express.Router();

// ajouter disponibilité
router.post('/', (req, res) => {
  res.json({ message: "Créneau ajouté" });
});

// modifier
router.put('/', (req, res) => {
  res.json({ message: "Créneau modifié" });
});

// supprimer
router.delete('/', (req, res) => {
  res.json({ message: "Créneau supprimé" });
});

module.exports = router;