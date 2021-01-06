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
    let targetClaims = EntityFilter.claimFilter(jsonObj[2]['claims']);
    console.log(targetClaims['P39'][0]['mainsnak']);
  });

  rl.on('close', () => {
    console.log('file read finished; claimFilter test done;');
  });
}

claimFilterTest();

function languageFilterTest() {
  const rl = readline.createInterface({
    input: fs.createReadStream('../data/10.json'),
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    let entities = JSON.parse(line);
    for (let entity of entities) {
      let targetEntity = EntityFilter.languageFilter(entity);
      console.log(targetEntity['sitelinks']);
    }
  });

  rl.on('close', () => {
    console.log('file read finished; languageFilter test done');
  });
}