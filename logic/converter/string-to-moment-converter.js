var Converter = require("montage/core/converter/converter").Converter,
    moment = require("montage/moment-timezone");

/**
* @class StringToMomentConverter
* @classdesc Converts a string to a moment and vice-versa.
* @extends Converter
*/
exports.StringToMomentConverter = Converter.specialize( /** @lends StringToMomentConverter# */ {


deserializeSelf: {
    value: function (deserializer) {
        this.pattern = deserializer.getProperty("pattern");
        this.defaultConvertValue = deserializer.getProperty("defaultConvertValue");
        this.defaultRevertValue = deserializer.getProperty("defaultRevertValue");
    }
},

/**
 * The pattern to use when parsing the value during conversion or reversion.
 * @type {?string}
 */
pattern: {
    value: null
},

/**
 * Converts the specified value to a moment object.
 * @function
 * @param {Property} v The value to format.
 * @returns {moment} The value converted to a moment.
 */
convert: {
    value: function (v) {
        var result = null;
        if (v !== undefined) {
            result = this.pattern && moment(v, this.pattern) || moment(parseInt(v))
        }
        return result;
    }
},

/**
 * Reverts a moment to the string output specified by the pattern property.
 * @function
 * @param {moment} v The value to revert.
 * @returns {string} v
 */
revert: {
    value: function (v) {
        if (this.defaultRevertValue === "now") {
            v = v || moment();
        }

        return v ? this.pattern ? v.format(this.pattern) : v.format() : "";
    }
}

});
