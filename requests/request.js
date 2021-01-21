const fetch = require('node-fetch');

module.exports = class WikidataEntityFetcher {
    constructor(wikidataId) {
        this.wikidataId = wikidataId
        this.url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&languages=en&format=json`;
    }

    getEntity() {
        return new Promise((resolve, reject) => {
            fetch(url)
            .then(res => res.json())
            .then(json => resolve(json));
        });
    }
}

