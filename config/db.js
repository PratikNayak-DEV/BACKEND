require('dotenv').config();
const mongoose = require("mongoose");

function connectDB() {
  //Database connection
   mongoose
     .connect(process.env.MONGO_CONNECTION_STRING)
     .then(() => console.log("DB connected."))
     .catch((err) => console.log("Connection Failed.", err));

}

module.exports = connectDB;