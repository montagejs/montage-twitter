var HttpService = require("montage-data/logic/service/http-service").HttpService,
    DataService = require("montage-data/logic/service/data-service").DataService,
    DataSelector = require("montage-data/logic/service/data-selector").DataSelector,
    Tweet = require('../model/tweet').Tweet;

/**
 * Provides data for applications.
 *
 * @class
 * @link https://dev.twitter.com/rest/
 * @extends external:DataService
 */
 exports.TwitterService = HttpService.specialize(/** @lends TwitterService.prototype */ {
        
    authorizationPolicy: {
        value: DataService.AuthorizationPolicyType.UpfrontAuthorizationPolicy
    },
    providesAuthorization: {
        value: false
    },

    authorizationServices: {
        value: ["./twitter-authorization-service"]
    },

    authorizationManagerWillAuthorizeWithService: {
        value:function( authorizationManager, authorizationService) {
            authorizationService.connectionDescriptor = this.authorizationDescriptor;
        }
    },

    //
    //
    //

    ENDPOINT: {
        value: '/api/twitter'
    },

    setHeadersForQuery: {
        value: function (headers, query) {
            var authorization = this.authorization[0];
            headers['authorization-token'] = authorization.token;
            headers['authorization-secret'] = authorization.secret;
        }
    },

    fetchRawData: {
        value: function (stream) {

            var self = this,
                authorization = self.authorization,
                criteria = stream.selector.criteria,
                parameters = criteria.parameters;


            var apiUrl = self.ENDPOINT + "/" + parameters.object + "/" + parameters.action + "?";

            if (parameters.userName) {
                apiUrl += 'screen_name=' + encodeURIComponent(parameters.userName);
            }

            return self.fetchHttpRawData(apiUrl).then(function (data) {
                if (data) {
                    self.addRawData(stream, data, criteria);
                    self.rawDataDone(stream);
                }
            });
        }
    },

    mapFromRawData: {
        value: function (object, rawData, criteria) {
            object.id = rawData.id;
            object.text = rawData.text;
            object.created_at = rawData.created_at;
            object.user = {
                name: rawData.user.name
            };
        }
    },

    types: {
        get: function () {
            return [Tweet];
        }
    }
});