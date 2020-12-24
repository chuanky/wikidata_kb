const fetch = require("node-fetch")

const url = "https://www.wikidata.org/w/api.php?"
const entityId = "Q17505024"   //Q23548 for NASA; Q17505024 for space agency
const propertyId = "P31"
var entityQuery = {
  "action": "wbgetentities",
  "ids": entityId,
  "props": "labels",
  "languages": "en",    //"zh|zh-hant|en|ru|ja" for irica languages
  "format": "json"
}
var claimQuery = {
  "action": "wbgetclaims",
  "entity": entityId,
  "property": propertyId,    // P279 for "subclass of"; P31 for "instance of"
  "format": "json"
}

const entitySearchParams = new URLSearchParams(entityQuery);
const entityQueryUrl = url + entitySearchParams.toString();

const claimSearchParams = new URLSearchParams(claimQuery);
const claimQueryUrl = url + claimSearchParams.toString();

// fetch(entityQueryUrl)
//   .then(response => response.json()
//     .then(data => printEntity(data))
//   );

function printEntity(data) {
  console.log(data['entities'][entityId]);
}

function printClaim(data) {
  console.log(data['claims'][propertyId][0]['mainsnak']);
}

fetch("http://search.people.cn/api-search/elasticSearch/search", {
  headers: {'Content-Type': 'application/json;charset=UTF-8'},
  method: 'POST',
  body: '{"key":"大选","page":1,"limit":20,"hasTitle":true,"hasContent":true,"isFuzzy":true,"type":7,"domain":"world.people.com.cn","sortType":2,"startTime":0,"endTime":0}'
})
  .then(response => response.json()
    .then(data => console.log(data))
  );