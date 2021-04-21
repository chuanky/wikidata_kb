const fs = require('fs');
const readline = require('readline');
const EntityFilter = require('./entity_filter')

/**
 * 处理wikidata json dump，根据语种和Claims筛选数据，目前目标语种为5个，处理后数据大约缩小10倍：1.1T -> 115G
 */
module.exports = class JSONDumpProcessor {

  /**
   * @param {String} inputPath 
   * @param {String} outputPath 
   * @param {String} errorPath  解析错误数据保存路径
   */
  constructor(inputPath, outputPath='../data/output.json', errorPath='../data/error.json') {
    this.rl = readline.createInterface({
      // input: fs.createReadStream('E:/bzip2/latest-all.json', {start: 0}),   // 可以通过修改start的数值来指定读取位置
      input: fs.createReadStream(inputPath),
      crlfDelay: Infinity
    });
    this.os = fs.createWriteStream(outputPath);    // 用于存放过滤后的json数据
    this.osError = fs.createWriteStream(errorPath) // 用于存放过滤过程中发生解析错误的json数据
    
    this.lineNo = 0;
    this.targetlineNo = 10001;
    this.index = 0;

    // 'close' event: readline关闭时的操作：确认读到了多少行数据，以及指针读到的位置
    this.rl.on('close', () => {
      console.log(`readline closed, read ${this.lineNo} lines.`);
      console.log(`cursor at: ${this.index + 1}`);
      this.os.close();
      this.osError.close();
    });
    
    this.os.on('close', () =>  {
      console.log("output file write finished");
    });

    this.osError.on('close', () => {
      console.log("error file write finished");
    });
  }

  /**
   * 用于处理大型JSON文件，例如：wikidataJSON(1.1T)
   * 处理策略：按行读取, 如果是wikidataJSON读取到的数据格式为：{...},
   * 数据最开始和最后的'['和']'会报JSON Parsing Error
  */ 
  processJSONDump() {
    this.rl.on('line', (line) => {
      this.index += line.length
      try {
        var entity = JSON.parse(line.slice(0, -1));
        let result = EntityFilter.languageFilter(entity);
        this.os.write(JSON.stringify(result) + '\n');
      } catch (e) {
        console.log(`JSON Parsing Error at position: ${this.index}`)
        console.log(e)
        this.osError.write(line + '\n');
      }
    });
  }
  
  /**
   * 用于处理小json文件，输入文件格式为[{...}, {...}, ...]
   */
  processJSONList() {
    // 'line' event: readline读到一个\n或\r之后的操作，line是读到\n或\r之前的所有内容
    this.rl.on('line', (line) => {
      this.lineNo++;
      if (this.lineNo <= this.targetlineNo) {
        this.index += line.length
        try {
          var entities = JSON.parse(line)
          for (let entity of entities) {
            let result = EntityFilter.languageFilter(entity);
            this.os.write(JSON.stringify(result) + '\n');
          }
        } catch (e) {
          console.log('JSON Parsing Error!')
          console.log(e)
        }
      } else {
        this.rl.close();
      }
    });
  }
}

class PropertyProcessor {
  constructor() {
    this.rl = readline.createInterface({
      input: fs.createReadStream('../data/error-2020-12-28.jl', {start: 0})
    });

    this.os = fs.createWriteStream('../data/property-label.json');

    this.rl.on('close', () => {
      console.log('JSONLines Reader finished');
      let sorted = this.sortProperties(this.result);
      this.os.write(JSON.stringify(sorted, null, 2));
    });

    this.result = {};
  }

  readJSONLines() {
    this.rl.on(('line'), (line) => {
      try {
        var entity = JSON.parse(line);
        if (entity['type'] == 'property') {
          this.result[entity['id']] = entity['labels']['en']['value'];
        }
      } catch (e) {
        // console.log(line);
        console.log(e);
      }
    });
  }

  sortProperties(properties) {
    const ordered = Object.keys(properties).sort((a, b) => {
      return parseInt(a.slice(1)) - parseInt(b.slice(1))
    }).reduce(
      (obj, key) => { 
        obj[key] = properties[key]; 
        return obj;
      },
      {}
    );
  
    return ordered;
  }
}


