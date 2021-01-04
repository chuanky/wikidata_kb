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

  static isOrganization(entity) {
    //TODO: 搜索所有instance of包括government_agency_subclasses.json的实体
  }

  static isLocation(entity) {
    
  }

}