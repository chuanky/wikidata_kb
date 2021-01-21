const MatchedEntityProcessor = require('./matched_entity_processor');
const DateUtil = require('../util/date_util');
const LocEntity = require('./entity_loc');
const Logger = require('../test_field/logger')

class MatchedLocProcessor extends MatchedEntityProcessor {
  constructor(inputFile) {
    super(inputFile);
    this.logger = new Logger('info', 'console', `../data/matched_loc_processor.log`, false);
    this.sql_logger = new Logger('debug', 'file', '../data/loc_sql_error.log')
    this.result = {
      'name_en': 0,'name_zh': 0,'name_zf': 0,'name_ru': 0,'name_ja': 0,
      'countryId': 0,
      'wpurl_en': 0,'wpurl_zh': 0,'wpurl_zf': 0,'wpurl_ru': 0,'wpurl_ja': 0,
      'description': 0, 'description_zh': 0, 'description_zf': 0, 'description_ru': 0, 'description_ja': 0,
      'longitudeFloat': 0,
      'latitudeFloat': 0,
      'ancestorNames': 0,
      'aliases': 0,
      'photoUrl': 0,
      'sourceTag': 0,
      'updateTime': 0,
      'photoUrl': 0,
    }
    
    this.rl.on('close', () => {
      setTimeout(() => {
        this.logger.info(`Total number of Entity: ${this.counter}; Total processed: ${this.processed}`);
        // console.log(this.result)
        console.log(this.update_result)
      }, 10000);
    })
  }

  process() {
    this.rl.on('line', (line) => {
      this.counter++;
      let entity_pair = JSON.parse(line);
      let wiki_entity = new LocEntity(entity_pair['wikidata'], this.con, this.con_irica);
      let db_entity = entity_pair['iricaDB'];
    
      this.update(wiki_entity, db_entity);
    
      if (this.counter % 500 == 0) {
        this.rl.pause();
        this.logger.info(`pausing for 100ms, processed: ${this.counter}`)
        setTimeout(() => this.rl.resume(), 1500);
        // setTimeout(() => this.rl.close(), 1000);
      }
    });
  }

  /**
   * 更新实体信息到数据库
   * @param {LocEntity} wiki_entity 
   */
  update = async (wiki_entity, db_entity) => {
    let names = wiki_entity.getNames();
    let countryId = await wiki_entity.getCountry('loc');
    let wikiUrls = wiki_entity.getWikiUrls();
    let descriptions = wiki_entity.getDescriptions();
    let longitudeFloat = wiki_entity.getLongitude();
    let latitudeFloat = wiki_entity.getLatitude();
    let ancestorNames = wiki_entity.getAncestorNames();
    let aliases = wiki_entity.getAliases();
    let photoUrl = wiki_entity.getPhotoUrl();
    let sourceTag = wiki_entity.getSourceTag('wikidata_2020-12-28', db_entity);

    var updateValues = {...names, 'countryId': countryId, ...wikiUrls, ...descriptions, 
                        'longitudeFloat': longitudeFloat, 'latitudeFloat': latitudeFloat,
                        'ancestorNames': ancestorNames, aliases: aliases, 'photoUrl': photoUrl, 
                        'sourceTag': sourceTag, 'updateTime': DateUtil.getUTCDateTime()}
    let sql = this.db_updater.buildUpdateValueString(db_entity['id'], updateValues, 'location');
    this.updateDB(sql, db_entity['id'], 'location', updateValues, this.sql_logger);
    this.processed++;
  }

  /**
   * @param {LocEntity} wiki_entity 
   */
  updateStats = async (wiki_entity, db_entity, result) => {
    let countryId = await wiki_entity.getCountry('org');
    this.logger.debug(`${wiki_entity.getId()}: ${wiki_entity.getLabel('en')} ---- ${db_entity['id']}: ${db_entity['name_en']}`)
    this.updateMultiLangFields(wiki_entity.getNames(), db_entity, result);
    this.updateField(countryId, db_entity, result, 'countryId');
    this.updateMultiLangFields(wiki_entity.getWikiUrls(), db_entity, result);
    this.updateMultiLangFields(wiki_entity.getDescriptions(), db_entity, result, true);
    this.updateField(wiki_entity.getLongitude(), db_entity, result, 'longitudeFloat');
    this.updateField(wiki_entity.getLatitude(), db_entity, result, 'latitudeFloat');
    this.updateField(wiki_entity.getAncestorNames(), db_entity, result, 'ancestorNames', true);
    this.updateField(wiki_entity.getAliases(), db_entity, result, 'aliases', true);
    this.updateField(wiki_entity.getPhotoUrl(), db_entity, result, 'photoUrl');

    this.appendFieldValue('wikidata-2020-12-28', db_entity, result, 'sourceTag', true);
    this.updateField(DateUtil.getUTCDateTime(), db_entity, result, 'updateTime', true);
  }
}

new MatchedLocProcessor('E:/wikidata/loc_matched-2020-12-28.jl_unique').process();