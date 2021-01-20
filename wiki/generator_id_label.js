const fs = require('fs');
const readline = require('readline');
const emojiStrip = require('emoji-strip')
var mysql = require('mysql');

// 用于生成wikidata id和中英文label表
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "wikidata"
});

const rl = readline.createInterface({
  input: fs.createReadStream('../data/output-2020-12-28.jl')
});

var counter = 0;
var values = [];
var insert_time = 1000;

rl.on('line', (line) => {
  let entity = JSON.parse(line);

  var label_en = getLabel('en');
  var label_zh = getLabel('zh-hans');
  values.push([entity['id'], label_en, label_zh]);
  
  if (values.length >= 20000) {
    insert(values);
    counter += values.length;
    values = [];
    console.log(`inserting values into DB`);
    rl.pause();
    console.log(`pause for ${insert_time} ms`);
    setTimeout(() => rl.resume(), insert_time);
  }
});

rl.on('close', () => {
  if (values.length > 0) insert(values);
  counter += values.length;
  console.log(`file read finished, total insertion: ${counter}`)
});

function insert(values) {
  let sql = "INSERT INTO entity_label (id, name_en, name_zh) VALUES ?";
  let insert_start = Date.now();
  con.query(sql, [values], (err, result) => {
    if (err) throw err;
    console.log(`${values.length} records has been inserted. Total insertion: ${counter}`);
    insert_time = Date.now() - insert_start;
  });
}

function getLabel(lang) {
  if (entity['labels'][lang]) {
    label_en = emojiStrip(entity['labels'][lang]['value'])
    label_en = encodeURI(label_en)
    
    if (label_en.length > 2048) return label_en.slice(0, 2048);
    return label_en;
  }

  return null;
}