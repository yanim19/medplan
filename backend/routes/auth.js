const express = require('express');
const router = express.Router();

// inscription
router.post('/register', (req, res) => {
  const { email, password, role } = req.body;

  // ici normalement on enregistre dans la BD
  if (!email || !password) {
    return res.status(400).json({ message: "Données invalides" });
  }

  res.json({ message: "Utilisateur créé avec succès" });
});

// connexion
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // normalement vérifier dans BD
  if (email === "test@test.com" && password === "123") {
    return res.json({ message: "Connexion réussie", role: "patient" });
  }

  res.status(401).json({ message: "Email ou mot de passe incorrect" });
});

module.exports = router;