const parser = require("node-html-parser");
const fs = require("fs");

fs.readFile('../data/wikidata.xml', function(err, data) {
  if (!err) {
    const root = parser.parse(data.toString());
    const pages = root.querySelectorAll("page");
    for (let page of pages) {
      if (page.querySelector("format").innerText != "application/json") continue;
      
      const text = page.querySelector("text").innerHTML.replace(/&quot;/g,'"');
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