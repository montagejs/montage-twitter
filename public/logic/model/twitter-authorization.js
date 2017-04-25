var Montage = require("montage").Montage;

/**
 * @class TwitterAuthorization
 * @extends Montage
 */

exports.TwitterAuthorization = TwitterAuthorization = Montage.specialize(/** @lends TwitterAuthorization.prototype */ {

    profile: {
        value: undefined
    },

    role: {
        value: undefined
    },

    secret: {
        value: undefined
    },

    token: {
        value: undefined
    }

});