const fs = require('fs');
const readline = require('readline');
const JSONUtil = require('../util/json_util')
const EntityClassifier = require('../wiki/entity_classifier')
/**
 * 从wikidata jl格式文件中筛选出person、organization和location
 * 数据分别输出到三个jl文件当中
 * 分类报错的实体数据写入classifier_err.jl文件中
 */

// load classes resources
let locations = JSONUtil.loadSubclassesSync('../data/locality.json');
let gov_agencies = JSONUtil.loadSubclassesSync('../data/government_agency.json');
// read write streams
const rl = readline.createInterface({
  input: fs.createReadStream('../data/output-2020-12-28.jl')
})

const os_per = fs.createWriteStream('../data/output_per-2020-12-28.jl')
const os_org = fs.createWriteStream('../data/output_org-2020-12-28.jl')
const os_loc = fs.createWriteStream('../data/output_loc-2020-12-28.jl')
// process entity
const classifier = new EntityClassifier(); 
var counter = 0;
rl.on('line', (line) => {
  counter++;
  let entity = JSON.parse(line);
  let entityStr = JSON.stringify(entity) + '\n';
  if (classifier.isPerson(entity)) os_per.write(entityStr);
  if (classifier.isOrganization(entity, gov_agencies)) os_org.write(entityStr);
  if (classifier.isLocation(entity, locations)) os_loc.write(entityStr);

  if (counter % 100000 == 0) {
    console.log(`${counter} entities processed`);
  }
})

rl.on('close',() => {
  console.log('process done');
})