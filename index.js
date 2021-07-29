#!/usr/bin/env node
const express = require("express");
const app = express();
const http_server = require("http").createServer(app);
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ansi_to_html = require("ansi-to-html");

// Colors
const ConvertAnsiHtml = new ansi_to_html()

// Backend
const Backend = require("./src/Backend");

// Socket.io
const io = new Server(http_server);

// Body Parse Middlerware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Send Log
function sendlog(data = ""){
	data = data.split(/\n|\r/gi).filter(a=>a).forEach(data => {
        io.emit("Log", ConvertAnsiHtml.toHtml(data));
    });
}

io.on("connection", (socket) => {
    const Logfile = path.resolve(os.tmpdir(), "bdsBridgeLog.log");
    console.log(`Socket.io ID: ${socket.id}`);
    if (fs.existsSync(Logfile)) {
        fs.readFileSync(Logfile, "utf8").split(/\n|\r/gi).forEach(data => {
            socket.send("Log", ConvertAnsiHtml.toHtml(data));
        });
    }
    socket.on("disconnect", ()=>{
        console.log(`User disconnected ${socket.id}`);
    })
});

// Routers
app.use("/", express.static("./src/pages"));

// API
app.post("/api/start", (req, res) => {
    const { Platform, Server, Port } = req.body;
	const Start = Backend.StartBridge(Platform, Server, Port);
    Start.log(sendlog)
    return res.send("OK");
});

app.post("/api/download", async (req, res) => {
    try {
        const { Platform, Variant } = req.body;
        const Download = await Backend.DownloadPlatform(Platform, Variant)
        return res.send(Download);
    } catch (e) {
        return res.send(e);
    }
});

// Listen Server
const Bridge_Port = process.env.PORT || 3000
http_server.listen(Bridge_Port, () => {console.log(`Bridge UI, listening on *:${Bridge_Port}`)});