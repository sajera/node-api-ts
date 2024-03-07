# Application on TypeScript and Express

To expedite the development process, a dummy application with fundamental features was created, demonstrating typical functionalities found in a Node.js application using TypeScript. This includes setting up TypeScript configuration, initiating an Express server, configuring server routes, implementing CORS, serving static content, enabling file uploads, and parsing request bodies. Additionally, code linters adhering to the company's coding standards were applied.

### Development TODO


### Deployment TODO


### Application configuration

"In our project, environment variables, such as database URLs or API keys, are managed using a `.env` file. This file, formatted as `KEY=VALUE` pairs, stores configuration data. During local development, developers create and modify this file to suit their testing needs, optionally overriding specific variables in a `.env.local` file. However, in production deployments, we avoid using `.env` files to protect sensitive information. Instead, environment variables are securely passed to the application server or container during deployment, a process handled by deployment scripts or configuration management tools. Within the Node.js application, environment variables are accessed using `process.env.VARIABLE_NAME`, simplifying configuration management without requiring direct modification of the application's code."

1. **Understanding the `.env` File:**
  - Explain that the `.env` file is a plain text file where environment variables are stored.
  - Each line in the file contains a single environment variable in the format `KEY=VALUE`.
  - Emphasize the importance of not sharing sensitive information in the `.env` file.
2. **Local Development:**
  - Describe the `.env` file's role in local development.
  - Mention that developers create this file to store environment variables needed for testing the application locally.
  - Highlight the optional `.env.local` file, which developers can use to override specific variables for their local environment without affecting others.
3. **Deployment:**
  - Explain that in production deployments, environment variables are managed differently.
  - Mention that the `.env` file is not used in production to avoid exposing sensitive information.
  - Instead, environment variables are passed directly to the application server or container during deployment.
  - This process is typically handled by deployment scripts or configuration management tools.
4. **Usage:**
  - Mention that within the Node.js application code, developers access environment variables using `process.env.VARIABLE_NAME`.
  - Explain that developers load environment variables from the `.env` file into the application using the `dotenv` package, which is installed as a dependency.
  - Assure them that once environment variables are set up correctly, they do not need to modify any JavaScript code.
5. **Security:**
  - Remind them about the importance of securing environment variables, especially in production environments.
  - Encourage them to follow best practices for managing secrets and sensitive information, such as using secure storage solutions and access controls.
6. **Support and Resources:**
  - Offer assistance and provide resources for setting up environment variables if needed.
  - Direct them to documentation or tutorials specific to their deployment environment (e.g., cloud platforms, container orchestration tools) for further guidance.



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

* [ ] `Server` Project server life cycle
    * [x] **[express server](https://expressjs.com/ "express")** and provide to use original express with options from project config 
    * [x] **[cors](https://www.npmjs.com/package/cors "CORS")** with options from project config
    * [x] **[static server](https://expressjs.com/en/4x/api.html#express.static "express static")** with options from project config
    * [x] **[parse json](https://www.npmjs.com/package/body-parser "body-parser => JSON")** with options from project config
    * [x] **[parse urlencoded](https://www.npmjs.com/package/body-parser "body-parser => URLENCODED")** with options from project config
    * [x] **[cookie/session](https://www.npmjs.com/package/express-session "express-session")** with options from project config 
    * [ ] multipart with options from project config 

* [ ] `API Controller` Project controllers
    * [x] Provide controllers entry point
    * [x] Provide functionality from express
    * [x] Implement Controller life cycle - each call to API will be handled of its own controller instance
    * [x] Provide `endpoint` as controller `public async` method with access to controller instance for current call
    * [x] Provide Decorators `API`
        * [x] @APIController({...options...}) - define `class` as API controller - read annotations of controller
        * [x] @APIEndpoint({...options...}) - define `public async` method of `{APIController}` as endpoint - setup annotation endpoint
    * [ ] Provide Decorators `@APIEndpoint` (Proxy)  
        * [x] @Swagger({...options...}) - expand `{@APIEndpoint}` annotation - provide ability to auto generate documentation of endpoint using **[Swagger](https://www.npmjs.com/package/swagger-ui-express/ "swagger-ui-express")**
        * [x] @Auth({…options…}) - check/restore `Authorization` and handle 401 Unathorized
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

* [ ] `Documentation` generate project swagger
