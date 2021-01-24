const DateUtil = require("../util/date_util");
const Entity = require("./entity");

/**
 * 封装wikidata person entity，获取entity内各种数据
 * 多语种数据最终返回时key为irica数据库字段名
 */
module.exports = class PersonEntity extends Entity {

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
      let result = DateUtil.getUTCDateTimeFromString(time);
      if (result) {
        return result[0];
      }
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

  async getPerson(db_entity) {
    let names = this.getNames();
    let countryId = await this.getCountry('per');
    let job = await this.getJob();
    let birthday = this.getBirthday();
    let photoUrl = this.getPhotoUrl();
    let wikiUrls = this.getWikiUrls();
    let party = await this.getParty();
    let descriptions = this.getDescriptions();
    let aliases = this.getAliases();

    var sourceTag = '';
    let currentSource = `wikidata_${DateUtil.getUTCDate()}`
    if (db_entity) {
      sourceTag = this.getSourceTag(currentSource, db_entity);
    } else {
      sourceTag = currentSource;
    }

    let person = {...names, 'countryId': countryId, ...job, 'birthday': birthday, 
                        'photoUrl': encodeURI(photoUrl), ...wikiUrls, 'partyName': party,  
                        ...descriptions, 'aliases': aliases,
                        'sourceTag': sourceTag, 'updateTime': DateUtil.getUTCDateTime()
                  }
    return person
  }
}