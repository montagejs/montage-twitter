var HttpService = require("montage-data/logic/service/http-service").HttpService,
    DataService = require("montage-data/logic/service/data-service").DataService;

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
                criteria = stream.selector.criteria,
                parameters = criteria.parameters,
                url = self.ENDPOINT + "/" + parameters.object + "/" + parameters.action;


            return self.fetchHttpRawData(url).then(function (data) {
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
    }
});
