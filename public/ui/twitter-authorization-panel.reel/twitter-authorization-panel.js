var AuthorizationPanel = require("montage-data/ui/authorization-panel.reel").AuthorizationPanel;

/**
 * @class Login
 * @extends AuthorizationPanel
 */
exports.TwitterAuthorizationPanel = AuthorizationPanel.specialize({

    _pollForCredentials: {
        value: function (popup) {
            var pollingInterval = 500,
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
            })
        }
    },

    _openPopup: {
        value: function (url, options) {
            var self = this,
                popupOptions = self._stringifyOptions(self._prepareOptions(options)),
                popupName = 'authorization-panel';

            return window.open(url, popupName, popupOptions);
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

    isAuthenticated: {
        value: false
    },

    handleLoginAction: {
        value: function(event) {
            var self = this,
                popup = this._openPopup("/auth/twitter");

            this._pollForCredentials(popup).then(function (result) {
                console.log("Result", result);
                return self.service.authorize(result);
            }).then(function (authorization) {
                self.authorizationManagerPanel.approveAuthorization(authorization, self);
            }).catch(function (error) {
                console.error(error);
                self.authorizationManagerPanel.cancelAuthorization();
            }).finally(function () {
                if (typeof popup.close === 'function') {
                    popup.close();
                }

                self._popup = null;
            });
        }
    },

    logout: {
        value: function() {

        }
    }
});
