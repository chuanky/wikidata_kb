const MatchedEntityProcessor = require('./matched_entity_processor');
const PersonEntity = require('./entity_per');
const DateUtil = require('../util/date_util');
const Logger = require('../test_field/logger')
const DBUpdater = require('../mysql/db_updater')

class MatchedPersonProcessor extends MatchedEntityProcessor {
  constructor(inputFile) {
    super(inputFile);
    this.logger = new Logger('info', 'console', `../data/matched_per_processor.log`);
    this.sql_logger = new Logger('debug', 'file', '../data/per_sql_error.log');

    this.table = 'person';
    this.result = {
      'name_en': 0, 'name_zh': 0, 'name_zf': 0, 'name_ru': 0, 'name_ja': 0,
      'countryId': 0,
      'jobTitle_en': 0, 'jobTitle_zh': 0,
      'birthday': 0,
      'photoUrl': 0,
      'wpurl_en': 0, 'wpurl_zh': 0, 'wpurl_zf': 0, 'wpurl_ru': 0, 'wpurl_ja': 0,
      'partyName': 0,
      'description': 0, 'description_zh': 0, 'description_zf': 0, 'description_ru': 0, 'description_ja': 0,
      'aliases': 0,
      'sourceTag': 0,
      'updateTime': 0
    };

    this.db_updater = new DBUpdater();
    this.update_result = {'matched': 0, 'changed': 0, 'errors': 0};
    

    this.rl.on('close', () => {
      setTimeout(() => {
        this.logger.info(`Total number of Entity: ${this.counter}; Total processed: ${this.processed}`);
        // console.log(this.result);
        // console.log(this.update_result);
      }, 2000);
    })
    
  }

  process() {
    this.rl.on('line', (line) => {
      this.counter++;
      let entity_pair = JSON.parse(line);
      let wiki_entity = new PersonEntity(entity_pair['wikidata'], this.con, this.con_irica);
      let db_entity = entity_pair['iricaDB'];
    
      // this.updateStats(wiki_entity, db_entity, this.result);
      this.update(wiki_entity, db_entity);
    
      if (this.counter % 100 == 0) {
        this.rl.pause();
        let pause_time = 500;
        this.logger.info(`pausing for ${pause_time}ms, processed: ${this.counter}`)
        setTimeout(() => this.rl.resume(), pause_time);
        // setTimeout(() => this.rl.close(), 1000);
      }
    });
  }

  /**
   * 访问wikidata query api，更新单个实体数据
   * @param {String} wiki_id 实体的wikidata Id，例：'Q22686'
   * @param {Number} db_id 实体的数据库id，例：67083
   */
  async processSingle(wiki_id, db_id) {
    let wikidata = await this.getEntity(wiki_id);
    let wiki_entity = new PersonEntity(wikidata, this.con, this.con_irica);
    this.con_irica.query(`SELECT * FROM ${this.table} WHERE id=${db_id}`, (error, record)=>{
      if (error) {
        console.log(`cannot find entity with id=${db_id} in database`)
      } else {
        let db_entity = record[0];
        this.update(wiki_entity, db_entity);
        console.log('update finished');
        console.log(`update from`);
        console.log(db_entity);
        console.log(`update to`);
        console.log(wikidata);
      }
    });
  }

  async processNewPer(wiki_id) {
    let wikidata = await this.getEntity(wiki_id);
    let wiki_entity = new PersonEntity(wikidata, this.con, this.con_irica);
    this.insert(wiki_entity);
  }

  /**
   * 插入实体信息到数据库
   * @param {PersonEntity} wiki_entity 
   */
  insert = async (wiki_entity) => {
    let person = await wiki_entity.getPerson();
    let maxId = await this.db_updater.getMaxId(this.table);
    let sql = this.db_updater.buildInsertSQL(maxId + 1, person, this.table);
    this.db_updater.query(sql).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    })
  }

  /**
   * 更新实体信息到数据库
   * @param {PersonEntity} wiki_entity 
   */
  update = async (wiki_entity, db_entity) => {
    let person = await wiki_entity.getPerson(db_entity);
    let sql = this.db_updater.buildUpdateSQL(db_entity['id'], person, this.table);
    this.updateDB(sql, db_entity['id'], this.table, person, this.sql_logger);
    this.processed++;
  }

  /**
   * 统计可更新信息,wikidata中职位、党派信息为id, 需要数据库访问得到label
   * @param {PersonEntity} wiki_entity 
   */
  updateStats = async (wiki_entity, db_entity, result) => {
    let job = await wiki_entity.getJob();
    let party = await wiki_entity.getParty();
    let countryId = await wiki_entity.getCountry('per');
    this.logger.debug(`${wiki_entity.getId()}: ${wiki_entity.getLabel('en')} ---- ${db_entity['id']}: ${db_entity['name_en']}`)
    this.updateMultiLangFields(wiki_entity.getNames(), db_entity, result);
    this.updateMultiLangFields(wiki_entity.getWikiUrls(), db_entity, result);
    this.updateMultiLangFields(wiki_entity.getDescriptions(), db_entity, result, true);
    this.updateField(countryId, db_entity, result, 'countryId');
    this.updateField(wiki_entity.getBirthday(), db_entity, result, 'birthday');
    this.updateField(wiki_entity.getPhotoUrl(), db_entity, result, 'photoUrl');
    this.updateField(party, db_entity, result, 'partyName');
    this.updateMultiLangFields(job, db_entity, result);
    this.updateField(wiki_entity.getAliases(), db_entity, result, 'aliases', true);
    this.appendFieldValue('wikidata-2020-12-28', db_entity, result, 'sourceTag')
    this.updateField(DateUtil.getUTCDateTime(), db_entity, result, 'updateTime', true);
    this.processed++;
  }
}

const processor = new MatchedPersonProcessor('../data/per_matched-2020-12-28.jl');

// processor.processSingle('Q22686', 67083);
// processor.processSingle('Q6279', 281595);
processor.processNewPer('Q337507');
// processor.processNewPer('Q128573');
// processor.processNewPer('Q188095');
// processor.processNewPer('Q11572647');
// processor.processNewPer('Q17198778');