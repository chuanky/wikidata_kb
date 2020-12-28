const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  // input: process.stdin,
  // input: fs.createReadStream('data/wiki_en.xml'),
  input: fs.createReadStream('E:/bzip2/latest-all.json', {start: 0}),   // 可以通过修改start的数值来指定读取位置
  crlfDelay: Infinity
});

const os = fs.createWriteStream('../data/1.json');

var lineNo = 0;
var index = 0;

// readline读到一个\n或\r之后的操作，line是读到\n或\r之前的所有内容
rl.on('line', (line) => {
  lineNo++;
  if (lineNo <= 10) {
    os.write(line);
    index += line.length
    try {
      console.log(JSON.parse(line.slice(0, -1)))
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