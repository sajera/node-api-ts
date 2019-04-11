# Dummy of Node API based on TypeScript and Express

In order to speed up starting of development process - was implemented dummy application with base functionality which may present within node application on typescript. Such as configure Typescript, start up Express server, setup and configure server router, cors, static content, file upload and body parse. Applied code linters which support company code style agreement.


### Application configuration

Provided expandable and scalable application. Each build process start from setup `configuration`. Application config may be split by environment and configuration. Implemented behavior for `*.env` (environment configuration) and `*.json` (application configuration). Within application present `.env` file in root directory with example of supported flags and `./source/configuration/development.json` as default application configuration with supported parameters. Example of all awalable configuration parameters present in `./source/configuration/example.json`.


### Application server

Provide flow to expand application server by any existing and features express modules in common way. All connected, to base server, modules has default his own configuration. It will use default configuration only if it wasn't provided from `Application configuration`.

- - - -
# Root TODO`s

* [x] `Project` common requirement to project
    * [x] Provide stable building process
    * [x] Provide ability to easy setup configuration for different environment and project requirement
    * [x] Provide API initialization flow which may apply a lot of changes with same initialization rules
    * [x] Include Server(s) life cycle
    * [x] Include Controllers life cycle
    * [ ] Include Database(s) life cycle
    * [ ] Include models life cycle
    * [ ] Generate documentation (Swagger or ...)
    * [x] Provide configurable lint rules
    * [x] Provide intuitive developer process (care about helps from IDE of developers)

* [x] `Configuration` Environment ad project configuration
    * [x] Implement getting configuration from **environment**
    * [x] Implement expanding of **process.env** from **.env** files by priority
    * [x] Implement getting project configuration from **${environment}.json** file
    * [x] Provide ability to get configuration data on **any stage of project life cycle**
    * > Priority rules for `.env` files from lowest:
        * min: `${root}/.env`
        * `${root}/${NODE_ENV}.env`
        * `${root}/${configStore}/.env`
        * max: `${root}/${configStore}/${NODE_ENV}.env`

* [ ] `Server` Project server life cycle
    * [x] **[express server](https://expressjs.com/ "express")** and provide to use original express with options from project config 
    * [x] **[cors](https://www.npmjs.com/package/cors "CORS")** with options from project config
    * [x] **[static server](https://expressjs.com/en/4x/api.html#express.static "express static")** with options from project config
    * [x] **[parse json](https://www.npmjs.com/package/body-parser "body-parser => JSON")** with options from project config
    * [x] **[parse urlencoded](https://www.npmjs.com/package/body-parser "body-parser => URLENCODED")** with options from project config
    * [ ] multipart with options from project config 
    * [ ] cookie with options from project config 
    * [ ] session (Not authorization) with options from project config 

* [ ] `API Controller` Project controllers
    * [x] Provide controllers entry point
    * [x] Provide functionality from express
    * [x] Implement Controller life cycle - each call to API will be handled of its own controller instance
    * [x] Provide `endpoint` as controller `public async` method with access to controller instance for current call
    * [x] Provide Decorators `API`
        * [x] @APIController({...options...}) - define `class` as API controller - read annotations of controller
        * [x] @APIEndpoint({...options...}) - define `public async` method of `{APIController}` as endpoint - setup annotation endpoint
    * [ ] Provide Decorators `@APIEndpoint` (Proxy)  
        * [ ] @Swagger({...options...}) - expand `{@APIEndpoint}` annotation - provide ability to auto generate documentation of endpoint using **[Swagger](https://www.npmjs.com/package/swagger-ui-express/ "swagger-ui-express")**
        * [ ] @Auth({…options…}) - check/restore `Authorization` and handle 401 Unathorized
        * [ ] @Validate - ??? or it can be as @APIEndpointSchema
        * [ ] @??? - ???
    * [x] Provide examples of usage

* [ ] `DB` Project database life cycle
    * [ ] Provide customization from configuration file
    * [ ] Provide MongoDB with Mongoose initialization
    * [ ] PostgreSQL based on "pg" initialization
    * [ ] Provide MongoDB initialization
    * [ ] Provide examples of usage

* [ ] `Model` Project model life cycle
    * [ ] Abstract helpers for model creation such as (Base)Controller
    * [ ] Provide huge customizable Models
    * [ ] Implement ability to connect models in the same way for different DB
    * [ ] Provide examples of usage
