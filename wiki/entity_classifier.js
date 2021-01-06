const { json } = require('d3');
const fs = require('fs')
/**
 * 判断wikidata entity的类型
 */
module.exports = class EntityClassifier {

  constructor() {
    this.os_err = fs.createWriteStream('../data/classifier_err.jl');
  }
  
  isPerson(entity) {
    let instances = entity['claims']['P31'];
    if (!instances) return false;
  
    for (let instance of instances) {
      try {
        if (instance['mainsnak']['datavalue']['value']['id'] == 'Q5') {
          return true;
        }
      } catch (e) {
        console.log(e);
        console.log(entity);
        this.os_err.write(JSON.stringify(entity) + '\n');
      }
    }
  
    return false;
  }

  /**
   * 判断一个实体是否为组织
   * @param {any} entity wikidata entity，格式：{'id': 'Qxxx', 'labels': {...} ...}
   * @param {any} classes 所属类别，格式：{QXXXXX: 'government agency', QXXXXX: 'space agency'...}
   */
  isOrganization(entity, classes) {
    return this.inClasses(entity, classes);
  }

  isLocation(entity, classes) {
    return this.inClasses(entity, classes);
  }

  inClasses(entity, classes) {
    let instances = entity['claims']['P31'];
    if (!instances) return false;

    for (let instance of instances) {
      try {
        let id = instance['mainsnak']['datavalue']['value']['id'];
        if (classes[id]) {
          return true;
        }
      } catch(e) {
        console.log(e);
        console.log(entity);
        this.os_err.write(JSON.stringify(entity) + '\n');
      }
    }
  }

}