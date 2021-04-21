const readline = require('readline')
const fs = require('fs')
const EntityClassifier = require('../wiki/entity_classifier')
const JSONUtil = require('../util/json_util')
const Entity = require('../wiki/person_entity')

class EntityClassifierTest {
  
  constructor() {
    this.rl = readline.createInterface({
      input: fs.createReadStream('../data/output-2020-12-28.jl'),
    });
    this.classifier = new EntityClassifier();
  }

  isPersionTest() {
    var count = 0;
    this.rl.on('line', (line) => {
      count++;
      if (count < 200) {
        let entity = JSON.parse(line);
        if (this.classifier.isPerson(entity)) {
          console.log(`${entity['id']}: ${entity['labels']['en']['value']}`);
          // let enwiki = entity['sitelinks']['enwiki'];
          // if (enwiki) {
          //   let wiki_title = WikiURL.getURLTitle('http://en.wikipedia.org/wiki/George_Washington');
          //   if (entity['sitelinks']['enwiki']['title'] == wiki_title) {
          //     console.log(`${entity['id']}: ${entity['sitelinks']['enwiki']['title']}`);
          //     console.log(entity['descriptions']['en'])
          //   }
          // }
        }
      } else {
        this.rl.close();
      }
    });
  }

  isOrganizationTest(classes) {
    var count = 0;
    this.rl.on('line', (line) => {
      count++;
      if (count < 10000) {
        let entity = JSON.parse(line);
        if (this.classifier.isOrganization(entity, classes)) {
          console.log(Entity.getLabel(entity))
        }
      } else {
        this.rl.close();
      }
    });
  }

  isLocationTest(classes) {
    var count = 0;
    this.rl.on('line', (line) => {
      count++;
      if (count < 10000) {
        let entity = JSON.parse(line);
        if (this.classifier.isOrganization(entity, classes)) {
          console.log(Entity.getLabel(entity))
        }
      } else {
        this.rl.close();
      }
    });
  }
}

let gov_agencies = JSONUtil.loadSubclassesSync('../data/organizations.json');
let locations = JSONUtil.loadSubclassesSync('../data/locations.json');

let test = new EntityClassifierTest();
test.isPersionTest();
// test.isOrganizationTest(gov_agencies);
// test.isLocationTest(locations);



