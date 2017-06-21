function getData(screen_name) {
    var url = "http://localhost:5000/tweetdata/" + screen_name;
    queue().defer(d3.json, url).await(makeGraphs);
}

// Define days of the week for access in several charts
week_day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Calculate dimensions for charts
    var chartWidth = $("#pieChart").width();
    var pieRadius = 200;
    if (chartWidth >= 480) {
            pieRadius = 200;
        } else {
            pieRadius = chartWidth * 0.3;
        }

// Average tweets per day
// Average tweets per day of the week 
// 10 most common words 
// Most liked tweets 
// Most retweeted tweets 
// Most liked/retweeted vs common words (crossfilter?) 
// Retweets / favorites by day of week / time of week 
// Most interactions vs time of the day
// JQuery selection for collections in database
// Catch 404 for handles that don't exist
// Make accounts (Django?) to handle user sets (name db as user name in Django?)


function timeOfDay(time) {
    var period = time.getHours();
    if (period >=23)
        return "Late night";
    else if (period <=7)
        return "Late night";
    else if (period > 16)
        return "Evening";
    else if (period >11)
        return "Afternoon";
    else if (period >6)
        return "Morning";
}

function makeGraphs(error, tweetsJson) {
 
    // Clean projectsJson data
    
    // Time format in harvested Tweets: Thu Jun 06 10:51:22 +0000 2017
    // Time format in D3.js:            %a  %b  %d %H:%M:%S %Z    %Y

    var all_tweets = tweetsJson;
    var dateFormat = d3.time.format("%a %b %d %H:%M:%S %Z %Y");
     
    all_tweets.forEach(function (d) {
        d["created_at"] = dateFormat.parse(d["created_at"]);
        d["created_at"].setSeconds(0);
        d["created_at"].setMinutes(0);
        return d;
        // d["created_at"].setHours(0);
    });

    // Create a Crossfilter instance. This will aid in filtering your charts.
    // When you click on a particular chart element, all other charts accomodate 
    // their displayed data to filter on your selection
    var ndx = crossfilter(all_tweets);








    // Define Dimensions

    // Dimension to total all tweets
    // var allTweetsDim = ndx.dimension(function (d){
    //     return length.d
    // });

    // Dimension by date
    var dateDim = ndx.dimension(function (d) {
        return d["created_at"];
    });

    // Dimension by favorites count
    var faveDim = ndx.dimension(function (d) {
        return d["favorite_count"];
    });

    // Dimension by retweet count
    var retweetDim = ndx.dimension(function (d) {
        return d["retweet_count"];
    });

    // Dimension by day of the week
    var dayDim = ndx.dimension(function (d) {
        return d["created_at"].getDay();
    });

    // Dimension by time period
    var periodDim = ndx.dimension(function (d) {
        return timeOfDay(d["created_at"]);
    });

    // Dimension by hashtags
    var hasHashtagDim = ndx.dimension(function (d) {
        return d["has_hashtags"];
    });

    // Dimension by retweets.
    var isRetweetDim = ndx.dimension(function (d) {
        return d["is_retweet"];
    });








    // Calculate groups

    // Groups all tweets by date
    var numTweetsByDate = dateDim.group();

    // Group all tweets by day of the week
    var numTweetsByDay = dayDim.group();

    // Groups all tweets that have a hashtag together. The data value is a boolean, the key is has_hashtag
    var numHasHashtag = hasHashtagDim.group();

    // Groups all tweets by tweet/retweet. The data value is a boolean, the key is is_retweet
    var numAllRetweets = isRetweetDim.group();

    // Groups only tweets that are retweets together. The data value is a boolean, the key is is_retweet
    var numIsRetweet = dateDim.group().reduceSum(function (d) {
        if (d.is_retweet === true ) {
            return 1;
        } else {
            return 0;
        }
    });

    // Groups only tweets that are not retweets together. The data value is a boolean, the key is is_retweet
    var numIsOriginal = dateDim.group().reduceSum(function (d) {
        if (d.is_retweet === false ) {
            return 1;
        } else {
            return 0;
        }
    });

    // Groups all tweets by period of day (morning, afternoon, evening, late night)
    var numTweetsByPeriod = periodDim.group();
 
    var all = ndx.groupAll();
 
    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["created_at"];
    var maxDate = dateDim.top(1)[0]["created_at"];
    var topfavorites = faveDim.top(10)[0]["favorite_count"];
    var topretweets = retweetDim.top(10)[0]["retweet_count"];

    //Declare charts with apropriate #IDs that go to the HTML section
    var timeChart = dc.lineChart("#time-chart");
    var hasHashtagChart = dc.pieChart("#hashtag-pie-chart");
    var uniqueTweetsPie = dc.pieChart("#unique-tweets-pie");
    var uniqueTweetsChart = dc.compositeChart("#unique-tweets-chart");
    var dayOfWeekPie = dc.pieChart("#tweets-by-day-of-week");
    var periodOfDayPie = dc.pieChart("#tweets-by-period-of-day");
    var scatterTweets = dc.scatterPlot("#scatter-Tweets-by-period-of-day");
    var totalTweetsDisplay = dc.numberDisplay("#total-tweets");

    // Define chart properties

    timeChart
        .width(1850)
        .height(400)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .interpolate('linear')
        .renderArea(true)
        .round(d3.time.month.round)
        .brushOn(false)
        .elasticY(true)
        .renderDataPoints(false)
        .renderHorizontalGridLines(true)
        .mouseZoomable(true)
        .clipPadding(10)
        .yAxisLabel("Daily Tweets")
        .transitionDuration(500)
        .xAxisLabel("Date")
        .dimension(dateDim)
        .group(numTweetsByDate);

    hasHashtagChart
       .height(220)
       .radius(90)
       .innerRadius(20)
       .transitionDuration(500)
       .dimension(hasHashtagDim)
       .group(numHasHashtag)
       .label(function (d) {
            if (d.key == true) {
                return 'Hashtags';
            } else {
                return 'No Hashtags'}
        })
        .title(function (d) {
            if (d.key == true) {
                return 'Hashtags: ' + d.value;
            } else {
                return 'No Hashtags: ' + d.value;}
        });

    uniqueTweetsPie
        .height(220)
        .radius(90)
        .innerRadius(20)
        .transitionDuration(500)
        .dimension(isRetweetDim)
        .group(numAllRetweets)
        .label(function (d) {
            if (d.key == true) {
                return 'Retweets';
            } else {
                return 'Original';}
        })
        .title(function (d) {
            if (d.key == true) {
                return 'Retweets: ' + d.value;
            } else {
                return 'Original: ' + d.value;}
        });

    dayOfWeekPie
        .height(200)
        .radius(90)
        .innerRadius(20)
        .transitionDuration(500)
        .dimension(dayDim)
        .group(numTweetsByDay)
        .label(function (d) {
            return week_day[d.key];
        })
        .title(function (d) {
            return week_day[d.key] + ": " + d.value;
        });

    periodOfDayPie
        .height(200)
        .radius(90)
        .innerRadius(20)
        .transitionDuration(500)
        .dimension(periodDim)
        .group(numTweetsByPeriod);

    uniqueTweetsChart
        .width(1850)
        .height(400)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .mouseZoomable(true)
        .yAxisLabel("Daily Tweets")
        .xAxisLabel("Date")
        .elasticY(true)
        .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
        .renderHorizontalGridLines(true)
        .compose([
            dc.lineChart(uniqueTweetsChart)
                .dimension(dateDim)
                .colors('green')
                .group(numIsRetweet, 'Retweets'),
            dc.lineChart(uniqueTweetsChart)
                .dimension(dateDim)
                .colors('blue')
                .group(numIsOriginal, 'Originals')
        ])
        .brushOn(false);

    scatterTweets
        .width(1850)
        .height(400)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .brushOn(false)
        .mouseZoomable(true)
        .symbolSize(8)
        .clipPadding(10)
        .dimension(dateDim)
        .group(numTweetsByDate);

    totalTweetsDisplay
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d) {
           return d;
       })
       .group(all);

   dc.renderAll();
}