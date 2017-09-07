var AuthorizationPanel = require("montage/data/ui/authorization-panel.reel").AuthorizationPanel,
    Promise = require('montage/core/promise').Promise;


function getHashParam(url, name) {
    name = name.replace(/[\[]/, '\\[')
                .replace(/[\]]/, '\\]');

    var regex = new RegExp('[#&]' + name + '=([^;]*)');
    var results = regex.exec(new URL(url).hash);

    return results === null ? '' : JSON.parse(decodeURIComponent(results[1].replace(/\+/g, ' ')));
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
            var self = this;
            self._getCredentials().then(function (credentials) {
                 return self.service.authorize(credentials);
            }).then(function (authorization) {
                self.authorizationManagerPanel.approveAuthorization(authorization, self);
            });
        }
    },

    isAuthenticated: {
        value: false
    },

    _pollForCredentials: {
        value: function (popup) {

            var self = this,
                pollingInterval = 100,
                polling;
            return new Promise(function (resolve, reject) {

                if (!popup) {
                    reject('Authorization Failed (POPUP_BLOCKED)');
                } else {
                    polling = setTimeout(function tryPollPopup() {

                        try {

                            var documentOrigin = window.location.host,
                                popupWindowLocation = popup.location,
                                popupWindowOrigin = popupWindowLocation.host;

                            if (popupWindowOrigin === documentOrigin) {
                                if (popup.document.readyState === "complete") {
                                    resolve(new URL(popupWindowLocation));
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
                                setTimeout(tryPollPopup, pollingInterval);
                            }
                        }

                    }, pollingInterval);
                }
            }).then(function (popupWindowLocation) {
                var token = self._getHashParam(popupWindowLocation, 'result'),
                    error = self._getHashParam(popupWindowLocation, 'error');
    
                if (error) {
                    return Promise.reject(error);
                } else {
                   return Promise.resolve(token);
                }
            });
        }
    },

    _openPopup: {
        value: function (url, options) {
            var self = this;
            return new Promise(function (resolve, reject) {
                
                var popupWindow,
                    popupOptions = self._stringifyOptions(self._prepareOptions(options)),
                    popupName = 'authorization-panel';

                 popupWindow = window.open(url, popupName, popupOptions);

                 if (popupWindow) {
                    resolve(popupWindow)
                 } else {
                    reject(new Error('Unable to open popup'))
                 }
            });
        }
    },

    _prepareOptions: {
        value: function (options) {
            options = options || {};

            var width = options.width || 500,
                height = options.height || 500,
                preparedOptions = {
                    width: width,
                    height: height,
                    left: parseInt(window.screenX + ((window.outerWidth - width) / 2)),
                    top: parseInt(window.screenY + ((window.outerHeight - height) / 2.5)),
                    toolbar: "no", 
                    location: "no", 
                    directories: "no", 
                    status: "no", 
                    menubar: "no",  
                    scrollbars: "yes", 
                    resizable: "no", 
                    copyhistory: "no"
                };

            Object.keys(options).forEach(function(key) {
                preparedOptions[key] = options[key];
            });

            return preparedOptions;
        }
    },

    _stringifyOptions: {
        value: function (options) {
            var parts = [];
            Object.keys(options).forEach(function(key) {
                parts.push(key + '=' + options[key]);
            });

            return parts.join(',');
        }
    },

    _getHashParam: {
        value: function (url, name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

            var regex = new RegExp('[#&]' + name + '=([^;]*)'),
                results = regex.exec(url.hash);

            return results === null ? '' : JSON.parse(decodeURIComponent(results[1].replace(/\+/g, ' ')));
        }
    },

    _getCredentials: {
        value: function () {
            return new Promise(function (resolve, reject) {
                var credentials = localStorage.getItem('twitter-credentials', credentials);
                if (credentials) {
                    resolve(JSON.parse(credentials))
                } else {
                    reject(new Error('No credentials'));
                }
            });
        }
    },

    _setCredentials: {
        value: function (credentials) {
            return new Promise(function (resolve, reject) {
                localStorage.setItem('twitter-credentials', JSON.stringify(credentials));
                resolve(credentials);
            });
        }
    },

    handleLoginAction: {
        value: function(event) {
            var self = this;
            self._getCredentials().catch(function () {
                return self._openPopup("/auth/twitter").then(function (popup) {
                    return self._pollForCredentials(popup).then(function (credentials) {
                        return self._setCredentials(credentials);
                    }).finally(function () {
                        if (typeof popup.close === 'function') {
                            popup.close();
                        }
                    });
                })
            }).then(function (credentials) {
                 return self.service.authorize(credentials);
            }).then(function (authorization) {
                self.authorizationManagerPanel.approveAuthorization(authorization, self);
            }).catch(function (error) {
                console.error(error);
                self.authorizationManagerPanel.cancelAuthorization();
            })
        }
    },

    logout: {
        value: function() {
            var self = this;
            self._setCredentials("");
            self.authorizationManagerPanel.cancelAuthorization();
        }
    }
});
