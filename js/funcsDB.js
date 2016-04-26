//Global variables
var MYMARKERS =[];
var MYBARS = [];
var MYTWEETS = [];
var BUFFERLIST = [];
var TWEETSLIST= [];
var sadFirst;
var happyFirst;
var sadColor =  "#C000FF";
var happyColor = "#FFD000";
var fiveHappyColors = ["#FFD000","#FFA600","#FF8000","#FF4D00","#FF0000"];
var fiveSadColors = ["#C000FF","#8400FF","#6200FF","#2600FF","#0D00FF"];
var allWords;
var someWords;
var wordPopularity;
var wordPopList;

//Helper functions
//Function takes the tweet text field and converts it into an array
var tweetText = function(geoJSON){
  var allFeats = geoJSON.features;
  _.each(allFeats, function(ob){
    ob.properties.textarray = ob.properties.text.split(" ");
  });
  return geoJSON;
};

//Colors tweets by positive or negative words, and assigns them properties a property based on
//how many negative or positive words their tweet contains.
var moodSet = function(geoJSON){
  var allFeats = geoJSON.features;
  var positives = poswords.split(",");
  var negatives = negwords.split(",");
  _.each(allFeats,function(ob){
    var numNeg = _.intersection(ob.properties.textarray, negatives).length;
    var numPos = _.intersection(ob.properties.textarray, positives).length;
    if (numNeg > numPos){
      ob.properties.MarkerColor = "#C000FF";
      ob.properties.mood = -1 * numNeg;
      ob.mood =  -1 * numNeg;
    } else if (numPos > numNeg){
      ob.properties.MarkerColor = "#FFD000";
      ob.properties.mood = numPos;
      ob.mood =  numPos;
    } else {
      ob.properties.MarkerColor = "#898F8B";
      ob.properties.mood = 0;
      ob.mood =  0;
    }
  });
};

//Makes Tweets into Markers on Map!
var mapTweets = function(geoJSON){
  var allFeats = geoJSON.features;
  _.each(allFeats,function(ob){
    var lat2 = ob.geometry.coordinates[1];
    var long2= ob.geometry.coordinates[0];
    var tweetText = ob.properties.text;
    var colorStuff = ob.properties.MarkerColor;
    MYTWEETS.push(L.circleMarker([lat2,long2],{title: tweetText, fillColor:colorStuff,color:colorStuff}).setRadius(2));
  });
  _.each(MYTWEETS, function(mark){
    mark.addTo(map).bindPopup(mark.options.title);
  });
};

//mapping GeoJSON
var mapGeoJSONBars = function(geoJSON){
  var allFeats = geoJSON.features;
  _.each(allFeats,function(ob){
    var lat2 = ob.geometry.coordinates[1];
    var long2= ob.geometry.coordinates[0];
    var barname = ob.properties.coname;
    MYBARS.push(L.circleMarker([lat2,long2],{title: barname, fillColor:"#D49090",color:"#E03636"}).setRadius(3));
  });
  _.each(MYBARS, function(mark){
    mark.addTo(map).bindPopup(mark.options.title);
  });
};

//Gets Rid of duplicates in bar list
var removeDups = function(arrayOfObjects){
    var listOffBarNames = [];
    _.each(arrayOfObjects,function(ob){
      var barN = ob.locName;
      if(_.contains(listOffBarNames,barN) === true) {
        ob.repeat = true;
      } else{
        ob.repeat = false;
      }
      listOffBarNames.push(barN);
    });
    var filteredarray = _.filter(arrayOfObjects,function(ob2){
      return ob2.repeat === false;
    });
  return filteredarray;
};


//Creates property for each bar based on number of positive and negative tweets
var setBarBuffers = function(geoJSON){
  var allFeats = geoJSON.features;
  _.each(allFeats,function(ob){
    var barName = ob.properties.coname;
    var buffer = turf.buffer(ob,350,"feet");
    //buffer.features[0].properties.locName = barName;
    buffer.locName = barName;
    BUFFERLIST.push(buffer);
  });
};
//Takes list of Turf Objects and adds them to map
var turfObToMap = function(list){
  _.each(list,function(ob){
    L.geoJson(ob).addTo(map);
  });
};

//Takes list of Turf Feature Collections Objects and sums their "mood"
var moodSum = function(list,points){
  _.each(list,function(ob){
    //ob.features[0].properties.barMood = 0;
    ob.barMood = 0;
    turf.sum(ob,points,"mood","barMood");
    ob.barMood = ob.features[0].properties.barMood;
  });
};

//Create word bank of all words
var createWordBank = function(geoJSON){
  var allFeats = geoJSON.features;
  var wordBank = [];
  _.each(allFeats, function(ob){
    wordBank = wordBank.concat(ob.properties.textarray);
  });
  return wordBank;
};

//Removes Common Words from wordBank
var removeWords = function(stringArray){
  var stopwords = comwords.split("  ");
  return _.difference(stringArray,stopwords);
};

//Create index of most common words
//From Stack Exchange Thread "How to count the number of occurences of each item in an array?""
var createWordIndex = function(stringArray){
  var indexOb = {};
  _.each(stringArray,function(word){
    indexOb[word] = (indexOb[word] || 0) + 1;
  });
  return indexOb;
};

//Creates an array of arrays, in which the words of the Word Index are put in an array with the number of times they occur
//Then sorts this list by it's the second element, AKA popularity.
var createIndexArray = function(indexObject){
  var sortedList = [];
  for (var propertyname in indexObject){ //from StackExchange "How do I enumerate the properties of a JavaScript object?"
    sortedList.push([propertyname,indexObject[propertyname]]);
  }
  sortedList = sortedList.sort(function(a,b){return a[1]>b[1];});
  return sortedList.reverse();
};

//Takes the 5 saddest and happiest bars, and turns them into a chart
var buildBarGraphs = function(barArray,labelString,jqueryPoint,colorText,colorList){
  //titleArray = [barArray[0].locName,barArray[1].locName,barArray[2].locName,barArray[3].locName,barArray[4].locName];
  var graphHeightArray = function(barArray){
    var listOfHeights = [barArray[0].barMood,barArray[1].barMood,barArray[2].barMood,barArray[3].barMood,barArray[4].barMood];
    if (barArray[0].barMood < 0) {
      var negListOfHeights = [];
      _.each(listOfHeights,function(height){
        var negheight = height*-1;
        negListOfHeights.push(negheight);
      });
      return negListOfHeights;
    }
    else {
      return listOfHeights;
    }
  };
  dataF = graphHeightArray(barArray);
  barGraphData = {
    labels:["1","2","3","4","5"],
    datasets:[{
      label:labelString,
      fillColor: colorText,
      strokeColor: "#000000",
      highlightFill: colorText,
      highlightStroke: colorText,
      data:dataF
    }]
  };
  var ctx = $(jqueryPoint).get(0).getContext("2d");
  var NC = new Chart(ctx).Bar(barGraphData,  {
      barValueSpacing : 5,
      scaleShowGridLines : false,
      responsive: true
  });
  NC.datasets[0].bars[0].fillColor = colorList[0];
  NC.datasets[0].bars[1].fillColor = colorList[1];
  NC.datasets[0].bars[2].fillColor = colorList[2];
  NC.datasets[0].bars[3].fillColor = colorList[3];
  NC.datasets[0].bars[4].fillColor = colorList[4];
  NC.update();
};

//Builds a bar graph for the most tweeted words
var buildBarGraphTweets = function(wordRankArray,labelString,jqueryPoint,colorText){
  var titleArray = [wordRankArray[0][0],wordRankArray[1][0],wordRankArray[2][0],wordRankArray[3][0],wordRankArray[4][0]];
  var graphHeightArray = [wordRankArray[0][1],wordRankArray[1][1],wordRankArray[2][1],wordRankArray[3][1],wordRankArray[4][1]];
  barGraphData2 = {
    labels:titleArray,
    datasets:[{
      label:labelString,
      fillColor: colorText,
      strokeColor: colorText,
      highlightFill: colorText,
      highlightStroke: colorText,
      data:graphHeightArray
    }]
  };
  var ctx = $(jqueryPoint).get(0).getContext("2d");
  new Chart(ctx).Bar(barGraphData2,
    {
      barStrokeWidth : 10,
      barValueSpacing : 5,
      scaleShowGridLines : false,
      responsive: true
  });
};

//Builds a Doughnut Graph of happy and sad tweets
var buildMoodDonut = function(tweetOblist,labelString,labelString2,jqueryPoint,colorText,colorText2){
  var tweetsArray =tweetOblist.features;
  var happyTweetList = _.filter(tweetsArray,function(tweetOb){return tweetOb.mood > 0;});
  var sadTweetList = _.filter(tweetsArray,function(tweetOb){return tweetOb.mood < 0;});
  var happyTweetNum = happyTweetList.length;
  var sadTweetNum = sadTweetList.length;
  var donutData =[{
    value:happyTweetNum,
    color: colorText,
    highlight: colorText,
    label:labelString
  },{
    value:sadTweetNum,
    color: colorText2,
    highlight: colorText2,
    label:labelString2
  }];
  var ctx = $(jqueryPoint).get(0).getContext("2d");
  new Chart(ctx).Doughnut(donutData,  {
      responsive: true
  });
};

//Populates list of happy or sad bars, and makes a clickable object that highlights them
var populateBarDiv = function(barArray,buffers,string,jqueryPoint){
  var firstFive = barArray.slice(0,5);
  var i = 0;
  _.each(firstFive,function(ob){
    var bName = ob.locName;
    var rank = (i + 1).toString();
    var htmlstring = '<div class="barListElement" id=' + string + "bar" + i.toString()  + '>'+  rank + " : " + bName + '</div>';
    $(jqueryPoint).append(htmlstring);
    var querycall = "#"+ string +"bar" + i.toString();
    $(querycall).click(function() {
      var pointOfInterest =_.filter(buffers,function(bar) { return bar.locName === bName;});
      L.geoJson(pointOfInterest[0]).addTo(map);
      var bLat = pointOfInterest[0].features[0].geometry.coordinates[0][0][0];
      var bLong = pointOfInterest[0].features[0].geometry.coordinates[0][0][1];
      map.setView([bLong,bLat], 15);
    });
    i = i+1;
  });
};

//Create Time Graph
var buildTimeGraph = function(tweets,jqueryPoint,timeArray,labelArray,colorString){
  var tweetsArray =tweets.features;
  _.each(tweetsArray,function(ob){
    ob.hour = ob.properties.hour;
  });

  var times = [];
  _.each(timeArray,function(string){
    times.push(Number(string.substring(0,2)));
  });

  var timeValue =[];
  _.each(times,function(number){
    var hourList = _.filter(tweetsArray,function(tweetOb){return tweetOb.hour === number;});
    var hourNum = hourList.length;
    timeValue.push(hourNum);
  });
  var data = {
      labels: labelArray,
      datasets: [
          {
              label: "My Time dataset",
              fillColor: colorString,
              strokeColor: "#6E6E6E",
              pointColor: "#6E6E6E",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "#6E6E6E",
              data: timeValue
          }]};

  var ctx = $(jqueryPoint).get(0).getContext("2d");
  new Chart(ctx).Line(data,  {
      responsive: true,
      maintainAspectRatio: false
  });
};

//Clear Map button
var clearAll = function(){

  //Clear Maps
  map.eachLayer(function (layer) {
    map.removeLayer(layer);
  });
  Stamen_TonerLite.addTo(map);
  //Clear, and recreate graph canvases
  var clearGraphDiv = function(div,chart){
    var divSelect = "#" + div;
    var chartSelect = "#" + chart;
    $(chartSelect).remove();
    $(divSelect).append('<canvas id=' + chart + ' width=100% height=100%></canvas>');
  };
  clearGraphDiv("sadgraph","mySadChart");
  clearGraphDiv("donutBox","myDonutChart");
  clearGraphDiv("happygraph","myHappyChart");
  clearGraphDiv("freqgraph","myFreqChart");
  clearGraphDiv("timegraph","myTimeChart");
  $("#descrip").remove();

  //Clear and Recreate Bar Lists
  var clearBarList = function(string){
    var fiveThings = [0,1,2,3,4];
    _.each(fiveThings,function(num){
      var elemSelect = "#" + string + "bar" + num.toString();
      $(elemSelect).remove();
    });
  };

  clearBarList("happy");
  clearBarList("sad");

  //Clear all Global variables
  var allWords=[];
  var someWords=[];
  var wordPopularity=[];
  var wordPopList=[];
  var MYMARKERS =[];
  var MYBARS = [];
  var MYTWEETS = [];
  var BUFFERLIST = [];
  var TWEETSLIST= [];
  var sadFirst =[];
  var happyFirst =[];

};

//Execution
var setAll = function(tweets1,bars1,colorT){
  $(".load").show();
  clearAll();
  tweetText(tweets1);
  moodSet(tweets1);
  allWords = createWordBank(tweets1);
  someWords = removeWords(allWords);
  wordPopularity = createWordIndex(someWords);
  wordPopList = createIndexArray(wordPopularity);
  mapTweets(tweets1);
  mapGeoJSONBars(bars1);
  setBarBuffers(bars1);
  BUFFERLIST = removeDups(BUFFERLIST);
  moodSum(BUFFERLIST,tweets1);
  //Sort bars by mood!
  sadFirst = _.sortBy(BUFFERLIST,"barMood");
  happyFirst = _.sortBy(BUFFERLIST,"barMood").reverse(); //this idea from StackExchange
  //Call Populate Divs
  buildBarGraphTweets(wordPopList,"Tweet Popularity","#myFreqChart","#1AB8ED");
  buildBarGraphs(sadFirst,"Saddest Bars","#mySadChart",sadColor,fiveSadColors);
  buildBarGraphs(happyFirst,"Happiest Bars","#myHappyChart",happyColor,fiveHappyColors);
  buildMoodDonut(tweets1,"Happy","Sad","#myDonutChart",happyColor,sadColor);
  populateBarDiv(happyFirst,BUFFERLIST,"happy","#happyBarsList");
  populateBarDiv(sadFirst,BUFFERLIST,"sad","#sadBarsList");
  buildTimeGraph(tweets1,"#myTimeChart",["16","17","18","19","20","21","22","23","0","1","2","3","4"],
  ["4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM","11:00 PM","12:00 AM","1:00 AM","2:00 AM","3:00 AM","4:00 AM"],colorT);
  $(".load").hide();
};

$("#tweetAllMapButton").click(function(){
  setAll(tweets,bars,"#6D71E3");
});

$("#tweetLateAfterNoonMapButton").click(function(){
  setAll(tweetsAfterNoon,bars,"#E36DDF");
});

$("#tweetEveningMapButton").click(function(){
  setAll(tweetsEvening,bars,"#C26DE3");
});

$("#tweetLateNightMapButton").click(function(){
  setAll(tweetsLateNight,bars,"#79777A");
});

$(document).ready(function(){
  $(".load").hide();
});
