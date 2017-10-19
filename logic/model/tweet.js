var Montage = require("montage").Montage;

/**
 * @class Tweet
 * @extends Montage
 */

exports.Tweet = Montage.specialize(/** @lends Tweet.prototype */ {
    temp: {
        value: null
    }
});
