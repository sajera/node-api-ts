# Application on TypeScript and Express

To expedite the development process, a dummy application with fundamental features was created, demonstrating typical functionalities found in a Node.js application using TypeScript. This includes setting up TypeScript configuration, initiating an Express server, configuring server routes, implementing CORS, serving static content, enabling file uploads, and parsing request bodies. Additionally, code linters adhering to the company's coding standards were applied.


### Development Environment Setup

Configuring the development process may vary depending on the capabilities of your system. This allows developers to choose the approach that best fits their environment and preferences.
> docker-compose.yaml - the simplest way to use [Docker](https://www.docker.com/get-started/) in the project, the development environment is set up with all the necessary services.

#### Infrastructure with Docker
1. Launch Docker [Docker](https://www.docker.com/get-started/)
2. Run the server in development mode
```
 docker compose up
```

#### Manual Infrastructure Setup
For manual infrastructure setup, you need to install and run the required services on your computer. Currently, these are:
1. [Redis](https://redis.io/)
2. [MongoDB](https://www.mongodb.com/)

Connect to remote/local services, create an `env.local` file in the project's main directory and describe the variables specific to your environment:
```
# with running locally instance of Redis
REDIS_URL=redis://127.0.0.1:6379
# with running locally instance of Mongo
MONGO_URL=mongodb://127.0.0.1:27017/node-api-ts
```

Install the application dependencies:
```
npm install
```
Run the application in development mode:
```
npm run start:dev
```

### Deployment

The application is designed to be deployed using [Docker](https://www.docker.com/get-started/) with configuration set up using environment variables
> Please utilize the `Dockerfile:production` file for deployment


### Application configuration

In our project, environment variables, such as database URLs or API keys, are managed using a `.env` file. This file, formatted as `KEY=VALUE` pairs, stores configuration data. During local development, developers create and modify this file to suit their testing needs, optionally overriding specific variables in a `.env.local` file. However, in production deployments, we avoid using `.env` files to protect sensitive information. Instead, environment variables are securely passed to the application server or container during deployment, a process handled by deployment scripts or configuration management tools. Within the Node.js application, environment variables are accessed using `process.env.VARIABLE_NAME`, simplifying configuration management without requiring direct modification of the application's code.

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
    * [x] Generate documentation Swagger
    * [x] Provide configurable lint rules
    * [x] Provide intuitive developer process (care about helps from IDE of developers)

* [ ] `Server` Project server
    * [x] **[express server](https://expressjs.com/ "express")** and provide to use original express with options from project config 
    * [x] **[cors](https://www.npmjs.com/package/cors "CORS")** with options from project config
    * [x] **[static server](https://expressjs.com/en/4x/api.html#express.static "express static")** with options from project config
    * [x] **[cookie/session](https://www.npmjs.com/package/express-session "express-session")** with options from project config 
    * [x] **[parse json](https://www.npmjs.com/package/body-parser "body-parser => JSON")** with options and validation
    * [x] **[parse urlencoded](https://www.npmjs.com/package/body-parser "body-parser => URLENCODED")** with  options and validation
    * [ ] **[multer](https://www.npmjs.com/package/multer)** with options and validation - FILES|multipart/form-data

* [x] `API Controller` Project controllers
    * [x] Provide controllers entry point
    * [x] Provide functionality from express
    * [x] Implement Controller life cycle - each call to API will be handled of its own controller instance
    * [x] Provide `endpoint` as controller `public async` method with access to controller instance of current call
    * [x] Provide Decorators `API`
        * [x] @API({ ...options }) - define `class` as API controller - read annotations of controller
        * [x] @Endpoint({ ...options }) - define `public async` method of `@API` as endpoint - setup annotation endpoint
    * [x] Provide Decorators `@Endpoint`
        * [x] @Swagger({ ...options }) - expand `@Endpoint` annotation - provide ability to auto generate documentation of endpoint using **[Swagger](https://www.npmjs.com/package/swagger-ui-express/ "swagger-ui-express")**
        * [x] @Auth({ ...options }) - check `Authorization` and handle 401 Unathorized
        * [x] @Json({ ...options }) - parse body to get data from JSON
        * [x] @URLEncoded({ ...options }) - configure parsing body to get data from */x-www-form-urlencoded
        * [x] @URLEncoded({ ...options }) - configure parsing body to get data from */x-www-form-urlencoded
        * [x] @Query({ ...options }) - configure parsing query parameters
        * [x] @Params({ ...options }) - configure parsing url path parameters
        * [ ] @Multer({ ...options }) - configure parsing */form-data with files
        * [x] ({ ...options, schema: Yup }) - all parsing decorators are connected with the Swagger documentation and have ability to validate data using **[Yup](https://www.npmjs.com/package/yup) validators
    * [x] Provide examples of usage

* [ ] `DB` Project databases
    * [ ] customization from configuration file
    * [x] MongoDB with Mongoose
    * [ ] PostgreSQL with "pg"
    * [x] Redis
    * [ ] examples of usage
