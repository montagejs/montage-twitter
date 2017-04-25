var RawDataService = require("montage-data/logic/service/raw-data-service").RawDataService,
    TwitterAuthorization = require("logic/model/twitter-authorization").TwitterAuthorization;

 exports.TwitterAuthorizationService = RawDataService.specialize({

    providesAuthorization: {
        value: true
    },

    authorizationPanel: {
        value: "ui/twitter-authorization-panel.reel"
    },

    authorize: {
        value: function (hashResult) {
            var self = this;
            return new Promise(function (resolve, reject) {
                var token = self._getHashParam(hashResult, 'result'),
                    error = self._getHashParam(hashResult, 'error');


                if (error) {
                    reject(error);
                } else {
                    self.authorization = self._mapRawDataToTwitterAuthorization(token);
                    console.log("Authorization", self.authorization);
                    resolve(self.authorization);
                }
            });
        }
     },

     _mapRawDataToTwitterAuthorization: {
        value: function (rawData) {
            var authorization = new TwitterAuthorization();
            authorization.profile = rawData.profile;
            authorization.role = rawData.profile._accessLevel;
            authorization.secret = rawData.tokenSecret;
            authorization.token = rawData.token;
            return authorization;
        }
     },

     _getHashParam: {
         value: function (url, name) {
             name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

             var regex = new RegExp('[#&]' + name + '=([^;]*)'),
                 results = regex.exec(url.hash);

             return results === null ? '' : JSON.parse(decodeURIComponent(results[1].replace(/\+/g, ' ')));
         }
     }

});