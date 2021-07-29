const { Fetch_JSON, Download_File } = require("./fetch");
const path = require("path");
const fs = require("fs");
const os = require("os");
const child_process = require("child_process");

const BridgesDownlaodLink = {
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

const BdsBridgeHome = path.resolve(os.homedir(), ".bds_bridge");
const FilesBridgeSave = {
    phantom: path.join(BdsBridgeHome, "Phantom.exe"),
    gayser: path.join(BdsBridgeHome, "Gayser.jar"),
}

async function DownloadPlatform(Platform = "phantom", Variant = "oficial"){
    return new Promise(async (resolve, reject) => {
        try {
            if (Platform === "phantom") {
                const PhantomReleases = await Fetch_JSON("https://api.github.com/repos/jhead/phantom/releases")[0].tag_name;
                await Download_File(BridgesDownlaodLink["phantom"][process.platform][process.arch].replaceAll("${{VERSION}}", PhantomReleases), FilesBridgeSave.phantom);
                if (process.platform !== "win32") fs.chmodSync(FilesBridgeSave.phantom, "755");
                return resolve(FilesBridgeSave.phantom)
            } else if (Platform === "gayser") {
                await Download_File(BridgesDownlaodLink["gayser"]["oficial"], FilesBridgeSave.gayser);
                return resolve(FilesBridgeSave.gayser);
            }
            return reject("Invalid platform")
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

function SaveLogFile(data = ""){
    
}

function StartBridge(Platform = "phantom", Server = "", Port = 19132){
    const CommandExec = {
        command: null,
        args: [],
    }

    if (Platform === "phantom") {
        CommandExec.command = FilesBridgeSave.phantom;
        CommandExec.args.push("-server", `${Server}:${Port}`)
    }
    else if (Platform === "gayser") {}
    else throw new Error("Platform not valid");

    const Bridge = child_process.execFile(CommandExec.command, CommandExec.args, {
        cwd: BdsBridgeHome,
    });

    return {
        log: function(callback = data => process.stdout.write(data)) {
            Bridge.stdout.on("data", callback);
            Bridge.stderr.on("data", callback);
        },
        exit: function (callback = exit => process.exit(exit)) {
            process.on("exit", callback);
        }
    }
}

module.exports = {
    DownloadPlatform,
    StartBridge,
}