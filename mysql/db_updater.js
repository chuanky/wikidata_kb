var mysql = require('mysql');

module.exports = class DBUpdater {
  constructor() {
    this.con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "irica20140408"
    });
  }

  /**
   * @param {Number} id 实体ID
   * @param {String} table 'person', 'organization'， 'location'
   */
  async getRecordById(id, table) {
    let sql = `SELECT * FROM ${table} WHERE id=${id}`;
    let doc = await this.query(sql);
    console.log(doc);
    return doc;
  }

  /**
   * @param {Number} id 实体ID
   * @param {Any} field_value_pairs {'fieldName1': value1, 'fieldName2': value2 }
   * @param {String} table 数据库表名
   */
  async updateFields(id, field_value_pairs, table) {
    let sql = this.buildUpdateValueString(id, field_value_pairs, table);
    return this.query(sql);
  }

  /**
   * @param {Number} id 实体ID
   * @param {Any} field_value_pairs {'fieldName1': value1, 'fieldName2': value2 }
   * @param {String} table 数据库表名
   */
  buildUpdateValueString(id, field_value_pairs, table) {
    if (Object.keys(field_value_pairs).length < 1) return null;

    var set_values = '';
    for (let field of Object.keys(field_value_pairs)) {
      let value = field_value_pairs[field];
      if (value) {
        if (typeof value === "string") {
          value = value.replace(/'/g, "''");
          set_values += `${field}='${value}', `;
        } else {
          set_values += `${field}=${value}, `
        } 
      }
    }

    return `UPDATE ${table} SET ${set_values.slice(0, -2)} WHERE id=${id}`;
  }

  query(sql) {
    if (!sql) return;

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
    if (!sql) return;

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

  /**
   * @param {String} sqlMessage 
   */
  getColumn(sqlMessage) {
    let target = "for column ";
    let index = sqlMessage.lastIndexOf(target) + target.length + 1;
    let lastQuote = sqlMessage.lastIndexOf("'");
    return sqlMessage.slice(index, lastQuote)
  }

  handleIncorrectStringError(error, updateValues, id, table) {
    if (error['sqlMessage'].includes('Incorrect string value')) {
      console.log("Incorrect String Error: " + id);
      var field = this.getColumn(error['sqlMessage']);
      if (field.includes("wpurl")) field = field.replace('url', 'Url');
      updateValues[field] = encodeURI(updateValues[field])
      let modifiedSql = this.buildUpdateValueString(id, updateValues, table);
      this.query(modifiedSql).catch(e => {
        this.handleIncorrectStringError(e, updateValues, id, table)
      });
    }
  }

  close() {
    this.con.end();
  }
}