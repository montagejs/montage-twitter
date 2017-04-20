/**
 * @module ui/main.reel
 */
var Component = require("montage/ui/component").Component,
    DataService = require("montage-data/logic/service/data-service").DataService,
    DataSelector = require("montage-data/logic/service/data-selector").DataSelector,
    Criteria = require("montage/core/criteria").Criteria,
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
        value: function Main() {
            var that = this;

            that.super();

            // Init services
            that.initServices().then(function () {

                // Load initals tweets
                that.loadTweets().then(function () {

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

    //
    // Initialyze mainService
    //

    // TODO use future montage-data/service/loader.reel
    
    initServices: {
        value: function () {
            this.mainService = mainService = new DataService();
            var twitterService = new TwitterService();
            this.mainService.addChildService(twitterService);
            return Promise.resolve();
        },
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
            
            var dataType = Tweet.TYPE;
            var dataQuery = DataSelector.withTypeAndCriteria(dataType, dataCriteria);
                
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
            
            var dataType = Tweet.TYPE;
            var dataQuery = DataSelector.withTypeAndCriteria(dataType, dataCriteria);
                
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
            
            var dataType = Tweet.TYPE;
            var dataQuery = DataSelector.withTypeAndCriteria(dataType, dataCriteria);
                
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