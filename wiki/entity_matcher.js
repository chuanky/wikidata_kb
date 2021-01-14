const fs = require('fs');
const readline = require('readline');
const DBResourceLoader = require('../mysql/db_resource_loader');
const CONSTANTS = require('./CONSTANTS');

/**
 * 匹配过滤后的wikidata人物、组织、地点和iricaDB实体
 */
const dbLoader = new DBResourceLoader();
// dbLoader.loadTargetFields(CONSTANTS.ORG_FIELDS, 'organization', 4198).then(records =>{
//   console.log(records);
// });
const table = 'location';
const shortName = 'loc';
const targetFields = CONSTANTS.LOC_FIELDS;

dbLoader.loadTitles(table).then(titles_map => {
  dbLoader.loadNames(table).then(names_map => {
    const rl = readline.createInterface({
      input: fs.createReadStream(`E:/wikidata/output_${shortName}-2020-12-28.jl`)
    })
    const os = fs.createWriteStream(`../data/${shortName}_matched-2020-12-28.jl`);

    const lang_pairs_title = CONSTANTS.LANG_PAIRS_TITLE;
    const lang_pairs_name = CONSTANTS.LANG_PAIRS_NAME;

    var counter = 0;
    var matched = 0;
    rl.on('line', (line) => {
      counter++;
      let entity = JSON.parse(line);
      // match by wiki links
      for (let lang of Object.keys(entity['sitelinks'])) {
        let title = entity['sitelinks'][lang]['title'];
        let lang_db_title = lang_pairs_title[lang];
        if (titles_map[lang_db_title][title]) {
          matched++;
          // console.log(`iricaID: ${titles_map[lang_db][title]}, wikidataID: ${entity['id']}, match found in ${lang}`);
          dbLoader.loadTargetFields(targetFields, table, titles_map[lang_db_title][title]).then(record => {
            var result = { 'wikidata': entity, 'iricaDB': record }
            os.write(JSON.stringify(result) + '\n');
          });
          return
        }
      }
      // match by name
      for (let lang of Object.keys(entity['labels'])) {
        let name = entity['labels'][lang]['value'];
        let lang_db_name = lang_pairs_name[lang];
        if (names_map[lang_db_name][name]) {
          matched++;
          dbLoader.loadTargetFields(targetFields, table, names_map[lang_db_name][name]).then(record=> {
            var result = { 'wikidata': entity, 'iricaDB': record };
            os.write(JSON.stringify(result) + '\n');
          });
          return
        }
      }

      if (counter % 10000 == 0) {
        console.log(`${counter} ${table} processed`);
        rl.pause();
        setTimeout(() => rl.resume(), 10000);
      }
    });

    rl.on('close', () => {
      console.log(`${counter} processed, ${matched} found`);
    });

    rl.on('pause', () => {
      console.log(`pausing...`);
    });

    rl.on('resume', () => {
      console.log(`readline resumed`);
    });
  });
});



