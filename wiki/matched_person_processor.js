const fs = require('fs');
const readline = require('readline');
const PersonEntity = require('./person_entity');
const DateUtil = require('../util/date_util');
const mysql = require('mysql')

const rl = readline.createInterface({
  input: fs.createReadStream('E:/wikidata/per_matched-2020-12-28.jl_unique')
})
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
var processed = 0;
var result = {
  'name_en': 0, 'name_zh': 0, 'name_zf': 0, 'name_ru': 0, 'name_ja': 0,
  'countryId': 0,
  'jobTitle_en': 0, 'jobTitle_zh': 0,
  'birthday': 0,
  'photoUrl': 0,
  'wpurl_en': 0, 'wpurl_zh': 0, 'wpurl_zf': 0, 'wpurl_ru': 0, 'wpurl_ja': 0,
  'partyName': 0,
  'description': 0, 'description_zh': 0, 'description_zf': 0, 'description_ru': 0, 'description_ja': 0,
  'aliases': 0,
  'sourceTag': 0,
  'updateTime': 0
};

rl.on('line', (line) => {
  counter++;
  let entity_pair = JSON.parse(line);
  let wiki_entity = new PersonEntity(entity_pair['wikidata'], con, con_irica);
  let db_entity = entity_pair['iricaDB'];

  // 统计可更新信息,wikidata中职位、党派信息为id, 需要数据库访问得到label
  wiki_entity.getJob().then(job => {
    wiki_entity.getParty().then(party => {
      wiki_entity.getCountry().then(countryId => {
        updateField(party, db_entity, result, 'partyName');
        updateMultiLangFields(job, db_entity, result);
        updateField(countryId, db_entity, result, 'countryId');
        updateMultiLangFields(wiki_entity.getNames(), db_entity, result);
        updateMultiLangFields(wiki_entity.getWikiUrls(), db_entity, result);
        updateField(wiki_entity.getBirthday(), db_entity, result, 'birthday');
        updateField(wiki_entity.getPhotoUrl(), db_entity, result, 'photoUrl');
        updateMultiLangFields(wiki_entity.getDescriptions(), db_entity, result, true);
        updateField(wiki_entity.getAliases(), db_entity, result, 'aliases', true);

        let sourceTag = appendValue('wikidata-2020-12-28', db_entity, 'sourceTag');
        updateField(sourceTag, db_entity, result, 'sourceTag', true);
        updateField(DateUtil.getUTCDateTime(), db_entity, result, 'updateTime', true);
        processed++;
      });
    });
  });

  if (counter % 100 == 0) {
    rl.pause();
    console.log(`pausing for 100ms, processed: ${counter}`)
    setTimeout(() => rl.resume(), 100);
  }
});

rl.on('close', () => {
  setTimeout(() => {
    console.log(`Total number of Entity: ${counter}; Total processed: ${processed}`);
    console.log(result)
  }, 2000);
})

/**
 * @param {Any} multi_lang_values 多语种名称或wiki链接，需要和数据库中的字段对应，例如：{name_en: xxx, name_zh: xxx}
 * @param {Any} db_entity iricadb中的实体
 * @param {Any} result 字段统计变量
 */
function updateMultiLangFields(multi_lang_values, db_entity, result, overwrite = false) {
  for (let field of Object.keys(multi_lang_values)) {
    let value = db_entity[field];
    if (value == null || value == '' || overwrite) {
      // console.log(`wiki: ${multi_lang_values[field]}; ${field} irica: ${value}`);
      result[field]++;
    }
  }
}

/**
 * @param {String} value 从wikidata的Claims中获取的属性值
 * @param {Any} db_entity iricadb中的实体
 * @param {Any} result 字段统计变量
 * @param {String} field_name 需要更新的person表字段
 */
function updateField(value, db_entity, result, field_name, overwrite = false) {
  if (value) {
    let db_value = db_entity[field_name];
    if (db_value == -1 || db_value == null || db_value == '' || overwrite) {
      // console.log(`wiki: ${value}; irica: ${db_value}`);
      result[field_name]++;
    }
  }
}

function appendValue(value, db_entity, field_name) {
  let db_value = db_entity[field_name];
  if (db_value) {
    return `${db_value}, ${value}`
  } else {
    return value;
  }
}