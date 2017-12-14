var HttpService = require("montage/data/service/http-service").HttpService,
    DataService = require("montage/data/service/data-service").DataService,
    Role = require("logic/model/role").Role,
    User = require("logic/model/user").User,
    UserObjectDescriptor = require("data/model/user.mjson").montageObject;

/**
 * Provides data for applications.
 *
 * @class
 * @link https://dev.twitter.com/rest/
 * @extends external:DataService
 */
exports.UserService = HttpService.specialize(/** @lends UserService.prototype */ {

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

    fetchRawData: {
        value: function (stream) {
            var self = this,
                parameters = stream.query.criteria.parameters,
                username = parameters && parameters.username;

            if (username) {
                this._fetchUserWithName(stream, username);
            } else if (stream.query.type === User || stream.query.type === UserObjectDescriptor) {
                this._fetchUser(stream);
            } else {
                this._fetchRole(stream);
            }       
        }
    },

    _fetchRole: {
        value: function (stream) {
            this.addRawData(stream, [{
                id: stream.query.criteria.parameters.accessLevel
            }]);
            this.rawDataDone(stream);
        }
    },

    _fetchUser: {
        value: function (stream) {
            var rawUser = this.authorization && this.authorization[0].profile;
            this.addRawData(stream, [rawUser]);
            this.rawDataDone(stream);
        }
    },

    _fetchUserWithName: {
        value: function (stream, username) {
            var rawUser = {
                username: username,
                displayName: username
            };
            this.addRawData(stream, [rawUser]);
            this.rawDataDone(stream);
        }
    }
});
