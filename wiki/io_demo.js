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

  constructor() {
    this.rl = readline.createInterface({
      // input: fs.createReadStream('../data/10.json'),
      input: fs.createReadStream('E:/bzip2/latest-all.json', {start: 0}),   // 可以通过修改start的数值来指定读取位置
      crlfDelay: Infinity
    });
    this.os = fs.createWriteStream('../data/output');
    
    this.lineNo = 0;
    this.index = 0;
    this.targetlineNo = 1001;
  }
  
  process() {
    // 'line' event: readline读到一个\n或\r之后的操作，line是读到\n或\r之前的所有内容
    this.rl.on('line', (line) => {
      this.lineNo++;
      if (this.lineNo <= this.targetlineNo) {
        this.index += line.length
        try {
          var entity = JSON.parse(line.slice(0, -1));
          let result = this.languageFilter(entity);
          this.os.write(JSON.stringify(result) + '\n');
          // var entities = JSON.parse(line)
          // for (let entity of entities) {
          //   let result = this.languageFilter(entity);
          //   this.os.write(JSON.stringify(result) + '\n');
          // }
        } catch (e) {
          console.log('JSON Parsing Error!')
          console.log(e)
        }
      } else {
        this.rl.close();
      }
    });

    // 'close' event: readline关闭时的操作：确认读到了多少行数据，以及指针读到的位置
    this.rl.on('close', () => {
      console.log(`readline closed, read ${this.lineNo} lines.`);
      console.log(`cursor at: ${this.index + 1}`);
      this.os.close();
    });
    
    this.os.on('close', () =>  {
      // TODO: 添加一个计时器
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

// claimFilterTest()
// languageFilterTest()
new EntityProcessor().process()