var RawDataService = require("montage/data/service/raw-data-service").RawDataService,
    TwitterAuthorization = require("logic/model/twitter-authorization").TwitterAuthorization;

 exports.TwitterAuthorizationService = RawDataService.specialize({

    constructor: {
        value: function () {
            var self = this;
            self.super();

            // TODO unserialize TwitterAuthorization from session
            /*
            this.authorize({
                "token":"14651812-m9Tefd9yLYCa03VM9Yanl9JiBpK9DMqhrcj9MsduE",
                "tokenSecret":"6CkeDG2lZaFGyDWiIaKkYxoJXR9yB6Yk5bXrIgGcolWK7",
                "profile":{}
            });
            */
        }
    },

    providesAuthorization: {
        value: true
    },

    authorizationPanel: {
        value: "ui/twitter-authorization-panel.reel"
    },

    authorize: {
        value: function (panelResult) {
            var self = this;
            return new Promise(function (resolve, reject) {
                if (panelResult) {
                    self.authorization = self._mapRawDataToTwitterAuthorization(panelResult);
                    resolve(self.authorization);
                } else {
                    resolve(null);
                }
            });
        }
     },

     _mapRawDataToTwitterAuthorization: {
        value: function (rawData) {
            var authorization = new TwitterAuthorization();
            authorization.profile = rawData.profile || {};
            authorization.role = authorization.profile._accessLevel || null;
            authorization.secret = rawData.tokenSecret;
            authorization.token = rawData.token;

            return authorization;
        }
     }
});
