const fetch = require('node-fetch');

const wikidataId = 'Q42';
const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&languages=en&format=json`;

fetch(url)
    .then(res => res.json())
    .then(json => console.log(json));