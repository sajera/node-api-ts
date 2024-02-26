## this is the stage one , also know as the build step
FROM node:20-alpine
# NOTE take in mind - production usage
ENV HOST=0.0.0.0 \
    PORT=3838\
    LOG_LEVEL=2 \
    REDIS_URL=""

USER node
WORKDIR /home/node

COPY package.json package-lock.json tsconfig.json .env ./
COPY source/ ./source

RUN npm install --no-package-lock

EXPOSE 3838

CMD ["npm", "run", "start"]

## TODO this is stage two , where the app actually runs
#FROM node:20-alpine
