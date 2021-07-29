const express = require("express");
const fs = require("fs");
const Download = require("./Download_Bridge");

const app = express.Router();

// Home
app.get("/", async (req, res) => {});


// Export Express app
module.exports = app;
