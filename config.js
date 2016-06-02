module.exports = {
    fetchAgain: 7, //maximum days before fetching results again
    ip: "localhost",
    port: "8080",
    dbhost: "localhost",
    dbport: "2702",
    dbname: "movies",
    dbUrl: function(){
        return "mongodb://" + this.dbhost + ":" + this.dbport + "/" + this.dbname;
    }
}
