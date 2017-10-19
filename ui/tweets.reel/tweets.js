var Component = require("montage/ui/component").Component,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Tweet = require("logic/model/tweet").Tweet;

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

    tweets: {
        value: null
    },

    error: {
        value: null
    },

    selectedTab: {
        value: 'timeline'
    },

    selectedUser: {
        value: null,
    },

    user: {
        value: undefined
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
            var tweetProperty = this.selectedTab === 'timeline' ? "timelineTweets" :
            this.selectedTab === 'profile' ? "tweets" : null;
            if (tweetProperty) {
                this.application.service.updateObjectProperties(this.user, tweetProperty);
            }
        }
    },


    handleTimelineAction: {
        value: function(event) {
            this.selectedTab = 'timeline';
            this.selectedUser = null;
            // this.loadTimelineTweets();
        }
    },
    handleProfileAction: {
        value: function(event) {
            this.selectedTab = 'profile';
            this.selectedUser = null;
            // this.loadProfileTweets();
        }
    },
    handleUserAction: {
        value: function(event) {
            this.selectedTab = 'user';
            // this.selectedUser = 'montagejs';
            // this.loadUserTweets();
        }
    }
});
