var mysql = require('mysql');
var fs = require('fs')
var WikiURL = require('../wiki/wikiURL')
const {PERSON_FIELDS, NAME_FIELDS, TITLE_FIELDS} = require('../wiki/CONSTANTS')

class DBResourceLoader {

  constructor() {
    this.con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "irica20140408"
    });

    this.os = fs.createWriteStream('../data/duplicates.txt')
  }

  loadWikiURL() {
    var enwikis = {};
    var duplicateCount = 0;
    this.con.query(`select id, name_en, wpurl_en, description
      from person 
      where wpurl_en is not null and wpurl_en != ''`, 
      (error, rows, fields) => {
      if (error) throw error;
      for (let row of rows) {
        let title = WikiURL.getURLTitle(row['wpurl_en']);
        if (enwikis[title]) {
          duplicateCount++;
          this.os.write(`duplicate recode record1: ${enwikis[title][0]}; recode2: ${row['id']} ${title}\n`);
          this.os.write(`description1: ${enwikis[title][1]}\n`);
          this.os.write(`description2: ${row['description']}\n`);
          this.os.write('----------------------------------------------------------\n');
        }
        enwikis[title] = [row['id'], row['description']];
      }
      console.log(Object.keys(enwikis).length)
      console.log(duplicateCount);
      this.con.end();
    });
  }

  loadTargetFields(fields, table) {
    let sql = `SELECT ${fields} FROM ${table} LIMIT 10`
    this.con.query(sql, (error, rows) => {
      rows.map((row) => {
        Object.keys(row).map((field) => {
          let value = row[field];
          if (value != null & value != '') {
            console.log(`${field}: ${row[field]}`)
          }
          // console.log(`${field}: ${row[field]}`)
        })
      })
      this.con.end();
    });
  }

  /**
   * 从指定表中读取实体名，然后存为一个map
   * @param {String} table 实体表名：person, organization, location
   */
  loadNames(table) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT id,${NAME_FIELDS} FROM ${table} LIMIT 100`
      var names_map = {'name_en': {}, 'name_zh': {}, 'name_zf': {}, 'name_ru': {}, 'name_ja': {}};

      this.con.query(sql, (error, rows) => {
        rows.map((row) => {
          for (let field of Object.keys(names_map)) {
            let value = row[field]
            if (value != null & value != '') {
              names_map[field][value] = row['id']
            }
          }
        });
  
        this.logMap(names_map, table);
        resolve(names_map);
      });
    });
    
  }
  
  /**
   * 从指定表中读取实体wiki链接中的实体名
   * @param {String} table 实体表名：person, organization, location
   */
  loadTitles(table) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT id,${TITLE_FIELDS} FROM ${table} LIMIT 100`
      var titles_map = {'wpurl_en': {}, 'wpurl_zh': {}, 'wpurl_zf': {}, 'wpurl_ru': {}, 'wpurl_ja': {}};
      this.con.query(sql, (error, rows) => {
        rows.map((row) => {
          for (let field of Object.keys(titles_map)) {
            let value = WikiURL.getURLTitle(row[field]);
            if (value != null & value != '') {
              titles_map[field][value] = row['id'];
            }
          }
        });

        this.logMap(titles_map, table);
        resolve(titles_map);
      });
    });
  }

  logMap(names_map, table) {
    for (let field of Object.keys(names_map)) {
      console.log(`${Object.keys(names_map[field]).length} ${field} loaded from ${table}`);
    }
  }
}

const dbLoader = new DBResourceLoader();
// dbLoader.loadTargetFields(PERSON_FIELDS, 'person_sample');
dbLoader.loadNames('person').then(names_map => {
  dbLoader.loadTitles('person').then(titles_map => {
    console.log(names_map);
    console.log(titles_map);
    dbLoader.con.end();
  })
})
