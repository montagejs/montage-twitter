var Component = require("montage/ui/component").Component,
    DataService = require("montage/data/service/data-service").DataService,
    User = require("logic/model/user").User,
    applicationService = require("data/montage-data.mjson").montageObject;

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main# */ {
    
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

    isAuthenticationLoading: {
        value: null
    },

    _authorizationManager: {
        get: function () {
            return DataService.authorizationManager;
        }
    },

    authorizationPanel: {
        get: function () {
            return this._authorizationManager.authorizationManagerPanel;
        }
    },

    constructor: {
        value: function Main() {
            this.super();
        }
    },

    _initializeServices: {
        value: function () {
            this.application.service = applicationService;
            this.isReady = true;
        }
    },

    _initializeUser: {
        value: function () {
            var self = this;
            return this.application.service.fetchData(User).then(function (users) {
                self.application.user = users[0];
                return null;
            });
        }
    },

    enterDocument: {
        value: function () {
            this._initializeServices();
            this._initializeUser();
        }
    },

    authorizationManagerDidAuthorizeService: {
        value: function(authorizationManager, dataService) {
            this.isAuthenticated = true;
            this.isAuthenticationLoading = false;
        }
    }
});
