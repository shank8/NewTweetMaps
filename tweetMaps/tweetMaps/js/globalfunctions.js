function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a href='$1'>$1</a>");
}

function getUsernameLinkSimple(username) {
    var link = "<a href=\"https://twitter.com/" + username + "\">@" + username + "</a>";
    return link;
}

function getUsernameLink(text) {
    var exp = /@(\S*)/gi;
    return text.replace(exp, "<a href=\"https://twitter.com/$1\">@$1</a>");
}

function getHashtagLink(text) {
    var exp = /#(\S*)/gi;
    return text.replace(exp, "<a href=\"https://twitter.com/search?q=%23$1&src=hash\">#$1</a>");
}
