const fs = require('fs');

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

  static loadSubclasses(filePath, result, emitter) {
    console.log(`loading... ${filePath}`)
    fs.readFile(filePath, (err, data) => {
      let subclasses = JSON.parse(data);
      //TODO: Use MapReduce
      for (let subclass of subclasses) {
        let id = String(subclass['item']).split('/').slice(-1).pop();
        let label = subclass['itemLabel'];
        result[id] = label;
      }
      console.log(`${filePath} loaded`)
      emitter.emit('loadFinished');
    });
  }
}

