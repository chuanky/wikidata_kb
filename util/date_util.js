module.exports = class DateUtil {

  /**
   * date format: '2021-01-15 07:35:13'
   */
  static getUTCDateTime() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
  }

  static getUTCDate() {
    return new Date().toISOString().slice(0, 10)
  }

  static getUTCDateTimeFromString(time) {
    if (!time) return null;
    
    var dateReg = /\d{4}\-\d{2}\-\d{2}/;
    return time.match(dateReg);
  }
}