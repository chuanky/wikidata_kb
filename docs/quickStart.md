## 项目使用流程
>> nodejs version: v12.18.1
1. 下载wikidata JSON dump文件
2. 使用json_dump_processor.js的JSONDumpProcessor类处理JSON dump文件，文件大小：1.1T -> 115G，文件过滤后变为JSON Line文件。
3. 使用main.js根据Claims筛选出目标实体，运行过后生成3个文件，分别对应人物、组织、地点实体。
4. 使用entity_matcher.js匹配wikidata和iricaDB中的实体。
5. 使用matched_{per/org/loc}_processor.js[统计](知识库可更新实体统计-2020-01-19.md)和[更新](知识库更新数据统计_2020-01-21.md)的数据库字段。
6. 使用request.js访问wikidata api更新单个实体数据。
