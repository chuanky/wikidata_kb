const DateUtil = require("../util/date_util");
const Entity = require("./entity");

/**
 * 封装wikidata person entity，获取entity内各种数据
 * 多语种数据最终返回时key为irica数据库字段名
 */
module.exports = class LocationEntity extends Entity {
  getAncestorNames() {
    var result = '';
    let claims =  this.entity['claims']['P1448'];
    if (claims) {
      for (var i = 0; i < claims.length; i++) {
        let name = claims[i]['mainsnak']['datavalue']['value']['text'];
        result += name + '||';
      }
    }
    return result;
  }
}