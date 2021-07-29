const path = require("path");
const fs = require("fs");

if (typeof fetch === "undefined") global.fetch = require("node-fetch");

async function Download_File(url = "", Path_Save = "./"){
  return new Promise(async (resolve, reject) => {
    try {
      const FetchBuffer = Buffer.from((await (await fetch(url)).arrayBuffer()));
      if (!(fs.existsSync(path.dirname(Path_Save)))) fs.mkdirSync(path.dirname(Path_Save), {recursive: true});
      fs.writeFileSync(Path_Save, FetchBuffer, "binary")
      resolve(Path_Save);
    } catch (err){
      console.log(err);
      reject(err);
    }
  });
}

async function Fetch_JSON(url){
  return new Promise(async (resolve, reject) => {
    try {
      const FetchJson = (await (await fetch(url)).json());
      resolve(FetchJson)
    } catch (err){
      console.log(err);
      reject(err)
    }
  });
}

module.exports = {Download_File, Fetch_JSON}
