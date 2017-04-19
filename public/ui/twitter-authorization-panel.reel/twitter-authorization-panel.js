var AuthorizationPanel = require("montage-data/ui/authorization-panel.reel").AuthorizationPanel;


function stringifyOptions(options) {

    var parts = [];
    Object.keys(options).forEach(function(key) {
        parts.push(key + '=' + options[key]);
    });

    return parts.join(',');
}

function prepareOptions(options) {

    options = options || {};

    var width = options.width || 500,
        height = options.height || 500,
        preparedOptions = {
            width: width,
            height: height,
            status: 1,
            toolbar: 1,
            left: window.screenX + ((window.outerWidth - width) / 2),
            top: window.screenY + ((window.outerHeight - height) / 2.5)
        };
    
    Object.keys(options).forEach(function(key) {
        preparedOptions[key] = options[key];
    });

    return preparedOptions;
}

function getHashParam(url, name) {
    name = name.replace(/[\[]/, '\\[')
                .replace(/[\]]/, '\\]');

    var regex = new RegExp('[#&]' + name + '=([^;]*)');
    var results = regex.exec(new URL(url).hash);

    return results === null ? '' : JSON.parse(decodeURIComponent(results[1].replace(/\+/g, ' ')));
}

function open(url, options) {
    var popup;
    return new Promise(function (resolve, reject) {
           
        var popupOptions = stringifyOptions(prepareOptions(options)),
            popupName = 'authorization-panel'

        popup = window.open(url, popupName, popupOptions);

        if (!popup) {
            reject('Authorization Failed (POPUP_BLOCKED)');
        } else {

            var poolInterval = 500;
            polling = setTimeout(function tryPollPopup() {
                
                try {

                    var documentOrigin = window.location.host,
                        popupWindowLocation = popup.location,
                        popupWindowOrigin = popupWindowLocation.host;

                    if (popupWindowOrigin === documentOrigin) {
                        if (popup.document.readyState === "complete") {
                            resolve(popupWindowLocation);
                            return;
                        }
                    }

                } catch (err) {

                    //console.error(err);
                    // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.

                } finally {

                    // we're here when the child window has been navigated away or closed
                    if (!popup || popup.closed || popup.closed === undefined) {

                        reject('Authorization Failed (LOAD_CANCEL)');
                    } else if (popup) {                        

                        // we're here when the child window returned to our domain
                        setTimeout(tryPollPopup, poolInterval);
                    }
                }

            }, poolInterval);
        }
    }).then(function (popupWindowLocation) {
        
        var token = getHashParam(popupWindowLocation, 'result'),
            error = getHashParam(popupWindowLocation, 'error');

        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(token);
        }

    }).finally(function () {
        if (typeof popup.close === 'function') {
           popup.close();  
        }

        popup = null; 
    });
}

/**
 * @class Login
 * @extends AuthorizationPanel
 */
exports.TwitterAuthorizationPanel = AuthorizationPanel.specialize({
    constructor: {
        value: function OauthAuthorizationPanel() {
            this.super();
        }
    },

    enterDocument: {
        value: function () {
            
        }
    },

    isAuthenticated: {
        value: false
    },

    handleLoginAction: {
        value: function(event) {
            var self = this;
            open("/auth/twitter").then(function (credentials) {
                self.authorizationManagerPanel.approveAuthorization(credentials);
            }, function (err) {
                self.authorizationManagerPanel.cancelAuthorization();
            })
        }
    },

    logout: {
        value: function() {

        }
    }
});
