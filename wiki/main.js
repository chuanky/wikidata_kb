const JSONUtil = require('../util/json_util')
const EventEmitter = require('events')

var result = {}
const fileLoaderEmitter = new EventEmitter();

JSONUtil.loadSubclasses('../data/government_agency_subclasses.json', result, fileLoaderEmitter);

fileLoaderEmitter.on('loadFinished', () => {
  console.log(result)
})