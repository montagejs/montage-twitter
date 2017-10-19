var Component = require("montage/ui/component").Component,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    DataService = require("montage/data/service/data-service").DataService,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    User = require("logic/model/user").User;

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main# */ {

    constructor: {
        value: function Main() {
            this.super();
            DataService.authorizationManager.delegate = this;
            var self = this;
            this._initializeServices().then(function () {
                return self._initializeUser();
            });
        }
    },

    

    _initializeServices: {
        value: function () {
            var self = this;
            return require.async("data/montage-data.mjson").then(function (descriptor) {
                var deserializer = new Deserializer().init(JSON.stringify(descriptor), require);
                return deserializer.deserializeObject();
            }).then(function (service) {
                self.application.service = service;
                self.isReady = true;
                return service;
            });
        }
    },

    _initializeUser: {
        value: function () {
            var self = this;
            return this.application.service.fetchData(User).then(function (users) {
                self.user = users[0];
                return null;
            });
        }
    },

    isReady: {
        value: false
    },

    // Holds the Authenticate object after a succesfull authrorization
    isAuthenticated: {
        value: false
    },

    user: {
        value: undefined
    },

    _authorizationManager: {
         get: function () {
             return DataService.authorizationManager;
         }
     },

    isAuthenticationLoading: {
        value: null
    },

    authorizationManagerWillInstantiateAuthorizationPanelForService: {
        value: function(authorizationManager, authorizationPanel, authorizationService) {

        	// We put it in a slot
            this.auth.content = this.authorizationPanel = new authorizationPanel();
            this.isAuthenticationLoading = true;
            return this.authorizationPanel;
        }
    },

    authorizationManagerDidAuthorizeService: {
        value: function(authorizationManager, dataService) {
            this.isAuthenticated = true;
            this.isAuthenticationLoading = false;
        }
    }
});
