var app = require('express')();
var server = require('http').createServer(app);
var fs = require('fs');
var io = require('socket.io').listen(server);
var search = require('./search');
var getMovieList = require('./getMovieList');
var listing = require('./listing');
var config = require('./config');
var mongo = require('mongodb');
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
})
.get('/:page', function(req, res) {
    res.sendFile(__dirname + '/public/' + req.params.page);
})
.use(function(err, req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Error 404');
});
server.listen(config.port, config.ip);
mongo.MongoClient.connect(config.dbUrl(), function(err, db) {
    if (err) throw err;
    var movieCollection = db.collection(config.dbcollection);
    var ips = db.collection("ips");
    io.sockets.on('connection', function(socket) {
        ips.insert({ip: socket.handshake.address}, function(err){
            if(err) throw err;
        })
        var submitted = false;
        search.init(socket);
        var movies = {};
        socket.on("movieInput", function(id) {
            var ignored = Object.getOwnPropertyNames(movies);
            movies[id] = [[], 0, 12];
            getMovieList(movieCollection, id, ignored, function(similar){
                movies[id] = [similar, 0, similar.length];
                ignored = Object.getOwnPropertyNames(movies);
                for (var i in similar) {
                    getMovieList(movieCollection, similar[i].id, ignored, function(simToSim){
                        if (typeof movies[id] !== "undefined") {
                            movies[id][1]++;
                            movies[id][0] = movies[id][0].concat(simToSim);
                            listing(submitted, movies, reco);
                        }
                    });
                }
            });
        });
        socket.on("deleteMovie", function(id) {
            delete movies[id];
        });
        socket.on("submittedForm", function() {
            submitted = true;
            listing(true, movies, reco);
        });
        function reco(list) {
            socket.emit("reco", list);
            submitted = false;
            movies = {};
        }
    })
})
