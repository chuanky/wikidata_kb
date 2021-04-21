const fs = require('fs');
const readline = require('readline');
const Entity = require('./entity');

const rl = readline.createInterface({
  input: fs.createReadStream('E:/wikidata/output_loc-2020-12-28.jl'),
})

const os = fs.createWriteStream('../data/location_min.jl')

var counter = 0;
rl.on('line', (line) => {
  counter++;
  let entity = new Entity(JSON.parse(line));
  let id = entity.getId();
  let longitude = entity.getLatitude();
  let latitude = entity.getLatitude();

  if (longitude) {
    let result = {'id': id, 'longitude': longitude, 'latitude': latitude};
    os.write(JSON.stringify(result) + '\n');
  }
  

  if (counter % 100000 == 0) {
    console.log(`${counter} processed`);
  }
})