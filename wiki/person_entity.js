const CONSTANTS = require("./CONSTANTS");
const mysql = require('mysql');

/**
 * 封装wikidata person entity，获取entity内各种数据
 * 多语种数据最终返回时key为irica数据库字段名
 */
module.exports = class PersonEntity {
  
  constructor(entity, con_wiki, con_irica) {
    this.entity = entity;
    this.wiki_name_title_map = CONSTANTS.WIKI_NAME_TITLE_MAP;
    this.lang_pairs_title = CONSTANTS.LANG_PAIRS_TITLE;
    this.lang_pairs_name = CONSTANTS.LANG_PAIRS_NAME;
    this.wiki_link_initial = CONSTANTS.WIKI_LINK_INITIAL;
    this.con = con_wiki;
    this.con_irica = con_irica;
  }

  getId() {
    return this.entity['id'];
  }

  getLabel() {
    let label = this.entity['labels']['en'];
    if (label) {
      return label['value']
    } else {
      return null;
    }
  }

  /**
   * 从wikidata的label和sitelink title中获取实体名
   * 返回格式{name_en: xxx; name_zh: ...}
   */
  getNames() {
    var names = {}
    for (let lang of Object.keys(this.wiki_name_title_map)) {
      let name = this.entity['labels'][lang];
      let title = this.entity['sitelinks'][this.wiki_name_title_map[lang]];
      if (name) {
        names[this.lang_pairs_name[lang]] = name['value'];
      } else if (title) {
        names[this.lang_pairs_name[lang]] = title['title'];
      }
    }
    return names;
  }

  getWikiUrls() {
    var urls = {};
    for (let lang of Object.keys(this.lang_pairs_title)) {
      let title = this.entity['sitelinks'][lang];
      if (title) {
        let url = `https://${this.wiki_link_initial[lang]}.wikipedia.org/wiki/${title['title']}`
        urls[this.lang_pairs_title[lang]] = url;
      }
    }
    return urls;
  }

  getDescriptions() {
    var descs = {};
    let lang_pairs_desc = CONSTANTS.LANG_PAIRS_DESC;
    for (let lang of Object.keys(lang_pairs_desc)) {
      let desc = this.entity['descriptions'][lang];
      if (desc) {
        descs[lang_pairs_desc[lang]] = desc['value'];
      }
    }
    return descs;
  }

  getAliases() {
    var result = '';
    for (let lang of Object.keys(this.lang_pairs_name)) {
      let aliases_lang = this.entity['aliases'][lang];
      if (aliases_lang) {
        for (var i = 0; i < aliases_lang.length && i < 10; i++) {
          result += aliases_lang[i]['value'] + '||'
        }
      }
    }
    return result;
  }

  getCountry() {
    return new Promise((resolve, reject) => {
      var countryId = null;
      let id = this.getLastClaimValue('P27', 'id');
      if (!id) return resolve(countryId);

      let sql = `SELECT id, name_en, name_zh FROM entity_label WHERE id='${id}'`;
      this.con.query(sql, (error, records) => {
        if (error) {
          console.log(sql);
          console.log(error);
        } else {
          let country = decodeURI(records[0]['name_en']);
          if (country.includes('China')) country = 'China';
          let sql_country = `SELECT id FROM country WHERE name_en LIKE "%${country}%"`
          this.con_irica.query(sql_country, (err, country) => {
            if (err) {
              console.log(err);
            } else if (country[0]) {
              resolve(country[0]['id']);
            } else {
              resolve(countryId);
            }
          })
        }
      });
    });
  }

  getJob() {
    return new Promise((resolve, reject) => {
      var job = {};
      let id =  this.getFirstClaimValue('P39', 'id');
      if (!id) return resolve(job);

      let sql = `SELECT id, name_en, name_zh FROM entity_label WHERE id='${id}'`;
      this.con.query(sql, (error, records) => {
        if (error) {
          console.log(sql);
          console.log(error);
        } else {
          let name_en = records[0]['name_en'];
          let name_zh = records[0]['name_zh'];
          if (name_en) job['jobTitle_en'] = decodeURI(name_en);
          if (name_zh) job['jobTitle_zh'] = decodeURI(name_zh);
          return resolve(job);
        }
      });
    });
  }

  getBirthday() {
    let time = this.getFirstClaimValue('P569', 'time');
    if (time) {
      var dateReg = /\d{4}\-\d{2}\-\d{2}/;
      let result =  time.match(dateReg);
      if (result) {
        return result[0];
      }
    }

    return null;
  }

  getPhotoUrl() {
    let image = this.getFirstClaimValue('P18', null);
    let baseUrl = 'https://commons.wikimedia.org/wiki/File:';
    if (image) {
      return `${baseUrl}${image}`
    }
    return null;
  }

  getParty() {
    return new Promise((resolve, reject) => {
      var party = null;
      let id = this.getFirstClaimValue('P102', 'id');
      if (!id) return resolve(party);

      let sql = `SELECT id, name_en, name_zh FROM entity_label WHERE id='${id}'`;
      this.con.query(sql, (error, records) => {
        if (error) {
          console.log(sql);
          console.log(error);
        } else {
          party = records[0]['name_en'];
          return resolve(decodeURI(party));
        }
      });
    });
  }

  getFirstClaimValue(claimId, valueType) {
    let claims = this.entity['claims'][claimId];
    if (!claims) return null;
    for (var i = 0; i < claims.length; i++) {
      let data = claims[i]['mainsnak']['datavalue'];
      if (data) {
        if (valueType) {
          return data['value'][valueType];
        } else {
          return data['value'];
        }
      }
    }

    return null;
  }

  getLastClaimValue(claimId, valueType) {
    let claims = this.entity['claims'][claimId];
    if (!claims) return null;
    
    for (var i = claims.length - 1; i >= 0; i--) {
      let data = claims[i]['mainsnak']['datavalue'];
      if (data) {
        return data['value'][valueType];
      }
    }
    return null;
  }
}