var mysql = require('mysql');
var fs = require('fs')
var WikiURL = require('../wiki/wikiURL')

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

  loadWikiURL() {;
    var enwikis = {};
    var duplicateCount = 0;
    this.con.query(`select id, name_en, wpurl_en, description
      from person 
      where wpurl_en is not null and wpurl_en != ''`, 
      (error, results, fields) => {
      if (error) throw error;
      for (let result of results) {
        let title = WikiURL.getURLTitle(result['wpurl_en']);
        if (enwikis[title]) {
          duplicateCount++;
          this.os.write(`duplicate recode record1: ${enwikis[title][0]}; recode2: ${result['id']} ${title}\n`);
          this.os.write(`description1: ${enwikis[title][1]}\n`);
          this.os.write(`description2: ${result['description']}\n`);
          this.os.write('----------------------------------------------------------\n');
        }
        enwikis[title] = [result['id'], result['description']];
      }
      console.log(Object.keys(enwikis).length)
      console.log(duplicateCount);
      this.con.end();
    });
  }

}

new DBResourceLoader().loadWikiURL();
