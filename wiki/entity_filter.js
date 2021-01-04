const { CLAIMS, LANGUAGES, LANGUAGES_SITE } = require('../wiki/CONSTANTS');

module.exports = class EntityFilter {
    /**
   *  输入entity，输出经过语种过滤的entity;
   *  entity为JSONObject，格式参考wikidata entity
   * @param {JSONObject} entity 
   */
  static languageFilter(entity) {
    var result = {};
  
    for (let key of Object.keys(entity)) {
      result[key] = {};
    }
  
    result['type'] = entity['type'];
    result['id'] = entity['id'];
    result['claims'] = this.claimFilter(entity['claims'])
    result['lastrevid'] = entity['lastrevid'];
  
    for (let lang of Object.keys(LANGUAGES)) {
      result['labels'][lang] = entity['labels'][lang]
      result['descriptions'][lang] = entity['descriptions'][lang]
      result['aliases'][lang] = entity['aliases'][lang]
    }
  
    for (let lang of Object.keys(LANGUAGES_SITE)) {
      result['sitelinks'][lang] = entity['sitelinks'][lang]
    }
    
    return result;
  }
  
  /**
   * 输入为entity的claims，输出目标claims
   * 输入输出格式均为JSONObject
   * @param {JSONObject} claims 
   */
  static claimFilter(claims) {
    var result = {};

    for (let claim of Object.keys(CLAIMS)) {
      result[claim] = claims[claim];
    }

    return result;
  }
}
