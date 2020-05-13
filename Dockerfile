FROM node:14.2.0-alpine

ENV NODE_ENV production
ENV REDIS_PORT 6379
ENV REDIS_HOST redis
ENV AWS_BUCKET poom-poom-tchak
ENV DEBUG nodebug

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --silent && mv node_modules ../

COPY . .

EXPOSE 3000

CMD npm start
