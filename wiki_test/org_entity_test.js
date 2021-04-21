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
    test(wiki_entity);
  } else {
    rl.close();
  }
});

/**
 * @param {OrgEntity} wiki_entity 
 */
const test = async (wiki_entity) => {
  let countryId = await wiki_entity.getCountry('org');
  let founder = await wiki_entity.getFounderNames();
  let leader = await wiki_entity.getLeaderNames();

  console.log(wiki_entity.getId());
  console.log(wiki_entity.getLabel('en'));
  console.log(wiki_entity.getNames());
  console.log(wiki_entity.getWikiUrls());
  console.log(wiki_entity.getDescriptions());
  console.log(countryId);
  console.log(wiki_entity.getLongitude());
  console.log(wiki_entity.getLatitude());
  console.log(wiki_entity.getFoundingDate());
  console.log(founder);
  console.log(leader);
  console.log(wiki_entity.getAliases());
  console.log(wiki_entity.getPhotoUrl());
};