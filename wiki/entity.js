const CONSTANTS = require("./CONSTANTS");

module.exports = class Entity {
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

  getLabel(lang) {
    let label = this.entity['labels'][lang];
    if (label) {
      return label['value']
    }
    return null;
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
        var value = name['value'];
        while (value[value.length - 1] == "\\") { value = value.slice(0, -1)};
        names[this.lang_pairs_name[lang]] = value;
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
        var value = desc['value'];
        while (value[value.length - 1] == "\\") { value = value.slice(0, -1)};
        descs[lang_pairs_desc[lang]] = value;
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
    
    if (result.length < 1) return null;
    var encodedResult = encodeURI(result);
    while (encodedResult.length > 1023) {
      let split_char = '%7C%7C'
      var aliases = encodedResult.split(split_char);
      aliases.shift();
      encodedResult = this.arrayToString(aliases, split_char);
    }
    return encodedResult;
  }

  arrayToString(array, split_char) {
    var result = '';
    for (var i = 0; i < array.length; i++) {
      result += array[i] + split_char
    }
    if (result.length > 0) return result.slice(0, -6)
    return result;
  }

  /**
   * @param {String} entity_type {per: P27, org: P17, loc: P17}
   */
  getCountry(entity_type) {
    return new Promise((resolve, reject) => {
      const typeToId = {'per': 'P27', 'org': 'P17', 'loc': 'P17'};
      var countryId = null;
      let id = this.getFirstClaimValue(typeToId[entity_type], 'id');
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

  getLongitude() {
    return this.getFirstClaimValue('P625', 'longitude');
  }

  getLatitude() {
    return this.getFirstClaimValue('P625', 'latitude')
  }

  getPhotoUrl() {
    let image = this.getFirstClaimValue('P18', null);
    let baseUrl = 'https://commons.wikimedia.org/wiki/File:';
    if (image) {
      let result = `${baseUrl}${image}`;
      if (result.length < 255) {
        return result
      }
    }
    return null;
  }

  getFirstClaim(claimId) {
    let claims = this.entity['claims'][claimId];
    if (!claims) return null;
    for (var i = 0; i < claims.length; i++) {
      let data = claims[i]['mainsnak']['datavalue'];
      if (data) {
        return data;
      }
    }

    return null;
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

  getSourceTag(appendSource, db_entity) {
    if (!db_entity) {
      return appendSource;
    }

    var sourceTag = db_entity['sourceTag'];
    if (sourceTag != null && sourceTag != '') {
      if (sourceTag.includes(appendSource)) return sourceTag;
      sourceTag += `, ${appendSource}`
    } else {
      sourceTag = appendSource
    }
    
    while (sourceTag.length > 50) {
      var sources = sourceTag.split(',');
      sources.shift();
      sourceTag = sources.toString();
    }
    return sourceTag;
  }
}