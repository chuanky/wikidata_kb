const WikiURL = require('../wiki/wikiURL')

let title1 = WikiURL.getURLTitle('http://en.wikipedia.org/wiki/Melanie_Walsh_%28illustrator/writer%29');
console.log(title1);
let title2 = WikiURL.getURLTitle('http://ru.wikipedia.org/wiki/%D0%9D%D0%B0%D0%B7%D0%B0%D1%80%D1%8F%D0%BD,_%D0%90%D1%80%D0%BC%D0%B5%D0%BD_%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B8%D1%87');
console.log(title2);