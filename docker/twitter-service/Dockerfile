# Copyright 2007-2017, Kaazing Corporation. All rights reserved.
# montage-twitter-service docker
FROM node:7.9.0


RUN mkdir /home/montage-twitter-service
WORKDIR  /home/montage-twitter-service

# Install package
ADD package.json ./
RUN npm install

# Import certs
RUN mkdir certs
ADD certs/server.key certs/server.key
ADD certs/server.crt certs/server.crt

# Then add source after install
ADD index.js index.js

EXPOSE 8080

CMD ["node", "index.js"]