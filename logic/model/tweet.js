var Montage = require("montage").Montage,
    ModuleReference = require("montage/core/module-reference").ModuleReference,
    ModuleObjectDescriptor = require("montage/core/meta/module-object-descriptor").ModuleObjectDescriptor;

/**
 * @class Tweet
 * @extends Montage
 */

exports.Tweet = Tweet = Montage.specialize(/** @lends Tweet.prototype */ {
    temp: {
        value: null
    },
    constructor: {
        value: function Tweet() {}
    }
}, {

    // objectDescriptor: {
    //     get: function () {
    //         return this._objectDescriptor || (this._objectDescriptor = new ModuleObjectDescriptor().initWithModuleAndExportName(this.moduleReference, "Tweet"));
    //     }
    // },
    //
    // moduleReference: {
    //     get: function () {
    //         return this._moduleReference || (this._moduleReference = new ModuleReference().initWithIdAndRequire("logic/model/tweet", require));
    //     }
    // }
});
