
//called on button press
function getPlayer(name) {
    var playerProfileURL = 'http://stats.nba.com/stats/playerprofilev2?&PlayerID=101181&PerMode=Totals';

    console.log(name);

    $.ajax({
        url:playerProfileURL,
        dataType: 'jsonp',
        success: (json) => jsonParse(json),
        error:function(){
            alert("Error");
        },
    });
}

function getPlayerID(name) {
    //TODO worry about players with the same name
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
    var svg = d3.select('body').select('svg');
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
        getPlayer(playerName);
    });
}
