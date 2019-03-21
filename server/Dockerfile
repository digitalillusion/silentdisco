FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN echo 'deb http://ftp.debian.org/debian/ buster main' >> /etc/apt/sources.list
RUN apt-get update && apt-get -t buster install -y libc6

COPY . .

CMD [ "npm", "start" ]