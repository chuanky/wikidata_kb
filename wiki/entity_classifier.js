/**
 * 判断wikidata entity的类型
 */
module.exports = class EntityClassifier {
  
  static isPerson(entity) {
    let instances = entity['claims']['P31'];
    if (!instances) return false;
  
    for (let instance of instances) {
      if (instance['mainsnak']['datavalue']['value']['id'] == 'Q5') {
        return true;
      }
    }
  
    return false;
  }

  /**
   * 判断一个实体是否为组织
   * @param {any} entity wikidata entity，格式：{'id': 'Qxxx', 'labels': {...} ...}
   * @param {any} classes 所属类别，格式：{QXXXXX: 'government agency', QXXXXX: 'space agency'...}
   */
  static isOrganization(entity, classes) {
    let instances = entity['claims']['P31'];
    if (!instances) return false;

    for (let instance of instances) {
      let id = instance['mainsnak']['datavalue']['value']['id'];
      if (classes[id]) {
        return true;
      }
    }
  }

  static isLocation(entity) {
    
  }

}