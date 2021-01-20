var mysql = require('mysql');
const { PERSON_FIELDS, NAME_FIELDS, TITLE_FIELDS } = require('../wiki/CONSTANTS')

class DBUpdater {
  constructor() {
    this.con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "iricaStructure"
    });
  }

  async getDocById(id) {
    let sql = `SELECT * FROM doc WHERE id=${id}`;
    let doc = await this.query(sql);
    return doc;
  }

  update()

  query(sql) {
    return new Promise((resolve, reject) => {
      this.con.query(sql, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    })
  }

  queryFirstMatch(sql) {
    return new Promise((resolve, reject) => {
      let limit = "LIMIT 1";
      this.con.query(`${sql} ${limit}`, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    this.con.end();
  }
}

const db = new DBUpdater();
db.getDocById(4).then(row => console.log(row));
db.close();
