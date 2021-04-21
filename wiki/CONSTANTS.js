module.exports = class CONSTANTS {
  static LANGUAGES = {'zh-hans': 1, 'zh-hant': 2, 'en': 3, 'ru': 4, 'ja': 5};
  static LANGUAGES_SITE = {'zhwiki': 1, 'zh_yuewiki': 2, 'enwiki': 3, 'ruwiki': 4, 'jawiki': 5};
  static CLAIMS = {
    // person: p; location: l; organizations: o
    'P17': 'country',   // l, o: countryId
    'P18': 'image', // p, l, o: photoUrl
    'P27': 'country of citizenship', // p: countryId
    'P31': 'instance of', // l: level, o: type
    'P36': 'capital',   // l: capitalId
    'P39': 'position held', // p: jobTitle_en, jobTitle_zh
    'P102': 'member of political party',  // p: partyId, partyName
    'P112': 'founded by', // o: founderId, founderName_en, founderName_zh
    'P159': 'headquarters location',  // o: locationId, longitude, latitude
    'P279': 'subclass of', // for classification
    'P373': 'Commons category',  // o: category
    'P488': 'chairperson',  // o: leaderId, leaderName_en, leaderName_zh
    'P569': 'date of birth',  // p: birthday
    'P571': 'inception',  // o: foundingDate
    'P625': 'coordinate location',  // l, o: longitude, longitudeFloat, latitude, latitudeFloat
    'P1448': 'official name', // l: ancestorNames
  }

  static NAME_FIELDS = `name_en,name_zh,name_zf,name_ru,name_ja`;
  static TITLE_FIELDS = `wpurl_en,wpurl_zh,wpurl_zf,wpurl_ru,wpurl_ja`;

  static PERSON_FIELDS = `
    id, 
    countryId, 
    ${this.NAME_FIELDS},
    jobTitle_en,jobTitle_zh,
    birthday,
    photoUrl,
    ${this.TITLE_FIELDS},
    partyName,
    description,
    aliases,
    sourceTag,
    updateTime
  `

  static ORG_FIELDS = `
    id,
    ${this.NAME_FIELDS},
    countryId,
    ${this.TITLE_FIELDS},
    description,
    longitude,
    latitude,
    foundingDate,
    founderId,
    founderName_en,
    founderName_zh,
    leaderId,
    leaderName_en,
    leaderName_zh,
    aliases,
    sourceTag,
    updateTime,
    photoUrl
  `

  static LOC_FIELDS = `
    id,
    ${this.NAME_FIELDS},
    level,
    countryId,
    capitalId,
    longitude,
    longitudeFloat,
    latitude,
    latitudeFloat,
    ${this.TITLE_FIELDS},
    ancestorNames,
    description,
    aliases,
    sourceTag,
    updateTime,
    photoUrl
  `

  /**
   * wikidata和iricaDB的实体名字段对应
   */
  static LANG_PAIRS_NAME = {
    'en': 'name_en',
    'zh-hans': 'name_zh',
    'zh-hant': 'name_zf',
    'ru': 'name_ru',
    'ja': 'name_ja'
  }

  /**
   * wikidata和iricaDB的wiki title字段对应
   */
  static LANG_PAIRS_TITLE = {
    'enwiki': 'wpUrl_en',
    'zhwiki': 'wpUrl_zh',
    'zh_yuewiki': 'wpUrl_zf',
    'ruwiki': 'wpUrl_ru',
    'jawiki': 'wpUrl_ja'
  }

  static LANG_PAIRS_DESC = {
    'en': 'description',
    'zh-hans': 'description_zh',
    'zh-hant': 'description_zf',
    'ru': 'description_ru',
    'ja': 'description_ja',
  }

  static WIKI_NAME_TITLE_MAP = {
    'en': 'enwiki',
    'zh-hans': 'zhwiki',
    'zh-hant': 'zh_yuewiki',
    'ru': 'ruwiki',
    'ja': 'jawiki'
  }

  static WIKI_LINK_INITIAL = {
    'enwiki': 'en',
    'zhwiki': 'zh',
    'zh_yuewiki': 'zh-yue',
    'ruwiki': 'ru',
    'jawiki': 'ja'
  }
}

