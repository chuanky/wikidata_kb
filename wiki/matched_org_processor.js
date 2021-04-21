const MatchedEntityProcessor = require('./matched_entity_processor');
const DateUtil = require('../util/date_util');
const OrgEntity = require('./entity_org');
const Logger = require('../test_field/logger')
const DBUpdater = require('../mysql/db_updater')

class MatchedOrgProcessor extends MatchedEntityProcessor {
  constructor(inputFile) {
    super(inputFile);
    this.logger = new Logger('info', 'console', `../data/matched_org_processor.log`);
    this.sql_logger = new Logger('debug', 'file', '../data/org_sql_error.log');

    this.table = 'organization'
    this.result = {
      'name_en': 0,'name_zh': 0,'name_zf': 0,'name_ru': 0,'name_ja': 0,
      'countryId': 0,
      'wpurl_en': 0,'wpurl_zh': 0,'wpurl_zf': 0,'wpurl_ru': 0,'wpurl_ja': 0,
      'description': 0, 'description_zh': 0, 'description_zf': 0, 'description_ru': 0, 'description_ja': 0,
      'longitude': 0,
      'latitude': 0,
      'foundingDate': 0,
      'founderName_en': 0,
      'founderName_zh': 0,
      'leaderName_en': 0,
      'leaderName_zh': 0,
      'aliases': 0,
      'photoUrl': 0,
      'sourceTag': 0,
      'updateTime': 0,
    }

    this.db_updater = new DBUpdater();
    this.update_result = {'matched': 0, 'changed': 0, 'errors': 0};

    this.rl.on('close', () => {
      setTimeout(() => {
        this.logger.info(`Total number of Entity: ${this.counter}; Total processed: ${this.processed}`);
        // console.log(this.result)
        console.log(this.update_result)
      }, 2000);
    })
  }

  process() {
    this.rl.on('line', (line) => {
      this.counter++;
      let entity_pair = JSON.parse(line);
      let wiki_entity = new OrgEntity(entity_pair['wikidata'], this.con, this.con_irica);
      let db_entity = entity_pair['iricaDB'];
    
      this.update(wiki_entity, db_entity);
    
      if (this.counter % 500 == 0) {
        this.rl.pause();
        this.logger.info(`pausing for 1000ms, processed: ${this.counter}`)
        setTimeout(() => this.rl.resume(), 1000);
        // setTimeout(() => this.rl.close(), 1000);
      }
    });
  }

  /**
   * 访问wikidata query api，更新单个实体数据
   * @param {String} wiki_id 实体的wikidata Id，例：'Q7248756'
   * @param {Number} db_id 实体的数据库id，例：4198
   */
  async processSingle(wiki_id, db_id) {
    let wikidata = await this.getEntity(wiki_id);
    let wiki_entity = new OrgEntity(wikidata, this.con, this.con_irica);
    this.con_irica.query(`SELECT * FROM person WHERE id=${db_id}`, (error, record)=>{
      if (!error) {
        let db_entity = record[0];
        this.update(wiki_entity, db_entity);
        console.log('update finished');
        console.log(`update from ${db_entity} to ${wikidata}`)
      }
    });
  }

  async processNewOrg(wiki_id) {
    let wikidata = await this.getEntity(wiki_id);
    let wiki_entity = new OrgEntity(wikidata, this.con, this.con_irica);
    this.insert(wiki_entity);
  }

  /**
   * 插入实体信息到数据库
   * @param {OrgEntity} wiki_entity 
   */
  insert = async (wiki_entity) => {
    let org = await wiki_entity.getOrg();
    let maxId = await this.db_updater.getMaxId(this.table);
    let sql = this.db_updater.buildInsertSQL(maxId + 1, org, this.table);
    this.db_updater.query(sql).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    })
  }

  /**
   * 更新实体信息到数据库
   * @param {OrgEntity} wiki_entity 
   */
  update = async (wiki_entity, db_entity) => {
    let org = await wiki_entity.getOrg(db_entity);
    let sql = this.db_updater.buildUpdateSQL(db_entity['id'], org, this.table);
    this.updateDB(sql, db_entity['id'], this.table, org, this.sql_logger);
    this.processed++;
  }

  /**
   * @param {OrgEntity} wiki_entity 
   */
  updateStats = async (wiki_entity, db_entity, result) => {
    let countryId = await wiki_entity.getCountry('org');
    let founderNames = await wiki_entity.getFounderNames();
    let leaderNames = await wiki_entity.getLeaderNames();
    this.logger.debug(`${wiki_entity.getId()}: ${wiki_entity.getLabel('en')} ---- ${db_entity['id']}: ${db_entity['name_en']}`)
    this.updateMultiLangFields(wiki_entity.getNames(), db_entity, result);
    this.updateField(countryId, db_entity, result, 'countryId');
    this.updateMultiLangFields(wiki_entity.getWikiUrls(), db_entity, result);
    this.updateMultiLangFields(wiki_entity.getDescriptions(), db_entity, result, true);
    this.updateField(wiki_entity.getLongitude(), db_entity, result, 'longitude');
    this.updateField(wiki_entity.getLatitude(), db_entity, result, 'latitude');
    this.updateField(wiki_entity.getFoundingDate(), db_entity, result, 'foundingDate');
    this.updateMultiLangFields(founderNames, db_entity, result);
    this.updateMultiLangFields(leaderNames, db_entity, result);
    this.updateField(wiki_entity.getAliases(), db_entity, result, 'aliases', true);
    this.updateField(wiki_entity.getPhotoUrl(), db_entity, result, 'photoUrl');

    this.appendFieldValue('wikidata-2020-12-28', db_entity, result, 'sourceTag', true);
    this.updateField(DateUtil.getUTCDateTime(), db_entity, result, 'updateTime', true);
  }
}

const processor = new MatchedOrgProcessor('E:/wikidata/org_matched-2020-12-28.jl_unique')

// processor.processSingle('Q7248756', 4198);
// processor.processNewOrg('Q23548');