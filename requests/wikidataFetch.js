const fetch = require("node-fetch")

const url = "https://www.wikidata.org/w/api.php?"
const searchUrl = "https://en.wikipedia.org/w/api.php?"
var simpleQuery = {
  "action": "wbgetentities",
  "sites": "enwiki",
  "titles": "Berlin",
  "props": "descriptions",
  "languages": "zh|zh-hant|en|ru|ja",
  "format": "json"
}

var searchQuery = {
  "action": "query",
  "list": "search",
  "srsearch": "Xi Jinping",
  "utf8": "",
  "format": "json"
}
const searchParams = new URLSearchParams(searchQuery);
const fullUrl = searchUrl + searchParams.toString();

function printData(data){
  console.log(data['query']['search'])
}

fetch("http://search.people.cn/api-search/elasticSearch/search", {
  method: 'POST',
  body: '{"key":"大选","page":1,"limit":20,"hasTitle":true,"hasContent":true,"isFuzzy":true,"type":7,"domain":"world.people.com.cn","sortType":2,"startTime":0,"endTime":0}'
})
  .then(response => console.log(response.json()));