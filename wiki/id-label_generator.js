const fs = require('fs');
const readline = require('readline');
const emojiStrip = require('emoji-strip')
var mysql = require('mysql');

// ERROR: 数据量过大，数据库插入后期变慢，js会报错
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "wikidata"
});

const rl = readline.createInterface({
  input: fs.createReadStream('../data/output-2020-12-28.jl'),
  crlfDelay: Infinity
});

var values = []
rl.on('line', (line) => {
  let entity = JSON.parse(line);
  if (entity['labels']['en']) {
    var label = emojiStrip(entity['labels']['en']['value'])
    label = encodeURI(label)
    if (label.length > 2048) label.slice(0, 2048);
    values.push([entity['id'], label])
    // result[entity['id']] = entity['labels']['en']['value']  
    if (values.length >= 20000) {
      insert(values);
      values = [];
    }
  }
});

rl.on('close', () => {
  if (values.length > 0) insert(values);
  console.log('file read finished')
});

function insert(values) {
  let sql = "INSERT INTO entity_label (id, label) VALUES ?";

  con.query(sql, [values], (err, result) => {
    if (err) throw err;
    console.log(`${values.length} records has been inserted.`)
  });
}