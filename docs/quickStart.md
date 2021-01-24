## quickStart
#### 项目环境要求

- nodejs version: 12+
- npm version: 6+

#### 项目部署

1. 使用终端进入项目根目录
2. 执行终端命令：npm install

#### 项目使用流程

##### 批量更新

1. 下载wikidata JSON dump文件。
2. 使用json_dump_processor.js的JSONDumpProcessor类处理JSON dump文件，文件大小：1.1T -> 115G，文件过滤后变为JSON Line文件。
3. 使用classify_entity.js根据Claims筛选出目标实体，运行过后生成3个文件，分别对应人物、组织、地点实体。
4. 使用entity_matcher.js匹配wikidata和iricaDB中的实体。
5. 使用matched_{per/org/loc}_processor.js[统计](知识库可更新实体统计-2020-01-19.md)和[更新](知识库更新数据统计_2020-01-21.md)的数据库字段。

##### 单个实体更新

- 使用matched_{per/org/loc}_processor.js中的processSingle函数进行单个实体更新。

##### 单个实体插入

- 使用matched_{per/org/loc}_processor.js中的processNew{Per/Org/Loc}函数进行单个实体更新。