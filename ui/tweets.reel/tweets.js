var Component = require("montage/ui/component").Component,
    Criteria = require("montage/core/criteria").Criteria,
    DataService = require("montage/data/service/data-service").DataService,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    TwitterService = require('logic/service/twitter').TwitterService,
    Tweet = require('logic/model/tweet').Tweet;

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

    constructor: {
        value: function Tweets () {
            var self = this;

            self.super();


            // Init services
            self.initServices().then(function () {

                //Load initals tweets
                self.loadTweets().then(function () {

                    // Init auto update
                    if (self.UPDATE_AUTO) {
                        if (self.UPDATE_METHOD === 'poll') {
                            setTimeout(self.loadTweets.bind(self), self.UPDATE_INTERVAL);
                        }
                    }
                });
            });
        }
    },


    /***************
     * [TJ] 2 Patterns of adding a child-service
     * 1. Add a child
     */

    //
    // Initialyze mainService
    //

    // TODO use future montage/data/service/loader.reel

    initServices: {
        value: function () {
            // this.mainService = new DataService();
            // return this.mainService.registerChildService(new TwitterService());
            var self = this;
            return require.async("data/montage-data.mjson").then(function (descriptor) {
                var deserializer = new Deserializer().init(JSON.stringify(descriptor), require);
                return deserializer.deserializeObject();
            }).then(function (service) {
                self.mainService = service;
                return service;
            });
        }
    },


    //
    // Business layer using Service
    //

    loadTweets: {
        value: function () {
            var selectedTab = this.selectedTab;
            if (selectedTab === 'timeline') {
                return this.loadTimelineTweets();
            } else if (selectedTab === 'profile') {
                return this.loadProfileTweets();
            } else if (selectedTab === 'user') {
                return this.loadUserTweets();
            }
        }
    },

    loadTimelineTweets: {
        value: function () {
            var self = this;

            var dataExpression = "";
            var dataParameters = {
                object: 'statuses',
                action: 'home_timeline'
            };
            var dataCriteria = new Criteria().initWithExpression(dataExpression, dataParameters);

            var dataQuery = DataQuery.withTypeAndCriteria(Tweet, dataCriteria);

            self.isLoading = true;
            return self.mainService.fetchData(dataQuery).then(function (tweets) {
                self.tweets = tweets;
            }).catch(function (error) {
                debugger;
                self.error = error;
            }).finally(function () {
                self.isLoading = false;
            });
        }
    },

    loadProfileTweets: {
        value: function () {
            var self = this;

            var dataExpression = "";
            var dataParameters = {
                object: 'statuses',
                action: 'user_timeline'
            };
            var dataCriteria = new Criteria().initWithExpression(dataExpression, dataParameters);

            var dataQuery = DataQuery.withTypeAndCriteria(Tweet, dataCriteria);

            self.isLoading = true;
            return self.mainService.fetchData(dataQuery).then(function (tweets) {
                self.tweets = tweets;
            }, function (error) {
                self.error = error;
            }).finally(function () {
                self.isLoading = false;
            });
        }
    },

    loadUserTweets: {
        value: function (user) {
            var self = this;

            var dataExpression = "";
            var dataParameters = {
                object: 'statuses',
                action: 'user_timeline',
                userName: self.selectedUser
            };
            var dataCriteria = new Criteria().initWithExpression(dataExpression, dataParameters);

            var dataQuery = DataQuery.withTypeAndCriteria(Tweet, dataCriteria);

            self.isLoading = true;
            return self.mainService.fetchData(dataQuery).then(function (tweets) {
                self.tweets = tweets;
            }, function (error) {
                self.error = error;
            }).finally(function () {
                self.isLoading = false;
            });
        }
    },

    //
    // Handle events
    //

    handleRefreshAction: {
        value: function(event) {
            this.loadTweets();
        }
    },
    handleTimelineAction: {
        value: function(event) {
            this.selectedTab = 'timeline';
            this.selectedUser = null;
            this.loadTimelineTweets();
        }
    },
    handleProfileAction: {
        value: function(event) {
            this.selectedTab = 'profile';
            this.selectedUser = null;
            this.loadProfileTweets();
        }
    },
    handleUserAction: {
        value: function(event) {
            this.selectedTab = 'user';
            this.selectedUser = 'montagejs';
            this.loadUserTweets();
        }
    }
});
