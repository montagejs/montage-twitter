var Montage = require("montage").Montage,
    DataObjectDescriptor = require("montage-data/logic/model/data-object-descriptor").DataObjectDescriptor;

/**
 * @class Tweet
 * @extends Montage
 */

exports.Tweet = Montage.specialize(/** @lends Tweet.prototype */ {
    temp: {
        value: null
    },
    constructor: {
        value: function Tweet() {}
    }
}, {

    /**
     * @type {external:DataObjectDescriptor}
     */
    TYPE: {
        //get: DataObjectDescriptor.getterFor(exports, "Tweet"),
        get: function () {
            return (exports.Tweet.objectPrototype = exports.Tweet);
        }
    }
});
