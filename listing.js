module.exports = function(submitted, movies, callback) {
    if (submitted && Object.getOwnPropertyNames(movies).length) {
        //checking if all movie lists are loaded
        var finished = true;
        for (var g in movies) {
            if (movies[g][1] != movies[g][2]) {
                finished = false;
                break;
            }
        }
        if (finished) {
            var copy = [];
            for (var c in movies){
                copy = copy.concat(movies[c][0]);
            }
            var reps = [];
            /*if the user selected only one movie, we don't count for
            repeatitions in the lists and send the first one instead */
            if (Object.getOwnPropertyNames(movies).length == 1) {
                reps = copy.slice(0, 12);
            } else {
                reps = countRepeatitions(movies);
                /* If we can't find enough movies repeated in 2 or more lists,
                 we'll use the "copy" array to find the most present movies.*/
                if (reps.length < 12) {
                    for (var i in copy) {
                        for (var y = copy.length - 1; y > i; y--) {
                            if (copy[i].id == copy[y].id) {
                                copy[i].rep++;
                                copy.splice(y, 1);
                            }
                        }
                    }
                    while (reps.length < 12) {
                        var biggest = 0;
                        for (var d in copy) {
                            if (copy[d].rep > copy[biggest].rep) {
                                biggest = d;
                            }
                        }
                        reps.push(copy[biggest]);
                        copy.splice(biggest, 1);
                    }
                }
                reps.sort(sortingMovieList);
            }
            callback(reps);
        }
    }
}

var sortingMovieList = function(a, b) {
    if (a.rep < b.rep)
        return 1;
    if (a.rep > b.rep)
        return -1;
    return 0;
};

function countRepeatitions(movieList) {
    var repeated = [];
    var list = Object.getOwnPropertyNames(movieList);
    for (var i = 0; i < list.length - 1; i++) {
        for (var y in movieList[list[i]][0]) {
            //count how many times each movie is present in the other lists
            for (var a = i + 1; a < list.length; a++) {
                for (var b = movieList[list[a]][0].length - 1; b > -1; b--) {
                    if (movieList[list[i]][0][y].id == movieList[list[a]][0][b].id) {
                        movieList[list[a]][0].splice(b, 1);
                        var present = false;
                        for (var u in repeated) {
                            if (repeated[u].id == movieList[list[i]][0][y].id) {
                                repeated[u].rep++;
                                present = true;
                                break;
                            }
                        }
                        if (!present) {
                            repeated.push(movieList[list[i]][0][y]);
                        }
                    }
                }
            }
        }
    }
    return repeated;
}
