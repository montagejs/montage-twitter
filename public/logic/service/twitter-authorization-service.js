var DataService = require("montage-data/logic/service/data-service").DataService,
    RawDataService = require("montage-data/logic/service/raw-data-service").RawDataService,
    DataSelector = require("montage-data/logic/service/data-selector").DataSelector;

 exports.OauthAuthorizationService = RawDataService.specialize({
    constructor: {
        value: function OauthAuthorizationService() {
            RawDataService.call(this);
        }
    },

    providesAuthorization: {
        value: true
    },
    
    authorizationPanel: {
        value: "ui/twitter-authorization-panel.reel"
    }
});
