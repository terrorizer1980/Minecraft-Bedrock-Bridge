const { exec } = require("child_process")
const { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, chmodSync } = require("fs")
const { resolve, join } = require("path")
const yml = require("yaml")
const { Z_BLOCK } = require("zlib")
const Package_Json = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8"))
const BridgeConfigHome = resolve((process.env.USERPROFILE||process.env.HOME), "BdsBridge")
if(!(existsSync(BridgeConfigHome))) mkdirSync(BridgeConfigHome)
// 'arm', 'arm64', 'ia32', 'mips','mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'
const VersionFile = {
    "gayser": {
        "oficial": "https://ci.opencollab.dev//job/GeyserMC/job/Geyser/job/master/lastSuccessfulBuild/artifact/bootstrap/standalone/target/Geyser.jar",
        "sponge": "https://ci.opencollab.dev//job/GeyserMC/job/Geyser/job/master/lastSuccessfulBuild/artifact/bootstrap/sponge/target/Geyser-Sponge.jar",
        "spigot": "https://ci.opencollab.dev//job/GeyserMC/job/Geyser/job/master/lastSuccessfulBuild/artifact/bootstrap/spigot/target/Geyser-Spigot.jar"
    },
    "phantom": {
        "win32": {
            "ia32": "https://github.com/jhead/phantom/releases/download/${{VERSION}}/phantom-windows-32bit.exe",
            "x64": "https://github.com/jhead/phantom/releases/download/${{VERSION}}/phantom-windows.exe"
        },
        "linux": {
            "ia32": null,
            "x64": "https://github.com/jhead/phantom/releases/download/${{VERSION}}/phantom-linux",
            "aarch64": "https://github.com/jhead/phantom/releases/download/${{VERSION}}/phantom-linux-arm8"
        },
        "darwin":{
            "ia32": null,
            "x64": "https://github.com/jhead/phantom/releases/download/${{VERSION}}/phantom-macos",
            "aarch64": "https://github.com/jhead/phantom/releases/download/${{VERSION}}/phantom-macos"
        }
    }
}

function PrepareConfig(){
    const configFile = join(BridgeConfigHome, "BdsConfig.json");
    const config = {
        "version": Package_Json.version,
        "bridge": "phantom",
        "url": "minecraft.shs23.org",
        "port": 1841
    }
    writeFileSync(configFile, JSON.stringify(config, null, 4))
    return config
}
const configFile = join(BridgeConfigHome, "config.json");
var config;
if (existsSync(configFile)) config = JSON.parse(readFileSync(configFile, "utf8")); else config = PrepareConfig()

function DownloadSoftware(){
    if (config.bridge === "phantom") {
        fetch("https://api.github.com/repos/jhead/phantom/releases").then(res => res.json()).then(res => {
            var url = VersionFile.phantom[process.platform][process.arch]
            if (url === null) throw Error("Arch Not supported")
            else if (url === undefined) throw Error("Arch Not supported")
            url = url.replaceAll("${{VERSION}}", res[0].tag_name)
            console.log(url);
            var file_name = url.split("/");file_name = file_name[file_name.length-1];
            return fetch(url).then(response => response.arrayBuffer()).then(response => Buffer.from(response)).then(response => {
                console.log("Download Sucess")
                writeFileSync(resolve(BridgeConfigHome, file_name), response, "binary")
                if (process.platform !== "win32") chmodSync(resolve(BridgeConfigHome, file_name), 7777)
                console.log("Save sucess");
                return true
            })
        }).catch(err => console.error(err))
    }
    else {
        let url = VersionFile.gayser.oficial
        return fetch(url).then(response => response.arrayBuffer()).then(response => Buffer.from(response)).then(response => {
            console.log("Download Sucess")
            writeFileSync(join(BridgeConfigHome, "Gayser.jar"), response, "binary")
            if (process.platform !== "win32") chmodSync(join(BridgeConfigHome, "Gayser.jar"), 7777)
            console.log("Save sucess");
        }).catch(err => console.error(err))
    }
}

function BridgeStart(){
    if (typeof global.BridgeHill === "undefined"){
        var command, baseCommand="", Argv;
        if (config.bridge === "phantom") {
            dir = readdirSync(BridgeConfigHome)
            if (process.platform !== "win32") baseCommand = "./"
            for (let dirFile of dir) 
                if (dirFile.includes("phantom")) command = dirFile;
            Argv = ` -server ${config.url}:${config.port}`
        } else {
            baseCommand = "java -jar --nogui "
            command = "Gayser.jar"
            Argv = ""
            const config_yml = join(BridgeConfigHome, "config.yml")
            const yml_config = yml.parse(readFileSync(config_yml, "utf8"))
            yml_config.remote.address = config.url
            yml_config.remote.port = config.port
            yml_config.remote["auth-type"] = "floodgate"
            writeFileSync(config_yml, yml.stringify(yml_config))
        }
        if (command === undefined) throw Error("File not Detect")
        // -*-**-*-*-*-*-*-*-*-*-*-*-*--*-*-*-**-*-**-*-**-**--*-*--*--*-*--*-*--*-*-*--*-*--*-*-*--*-*--*-*--*-*--*-*--
        if (process.platform !== "win32") chmodSync(resolve(BridgeConfigHome, command), 7777)
        let commandExec = `${baseCommand}${command}${Argv}`
        console.log(commandExec);
        const BridgeHill = exec(commandExec, {
            cwd: BridgeConfigHome
        })
        BridgeHill.stdout.on("data", data => {
            console.log(data);
            document.getElementById('LOG').innerHTML += data
        })
        BridgeHill.on("exit", code => {
            console.warn(`Exit code: ${code}`)
            global.BridgeHill = undefined
        })
        global.BridgeHill = BridgeHill
        return BridgeHill
    } else throw Error("Started")
}

function BridgeStop(){
    if (typeof BridgeHill === "undefined") return alert("Start Bridge")
    return BridgeHill.kill("SIGKILL")
}

function BridgeRestart(){
    BridgeStop()
    BridgeStart()
}