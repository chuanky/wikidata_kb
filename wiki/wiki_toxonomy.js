const { queryTaxonomy } = require('wikidata-taxonomy')
var options = { lang: 'en', brief: true , children: true, property: ["P279"]}
queryTaxonomy('Q17505024', options)
  .then(taxonomy => 
    // console.log(taxonomy)
    taxonomy.concepts.forEach(concept => {
      // var qid = concept.notation[0]
      // var label = (concept.prefLabel || {}).en || '???'
      // console.log('%s %s', qid, label)
      console.log(concept)
    })
  )
  .catch(error => console.error("E", error))