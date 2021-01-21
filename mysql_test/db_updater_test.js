const DBUpdater = require('../mysql/db_updater')
const readline = require('readline')
const fs = require('fs')

const db_updater = new DBUpdater();

/**
  * OkPacket {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 0,
    serverStatus: 2,
    warningCount: 0,
    message: '(Rows matched: 1  Changed: 0  Warnings: 0',
    protocol41: true,
    changedRows: 0
    }
  * Error {
    code: 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD',
    errno: 1366,
    sqlMessage: "Incorrect integer value: 'a' for column 'countryId' at row 1",
    sqlState: 'HY000',
    index: 0,
    sql: "UPDATE person SET countryId='a', name_zf=null WHERE id=1"
    }
 */
// db_updater.updateFields(1, {'countryId': 'a', 'name_zf': null}, 'person')
//   .then(r => console.log(r))
//   .catch(err => console.log(err['sqlMessage']));
// let sql = db_updater.buildUpdateValueString(1, {'countryId': 'a', 'name_zf': null}, 'person');
// console.log(sql);

const rl = readline.createInterface({
  input: fs.createReadStream('../data/per_sql_error.log')
})

var counter = 0;
var ids = [];
rl.on('line', (line) => {
  counter++;
  if (counter % 2 == 0) {
    var result = {};
    var start = line.indexOf("SET ") + "SET ".length;
    var end = line.indexOf(" WHERE")
    var sourceTagStart = line.indexOf(", sourceTag")
    var sourceTagEnd = line.indexOf("wikidata_2020-12-28'") + "wikidata_2020-12-28'".length
    let noSourceLine = line.slice(start, sourceTagStart) + line.slice(sourceTagEnd, end);
    let field_value_pairs = noSourceLine.split(", ");
    for (var i = 0; i < field_value_pairs.length; i++) {
      field_value_pair = field_value_pairs[i].split('=');
      var value = field_value_pair[1];
      if (value) {
        if (value[0] == "'" || value[0] == '"') value = value.slice(1)
        let valueEnd = value.length - 1
        if (value[valueEnd] == "'" || value[valueEnd] == '"') value = value.slice(0, -1)
      }
      if (value != "null") {
        result[field_value_pair[0]] = value;
      }
    }
    result['sourceTag'] = line.slice(sourceTagStart + ", sourceTag=".length + 1, sourceTagEnd - 1);
    // console.log(result);
    let idStart = line.indexOf("id=") + "id=".length
    let id = line.slice(idStart)
    ids.push(id);
    let sql = db_updater.buildUpdateValueString(id, result, 'person');
    db_updater.query(sql).then(r => {
      // console.log(r)
    }).catch(e => {
      db_updater.handleIncorrectStringError(e, result, id, 'person');
    })
  }
})

rl.on('close', () => {
  var condition = ''
  ids.map(id => {
    condition += ` id=${id} OR`
  })
  console.log(condition.slice(0, -3))
})