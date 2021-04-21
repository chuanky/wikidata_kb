const Entity = require("./entity");
const DateUtil = require('../util/date_util')

/**
 * 封装wikidata organization entity，获取entity内各种数据
 * 多语种数据最终返回时key为irica数据库字段名
 */
module.exports = class OrgEntity extends Entity{

  async getOrg(db_entity) {
    let names = this.getNames();
    let countryId = await this.getCountry('org');
    let wikiUrls = this.getWikiUrls();
    let descriptions = this.getDescriptions();
    let longitude = this.getLongitude();
    let latitude = this.getLatitude();
    let foundingDate = this.getFoundingDate();
    let foundernames = await this.getFounderNames();
    let leaderNames = await this.getLeaderNames();
    let aliases = this.getAliases();
    let photoUrl = this.getPhotoUrl();
    let sourceTag = this.getSourceTag(`wikidata_${DateUtil.getUTCDate()}`, db_entity);

    let org = {...names, 'countryId': countryId, ...wikiUrls, ...descriptions, 
                        'longitude': longitude, 'latitude': latitude, 'foundingDate': foundingDate,
                        ...foundernames, ...leaderNames, aliases: aliases, 'photoUrl': photoUrl, 
                        'sourceTag': sourceTag, 'updateTime': DateUtil.getUTCDateTime()}
    return org
  }

  getFoundingDate() {
    let result = DateUtil.getUTCDateTimeFromString(this.getFirstClaimValue('P571', 'time'));
    if (result) {
      return result[0];
    }
    
    return null;
  }

  getFounderNames() {
    return new Promise((resolve, reject) => {
      let id = this.getFirstClaimValue('P112', 'id');
      var founder = {};
      if (id) {
        let sql = `SELECT id, name_en, name_zh FROM entity_label WHERE id='${id}'`;
        this.con.query(sql, (error, records) => {
          if (error) {
            resolve(founder);
            console.log(sql);
            console.log(error);
          } else {
            let name_en = records[0]['name_en'];
            let name_zh = records[0]['name_zh'];
            if (name_en) founder['founderName_en'] = decodeURI(name_en);
            if (name_zh) founder['founderName_zh'] = decodeURI(name_zh);
            resolve(founder);
          }
        });
      } else {
        resolve(founder);
      }
    });
  }

  getLeaderNames() {
    return new Promise((resolve, reject) => {
      let id = this.getFirstClaimValue('P488', 'id');
      var leader = {};
      if (id) {
        let sql = `SELECT id, name_en, name_zh FROM entity_label WHERE id='${id}'`;
        this.con.query(sql, (error, records) => {
          if (error) {
            resolve(leader);
            console.log(sql);
            console.log(error);
          } else {
            let name_en = records[0]['name_en'];
            let name_zh = records[0]['name_zh'];
            if (name_en) leader['leaderName_en'] = decodeURI(name_en);
            if (name_zh) leader['leaderName_zh'] = decodeURI(name_zh);
            resolve(leader);
          }
        });
      } else {
        resolve(leader);
      }
    });
  }
}