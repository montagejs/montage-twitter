var Montage = require("montage").Montage;

/**
 * @class User
 * @extends Montage
 */

exports.User = Montage.specialize(/** @lends User.prototype */ {

    avatar: {
        value: undefined
    },

    handle: {
        value: undefined
    },

    id: {
        value: undefined
    },

    name: {
        value: undefined
    },

    role: {
        value: undefined
    },

    timelineTweets: {
        get: function () {
            if (!this._timelineTweets) {
                this._timelineTweets = [];
            }
            return this._timelineTweets;
        }
    },
    
    tweets: {
        get: function () {
            if (!this._tweets) {
                this._tweets = [];
            }
            return this._tweets;
        }
    }
        
});
