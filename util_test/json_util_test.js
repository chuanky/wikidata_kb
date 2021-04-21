const JSONUtil = require('../util/json_util')

// JSONUtil.removeDuplicates('../data/loc_matched-2020-12-28.jl')
// JSONUtil.removeDuplicates('../data/per_matched-2020-12-28.jl')
// JSONUtil.removeDuplicates('../data/org_matched-2020-12-28.jl')

// JSONUtil.loadSubclasses('../data/locality.json').then(loc => {
//   console.log(loc)
// })

// JSONUtil.readJL('E:\\wikidata\\output_loc-2020-12-28.jl', 100);
// JSONUtil.readJL('E:\\wikidata\\output_org-2020-12-28.jl', 100);

const loadResources = async () => {
  const locationGeo = await JSONUtil.loadLocaions('../data/location_min.jl')

  return `Total location geo info loaded: ${Object.keys(locationGeo).length}`
}