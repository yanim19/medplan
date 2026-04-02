const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

/* 🔗 Connexion BD */
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'medplan_db'
});

db.connect((err) => {
  if (err) {
    console.log("Erreur BD :", err);
  } else {
    console.log("Connecté à MySQL !");
  }
});

/* 🧪 route test */
app.get('/', (req, res) => {
  res.send("Serveur MedPlan fonctionne !");
});

/* ===================== */
/* 🔐 AUTHENTIFICATION */
/* ===================== */

/* 🔹 REGISTER */
/* 🔹 REGISTER */
app.post('/register', (req, res) => {
  const { nom, prenom, email, password, role } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.json({
      success: false,
      message: "Champs manquants"
    });
  }

  const sql = `
    INSERT INTO users (nom, prenom, email, password, role)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [nom, prenom, email, password, role], (err) => {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Email déjà utilisé ou erreur BD"
      });
    }

    res.json({
      success: true,
      message: "Inscription réussie !"
    });
  });
});


/* 🔹 LOGIN */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT * FROM users
    WHERE email = ? AND password = ?
  `;

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      return res.json({
        success: false,
        message: "Erreur serveur"
      });
    }

    if (result.length === 0) {
      return res.json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    const user = result[0];

    res.json({
      success: true,
      message: "Connexion réussie",
      role: user.role,
      user: user
    });
  });
});


app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
