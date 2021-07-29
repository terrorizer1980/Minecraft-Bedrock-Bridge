#!/usr/bin/env node
const express = require("express");
const app = express();
const http_server = require("http").createServer(app);
const { Server } = require("socket.io");

// Socket.io
const io = new Server(http_server);

// Body Parse Middlerware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Send Log
function sendlog(data = ""){
	data = data.split(/\n|\r/gi).filter(a=>a)
	io.emit("Log", data);
}

io.on("connection", (socket) => {
    console.log(`User Id Connected: ${socket.id}`);
    
    socket.on("disconnect", ()=>{
        console.log(`User disconnected ${socket.id}`);
    })
});

// Routers
app.use("/", express.static("./src/pages"));

// API
app.post("/api/start", (req, res) => {
	
})

// Listen Server
const Bridge_Port = process.env.PORT || 3000
http_server.listen(Bridge_Port, () => {console.log(`Bridge UI, listening on *:${Bridge_Port}`)});