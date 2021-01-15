const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql')
const OrgEntity = require('../wiki/org_entity');

const rl = readline.createInterface({
  input: fs.createReadStream('E:/wikidata/org_matched-2020-12-28.jl_unique')
});
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "wikidata"
});
const con_irica = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "irica20140408"
})

var counter = 0;
rl.on('line', (line) => {
  counter++;
  if (counter < 100) {
    let entity_pair = JSON.parse(line);
    let wiki_entity = new OrgEntity(entity_pair['wikidata'], con, con_irica);
    let db_entity = entity_pair['iricaDB'];

    wiki_entity.getCountry('org').then(countryId => {
      console.log(wiki_entity.getId());
      console.log(wiki_entity.getLabel('en'));
      console.log(wiki_entity.getNames());
      console.log(wiki_entity.getWikiUrls());
      console.log(wiki_entity.getDescriptions());
      console.log(wiki_entity.getAliases());
      console.log(countryId);
      console.log(wiki_entity.getPhotoUrl());
    });

  } else {
    rl.close();
  }
});