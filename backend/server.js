

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'medplan_db'
});

db.connect((err) => {
  if (err) {
    console.log("Erreur BD", err);
  } else {
    console.log("Connecté à MySQL !");
  }
});

// Import your auth routes
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");

// Mount the routes - THIS IS THE KEY STEP
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

app.post('/register', (req, res) => {
  const { nom, prenom, email, password, role } = req.body;

  const sql = `INSERT INTO users (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [nom, prenom, email, password, role], (err, result) => {
    if (err) {
      return res.send("Erreur insertion");
    }
    res.send("Utilisateur ajouté !");
  });
});


app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
app.get('/doctors', (req, res) => {
  const sql = `
    SELECT doctors.id, users.nom, users.prenom, doctors.specialite
    FROM doctors
    JOIN users ON doctors.user_id = users.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});
app.get('/availability/:id', (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM availability WHERE doctor_id = ?",
    [id],
    (err, result) => {
      if (err) return res.send(err);
      res.json(result);
    }
  );
});
/*function showAvailability(id){
  fetch(`http://localhost:3000/availability/${id}`)
  .then(res => res.json())
  .then(data => alert(JSON.stringify(data)));
}*/
app.get('/availability/:id', (req, res) => {
  const id = req.params.id;

  // Your availability table has a 'date' column
  db.query(
    "SELECT * FROM availability WHERE doctor_id = ? AND date > NOW()",
    [id],
    (err, result) => {
      if (err) {
        console.log("Availability error:", err);
        return res.status(500).json({ message: "Erreur serveur", error: err.message });
      }
      res.json(result);
    }
  );
});
