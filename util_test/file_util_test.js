const FileUtil = require('../util/file_util')

const fileUtil = new FileUtil()

fileUtil.countLines('../data/output_per-2020-12-28.jl')
fileUtil.countLines('../data/output_org-2020-12-28.jl')
fileUtil.countLines('../data/output_loc-2020-12-28.jl')

