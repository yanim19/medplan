const express = require('express');
const app = express();

app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/appointments', require('./routes/appointments'));
app.use('/planning', require('./routes/planning'));

app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});