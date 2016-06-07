var request = require('request');
//Used to replace accents and "language specific" characters
var removeDiacritics = require('./removeDiacritics');
var init = function (socket) {
    socket.on('ask', function(input){
        var rawinput = input;
        var imdb = 'http://sg.media-imdb.com/suggests/';
        /*formatting the user input, the API only accept alphanumerical characters,
        and spaces must be replaced by underscore */
        input = removeDiacritics(input.toLowerCase().replace(/\s+/g, '_'));
        input = input.replace(/[^a-z0-9_]/g, '');
        request(imdb + input[0] +'/'+ input +'.json', function (err, res, body) {
            if (err) {
                console.log("Error: ", err);
            } else {
                var jsonSug = body.split('imdb$' + input + '(')[1];
                if(typeof jsonSug != 'undefined') {
                    jsonSug = JSON.parse(jsonSug.substring(0, jsonSug.length - 1));
                    var filmOnly = [];
                    for(var i in jsonSug.d){
                        if(typeof jsonSug.d[i].y !== 'undefined'){
                            filmOnly.push(jsonSug.d[i]);
                        }
                    }
                    socket.emit('suggest', filmOnly);
                } else {
                    socket.emit('noResults', rawinput);
                }
            }
        });
    });
}
exports.init = init;
