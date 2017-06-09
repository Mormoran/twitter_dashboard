function getData(screen_name) {
    var url = "http://localhost:5000/tweetdata/" + screen_name;
    queue().defer(d3.json, url).await(makeGraphs);
}
 
function makeGraphs(error, tweetsJson) {
    alert(tweetsJson);
 
    //Clean projectsJson data
    //Time format in harvested Tweets: Thu Jun 06 10:51:22 +0000 2017
    //                                 %a  %b  %d %H:%M:%S %Z    %Y
    // d["created_at"] = moment(d).format('ddd MMM Do h:mm:ss Z YYYY')

    var all_tweets = tweetsJson;
    var dateFormat = d3.time.format("%a %b %d %H:%M:%S %Z %Y");
     
    all_tweets.forEach(function (d) {
        d["created_at"] = dateFormat.parse(d["created_at"]);
        d["created_at"].setSeconds(0);
        d["created_at"].setMinutes(0);
        // d["created_at"].setHours(0);
    });

    // var parseDate = d3.time.format("%Y-%m-%d").parse;
    // Json.forEach(function (d) {
    //     d.date = parseDate(d.date);
    //     d.Year = d.date.getFullYear();
    //     d.Driver = d.forename + " " + d.surname;
    // });
    
    
    //Create a Crossfilter instance
    var ndx = crossfilter(all_tweets);
    
    //Define Dimensions
    var dateDim = ndx.dimension(function (d) {
        return d["created_at"];
    }); 

    var hasHashtagDim = ndx.dimension(function (d) {
        return d["has_hashtags"];
    }); 


    //Calculate metrics
    var numTweetsByDate = dateDim.group(); 
    var numHasHashtag = hasHashtagDim.group(); 
 
    var all = ndx.groupAll();
 
    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["created_at"];
    var maxDate = dateDim.top(1)[0]["created_at"];
 
    //Charts
    var timeChart = dc.lineChart("#time-chart"); 
    var hasHashtagChart = dc.pieChart("#hashtag-pie-chart"); 
 
    // selectField = dc.selectMenu('#menu-select')
    //     .dimension(stateDim)
    //     .group(stateGroup);
 
    // numberProjectsND
    //     .formatNumber(d3.format("d"))
    //     .valueAccessor(function (d) {
    //         return d;
    //     })
    //     .group(all);
 
    // totalDonationsND
    //     .formatNumber(d3.format("d"))
    //     .valueAccessor(function (d) {
    //         return d;
    //     })
    //     .group(totalDonations)
    //     .formatNumber(d3.format(".3s"));
 
    // timeChart
    //     .width(1500)
    //     .height(600)
    //     .margins({top: 10, right: 50, bottom: 30, left: 50})
    //     .dimension(dateDim)
    //     .group(numTweetsByDate)
    //     .transitionDuration(500)
    //     .x(d3.time.scale().domain([minDate, maxDate]))
    //     .elasticY(true)
    //     .xAxisLabel("Date")
    //     .yAxisLabel("Daily Tweets")
    //     .yAxis().ticks(20);
 
    timeChart
        .width(1500)
        .height(600)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .interpolate('step-before')
        .renderArea(true)
        .brushOn(false)
        .renderDataPoints(true)
        .clipPadding(10)
        .yAxisLabel("Daily Tweets")
        .xAxisLabel("Date")
        .dimension(dateDim)
        .group(numTweetsByDate)
        .mouseZoomable(true);
        // .title(function(d) { return d.key + ': ' + d.text; });


    hasHashtagChart
       .height(220)
       .radius(90)
       .transitionDuration(1500)
       .dimension(hasHashtagDim)
       .group(numHasHashtag);


    // timeChart
    //     .width(1500)
    //     .height(600)
    //     .x(d3.scale.ordinal())
    //     .xUnits(dc.units.ordinal)
    //     .brushOn(false)
    //     .xAxisLabel('Date')
    //     .yAxisLabel('Quantity')
    //     .dimension(dateDim)
    //     .group(numTweetsByDate)
    //     .mouseZoomable(true);

   dc.renderAll();
}