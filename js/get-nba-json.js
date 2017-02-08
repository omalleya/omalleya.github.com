
//called on button press
function getPlayer(code) {
    var playerProfileURL = 'http://stats.nba.com/stats/playerprofilev2?&PlayerID='
    var playerProfileURL2 = '&PerMode=Totals';
    playerProfileURL += code.toString() + playerProfileURL2;

    $.ajax({
        url:playerProfileURL,
        dataType: 'jsonp',
        success: (json) => jsonParse(json),
        error:function(){
            alert("Error");
        },
    });
}

function getAllPlayers(name) {
    //TODO worry about players with the same name
        //find all 
        //if size > 1 create links to each player 
        //user selects which one they want

    //TODO consecutive searches

    var urlCode;

    $.ajax({
        url:'http://stats.nba.com/stats/commonallplayers?&LeagueID=00&Season=2016-17&IsOnlyCurrentSeason=1',
        dataType: 'jsonp',
        success: (json) => {
            console.log(json);
            var players = json.resultSets[0].rowSet;
            var possibleCodes = [];
            possibleCodes.push( players.filter( (playerArray) => {
                if(playerArray[2].toLowerCase() == name.toLowerCase()) {
                    return playerArray[0];
                }
                return;
            }));
            urlCode = possibleCodes[0][0][0];
            //call to get stats
            getPlayer(urlCode);
        },
        error:function(e){
            alert('error');
            console.log(e);
        },
    });
}

//called on succesful ajax request
function jsonParse(json){
    //data to be used for d3 visualization
    var data = [];

    var regSeasonTotals = json.resultSets.find(getRegSeasonTotals);

    var statIndex = regSeasonTotals.headers.findIndex( (stat) => {
        //TODO: be able to select specific stat
        return stat === 'FG3_PCT';
    });

    //pushes intended stats to data array
    regSeasonTotals.rowSet.forEach((element) => {
         data.push(getData(element, statIndex));
    });

    console.log(json);
    console.log(data);
    visualizeStats(data);
}

function getRegSeasonTotals(totals) {
    return totals.name === 'SeasonTotalsRegularSeason';
}

//helper function for going through json
function getData(element, statIndex) {
    try {
        return element[statIndex];
    }
    catch(e) {
        console.log(e);
    }
}

function visualizeStats(dataset) {
    var svg = d3.select('body').append('svg')
                    .attr('width', '100%')
                    .attr('height', '100px');
                    
    var circles = svg.selectAll('circle')
                        .data(dataset)
                        .enter()
                        .append('circle')
                        .attr('cx', (d,i) => {
                            return i*50 + 100 +'px';
                        })
                        .attr('cy', '50%')
                        .attr('r', (d) => {
                            return d*50;
                        });
}

window.onload=function(){
    //when window loads add event listener for button press
    document.getElementById("getPlayer").addEventListener("click", () => {
        var playerName = document.getElementById("playerInput").value;
        getAllPlayers(playerName);
    });
}
