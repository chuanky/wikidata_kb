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
}

