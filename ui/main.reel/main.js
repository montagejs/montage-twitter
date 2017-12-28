var Component = require("montage/ui/component").Component,
    DataService = require("montage/data/service/data-service").DataService,
    User = require("logic/model/user").User,
    applicationService = require("data/montage-data.mjson").montageObject;

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main# */ {

    constructor: {
        value: function Main() {
            this.super();
            DataService.authorizationManager.delegate = this;
            this._initializeServices();
            this._initializeUser();
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
