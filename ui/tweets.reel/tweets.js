var Component = require("montage/ui/component").Component,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Tweet = require("logic/model/tweet").Tweet,
    User = require("logic/model/user").User;

/**
 * @class Tweet
 * @extends Component
 */
exports.Tweets = Component.specialize(/** @lends Tweet# */ {

    UPDATE_AUTO: {
        value: false
    },

    UPDATE_METHOD: {
        value: 'poll' // poll|longpoll|server-push|http2-push
    },

    UPDATE_INTERVAL: {
        value: 3600 // default one hour. Twitter limit to 100 call per hours
    },

    isLoading: {
        value: null
    },

    error: {
        value: null
    },

    _activeUser: {
        value: undefined
    },

    selectedUser: {
        value: undefined
    },

    tweetProperty: {
        get: function () {
            if (!this._tweetProperty) {
                this._tweetProperty = "tweets";
            }
            return this._tweetProperty;
        },
        set: function (value) {
            this._tweetProperty = value;
        }
    },

    //
    // Handle events
    //

    handleRefreshAction: {
        value: function(event) {
            this.refreshTweets();
        }
    },

    refreshTweets: {
        value: function () {
          return this.application.service.updateObjectProperties(this._activeUser, this.tweetProperty);
        }
    },


    handleTimelineAction: {
        value: function(event) {
            this.tweetProperty = 'timelineTweets';
            this.selectedUser = null;
        }
    },

    handleProfileAction: {
        value: function(event) {
            this.tweetProperty = 'tweets';
            this.selectedUser = null;
        }
    },

    handleUserAction: {
        value: function(event) {
            var self = this,
                criteria = new Criteria().initWithExpression("username == $.username", {
                    username: "montagejs"
                }),
                query = DataQuery.withTypeAndCriteria(User, criteria);
            this.isLoading = true;
            this.application.service.fetchData(query).then(function (users) {
                self.selectedUser = users[0];
                return self.refreshTweets();
            }).then(function () {
                self._activeUser
                self.isLoading = false;
            });
        }
    }
});
