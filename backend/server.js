const express = require("express");
const app = express();

app.use(express.json());

const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const planningRoutes = require("./routes/planning");

app.use("/api/auth",authRoutes);
app.use("/api/appointments",appointmentRoutes);
app.use("/api/planning",planningRoutes);

app.listen(3000,()=>{
 console.log("Server running");
});