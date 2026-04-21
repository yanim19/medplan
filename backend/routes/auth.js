const express = require("express");
const router = express.Router();
const db = require("../db/db");
const bcrypt = require("bcrypt");

// ================= REGISTER ================= //

router.post("/register", async (req, res) => {
  const { nom, prenom, email, password, role } = req.body;

  if (!nom || !prenom || !email || !password || !role) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (results.length > 0) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `INSERT INTO users (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)`;

      db.query(sql, [nom, prenom, email, hashedPassword, role], (err) => {
        if (err) return res.status(500).json({ message: "Erreur lors de la création" });
        res.status(201).json({ message: "Compte créé avec succès !" });
      });

    } catch (err) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
});

// ================= LOGIN ================= //

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (results.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      res.json({
        message: "Connexion réussie",
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        },
      });

    } catch (err) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
});

module.exports = router;