const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.post("/add",(req,res)=>{

 const {doctor_id,date,start_time,end_time} = req.body;

 const sql = `
 INSERT INTO availability (doctor_id,date,start_time,end_time)
 VALUES (?,?,?,?)
 `;

 db.query(sql,[doctor_id,date,start_time,end_time],(err,result)=>{
    if(err) return res.status(500).json(err);

    res.json({message:"Disponibilité ajoutée"});
 });

});

module.exports = router;