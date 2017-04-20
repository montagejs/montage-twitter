var Component = require("montage/ui/component").Component,
    DataService = require("montage-data/logic/service/data-service").DataService;

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main# */ {
    constructor: {
        value: function Main() {
            this.super();

            DataService.authorizationManager.delegate = this;
        }
    },

    _authorizationManager: {
        get: function () {
            return DataService.authorizationManager;
        }
    },

    //Holds the Authenticate object after a succesfull authrorization
    isAuthenticated: {
        value: false
    },

    authorizationManagerWillInstantiateAuthorizationPanelForService: {
        value: function(authorizationManager, authorizationPanel, authorizationService) {

            console.log('authorizationManagerWillInstantiateAuthorizationPanelForService', arguments);

        	// We put it in a slot
           //  this.auth.content = this.authorizationPanel = new authorizationPanel;

            return this.authorizationPanel;
        }
    },

    authorizationManagerDidAuthorizeService: {
        value: function(authorizationManager, dataService) {

            console.log('authorizationManagerDidAuthorizeService', arguments);

            this.isAuthenticated = true;
        }
    }
});
