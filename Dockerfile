FROM node:alpine
WORKDIR /app
COPY package.json /app
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
RUN apk add flux kubectl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/
RUN npm install express
COPY . /app
EXPOSE 3000
CMD ["node","bin/www"]