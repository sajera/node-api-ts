# Dummy of Node API based on TypeScript and Express

In order to speed up starting of development process - was implemented dummy application with base functionality which may present within node application on typescript. Such as configure Typescript, start up Express server, setup and configure server router, cors, static content, file upload and parse. Applied code linters which support company code style agreement.


### Configuration

In order to provide expandable and scalable application. Each build process start from setup `configuration`. Application config may be split by environment and configuration. Implemented behavior for `*.env` (environment configuration) and `*.json` (application configuration). Within application present `.env` file in root directory with example of supported flags and `./source/configuration/development.json` as default application configuration with supported parameters.


### Server


