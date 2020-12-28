const crypto = require('crypto')

let hash = crypto.createHash('md5').update('123456').digest("hex")

console.log(hash)