var formSub;
window.onload = function(){
    var currentList = [];
    var lastId = [];
    var sugHistory = [];
    var inputHistory = [];
    var inHisIndex = 0;
    var noResults = [];
    var liked = document.querySelector('#liked h3');
    var socket = io.connect(window.location.href);
    var input = document.getElementById("myinput");
    var awesomplete = new Awesomplete(input);
    var sub = document.getElementById('sub');
    var reco = document.querySelector('#reco .row');

    document.addEventListener('selected', function (e) {
        socket.emit("movieInput", lastId[e.detail]);
        currentList.push(lastId[e.detail]);
        var newM = document.createElement('div');
        newM.setAttribute("class", "alert alert-info");
        newM.setAttribute("role", "alert");
        var tempIndex = currentList.length;
        newM.innerHTML = input.value + "<a href='#'><i class='glyphicon glyphicon-remove'></i></a>";
        newM.querySelector('a').addEventListener('click', function(){
            liked.removeChild(newM);
            currentList.splice(tempIndex - 1, 1);
            socket.emit("deleteMovie", lastId[e.detail]);
        });
        liked.appendChild(newM);
        input.value = "";
    }, false)

    formSub = function() {
        if (currentList.length > 0) {
            socket.emit("submittedForm");
            var p = liked.querySelectorAll("p");
            liked.innerHTML = "";
        }
        currentList = [];
    }

    function changeList(newList){
        awesomplete.list = newList;
    }

    function nothingToShow(input){
        var nothing = false;
        for(var i = 0; i < noResults.length; i++){
            if (noResults[i] == input) {
                nothing = true;
                break;
            }
        }
        return nothing;
    }

    input.addEventListener('input', function(){
        var nothing = this.value === "" || nothingToShow(this.value);
        if (typeof sugHistory[this.value] === 'undefined' &&  !nothing) {
            inputHistory.push(this.value);
            socket.emit('ask', this.value);
        }
        else if(!nothing){
            lastId = sugHistory[this.value].id;
            changeList(sugHistory[this.value].name);
      }
    });

    socket.on('suggest', function(data){
        var buffer = {'id': [], 'name': []}
        for(var i = 0; i < data.length; i++){
            buffer.name.push(data[i].l + ' (' + data[i].y + ')');
            buffer.id.push(data[i].id.split('tt')[1]);
        }
        lastId = buffer.id;
        changeList(buffer.name);
        sugHistory[inputHistory[inHisIndex]] = buffer;
        inHisIndex++;
    });

    socket.on('noResults', function(input){
        noResults.push(input);
    });

    socket.on('reco', function(data){
        reco.innerHTML = "";
        for(var i in data) {
            reco.innerHTML += '<div class="col-xs-6 col-md-3 col-lg-2"><a href="#" onclick="return false;" class="thumbnail"><img src="' + data[i].img + '" alt=""><div class="blk">' + data[i].name + '</div></a></div>';
        }
    });
}
