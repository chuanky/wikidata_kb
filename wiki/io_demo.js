const fs = require('fs');
const readline = require('readline');

const LANGUAGES = {'zh': 1, 'zh-hant': 2, 'en': 3, 'ru': 4, 'ja': 5};
const LANGUAGES_SITE = {'zhwiki': 1, 'zh_yuewiki': 2, 'enwiki': 3, 'ruwiki': 4, 'jawiki': 5};
const CLAIMS_PEOPLE = {
  'P18': 'image',
  'P27': 'country of citizenship', 
  'P31': 'instance of',
  'P39': 'position held',
  'P102': 'member of political party',
  'P569': 'date of birth'
}
// TODO: level、parentId、category？
const CLAIMS_LOCATION = {
  'P17': 'country',   // 属于哪个国家
  'P18': 'image',
  'P31': 'instance of',
  'P36': 'capital',   // 如果地点是国家，需要找到该国家首都
  'P625': 'coordinate location',
  'P1448': 'official name',
}


class EntityProcessor {

  constructor() {
    this.rl = readline.createInterface({
      input: fs.createReadStream('../data/10.json'),
      // input: fs.createReadStream('E:/bzip2/latest-all.json', {start: 0}),   // 可以通过修改start的数值来指定读取位置
      crlfDelay: Infinity
    });
    this.os = fs.createWriteStream('../data/output');
    
    this.lineNo = 0;
    this.index = 0;
  }
  
  process() {
    // 'line' event: readline读到一个\n或\r之后的操作，line是读到\n或\r之前的所有内容
    this.rl.on('line', (line) => {
      this.lineNo++;
      if (this.lineNo <= 10) {
        // os.write(line);
        this.index += line.length
        try {
          // console.log(JSON.parse(line.slice(0, -1)))
          var jsonObj = JSON.parse(line)
          var result = this.languageFilter(jsonObj[0]);
          console.log(result)
        } catch (e) {
          console.log('JSON Parsing Error!')
          console.log(e)
        }
      } else {
        rl.close();
      }
    });

    // 'close' event: readline关闭时的操作：确认读到了多少行数据，以及指针读到的位置
    this.rl.on('close', () => {
      console.log(`readline closed, read ${this.lineNo} lines.`);
      console.log(`cursor at: ${this.index + 1}`);
      this.os.close();
    });
    
    this.os.on('close', () =>  {
      console.log("output file write finished");
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

    for (let claim of Object.keys(CLAIMS_LOCATION)) {
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
    console.log('file read finished');
  });
}

// claimFilterTest()
new EntityProcessor().process()