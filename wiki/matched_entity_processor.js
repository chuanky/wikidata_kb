const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql')

module.exports = class MatchedEntityProcessor {
  constructor(inputFile) {
    this.rl = readline.createInterface({
      input: fs.createReadStream(inputFile)
    })
    
    this.con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "wikidata"
    });
    this.con_irica = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "irica20140408"
    });

    this.counter = 0;
    this.processed = 0;
  }

  /**
   * @param {Any} multi_lang_values 多语种名称或wiki链接，需要和数据库中的字段对应，例如：{name_en: xxx, name_zh: xxx}
   * @param {Any} db_entity iricadb中的实体
   * @param {Any} result 字段统计变量
   */
  updateMultiLangFields(multi_lang_values, db_entity, result, overwrite = false) {
    for (let field of Object.keys(multi_lang_values)) {
      let value = db_entity[field];
      if (value == null || value == '' || overwrite) {
        this.logger.debug(`--${field}-- \n wiki: ${multi_lang_values[field]}\n irica: ${value}`);
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
  updateField(value, db_entity, result, field_name, overwrite = false) {
    if (value) {
      let db_value = db_entity[field_name];
      if (db_value == -1 || db_value == null || db_value == '' || overwrite) {
        this.logger.debug(`--${field_name}-- \n wiki: ${value}\n irica: ${db_value}`);
        result[field_name]++;
      }
    }
  }

  /**
   * 用于添加实体表sourceTag字段
   * @param {String} value 新来源
   * @param {String} field_name sourceTag 
   */
  appendFieldValue(value, db_entity, result, field_name) {
    if (!value) return;

    let db_value = db_entity[field_name];
    if (db_value) {
      let new_value = `${db_value}, ${value}`
      this.logger.debug(`--${field_name}-- \n newValue: ${new_value}\n irica: ${db_value}`);
      result[field_name]++;
    } else {
      this.logger.debug(`--${field_name}-- \n newValue: ${value}\n irica: ${db_value}`);
      result[field_name]++;
    }
  }
}
