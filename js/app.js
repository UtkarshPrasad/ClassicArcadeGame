var app = app || {};

app.level = 1;
app.lifes = 3;
app.pause = false;
app.points = 0;
app.maxSpeed = 400;
app.allItems = new Map();
app.LEVEL_UP_POINTS = 100;

//function to choose randomly between three numbers
app.randomNum = function(){
    var num = Math.floor((Math.random()*10)/3);
    return num;
};

app.levelUp = function() {
    var that = this;
    //update counters, display them on screen
    this.level++;
    $("#level").text("Level " + that.level);
    this.points += this.LEVEL_UP_POINTS;
    $("#points").text(that.points + " pts");

    //when level up, delete all gems and hearts displayed
    //this.deleteGemsHearts();


    if (this.level<=8 || (this.level>=25 && this.level%5 === 0)) {
        this.createEnemies();
    }

    if (this.level > 30) {
        this.maxSpeed = 500;
    }

    if (this.level === 40) {
        this.pause = true;
        $("#wonModal").modal('show');
        $(".restart").click(function() {
                that.restart();
            });
    }
};

//manage life counter, this function receives
//a boolean value
app.addLife = function(up) {
    //lifes counter is displayed to player as a list of hearts
    var elements = $("ul").children();
    var elem;
    var that = this;
    //plus one life when player catches a heart item
    if (up === true) {
        if (this.lifes < 3) {
            elem = elements[this.lifes];
            //refactor hearts counter displayed to user
            $(elem).toggleClass('fontawesome-heart-empty fontawesome-heart');
            this.lifes++;
        }
    } else { //minus one life when player collides with bug
        that.restart();
    }
};

//function that resets variables with initial values
app.restart = function() {
    var that = this;

    this.level = 1;
    this.lifes = 3;
    this.points = 0;
    this.maxSpeed = 400;
    this.allItems.clear();
    this.allEnemies = [];
    this.player.x = 404;
    this.player.y = 390;

    //reset info displayed on screen
    $("#level").text("Level " + that.level);
    $("#points").text(that.points + " pts");

    var elements = $("ul").children();
    //couldn't iterate with forEach loop
    for (var i = 0; i < 3; i++) {
        var heartElem = elements[i];

        //when used toggleClass found a bug
        $(heartElem).removeClass('fontawesome-heart-empty');
        $(heartElem).addClass('fontawesome-heart');
    }

    this.startGame();

};

//function used to select character
app.startGame = function() {
    var selected = null;
    var that = this;

    $("#startModal").modal('show');

    $(".char-elem").click(function() {

        //remove and add classes to show player which caracter was selected
        if (selected !== null) {
            $(selected).removeClass('char-selected');
        }

        //define new player sprite according to choosen caracter
        that.player.sprite = $(this).attr('src');
        $(this).addClass('char-selected');
        selected = $(this);
    });
	that.createEnemies();
	that.pause = false;
};

//function to choose random game over images
app.gameOverImg = function() {
    var imageGameOver = $("#game-over-img");
    var r = this.randomNum();
    switch(r){
        case 0:
            $(imageGameOver).attr('src', 'images/unagi.jpg');
            break;
        case 1:
            $(imageGameOver).attr('src', 'images/give-up.jpg');
            break;
        case 2:
            $(imageGameOver).attr('src', 'images/tugging.jpg');
            break;
        default:
            $(imageGameOver).attr('src', 'images/waste.jpg');
    }
};

var GameObject = function() {};

GameObject.prototype.getY = function() {
    var num = 0;
    switch(app.randomNum()) {
        case 0:
            num = 60;
            break;
        case 1:
            num = 143;
            break;
        default:
            num = 226;
    }
    return num;
};

var Character = function() {
    GameObject.call(this);
};

Character.prototype = Object.create(GameObject.prototype);
Character.prototype.constructor = Character;

Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Character.prototype.getX = function() {
    var num = 0;
    switch(app.randomNum()){
        case 0:
            num = -150;
            break;
        case 1:
            num = -350;
            break;
        default:
            num = -550;
    }
    return num;
};


Character.prototype.getSpeed = function() {
    return Math.floor(Math.random() * (app.maxSpeed - 100 + 1)) + 100;
};

// Enemies our player must avoid
var Enemy = function() {
    Character.call(this);

    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = this.getX();
    this.y = this.getY();
    this.speed = this.getSpeed();
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + this.speed*dt;

    //if enemie crossed screen get new x and y coordenates
    //also get a new value for speed
    if (this.x >= 1010) {
        this.x = this.getX();
        this.y = this.getY();
        this.speed = this.getSpeed();
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function() {
    Character.call(this);
    this.PLAYER_X_INIT_COORD = 404;
    this.PLAYER_Y_INIT_COORD = 390;
    this.x = this.PLAYER_X_INIT_COORD;
    this.y = this.PLAYER_Y_INIT_COORD;
    //xplus and y plus used to manage rock interactivity
    this.xplus = 0;
    this.yplus = 0;
    this.sprite = 'images/char-boy.png';
    this.PLAYER_RIGTH_LIMIT = 909;
    this.PLAYER_LEFT_LIMIT = 0;
    this.PLAYER_Y_MOVE = 83;
    this.PLAYER_X_MOVE = 101;

};

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

//handle player's playing area borders and collision with items
Player.prototype.update = function() {
    //player reaches water
    if (this.y === -25) {
        this.x = this.PLAYER_X_INIT_COORD;
        this.y = this.PLAYER_Y_INIT_COORD;
        app.levelUp();
    }

    //contain player into playing area
    if (this.y >= this.PLAYER_Y_INIT_COORD) {
        this.y = this.PLAYER_Y_INIT_COORD;
    }

    if (this.x <= this.PLAYER_LEFT_LIMIT) {
        this.x = this.PLAYER_LEFT_LIMIT;
    }

    if (this.x >= this.PLAYER_RIGTH_LIMIT) {
        this.x = this.PLAYER_RIGTH_LIMIT;
    }

};

//moves player through the playing area
Player.prototype.handleInput = function(key) {
    this.xplus = 0;
    this.yplus = 0;

    switch (key) {
        case 'left':
            this.x = this.x - this.PLAYER_X_MOVE;
            this.xplus = - this.PLAYER_X_MOVE;
            break;
        case 'up':
            this.y = this.y - this.PLAYER_Y_MOVE;
            this.yplus = - this.PLAYER_Y_MOVE;
            break;
        case 'right':
            this.x = this.x + this.PLAYER_X_MOVE;
            this.xplus = this.PLAYER_X_MOVE;
            break;
        case 'down':
            this.y = this.y + this.PLAYER_Y_MOVE;
            this.yplus = this.PLAYER_Y_MOVE;
            break;
    }
};

var Item = function() {
    GameObject.call(this);
    this.x = this.getXCoord();
    this.y = this.getY();
    //create key to store item on map
    this.key = this.x.toString()+this.y.toString();
    this.checkCoords();
};

Item.prototype = Object.create(GameObject.prototype);
Item.prototype.constructor = Item;

//validates that another item doesn't have the same position
//if it does, new x and y coordenates are generated
//as well as a new key
Item.prototype.checkCoords = function() {

        while (app.allItems.has(this.key)) {
            this.x = this.getXCoord();
            this.y = this.getY();
            this.key = this.x.toString()+this.y.toString();
        }
};

Item.prototype.getXCoord = function() {
    var num = 0;
    switch(Math.floor(Math.random()*10)){
        case 0:
            num = 0;
            break;
        case 1:
            num = 101;
            break;
        case 2:
            num = 202;
            break;
        case 3:
            num = 303;
            break;
        case 4:
            num = 404;
            break;
        case 5:
            num = 505;
            break;
        case 6:
            num = 606;
            break;
        case 7:
            num = 707;
            break;
        case 8:
            num = 808;
            break;
        case 9:
            num = 909;
            break;
    }
    return num;
};

Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
app.allEnemies = [];
app.player = new Player();

app.createEnemies = function() {
    this.allEnemies.push(new Enemy());
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
 document.addEventListener('keyup', function(e) {
     var allowedKeys = {
         37: 'left',
         38: 'up',
         39: 'right',
         40: 'down',
         32: 'space'
     };

    //show or hide pause game modal
     if (e.keyCode===32) {
         app.pause = !app.pause;
         if (app.pause === false) {
             $("#pauseModal").modal('hide');
         } else {
             $("#pauseModal").modal('show');
         }
     }
    //block player to move caracter when game is paused
      if (app.pause===false) {
          app.player.handleInput(allowedKeys[e.keyCode]);
     }
 });
