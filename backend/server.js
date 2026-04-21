const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'medplan_db'
});

db.connect((err) => {
  if (err) console.error("Erreur BD:", err);
  else console.log("Connecté à MySQL !");
});

// ================= ROUTES ================= //

const authRoutes         = require('./routes/auth');
const appointmentsRoutes = require('./routes/appointments');
const availabilityRoutes = require('./routes/availability');
const planningRoutes     = require('./routes/planning');

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/planning', planningRoutes);
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});
// Get doctors
app.get('/api/doctors', (req, res) => {
  const sql = `
    SELECT doctors.id, users.nom, users.prenom, doctors.specialite
    FROM doctors
    JOIN users ON doctors.user_id = users.id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(result);
  });
});

// Add availability
app.post('/api/availability', (req, res) => {
  const { doctor_id, date, start_time, end_time } = req.body;

  if (!doctor_id || !date || !start_time || !end_time) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  const sql = `INSERT INTO availability (doctor_id, date, start_time, end_time) VALUES (?, ?, ?, ?)`;
  db.query(sql, [doctor_id, date, start_time, end_time], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json({ message: "Disponibilité ajoutée avec succès", id: result.insertId });
  });
});

// Get availability by doctor
app.get('/api/availability/:id', (req, res) => {
  const sql = `SELECT * FROM availability WHERE doctor_id = ? ORDER BY date, start_time ASC`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(result || []);
  });
});

// ================= SERVER ================= //

app.listen(3000, () => console.log("Server running on http://localhost:3000"));