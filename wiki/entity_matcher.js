const { rollup } = require('d3');
const fs = require('fs');
const readline = require('readline');
const DBResourceLoader = require('../mysql/db_resource_loader');
const CONSTANTS = require('./CONSTANTS');

const dbLoader = new DBResourceLoader();

// dbLoader.loadTargetFields(CONSTANTS.ORG_FIELDS, 'organization', 4198).then(records =>{
//   console.log(records);
// });
const table = 'organization';
const shortName = 'org';

dbLoader.loadTitles(table).then(titles_map => {
  dbLoader.loadNames(table).then(names_map => {
    const rl = readline.createInterface({
      input: fs.createReadStream(`E:\\wikidata\\output_${shortName}-2020-12-28.jl`)
    })
    const os = fs.createWriteStream(`../data/${shortName}_matched-2020-12-28.jl`);

    const lang_pairs_title = {
      'enwiki': 'wpurl_en',
      'zhwiki': 'wpurl_zh',
      'zh_yuewiki': 'wpurl_zf',
      'ruwiki': 'wpurl_ru',
      'jawiki': 'wpurl_ja'
    }
    const lang_pairs_name = {
      'en': 'name_en',
      'zh-hans': 'name_zh',
      'zh-hant': 'name_zf',
      'ru': 'name_ru',
      'ja': 'name_ja'
    }

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
          dbLoader.loadTargetFields(CONSTANTS.ORG_FIELDS, table, titles_map[lang_db_title][title]).then(record => {
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
          dbLoader.loadTargetFields(CONSTANTS.ORG_FIELDS, table, names_map[lang_db_name][name]).then(record=> {
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



