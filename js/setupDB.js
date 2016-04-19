// Leaflet map setup
var map = L.map('map', {
  center: [39.9526, -75.1652],
  zoom: 11
});

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);

//Global Variables
var geoJSONurl = "https://pherman09.cartodb.com/api/v2/sql?format=GeoJSON&q=" + "SELECT * FROM bars";
var bars = [];

$.getJSON(geoJSONurl,function(data) {
   bars = data;
});


//Tweets CartoDB
var geoJSONurl = "https://pherman09.cartodb.com/api/v2/sql?format=GeoJSON&q=" + "SELECT * FROM phillytweets2 WHERE the_geom IS NOT null";
var tweets = [];

$.getJSON(geoJSONurl,function(data) {
   tweets = data;
});

//CHANGE SQL SELECTION TO HOURS!!
var geoJSONurlAfterNoon = "https://pherman09.cartodb.com/api/v2/sql?format=GeoJSON&q=" + "SELECT * FROM phillytweets2 WHERE (hour >= 16 AND hour < 19) AND the_geom IS NOT null";
var tweetsAfterNoon = [];

$.getJSON(geoJSONurlAfterNoon,function(data) {
   tweetsAfterNoon = data;
});

var geoJSONurlEvening = "https://pherman09.cartodb.com/api/v2/sql?format=GeoJSON&q=" + "SELECT * FROM phillytweets2 WHERE (hour >= 19 AND hour <= 23) AND the_geom IS NOT null";
var tweetsEvening = [];

$.getJSON(geoJSONurlEvening,function(data) {
   tweetsEvening = data;
});


var geoJSONurlLateNight = "https://pherman09.cartodb.com/api/v2/sql?format=GeoJSON&q=" + "SELECT * FROM phillytweets2 WHERE (hour >= 0 AND hour < 4) AND the_geom IS NOT null";
var tweetsLateNight = [];

$.getJSON(geoJSONurlLateNight,function(data) {
   tweetsLateNight = data;
});
