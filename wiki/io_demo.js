const fs = require('fs');
const readline = require('readline');

const LANGUAGE = {'zh': 1, 'zh-hant': 2, 'en': 3, 'ru': 4, 'ja': 5};

const rl = readline.createInterface({
  // input: process.stdin,
  input: fs.createReadStream('../data/10.json'),
  // input: fs.createReadStream('E:/bzip2/latest-all.json', {start: 0}),   // 可以通过修改start的数值来指定读取位置
  crlfDelay: Infinity
});

const os = fs.createWriteStream('../data/target.json');

var lineNo = 0;
var index = 0;

// readline读到一个\n或\r之后的操作，line是读到\n或\r之前的所有内容
rl.on('line', (line) => {
  lineNo++;
  if (lineNo <= 1) {
    os.write(line);
    index += line.length;
    try {
      // var jsonObj = JSON.parse(line.slice(0, -1));
      var jsonObj = JSON.parse(line);
      languageFilter(jsonObj[0]);
    } catch (e) {
      console.log('JSON Parsing Error!')
      console.log(e)
    }
  } else {
    rl.close();
  }
});

// readline关闭时的操作：确认读到了多少行数据，以及指针读到的位置
rl.on('close', () => {
  console.log(`readline closed, read ${lineNo} lines.`);
  console.log(`cursor at: ${index + 1}`)
});



function languageFilter(entity) {
  
  result = {};

  for (let key of Object.keys(entity)) {
    result[key] = {};
    console.log(key);
  }

  result['type'] = entity['type'];
  result['id'] = entity['id'];

  for (let lang of Object.keys(LANGUAGE)) {
    result['labels'][lang] = entity['labels'][lang];
    result['descriptions'][lang] = entity['descriptions'][lang];
    result['aliases'][lang] = entity['aliases'][lang];
    // result['sitelinks']
  }
  
  // result['descriptions'] = {}

  // console.log(`Entity type: ${entity['type']}`);
  // console.log(`Entity id: ${entity['id']}`);
  // console.log(`Entity labels: ${entity['labels']}`);
  // console.log(entity['labels']['zh'])
  // console.log(entity['descriptions']);
  // console.log(`Entity aliases: ${entity['aliases']}`);
  console.log(entity['sitelinks'])
  // console.log(result)
}

