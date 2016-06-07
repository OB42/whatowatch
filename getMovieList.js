var Movie = require('./Movie');
var config = require('./config');
var cheerio = require('cheerio');
var http = require('http');
function getMovies(data, toIgnore, id, collection) {
    var temp = [];
    var $ = parse(data);
    if ($) {
        var name = $("#sims p");
        var pageId = $("#sims li");
        var img = $(".ribbonize img");
        for (var y = 0; y < pageId.length; y++) {
            var exist = false;
            var tempId = pageId.eq(y).attr('data-tconst').split('tt')[1];
            //checking if the movie found wasn't selected by the user before
            for (var k in toIgnore) {
                if (tempId == toIgnore[k]) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                var title = name.eq(y).text();
                var imgUrl = img.eq(y).attr("src");
                temp.push(new Movie(tempId, title, 0, imgUrl));
            }
        }
    }
    collection.insert({timestamp: new Date().getTime(), id:id,
    similar: temp}, function(err){
        if(err) throw err
    });
    return temp;
}

function parse(html) {
    //Cropping the page to accelerate the parsing
    var tempString = html.substr(30000);
    if (typeof tempString !== 'undefined'
    && typeof tempString.split('More Like This')[1] !== 'undefined'
    && typeof tempString.split('</ul>')[0] + '</ul>' !== 'undefined') {
        tempString = tempString.split('More Like This')[1].split('</ul>')[0];
        tempString += '</ul>';
        var $ = cheerio.load(tempString);
        return $;
    }
    return false;
}

function getOptions(id) {
    return {
        host: 'm.imdb.com',
        port: 80,
        path: '/title/tt' + id + '/'
    }
}

var getMovieList = function(collection, id, ignored, callback) {
    collection.find({id: id}).toArray(function(err, mov){
        if(err) throw err;
        //checking if we already fetched this movie
        if(mov.length && new Date().getTime() - mov[0].timestamp < config.fetchAgain * 24 * 3600 * 1000){
            callback(mov[0].similar);
        }
        else{
            var options = getOptions(id);
            http.get(options, function(res) {
                var data = "";
                res.resume();
                res.on('data', function(chunk) {
                    if (res.statusCode == 200) {
                        data += chunk;
                    }
                });
                res.on('end', function() {
                    callback(getMovies(data, ignored, id, collection));
                });
            }).on('error', function(e) {
                console.log("Error: " + options.host + "\n" + e.message);
            });
        }
    });

}
module.exports = getMovieList;
