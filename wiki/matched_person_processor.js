const fs = require('fs');
const readline = require('readline');
const PersonEntity = require('./person_entity');

const rl = readline.createInterface({
  input: fs.createReadStream('E:/wikidata/per_matched-2020-12-28.jl_unique')
})

var counter = 0;
var result = {'name_en': 0, 'name_zh': 0, 'name_zf': 0, 'name_ru': 0, 'name_ja': 0,
              'countryId': 0,
              'jobTitle_en': 0,
              'birthday': 0,
              'photoUrl': 0,
              'wpurl_en': 0,'wpurl_zh': 0,'wpurl_zf': 0,'wpurl_ru': 0,'wpurl_ja': 0,
            };

rl.on('line', (line) => {
  counter++;
  if (counter < 100) {
    let entity_pair = JSON.parse(line);
    let wiki_entity = new PersonEntity(entity_pair['wikidata']);
    let db_entity = entity_pair['iricaDB'];

    // 统计可更新信息
    updateMultiLangFields(wiki_entity.getNames(), db_entity, result);
    updateMultiLangFields(wiki_entity.getWikiUrls(), db_entity, result);
    updateStats(wiki_entity.getCountry(), db_entity, result, 'countryId');
    updateStats(wiki_entity.getJob(), db_entity, result, 'jobTitle_en');
    updateStats(wiki_entity.getBirthday(), db_entity, result, 'birthday');
    updateStats(wiki_entity.getPhotoUrl(), db_entity, result, 'photoUrl');
    
  } else {
    rl.close();
  }
});

rl.on('close', () => {
  console.log(result);
})

/**
 * @param {Any} multi_lang_values 多语种名称或wiki链接，需要和数据库中的字段对应，例如：{name_en: xxx, name_zh: xxx}
 * @param {Any} db_entity iricadb中的实体
 * @param {Any} result 字段统计变量
 */
function updateMultiLangFields(multi_lang_values, db_entity, result) {
  for (let field of Object.keys(multi_lang_values)) {
    let value = db_entity[field];
    if (value == null || value == '') {
      // console.log(`${field} irica: ${value}; wiki: ${multi_lang_values[field]}`);
      result[field]++;
    }
  }
}

/**
 * @param {String} claim_value 从wikidata的Claims中获取的属性值
 * @param {Any} db_entity iricadb中的实体
 * @param {Any} result 字段统计变量
 * @param {String} field_name 需要更新的person表字段
 */
function updateStats(claim_value, db_entity, result, field_name) {
  if(claim_value) {
    if (db_entity[field_name] == -1 || db_entity[field_name] == null) {
      // console.log(`wiki: ${claim_value}; irica: ${db_entity[field_name]}`);
      result[field_name]++;
    }
  }
}