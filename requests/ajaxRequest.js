const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Http = new XMLHttpRequest();

const url = 'https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Berlin&props=labels&languages=en&format=json';

Http.open("GET", url);
Http.send();

Http.onreadystatechange = function() {
  if(this.readyState == 4 && this.status == 200) {
    console.log(Http.responseText)
    console.log(JSON.parse(Http.responseText))
  }
}