module.exports = class DateUtil {

  /**
   * date format: '2021-01-15 07:35:13'
   */
  static getUTCDateTime() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
  }
}