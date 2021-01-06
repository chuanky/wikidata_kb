module.exports = class WikiURL {
  /**
   * 获取数据库中wiki url的实体title，并且把实体中的'_'字符替换为' '
   * @param {String} url 数据库中的维基url
   */
  static getURLTitle(url) {
    let uri = decodeURI(url);
    let wiki_title = uri.split('/wiki/').slice(-1).pop().replace(/_/g, ' ');

    return wiki_title;
  }
}