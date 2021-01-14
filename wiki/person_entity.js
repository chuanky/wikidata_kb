const CONSTANTS = require("./CONSTANTS");

/**
 * 封装wikidata person entity，获取entity内各种数据
 * 多语种数据最终返回时key为irica数据库字段名
 */
module.exports = class PersonEntity {
  
  constructor(entity) {
    this.entity = entity;
    this.wiki_name_title_map = CONSTANTS.WIKI_NAME_TITLE_MAP;
    this.lang_pairs_title = CONSTANTS.LANG_PAIRS_TITLE;
    this.lang_pairs_name = CONSTANTS.LANG_PAIRS_NAME;
    this.wiki_link_initial = CONSTANTS.WIKI_LINK_INITIAL;
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
        urls[this.lang_pairs_title[lang]] = encodeURI(url);
      }
    }
    return urls;
  }

  getCountry() {
    return this.getLastClaimValue('P27', 'id');
  }

  getJob() {
    return this.getFirstClaimValue('P39', 'id');
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
      return encodeURI(`${baseUrl}${image}`)
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
}