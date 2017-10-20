# montage-twitter

[![Build Status](https://travis-ci.com/kaazing/montage-twitter.svg?token=DkxazY7pbviHZyy38ZZb&branch=master)](https://travis-ci.com/kaazing/montage-twitter)


This is a sample app that use montage-data authentication to fetch authenticated user twitter timeline.

# Quick start

1. Install 
```
git clone git@github.com:montagestudio/montage-twitter.git
cd montage-twitter
npm install
 ```

2. Start
```
npm start
```

3. Test
Then Open you browser to "https://localhost:8080".

# TODO
- Add polling auto-updates

# To run without docker

```
# Install twitter-service
cd docker/twitter-service 
npm install
cd ../../

# Run and serve montage-twitter
PUBLIC_PATH=. APP_PORT=8080 node docker/twitter-service/index.js 
```
