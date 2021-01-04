const readline = require('readline');
const fs = require('fs');
const EntityFilter = require('../wiki/entity_filter');


function claimFilterTest() {
  const rl = readline.createInterface({
    input: fs.createReadStream('../data/10.json'),
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    let jsonObj = JSON.parse(line);
    let targetClaims = EntityFilter.claimFilter(jsonObj[0]['claims']);
    console.log(targetClaims);
  });

  rl.on('close', () => {
    console.log('file read finished; claimFilter test done;');
  });
}

function languageFilterTest() {
  const rl = readline.createInterface({
    input: fs.createReadStream('../data/10.json'),
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    let jsonObj = JSON.parse(line);
    let targetEntity = EntityFilter.languageFilter(jsonObj[0]);
    console.log(targetEntity);
  });

  rl.on('close', () => {
    console.log('file read finished; languageFilter test done');
  });
}