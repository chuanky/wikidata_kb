const fs = require('fs');
const readline = require('readline');
const PersonEntity = require('../wiki/person_entity');

const rl = readline.createInterface({
  input: fs.createReadStream('E:/wikidata/per_matched-2020-12-28.jl_unique')
})

var counter = 0;
rl.on('line', (line) => {
  counter++;
  if (counter < 100) {
    let entity_pair = JSON.parse(line);
    let wiki_entity = new PersonEntity(entity_pair['wikidata']);
    let db_entity = entity_pair['iricaDB'];
    
    // wiki_entity.getDescriptions();
    // wiki_entity.getAliases();
    wiki_entity.getCountry().then(countryId => {
      wiki_entity.con.end();
      wiki_entity.con_irica.end();
      
      console.log(countryId)
    });
    
  } else {
    rl.close();
  }
});