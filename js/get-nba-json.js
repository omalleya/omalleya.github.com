window.onload=function(){
    //when window loads add event listener for button press
    document.getElementById("getPlayer").addEventListener("click", () => {
        document.getElementById("getPlayer").disabled = true;
        var playerName = document.getElementById("playerInput").value;
        console.log(playerName);
        getAllPlayers(playerName);
    });
}

//called on button press
function getAllPlayers(name) {
    //TODO worry about players with the same name
        //find all 
        //if size > 1 create links to each player 
        //user selects which one they want

    //TODO consecutive searches

    //TODO color of team

    //TODO use d3 to search array for name

    //TODO responsivesness only works for last set of circles

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

    //enable button now that ajax is complete
    document.getElementById("getPlayer").disabled = false;
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

    //creates svg element to put circles in
    var svg = d3.select('body').selectAll('div.container').append('svg')
                    .attr('width', '100%')
                    .attr('height', '100px')
                    .attr('id', 'chart');

    var w = parseInt(d3.select('#chart').style('width'), 10);
    var padding = 40;

    var maxDomain = (dataset.length*50)+100;

    //Creates proper scales for width of all circles height of svg using radius
    var xScale = d3.scaleLinear()
                    .domain([0,maxDomain])
                    .range([padding, w - padding]);

    // scales and axes
    var rScale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([0, w/dataset.length
                        //w<600 ? w/(dataset.length % 3) : w/dataset.length
                    ]);
    
    var circles = svg.selectAll('circle')
                        .data(dataset)
                        .enter()
                        .append('circle')
                        .attr('cx', (d,i) => {
                            return xScale(i*50 + 100);
                        })
                        .attr('cy', '50%')
                        .attr('r', (d) => {
                                return rScale(d);
                        });

    d3.select(window).on('resize', resize); 

    function resize() {
        // update width
        w = parseInt(d3.select('#chart').style('width'), 10);
        // reset x range
        xScale.range([padding, w - padding]);
        rScale.range([0, w/dataset.length]);

        circles.attr('cx', (d,i) => {
                    return xScale(i*50 + 100);
                })
                .attr('cy', '50%')
                .attr('r', (d) => {
                    return rScale(d);
                });

    }
}
