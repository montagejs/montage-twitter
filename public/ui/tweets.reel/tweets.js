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

    constructor: {
        value: function Main() {
            var that = this;

            that.super();

            that.initServices().then(function () {
                that.loadTweets();  
            });
        }
    },
    
    initServices: {
        value: function () {
            this.mainService = mainService = new DataService();
            var twitterService = new TwitterService();
            this.mainService.addChildService(twitterService);
            return Promise.resolve();
        },
    },

    loadTweets: {
        value: function () {
            var that = this;

            var dataExpression = "";
            var dataParameters = {
                object: 'statuses',
                action: 'home_timeline'
            };
            var dataCriteria = new Criteria().initWithExpression(dataExpression, dataParameters);
            
            var dataType = Tweet.TYPE;
            var dataQuery = DataSelector.withTypeAndCriteria(dataType, dataCriteria);
            
            that.mainService.fetchData(dataQuery).then(function (tweets) {
                that.tweets = tweets;
            });
        }
    },

    handleRefreshAction: {
        value: function(event) {
            this.loadTweets();
        }
    },

    tweets: {
        value: null
    }
});