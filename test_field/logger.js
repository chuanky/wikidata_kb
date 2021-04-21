const fs = require('fs');
const DateUtil = require('../util/date_util')

module.exports = class Logger {
  /**
   * @param {String} level {'error', 'debug', 'info'}
   * @param {String} outputType {'console', 'file'} 
   * @param {String} outputPath '../data/xxx.log 
   */
  constructor(level, outputType, outputPath, detailMode=true) {
    const levels = { 'error': 0, 'debug': 1, 'info': 2 };
    this.level = levels[level];
    this.outputType = outputType;
    if (outputType == 'file') {
      this.os = fs.createWriteStream(outputPath);
    }
  }

  info(message) {
    this.log(message, 2);
  }

  debug(message) {
    this.log(message, 1);
  }

  error(message) {
    this.log(message, 0);
  }

  log(message, level) {
    const levels = {0: 'ERROR', 1: 'DEBUG', 2: 'INFO'}
    const timeInfo = DateUtil.getUTCDateTime();
    if (level >= this.level) {
      if (this.outputType == 'console') {
        if (this.detailMode) {
          console.log(`${timeInfo} ${levels[level]}: ${message}`);
        } else {
          console.log(message);
        }
      }

      if (this.outputType == 'file') {
        if (this.detailMode) {
          this.os.write(`${timeInfo} ${levels[level]}: ${message}\r\n`);
        } else {
          this.os.write(`${message}\r\n`);
        }
      }
    }
  }
}

