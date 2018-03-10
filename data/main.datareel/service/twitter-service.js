var HttpService = require("montage/data/service/http-service").HttpService,
    DataService = require("montage/data/service/data-service").DataService,
    Tweet = require('logic/model/tweet').Tweet;

var Connection = require("logic/service/twitter-service-connection.json");
    // Replace the above with the following to load mock data
// var  Connection = require("logic/service/twitter-service-connection.mock.json");

/**
 * Provides data for applications.
 *
 * @class
 * @link https://dev.twitter.com/rest/
 * @extends external:DataService
 */
exports.Twitter = exports.TwitterService = HttpService.specialize(/** @lends TwitterService.prototype */ {

    authorizationPolicy: {
        value: DataService.AuthorizationPolicy.UP_FRONT
    },

    providesAuthorization: {
        value: false
    },

    authorizationServices: {
        value: ["./twitter-authorization-service"]
    },

    authorizationManagerWillAuthorizeWithService: {
        value: function (authorizationManager, authorizationService) {
            authorizationService.connectionDescriptor = this.authorizationDescriptor;
        }
    },

    setHeadersForQuery: {
        value: function (headers, query) {
            var authorization = this.authorization;

            if (authorization && authorization.length) {
                headers['authorization-token'] = authorization[0].token;
                headers['authorization-secret'] = authorization[0].secret;
            }
        }
    },

    fetchRawData: {
        value: function (stream) {
            var self = this,
                criteria = stream.query.criteria,
                parameters = criteria.parameters,
                apiUrl = Connection.url + "/" + parameters.type + "/" + parameters.action + "?";

            if (parameters.username) {
                apiUrl += 'screen_name=' + encodeURIComponent(parameters.username);
            }

            return self.fetchHttpRawData(apiUrl).then(function (data) {
                if (data) {
                    self.addRawData(stream, data);
                    self.rawDataDone(stream);
                }
            });
        }
    },

    mapRawDataToObject: {
        value: function (rawData, object) {
            object.id = rawData.id;
            object.text = rawData.text;
            object.created_at = rawData.created_at;
            object.user = {
                name: rawData.user.name
            };
        }
    }

});
