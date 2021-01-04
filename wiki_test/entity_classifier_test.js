const readline = require('readline')
const fs = require('fs')
const EventEmitter = require('events')
const EntityClassifier = require('../wiki/entity_classifier')
const JSONUtil = require('../util/json_util')
const Entity = require('../wiki/entity')


class EntityClassifierTest {
  
  constructor() {
    this.rl = readline.createInterface({
      input: fs.createReadStream('../data/output-2020-12-28.jl'),
    });
  }

  isPersionTest() {
    var count = 0;
    this.rl.on('line', (line) => {
      count++;
      if (count < 200) {
        let entity = JSON.parse(line);
        if (EntityClassifier.isPerson(entity)) {
          console.log(`${entity['id']}: ${entity['labels']['en']['value']}`);
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
        if (EntityClassifier.isOrganization(entity, classes)) {
          console.log(Entity.getLabel(entity))
        }
      } else {
        this.rl.close();
      }
    });
  }
}

// new EntityClassifierTest().isPersionTest();

var classes = {}
const fileLoaderEmitter = new EventEmitter();

JSONUtil.loadSubclasses('../data/government_agency_subclasses.json', classes, fileLoaderEmitter);

fileLoaderEmitter.on('loadFinished', () => {
  new EntityClassifierTest().isOrganizationTest(classes)
});

