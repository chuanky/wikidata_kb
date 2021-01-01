const fs = require('fs');
const readline = require('readline');

const LANGUAGES = {'zh-hans': 1, 'zh-hant': 2, 'en': 3, 'ru': 4, 'ja': 5};
const LANGUAGES_SITE = {'zhwiki': 1, 'zh_yuewiki': 2, 'enwiki': 3, 'ruwiki': 4, 'jawiki': 5};
const CLAIMS = {
  // person: p; location: l; organizations: o
  'P17': 'country',   // l, o: countryId
  'P18': 'image', // p, l, o: photoUrl
  'P27': 'country of citizenship', // p: countryId
  'P31': 'instance of', // l: level, o: type
  'P36': 'capital',   // l: capitalId
  'P39': 'position held', // p: jobTitle_en, jobTitle_zh
  'P102': 'member of political party',  // p: partyId, partyName
  'P112': 'founded by', // o: founderId, founderName_en, founderName_zh
  'P159': 'headquarters location',  // o: locationId, longitude, latitude
  'P279': 'subclass of', // for classification
  'P373': 'Commons category',  // o: category
  'P488': 'chairperson',  // o: leaderId, leaderName_en, leaderName_zh
  'P569': 'date of birth',  // p: birthday
  'P571': 'inception',  // o: foundingDate
  'P625': 'coordinate location',  // l, o: longitude, longitudeFloat, latitude, latitudeFloat
  'P1448': 'official name', // l: ancestorNames
}


class EntityProcessor {

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
        let result = this.languageFilter(entity);
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
            let result = this.languageFilter(entity);
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
  
  /**
   *  输入entity，输出经过语种过滤的entity;
   *  entity为JSONObject，格式参考wikidata entity
   * @param {JSONObject} entity 
   */
  languageFilter(entity) {
    var result = {};
  
    for (let key of Object.keys(entity)) {
      result[key] = {};
    }
  
    result['type'] = entity['type'];
    result['id'] = entity['id'];
    result['claims'] = this.claimFilter(entity['claims'])
    result['lastrevid'] = entity['lastrevid'];
  
    for (let lang of Object.keys(LANGUAGES)) {
      result['labels'][lang] = entity['labels'][lang]
      result['descriptions'][lang] = entity['descriptions'][lang]
      result['aliases'][lang] = entity['aliases'][lang]
    }
  
    for (let lang of Object.keys(LANGUAGES_SITE)) {
      result['sitelinks'][lang] = entity['sitelinks'][lang]
    }
    
    return result;
  }
  
  /**
   * 输入为entity的claims，输出目标claims
   * 输入输出格式均为JSONObject
   * @param {JSONObject} claims 
   */
  claimFilter(claims) {
    var result = {};

    for (let claim of Object.keys(CLAIMS)) {
      result[claim] = claims[claim];
    }

    return result;
  }
}


function claimFilterTest() {
  const rl = readline.createInterface({
    input: fs.createReadStream('../data/10.json'),
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    let jsonObj = JSON.parse(line);
    const entityProcessor = new EntityProcessor();
    let targetClaims = entityProcessor.claimFilter(jsonObj[0]['claims']);
    console.log(targetClaims);
  });

  rl.on('close', () => {
    console.log('file read finished; claimFilter test done;');
  });
}

function languageFilterTest() {
  const rl = readline.createInterface({
    input: fs.createReadStream('../data/10.json'),
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    let jsonObj = JSON.parse(line);
    const entityProcessor = new EntityProcessor();
    let targetEntity = entityProcessor.languageFilter(jsonObj[0]);
    console.log(targetEntity);
  });

  rl.on('close', () => {
    console.log('file read finished; languageFilter test done');
  });
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

class JSONUtil {

  /**
   * 仅适用于小文件
   * @param {String} jsonFilePath 文件名以.json结尾
   */
  static convert2JL(jsonFilePath) {
    let os = fs.createWriteStream(jsonFilePath.replace('.json', '.jl'));

    fs.readFile(jsonFilePath, (err, data) => {
      try {
        let jsonObjs = JSON.parse(data);
        for (let obj of jsonObjs) {
          os.write(JSON.stringify(obj) + '\n');
        }
      } catch(e) {
        console.log(e);
      }
      os.close();
    });

    os.on('close', () => {
      console.log("Convert Finished");
    });
  }
}


// claimFilterTest()
// languageFilterTest()
// new EntityProcessor().process()
// new EntityProcessor().processAll();
new PropertyProcessor().readJSONLines();
// JSONUtil.convert2JL('../data/error-2020-12-28.json')