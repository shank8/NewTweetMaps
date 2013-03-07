// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509

var map;
var searchPane;
var radius = 5;

(function () {
    "use strict";
 
    WinJS.Binding.optimizeBindingReferences = true;
    
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    InitSearch(); // allows searching from native search pane
    
    
    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: initMap, culture: "en-us", homeRegion: "US" });
            args.setPromise(WinJS.UI.processAll());
        }
    };

    function initMap() {
       

        var mapOptions =
        {
            credentials: "Ao5Db3mOvlNH4G7lgK5WV0XWdm4mdVFZc7_vB8VajuR70hLR92egwnjiWpT67l0T",
            mapTypeId: Microsoft.Maps.MapTypeId.birdseye
        };

        map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);
        var mapCenter = map.getCenter();
        var mapCSSControl = document.getElementById("mapDiv").firstChild;
        //mapCSSControl.style.height = "40%";
        //mapCSSControl.style.width = "35%";
        var geolocator = Windows.Devices.Geolocation.Geolocator();

        var promise = geolocator.getGeopositionAsync();
        navigator.geolocation.getCurrentPosition(function (pos) {
            mapCenter.latitude = pos.coords.latitude;
            mapCenter.longitude = pos.coords.longitude;
            glocation.latitude = pos.coords.latitude;
            glocation.longitude = pos.coords.longitude;
            map.setView({ center: mapCenter, zoom: 14 });
            if (tweetMap.registered == "registered") {
                Init();
            } else {
                twitterLogon(oauth);
            }
        });


    }

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
})();



function searchLocation(event) {
    var i = 0;
    var d;
    var name;
    var latitude;
    var longitude;

    var location = event.queryText; // Get search location as input string from textbox

    // Parse whatever input string the user gave separating words but doing nothing with punct
    var arrayOfWords = location.split(" ");  // Store all of the words in an array

    var url = "http://dev.virtualearth.net/REST/v1/Locations/";
  

    // Append '%20' to all words except the last one 
    for (i = 0; i < (arrayOfWords.length - 1) ; i++) {
        arrayOfWords[i] += "%20";
    }
    // Append the correctly formatted search location to the url and getJSON on it
    for (i = 0; i < arrayOfWords.length; i++) {
        url += arrayOfWords[i];
    }

    url += "?inclnb=1&key=Ao5Db3mOvlNH4G7lgK5WV0XWdm4mdVFZc7_vB8VajuR70hLR92egwnjiWpT67l0T";



    $.getJSON(url,
        function (data) {
            // Get the name and longitudinal/langitudinal coordinates of the location
            var coord = data.resourceSets[0].resources[0].point.coordinates;
           
          
                
                    
                            // name of the location 
                    glocation.latitude = coord[0];   // latitude of location 
                    glocation.longitude = coord[1];  // longitude of location
                    getTweets();
                    getTrends();

                    
               
           
        });

    var mapOptions =
        {
            credentials: "Ao5Db3mOvlNH4G7lgK5WV0XWdm4mdVFZc7_vB8VajuR70hLR92egwnjiWpT67l0T",
            mapTypeId: Microsoft.Maps.MapTypeId.birdseye
        };

    map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);
    //var mapCenter = map.getCenter();
    var mapCSSControl = document.getElementById("mapDiv").firstChild;
    mapCSSControl.style.height = "40%";
    mapCSSControl.style.width = "35%";




    navigator.geolocation.getCurrentPosition(function (pos) {
        var mapCenter = map.getCenter();
        mapCenter.latitude = glocation.latitude;
        mapCenter.longitude = glocation.longitude;
        map.setView({ center: mapCenter, zoom:14 });
    });




}

function InitSearch() {
    searchPane = Windows.ApplicationModel.Search.SearchPane.getForCurrentView();
    searchPane.showOnKeyboardInput = true;


    searchPane.addEventListener("querysubmitted", searchLocation);
}