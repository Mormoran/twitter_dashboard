function getData(screen_name) {
    var url = "http://localhost:5000/tweetdata/" + screen_name;
    queue().defer(d3.json, url).await(makeGraphs);
}

function changeData(screen_name) {
    var data = screen_name;
    queue().defer(d3.json, data).await(makeGraphs);
}

// Average tweets per day
// Average tweets per day of the week 
// 10 most common words 
// Most liked tweets 
// Most retweeted tweets 
// Most liked/retweeted vs common words (crossfilter?) 
// Retweets / favorites by day of week / time of week 
// Most interactions vs time of the day 


function makeGraphs(error, tweetsJson) {
 
    //Clean projectsJson data
    //Time format in harvested Tweets: Thu Jun 06 10:51:22 +0000 2017
    //                                 %a  %b  %d %H:%M:%S %Z    %Y
    // d["created_at"] = moment(d).format('ddd MMM Do h:mm:ss Z YYYY')
    //Time format in harvested Tweets: 2017-06-09 14:33:48
    //                                 %Y  -%m-%d %H:%M:%S

    var all_tweets = tweetsJson;
    var dateFormat = d3.time.format("%a %b %d %H:%M:%S %Z %Y");
     
    all_tweets.forEach(function (d) {
        d["created_at"] = dateFormat.parse(d["created_at"]);
        d["created_at"].setSeconds(0);
        d["created_at"].setMinutes(0);
        // d["created_at"].setHours(0);
    });    
    
    //Create a Crossfilter instance
    var ndx = crossfilter(all_tweets);
    
    //Define Dimensions
    var dateDim = ndx.dimension(function (d) {
        return d["created_at"];
    }); 

    var hasHashtagDim = ndx.dimension(function (d) {
        return d["has_hashtags"];
    });

    var isRetweetDim = ndx.dimension(function (d) {
        return d["is_retweet"];
    });

    //Calculate metrics
    var numTweetsByDate = dateDim.group();
    var numHasHashtag = hasHashtagDim.group();
    var numIsRetweet = isRetweetDim.group();
 
    var all = ndx.groupAll();
 
    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["created_at"];
    var maxDate = dateDim.top(1)[0]["created_at"];

    //Charts
    var timeChart = dc.lineChart("#time-chart");
    var hasHashtagChart = dc.pieChart("#hashtag-pie-chart");
    var uniqueTweetsPie = dc.pieChart("#unique-tweets-pie");
  
    timeChart
        .width(1850)
        .height(400)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .interpolate('linear')
        .renderArea(true)
        .brushOn(false)
        .elasticY(true)
        .renderDataPoints(true)
        .clipPadding(10)
        .yAxisLabel("Daily Tweets")
        .transitionDuration(500)
        .xAxisLabel("Date")
        .dimension(dateDim)
        .group(numTweetsByDate)
        // .yAxis().ticks(4)
        // .xAxis().ticks(20)
        .mouseZoomable(true);

    hasHashtagChart
       .height(220)
       .radius(90)
       .innerRadius(20)
       .transitionDuration(500)
        // .legend(dc.legend())
       .dimension(hasHashtagDim)
       .group(numHasHashtag)
       .label(function (d) {
            if (d.key == true) {
                return 'Hashtags';
            } else {
                return 'No Hashtags';}
        });

    uniqueTweetsPie
        .height(220)
        .radius(90)
        .innerRadius(20)
        .transitionDuration(500)
        .dimension(isRetweetDim)
        .group(numIsRetweet)
        .label(function (d) {
            if (d.key == true) {
                return 'Retweets';
            } else {
                return 'Original';}
        });

   dc.renderAll();
}