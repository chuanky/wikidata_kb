const DateUtil = require("../util/date_util");
const Entity = require("./entity");

/**
 * 封装wikidata person entity，获取entity内各种数据
 * 多语种数据最终返回时key为irica数据库字段名
 */
module.exports = class LocationEntity extends Entity {
  
  async getLoc(db_entity) {
    let names = this.getNames();
    let countryId = await this.getCountry('loc');
    let wikiUrls = this.getWikiUrls();
    let descriptions = this.getDescriptions();
    let longitudeFloat = this.getLongitude();
    let latitudeFloat = this.getLatitude();
    let ancestorNames = this.getAncestorNames();
    let aliases = this.getAliases();
    let photoUrl = this.getPhotoUrl();
    let sourceTag = this.getSourceTag(`wikidata_2020-12-28`, db_entity);

    let loc = {...names, 'countryId': countryId, ...wikiUrls, ...descriptions, 
                        'longitudeFloat': longitudeFloat, 'latitudeFloat': latitudeFloat,
                        'ancestorNames': ancestorNames, aliases: aliases, 'photoUrl': photoUrl, 
                        'sourceTag': sourceTag, 'updateTime': DateUtil.getUTCDateTime()};
    return loc
  }

  getAncestorNames() {
    var result = '';
    let claims =  this.entity['claims']['P1448'];
    if (claims) {
      for (var i = 0; i < claims.length; i++) {
        let name = claims[i]['mainsnak']['datavalue']['value']['text'];
        result += name + '||';
      }
    }

    if (result.length > 255) {
      result = result.slice(0, 255);
    }

    return result;
  }
}