//Set global board size
var boardWidth = 20;
var boardHeight = 20;
var grid = [];
var setFlag = true;
var boardInitialized = false;

class tile{
    constructor(xVal, yVal){
        this.x = xVal;
        this.y = yVal;
        this.neighbors = [];
        this.value = 0;
        this.isFlag = false;
        this.isRevealed = false;
    }

    get value(){
        return this._value;
    }

    set value(val){
        this._value = val;
    }

    set button(clicker){
        this._button = clicker;
    }

    get button(){
        return this._button;
    }

    setNeighbors(){
        var x = this.x;
        var y = this.y;
        /*
        The grid can be accessed by grid[y][x] since the board is created by rows, not cols
        */
        if (x > 0){
            this.neighbors.push(grid[y][x - 1]);
        }
        if (x < boardWidth - 1){
            this.neighbors.push(grid[y][x + 1]);
        }
        if (y > 0){
            this.neighbors.push(grid[y - 1][x]);
        }
        if (y < boardHeight - 1){
            this.neighbors.push(grid[y + 1][x]);
        }
        if (x > 0 && y > 0){
            this.neighbors.push(grid[y - 1][x - 1]);
        }
        if (x < boardWidth - 1 && y < boardHeight - 1){
            this.neighbors.push(grid[y + 1][x + 1]);
        }
        if (x > 0 && y < boardHeight - 1){
            this.neighbors.push(grid[y + 1][x - 1]);
        }
        if (y > 0 && x < boardWidth - 1){
            this.neighbors.push(grid[y - 1][x + 1]);
        }
    }
}

function createBoard(){

    //A div element that will hold each button/image
    var $board = $("<div>").attr("id", "board").css({"margin" : "auto",  "width" : "60%", "position" : "relative", "padding" : "0px"});
    //The actual grid that will hold each tile object
    grid.length = 0;
    $("#remFlags").text(80);
    $("body").append($board);
    for (var j = 0; j < boardHeight; ++j){
        var $div = $("<div>").addClass("row");
        var row = [];
        for (var i = 0; i < boardWidth; ++i){
            var $button = $("<button>").addClass("defaultTile", "column").attr("id", j + "x" + i);
            var currentTile = new tile(i, j);
            row.push(currentTile);
            $button.data(currentTile);
            $button.on("click", {x : i, y : j}, clickTile);
            $div.append($button);
        }
        grid.push(row);
        $board.append($div);
    }
    setFlag = false;
    boardInitialized = false;
}

function startGame(){
    //Set up the buttons, grid, and neighbors
    createBoard();
    for (var j = 0; j < boardHeight; ++j){
        for (var i = 0; i < boardWidth; ++i){
            grid[i][j].setNeighbors();
        }
    }
    var $restart = $("<button>").html("Play Again").addClass("restartButton");
    $restart.on("click", function(){
        $("#board").remove();
        if (setFlag){
            setGlag = false;
            $("#flagButton").css("border", "solid red 0px");
        }
        startGame();
    });
    $("#board").append($restart);
}

function clickTile(event){
    var y = event.data.y;
    var x = event.data.x;
    if (setFlag){
        //Remove flag and increment remaining flags
        if (grid[y][x].isFlag){
            $(this).css("background-image", "url(../images/defaultTile.png");
            grid[y][x].isFlag = false;
            $("#remFlags").text(parseInt($("#remFlags").text()) + 1);
        }
        else{
            //Add a flag and decrement remaining flags
            if ($("#remFlags").text() > 0) {
                $(this).css("background-image", "url(../images/flag.png");
                grid[y][x].isFlag = true;
                $("#remFlags").text($("#remFlags").text() - 1);
            }
        }
    }
    else{
        //Reveal the tile so long as it's not a flag
        if (!grid[y][x].isFlag){
            if (!boardInitialized){
                initializeBoard(x, y);
                boardInitialized = true;
            }
            if (grid[y][x].value != 9){
                revealTile(x, y);
            }
            else{
                for (var j = 0; j < boardHeight; ++j){
                    for (var i = 0; i < boardWidth; ++i){
                        revealTile(i, j);
                    }
                }
            }
            $(this).attr("disabled", "true");
        }
    }
}

function selectFlag(){
    if (setFlag){
        setFlag = false;
        $("#flagButton").css("border", "solid red 0px");
    }
    else{
        setFlag = true;
        $("#flagButton").css("border", "solid red 1px");
    }
}

function initializeBoard(x, y){
    var randRow;
    var randCol;
    //Set exactly 80 tiles to be bombs (value of 9)
    for (var i = 0; i < 80; ++i){
        randRow = Math.floor(Math.random() * 20);
        randCol = Math.floor(Math.random() * 20);
        //Don't overwrite existing bombs, starting position can't be a bomb
        if (grid[randRow][randCol].value == 9 || (x == randCol && y == randRow)){
            --i;
        }
        else{
            grid[randRow][randCol].value = 9;
            console.log(randRow + " " + randCol + " " + i);
        }
    }
    //Set the remaining tile values
    for (var j = 0; j < boardHeight; ++j){
        for (var i = 0; i < boardWidth; ++i){
            if (grid[j][i].value ==0){
                grid[j][i].value = analyzeNeighbors(i, j);
            }
        }
    }
}

function analyzeNeighbors(i, j){
    var neighbors = grid[j][i].neighbors;
    var currentVal = 0;
    for (var k = 0; k < neighbors.length; ++k){
        if (neighbors[k].value == 9){
            ++currentVal;
        }
    }
    return currentVal;
}

function revealTile(x, y){
    if (!grid[y][x].isRevealed){
        if (grid[y][x].value == 0){
            $("#" + y + "x" + x).css("background-image", "url(../images/tileZero.png)");
            grid[y][x].isRevealed = true;
            var neighbors = grid[y][x].neighbors;
            for (var i = 0; i < neighbors.length; ++i){
                revealTile(neighbors[i].x, neighbors[i].y);
            }
        }
        else if (grid[y][x].value == 1){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/tileOne.png)");
        }
        else if (grid[y][x].value == 2){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/tileTwo.png)");
        }
        else if (grid[y][x].value == 3){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/tileThree.png)");
        }
        else if (grid[y][x].value == 4){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/tileFour.png)");
        }
        else if (grid[y][x].value == 5){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/tileFive.png)");
        }
        else if (grid[y][x].value == 6){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/tileSix.png)");
        }
        else if (grid[y][x].value == 7){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/tileSeven.png)");
        }
        else if (grid[y][x].value == 8){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/tileEight.png)");
        }
        else if (grid[y][x].value == 9){
            grid[y][x].isRevealed = true;
            $("#" + y + "x" + x).css("background-image", "url(../images/bomb.png)");
        }
    }
}