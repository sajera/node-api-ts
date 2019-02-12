# Dummy of Node API based on TypeScript and Express

In order to speed up starting of development process - was implemented dummy application with base functionality which may present within node application on typescript. Such as configure Typescript, start up Express server, setup and configure server router, cors, static content, file upload and parse. Applied code linters which support company code style agreement.


### Configuration

In order to provide expandable and scalable application. Each build process start from setup `configuration`. Application config may be split by environment and configuration. Implemented behavior for `*.env` (environment configuration) and `*.json` (application configuration). Within application present `.env` file in root directory with example of supported flags and `./source/configuration/development.json` as default application configuration with supported parameters.


### Server



# Root TODO`s
* Decorator @validate({ ... props to validate from body, query, or params ... })
    * Try to use instead "own custom helper" something similar as PropTypes from react
    * If no solution found implement validate helpers

* Server parse Multipart form data
    * Provide customization from configuration files such as for cors and others

* Server parse and storing session (Not authorization session)
    * Provide customization from configuration files such as for cors and others
    * Session for unauthorized and authorized users
    * Probably should contain information about location, language etc.

* Database connection
    * Provide customization from configuration file
    * MongoDB (Mongoose optional)
    * PostgreSQL based on "pg"

* Model connection
    * Abstract helpers for model creation such as (Base)Controller
    * Example implementation for MongoDB
    * Example implementation for PostgreSQL
    * Example implementation for MongoDB with Mongoose

* Examples for services

* Swagger ...