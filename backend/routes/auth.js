const express = require("express");
const router = express.Router();
const db = require("../db/db");

// inscription
router.post("/register", (req, res) => {
  
  console.log(req.body);

  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name,email,password) VALUES (?,?,?)";

  db.query(sql, [name,email,password], (err,result)=>{
    if(err){
      return res.status(500).json(err);
    }

    res.json({message:"Utilisateur créé"});
  });

});

module.exports = router;

//LOGIN
router.post("/login", (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ message: "Champs manquants" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.length === 0) {
      return res.json({ message: "Utilisateur non trouvé" });
    }

    const user = result[0];

    if (user.password !== password) {
      return res.json({ message: "Mot de passe incorrect" });
    }

    res.json({ message: "Connexion réussie", user });

  });

});