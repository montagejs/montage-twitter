# Copyright 2007-2017, Kaazing Corporation. All rights reserved.
# montage-twitter-service docker
FROM node:7.9.0


RUN mkdir /home/twitter-service
WORKDIR  /home/twitter-service

# Install package
ADD package.json ./
RUN npm install

# Import certs
RUN mkdir certs
ADD certs/private.key certs/private.key
ADD certs/public.crt certs/public.crt

# Then add source after install
ADD index.js index.js

EXPOSE 8080

CMD ["node", "index.js"]