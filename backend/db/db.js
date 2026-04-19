const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: '',
  database: "medplan_db",
});

db.connect((err) => {
  if (err) {
    console.error("Erreur connexion DB:", err);
  } else {
    console.log("Connecté à la base de données");
  }
});

module.exports = db;