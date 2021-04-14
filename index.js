#!/usr/bin/env node
const {app, BrowserWindow } = require("electron");
var fs = require("fs");
const { resolve } = require("path");

require("@electron/remote/main").initialize()
const load_pages = resolve(__dirname, "pages", "index.html")
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true"
function createWindow () {
  // Load Pages
    const win = new BrowserWindow({
        // Width
        minWidth: 500,
        maxWidth: 1000,
        // Height
        minHeight: 500,
        maxHeight: 1000,
        // Preferences
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
          sandbox: false,
          devTools: true,
          maximizable: false
        }
    });
    win.loadFile(load_pages);
    if (process.env.debug === "true") win.webContents.openDevTools()
}
app.whenReady().then(() => {createWindow();app.on("activate", function () {if (BrowserWindow.getAllWindows().length === 0) createWindow()})})
app.on("activate", () => {if (BrowserWindow.getAllWindows().length === 0) {createWindow()}});