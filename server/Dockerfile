FROM node:10

RUN apt-get update -qqy \
	&& apt-get -qqy install xvfb
RUN apt-get -qqy install build-essential clang libdbus-1-dev libgtk-3-dev \
                   libnotify-dev libgnome-keyring-dev libgconf2-dev \
                   libasound2-dev libcap-dev libcups2-dev libxtst-dev \
                   libxss1 libnss3-dev gcc-multilib g++-multilib curl \
                   gperf bison python-dbusmock
RUN rm -rf /var/lib/apt/lists/* /var/cache/apt/*



WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]