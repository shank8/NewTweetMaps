//Windows.Storage.ApplicationData.current.roamingSettings.values['token'] = undefined;
//Windows.Storage.ApplicationData.current.roamingSettings.values['secret'] = undefined;

$(document).ready(function () {

    
    $('#PINpage').hide();
    
    $('#twitterContainer').css("width", document.documentElement.clientWidth).css("height", document.documentElement.clientHeight);
    $('#mapContainer').css("width", document.documentElement.clientWidth).css("height", document.documentElement.clientHeight);
    $('#mapDiv').css("marginTop", document.documentElement.clientHeight / 2 - $('#mapDiv').height() / 2 - $('#logoMainWrap').height());

    $('#settingsMenuWrap').hide();

    $('#twitterContainer').on("hover", function () {
        $('#mapControls').css("display", "none");
    }).mouseleave(function(){
        $('#mapControls').css("display", "block");
    });
    $('#refreshBtn').click(function () {
        getTrends();
        getHomeTimeline();
    });
    $('#findBtn').click(function () {
        goHome();
    });
    $('#settingsBtn').click(function () {
        var h = $('#settingsMenu').height();
        var w = $('#settingsMenu').width();
        $('#settingsMenu').css('marginTop', document.documentElement.clientHeight / 2 - h / 2).css('marginLeft',document.documentElement.clientWidth /2 - w/2);
        $('#settingsBg').css('marginTop', document.documentElement.clientHeight / 2 - h / 2).css('marginLeft', document.documentElement.clientWidth / 2 - w / 2);
        openSettings();
    });
    $('#mapControls').hover(function () {
        WinJS.UI.Animation.fadeIn(this);
    }, function () {
        WinJS.UI.Animation.fadeOut(this);
    });

    $(".settingBtns").hover(
        function () {
            
                WinJS.UI.Animation.pointerDown(this);
           
        },
        function () {
            WinJS.UI.Animation.pointerUp(this);
        });



    $("#PINsubmit").click(function () {
        submitPIN(oauth, requestParams);
    });

    $('#composeTweet').focus(function () {
        $('#composeTweet').val("");
        searchPane.showOnKeyboardInput = false;
    }).blur(function(){
        searchPane.showOnKeyboardInput = true;
    });

    // Reply to a tweet
    $('.twitter_ReplyBtn').click(function () {
        // Reply to the tweet
    });

    $('.twitter_RetweetBtn').click(function () {
       var url = "https://api.twitter.com/1.1/statuses/retweet/241259202004267009.json";
    }); 


});

    // This function is automatically called upon running of application
var tweetMap = {
    userstate: '',
    registered : ''
};
var glocation = {
    latitude: '',
    longitude: ''
};
    var currentTime = new Date();
    var requestParams;
    var accessParams;
    tweetMap.userstate = "loggedoff";
   
    //First we need some states of the user
    var options = {
        consumerKey: 'FF8EZGXoLhEksOvk6pC4Cg',
        consumerSecret: 'bcD2grgRWHs1MlnlCG5VVenZygmTEVQF8BGTTuxpxsg',
        accessTokenKey: '',
        accessTokenSecret: ''
    };
    
    tweetMap.registered = getUserState(); // Get user state and set tokens if necesarry
    if (tweetMap.registered == "registered") {
        tweetMap.userstate = "loggedin";
        options.accessTokenKey = Windows.Storage.ApplicationData.current.roamingSettings.values['token'];
        options.accessTokenSecret = Windows.Storage.ApplicationData.current.roamingSettings.values['secret'];
    }

    var oauth = OAuth(options);

    
   
     // If the user has already registered with app then log them in automatically

    window.setInterval(getTweets, 5000);
    window.setInterval(getTime, 1000);
    window.setInterval(getLocation, 1000);
    //window.setInterval(getTrends, 1000*60);

function getTime() {
    currentTime = new Date();
}

function Init() {
    // First get tweets from area
    getTweets();
    getTrends();
    getProfile(oauth);
    getHomeTimeline();
  
}




function twitterLogon(oauth) {
    //Send a get request to twitter asking of an access token
    oauth.get('https://twitter.com/oauth/request_token',
    function (data) {
        window.open('https://twitter.com/oauth/authorize?' + data.text);
        $('#PINpage').show();
        requestParams = data.text;
    },

    function (data) {
        console.log(data);
    });
}

function replyToTweet() {

}

function submitPIN(oauth, requestParams) {

    if ($('#PINinput').val()) {
        oauth.get('https://twitter.com/oauth/access_token?oauth_verifier=' + $('#PINinput').val() + '&' + requestParams,

            function (data) {


                // split the query string as needed						
                var accessParams = {};
                var qvars_tmp = data.text.split('&');
                for (var i = 0; i < qvars_tmp.length; i++) {;
                    var y = qvars_tmp[i].split('=');
                    accessParams[y[0]] = decodeURIComponent(y[1]);
                };

                oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
                Windows.Storage.ApplicationData.current.roamingSettings.values['token'] = accessParams.oauth_token;
                Windows.Storage.ApplicationData.current.roamingSettings.values['secret'] = accessParams.oauth_token_secret;

                oauth.setVerifier($('#PINinput').val());
                $('#PINpage').hide();
                tweetMap.userstate = "loggedin";
                Init();
            },

            function (data) { }
        );
    }
}

function getUserState() {
    if (Windows.Storage.ApplicationData.current.roamingSettings.values['token'] != undefined && Windows.Storage.ApplicationData.current.roamingSettings.values['secret'] != undefined) {
        return "registered";
    }else {
        return "notregistered";
    }
}

function sendTweet() {
    var mystatus = $('#composeTweet').val();


    oauth.post('http://api.twitter.com/1/statuses/update.json',
        { status: mystatus },
        function (data) {
            $('#composeTweet').val("Send another Tweet!");
        },
        function (data) {
            var d = data;
        });

    setTimeout(getHomeTimeline, 5000);
}

function getTweets() {

    // Get tweets for the specified geographic location
    var getTweetsUrl = "http://search.twitter.com/search.json?rpp=25&geocode=";

    // Get location 
    var getPlaceUrl = "http://api.twitter.com/1/geo/place.json";


    var tweetWrap = $("#tweetWrap");
    var location = glocation.latitude + "," + glocation.longitude + ","+radius+"mi";
    var tweetArr = new Array(); // This holds the data of the tweet
    var tweetDOM = new Array(); // This holds the actual DOM elements to be appended

    // This tweet variable will hold the data for a tweet
    var tweetHolder = {
        id: '',
        time: '',
        curSeconds: 0,
        image_url: '',
        from_username: '',
        from_name: '',
        location: '',
        content: ''
    };

    $.getJSON(
        getTweetsUrl + location,
        function (data) {
            $.each(data.results, function (i, tweet) {
                if (tweet.text !== undefined) {

                    tweetHolder.from_name = tweet.from_user_name;
                    tweetHolder.from_username = tweet.from_user;
                    tweetHolder.content = tweet.text;
                    tweetHolder.image_url = tweet.profile_image_url;
                    tweetHolder.id = tweet.id_str;
                    tweetHolder.time = tweet.created_at;
                    tweetHolder.location = tweet.location;

                    var date = new Date(Date.parse(tweet.created_at));

                    var curSeconds = currentTime.getSeconds() + currentTime.getMinutes() * 60 + currentTime.getHours() * 60 * 60 + currentTime.getDay() * 60 * 60 * 24;
                    var tweetSeconds = date.getSeconds() + date.getMinutes() * 60 + date.getHours() * 60 * 60 + date.getDay() * 60 * 60 * 24;
                    var timeElapsedSeconds = curSeconds - tweetSeconds;

                    tweetHolder.curSeconds = timeElapsedSeconds;


                   

                    
                    var tweetObj = document.createElement("div"); // Create a div to put the tweet
                    $(tweetObj).addClass("aTweet");
                   

                    var image = toStaticHTML("<img class=\"tweetImage\" src=\"" + tweetHolder.image_url + "\"></img>");

                    var content = toStaticHTML("<div class=\"tweetContent\"><span class=\"tweetUser\">" + tweetHolder.from_name + " </span><span class=\"tweetUserName\"> " + getUsernameLinkSimple(tweetHolder.from_username)  + "</span><span class=\"tweetTime\"> " + getTweetTime(tweetHolder.curSeconds) + "</span><br/>" + getHashtagLink(getUsernameLink(replaceURLWithHTMLLinks(tweetHolder.content))) + "</div>");
                    $(tweetObj).append(image);
                    $(tweetObj).append(content);

                    var tweetButtons = document.createElement("div"); // Create a div for the tweet buttons
                    $(tweetButtons).addClass("tweetButtons");

                    var replyButton = toStaticHTML("<img class=\"twitter_ReplyBtn\" src=\"/images/reply.png\"></img>");
                    $(tweetButtons).append(replyButton);

                    var favoriteButton = toStaticHTML("<img class=\"twitter_FavoriteBtn\" src=\"/images/favorite.png\"></img>");
                    $(tweetButtons).append(favoriteButton);

                    var retweetButton = toStaticHTML("<img class=\"twitter_RetweetBtn\" src=\"/images/retweet.png\"></img>");
                    $(tweetButtons).append(retweetButton);
                    
                  
                    tweetDOM.push(tweetButtons);
                    tweetDOM.push(tweetObj);
                    
                    
                    tweetArr.push(tweetButtons); 
                    tweetArr.push(tweetHolder);
                    
                    
                     
                }
            });

            $(tweetWrap).html("");
            for (var i = 0; i < tweetArr.length; i++) {
                $(tweetWrap).append(tweetDOM[i]);
            }

        }
    );
}
function getTrends() {
    var url = "https://api.twitter.com/1.1/trends/closest.json?long=" + glocation.longitude + "&lat=" + glocation.latitude;
   
    var woeid;
    var place;
    var trends;

    oauth.get(url,
        function (data) {
            place = $.parseJSON(data.text)[0];
            woeid = place.woeid;
            if (woeid) {
                var url2 = "http://api.twitter.com/1/trends/" + woeid + ".json";
                var trendArr = new Array();
                $.getJSON(url2,
                    function (data) {
                        $.each(data[0].trends, function (i, trend) {
                            var trendObj = document.createElement('div');
                            $(trendObj).addClass("aTrend");
                            var link = toStaticHTML("<a href=\"" + trend.url + "\">#" + trend.name.replace("#", "") + "</a>");
                            $(trendObj).append(link);
                            trendArr.push(trendObj);
                        });
                        $('#trendWrap').html("");
                        for (var i = 0; i < trendArr.length; i++) {
                            $('#trendWrap').append(trendArr[i]);
                        }
                    }, function (data) {
                        var d = data;
                    });
            }
        },
        function (data) {
            var d = data;
        });
    
   
}
function getProfile(oauth) {
    // First get the profile object

    var url = "https://api.twitter.com/1/account/verify_credentials.json";

    oauth.get(url,
        function (data) {
            var user = $.parseJSON(data.text);
            
            var profileHeader = document.createElement("div");
            $(profileHeader).addClass("profileHeader");
            var image = toStaticHTML("<img id=\"profilePic\" src=\"" + user.profile_image_url + "\" />");
            var name = toStaticHTML("<span id=\"profileName\">" + user.name + "</span><br />");
            var username = toStaticHTML("<span id=\"profileUsername\">" + getUsernameLinkSimple(user.screen_name) + "</span>");
            var tweets = toStaticHTML("<br /><br /><span class=\"profileFF\">" + user.statuses_count + " TWEETS</span>");
            var followers = toStaticHTML("<span class=\"profileFF\">" + user.followers_count + " FOLLOWERS</span>");
            var friends = toStaticHTML("<span class=\"profileFF\">" + user.friends_count + " FRIENDS</span>");

            var profileData = document.createElement("div");
            $(profileData).addClass("profileData");
            $(profileData).append(tweets).append(followers).append(friends);
            $(profileHeader).append(image).append(name).append(username);


            

            $('#profileWrap').prepend(profileData);
            $('#profileWrap').prepend(profileHeader);

            

            
        },
        function (data) {
            var d = data;
        });
    

}
function getTweetTime(curSeconds) {
    var curMin = curSeconds / 60;

    if (curSeconds < 60) {
        return (curSeconds + "s");
    } else if (curSeconds >= 60 && curMin < 60) {
        return (Math.ceil(curSeconds / 60) + "m")
    } else {
        return (curMin / 60 + "h");
    }
}

function getLocation() {
    var center = map.getCenter();
    glocation.latitude = center.latitude;
    glocation.longitude = center.longitude;
}

function getHomeTimeline() {
    var url = "http://api.twitter.com/1/statuses/home_timeline.json"

    oauth.get(url,
        function (data) {
            var posts = $.parseJSON(data.text);
            var postArr = new Array();
            $.each(posts, function (i, post) {
                var obj = document.createElement('div');
                $(obj).addClass('aPost');

                var image = toStaticHTML("<img class=\"postImage\" src=\"" + post.user.profile_image_url + "\"></img>");
                var name = toStaticHTML("<span class=\"postName\">" + post.user.name + "</span><span class=\"postUsername\">" + getUsernameLinkSimple(post.user.screen_name) + "</span>");
                var text = toStaticHTML("<div class=\"tweetContent\">" + getHashtagLink(getUsernameLink(replaceURLWithHTMLLinks(post.text))) + "</div>");
                $(obj).append(image).append(name).append(text);

                postArr.push(obj);
            });
            $('#timelineWrap').html("");
            for (var i = 0; i < postArr.length; i++) {
                $('#timelineWrap').append(postArr[i]);
            }
        });


}
function goHome(){
    var geolocator = Windows.Devices.Geolocation.Geolocator();

    var promise = geolocator.getGeopositionAsync();
    var mapCenter = map.getCenter();
    navigator.geolocation.getCurrentPosition(function (pos) {
        mapCenter.latitude = pos.coords.latitude;
        mapCenter.longitude = pos.coords.longitude;
        glocation.latitude = pos.coords.latitude;
        glocation.longitude = pos.coords.longitude;
        map.setView({ center: mapCenter, zoom: 14 });
       
    });
}

function openSettings() {
    $('#settingsMenuWrap').show();

}
function closeSettings() {
    $('#settingsMenuWrap').hide();
}
function setRadius(){
    radius = $('#radiusSelect').val();
}