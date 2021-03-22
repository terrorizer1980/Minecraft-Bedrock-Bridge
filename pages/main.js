const { exec } = require("child_process")
const { resolve, join } = require("path")
const { existsSync, mkdirSync, writeFileSync, readFileSync, createWriteStream, chmodSync } = require("fs")
const { platform, arch, env } = process
// -----------------------------------------------------
function get_radom_port(){
    const port_randed = Math.trunc(Math.random() * 10000 * (Math.random() / 0.15))
    if (port_randed > 65530) return get_radom_port()
    else if (port_randed < 1025) return get_radom_port()
    else return port_randed
}
var phantom_config = {
    version: "v0.5.2",
    server: "pe.hypixel.net",
    bind_port: get_radom_port(),
    port: 19132
}
const phantom_path = resolve((env.HOME||env.USERPROFILE), "phantom");if (!(existsSync(phantom_path))) mkdirSync(phantom_path)
const json_config = join(phantom_path, "phantom.json");if (existsSync(json_config)) phantom_config = JSON.parse(readFileSync(json_config, "utf8")); else writeFileSync(json_config, JSON.stringify(phantom_config, null, 2))
var bin_file;if (platform === "win32") bin_file = "phantom.exe"; else bin_file = "phantom";const bin_save = join(phantom_path, bin_file)

function download(){
    fetch("https://api.github.com/repos/jhead/phantom/releases").then(response => response.json()).then(response => {
        const pdtag = response[0].tag_name;
        console.log(`Phantom tag version: ${phantom_config.version}`)
        if (phantom_config.version !== pdtag){
            phantom_config.version = pdtag
            writeFileSync(json_config, JSON.stringify(phantom_config, null, 2))
            var url_download;
            if (platform === "linux") {
                if (arch === "x64") url_download = `https://github.com/jhead/phantom/releases/download/${pdtag}/phantom-linux`
                else if (arch === "arm64") url_download = `https://github.com/jhead/phantom/releases/download/${pdtag}/phantom-linux-arm8`
                else {alert("Please select the compatible file for your architecture.");open("https://github.com/jhead/phantom/releases")}
            } else if (platform === "win32") {
                if (arch === "x64") url_download = `https://github.com/jhead/phantom/releases/download/${pdtag}/phantom-windows.exe`
                else if (arch === "x86") url_download = `https://github.com/jhead/phantom/releases/download/${pdtag}/phantom-windows-32bit.exe`
                else {alert("Architecting not compatible with our program");open("https://github.com/jhead/phantom/releases")}
            } else if (platform === "darwin") url_download = `https://github.com/jhead/phantom/releases/download/${pdtag}/phantom-macos`
            else alert("Platform not compatible")
            console.log(pdtag + " :/: " + url_download);
            fetch(url_download).then(response => response.arrayBuffer()).then(response => Buffer.from(response)).then(response => {
                console.log("Download Sucess")
                writeFileSync(bin_save, response, "binary")
                chmodSync(bin_save, "775")
                console.log("Save sucess")
            })
        }
    })
}
download()
const status = document.getElementById("status").classList
function run(){
    if (global.phantom_run === undefined){
        global.phantom_run = exec(`${bin_save} --server ${phantom_config.server}:${phantom_config.port} --bind_port ${phantom_config.bind_port} --timeout 30`)
        phantom_run.stdout.pipe(createWriteStream(join(phantom_path, "latest.log"), {flags: "w"}))
        phantom_run.stdout.on("data", function (data){
            console.log(data);
            document.getElementById("console_log").innerHTML += data.split("\n").join("<br>")
            .split("[90m").join("")
            .split("[0m [32m").join("")
            .split("[0m ").join("")
            .split("[31m").join("")
            .replaceAll("", " ")
            
            // Erros detect
            if (data.includes("bind: permission denied")) {
                status.add("error")
                status.remove("sucess")
                status.remove("wait")
                status.remove("stoped")
            } else if (data.includes("Server seems to be offline")) {
                status.add("error")
                status.remove("sucess")
                status.remove("wait")
                status.remove("stoped")
            } else {
                status.remove("error")
                status.add("sucess")
                status.remove("wait")
                status.remove("stoped")
            }
        })
    } else {
        if (confirm("The phantom is running, do you want it?")) {
            phantom_run.kill()
            if (phantom_run.killed) {
                alert("Successfully stopped");
                global.phantom_run = undefined
                status.remove("error")
                status.remove("sucess")
                status.remove("wait")
                status.add("stoped")
            } else alert("We had an error for the server")
        } else alert("The phantom was not stopped, continuing")
    }
}

document.getElementById("server_url").value = phantom_config.server
function update_url(){
    const server = document.getElementById("server_url").value
    const phantom_config = JSON.parse(readFileSync(json_config, "utf8"));
    phantom_config.server = server
    writeFileSync(json_config, JSON.stringify(phantom_config, null, 2))
}

document.getElementById("server_port").value = phantom_config.port
function update_port(){
    const server_port = document.getElementById("server_port").value
    console.log(server_port);
    const phantom_config = JSON.parse(readFileSync(json_config, "utf8"));
    phantom_config.port = server_port
    writeFileSync(json_config, JSON.stringify(phantom_config, null, 2))
}

function showLog(){
    const logDiv = document.getElementById("console_log_div")
    const buttom = document.getElementById("buttomlog")
    if (logDiv.style.display === "none") {
        logDiv.style.display = "block"
        buttom.innerHTML = "hide the Phantom logs"
    }
    else {
        logDiv.style.display = "none"
        buttom.innerHTML = "Show the phantom logs"
    }
}