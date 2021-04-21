const parser = require("node-html-parser");
const fs = require("fs");
const readline = require('readline')
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

module.exports = class FileUtil {
  
  constructor() {}

  readBinaryFile(filePath) {
    fs.readFile(filePath, function (err, data) {
      if (!err) {
        let text = decoder.end(Buffer.from(data))
        console.log(text);
      }
    });
  }

  readWikidata(filePath) {
    fs.readFile(filePath, function (err, data) {
      if (!err) {
        const root = parser.parse(data.toString());
        const pages = root.querySelectorAll("page");
        for (let page of pages) {
          if (page.querySelector("format").innerText != "application/json") continue;

          const text = page.querySelector("text").innerHTML.replace(/&quot;/g, '"');
          const jsonObj = JSON.parse(text);
          const keys = Object.keys(jsonObj);

          for (let key of keys) {
            console.log(key);
          }
          console.log(jsonObj['claims']['P31'][0]['mainsnak'])
          console.log(Object.keys(jsonObj['aliases']).length)
        }
      } else {
        console.log(err);
      }
    });
  }

  countLines(filePath) {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath)
    })

    var entityNum = 0;

    rl.on('line', (line) => {
      try {
        JSON.parse(line)
        entityNum++;
      } catch(e) {
        console.log(e)
      }
    })

    rl.on('close', () => {
      console.log(`${filePath} has ${entityNum} entities`);
    })
  }
};