const fs = require('fs');
const readline = require('readline')

/**
 * 主要用于wikidata json和jl文件
 */
module.exports = class JSONUtil {

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

  /**
   * 从jl文件中读取lineNums行，适用于大文件
   * @param {String} jlFilePath jl文件路径
   * @param {Number} lineNums 需要读取行数
   */
  static readJL(jlFilePath, lineNums) {
    const rl = readline.createInterface({
      input: fs.createReadStream(jlFilePath)
    })

    var counter = 0;
    rl.on('line', (line) => {
      counter++;
      if (counter < lineNums) {
        let entity = JSON.parse(line);
        console.log(entity['labels']);
      } else {
        rl.close();
      }
    });
  }

  static loadSubclasses(filePath) {
    console.log(`loading... ${filePath}`)
    var result = {};
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        let subclasses = JSON.parse(data);
        //TODO: Use MapReduce
        for (let subclass of subclasses) {
          let id = String(subclass['item']).split('/').slice(-1).pop();
          let label = subclass['itemLabel'];
          result[id] = label;
        }
        console.log(`${filePath} loaded`);
        resolve(result);
      });
    });
  }

  static loadSubclassesSync(filePath) {
    console.log(`loading... ${filePath}`);
    var result = {};
    let data = fs.readFileSync(filePath);

    let subclasses = JSON.parse(data);
    for (let subclass of subclasses) {
      let id = String(subclass['item']).split('/').slice(-1).pop();
      let label = subclass['itemLabel'];
      result[id] = label;
    }
    console.log(`${filePath} loaded`)
    return result;
  }

  static removeDuplicates(jlFilePath) {
    let os = fs.createWriteStream(jlFilePath + '_unique');
    let rl = readline.createInterface({
      input: fs.createReadStream(jlFilePath)
    })
    
    var unique = {}
    rl.on('line', (line) => {
      let entity = JSON.parse(line);
      if (!unique[entity['iricaDB']['id']]) {
        unique[entity['iricaDB']['id']] = true;
        os.write(JSON.stringify(entity) + '\n');
      }
    })

    rl.on('close', () => {
      console.log(`${jlFilePath} unique filter finished, unique found ${Object.keys(unique).length}`)
    })
  }

  
}