module.exports = class Entity {
  
  static getLabel(entity) {
    if (entity['labels']['en']) {
      return `${entity['id']}: ${entity['labels']['en']['value']}`
    } else {
      return `${entity['id']}: undefined`
    }
  }
}