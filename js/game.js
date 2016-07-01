//Sets basic canvas configurations, DOM
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
//time
var t1 = 200;
var t2 = 200;
// player
var keys = [];
var jump = 0;
var player;
var soldier;
var coord;
var building1;
var counter = 0;
var x;
//sprites
var flybird;
var soldiershoot;
//background
var turf;
//the hills
var backgroundImg1;
var spanningBackground1;
//the mountains
var backgroundImg2;
var spanningBackground2;
// conditions
var initialCondition = true;
var gravityCondition = true;
var finalCondition = false;
var towerShoot = 0;
var soldierSwitch = 0;
var soldierDirection = true;
//bullets
var blt = [];
var bltCount = 0;
/**
var poop = [];
var poopCount = 0;
**/
//lava
var magma = [];
var magmacount;
//Music
var playmusic0 = true;
var audio0 = new Audio('sounds/vocalise.mp3');
var audio1 = new Audio('sounds/themesong1.mp3');
//Score
var time;

//Sets initial values for game objects and also initializes images
function initialize() {
    for (var i = 0; i < 25; i++) {
        blt[i] = {
            x: 0,
            y: 0,
            radius: 0,
            speed: 0,
            velX: 0,
            velY: 0,
            slope: 0
        };
    }
    /**
    for (var i = 0; i < 25; i++) {
        poop[i] = {
            x: 0,
            y: 0,
            radius: 0,
            speed: 0,
            velX: 0,
            velY: 0,
            slope: 0
        };
    }
    **/

    player = {
        x: 0,
        y: canvas.height / 2,
        velX: 10 * canvas.width / 1920,
        velY: 0,
        width: canvas.width * 40 / 1920,
        height: canvas.height * 40 / 971,
        spritesheet: new SpriteSheet('images/bird.png', 110, 100),
        counter: 0,
        currentFrame: 0,
        frameOrder: [0, 1, 2, 1, 0, 3, 4, 3],
        framenumber: 8,
        hit: false,
        alive: true
    },
    soldier = {
        x: canvas.width * 9 / 10,
        y: canvas.height * (16 / 21 + 3 / 63),
        velX: 0,
        velY: 0,
        width: canvas.width * 60 / 1920,
        height: canvas.height * (2 / 21) * 2 / 3,
        spritesheet: new SpriteSheet('images/soldier.png', 48, 48),
        counter: 0,
        currentFrame: 0,
        frameOrder: [3, 2, 1, 2, 3, 4, 5, 4, 3, 9, 10, 13],
        framenumber: 12 //to be changed
    };

    flybird = new Animation(player, 6);
    soldiershoot = new Animation(soldier, 6);
    //contains variable for the height of the ground with the grass 'n' stuff
    turf = {
        height: canvas.height / 7
    },
    spanningBackground1 = {
        x: 0,
        y: 0,
        speed: 2
    },
    spanningBackground2 = {
        x: 0,
        y: 0,
        speed: 1
    },
    building1 = {
        x: canvas.width * 4 / 5,
        y: 418 * canvas.height / 971,
        width: 25 * canvas.width / 1920,
        height: 200 * canvas.height / 971,
        hp: 500
    };

    //the hills
    backgroundImg1 = new Image();
    backgroundImg1.src = 'images/besthills.png';
    backgroundImg1.height = canvas.height;
    backgroundImg1.width = canvas.width;
    //the mountains
    backgroundImg2 = new Image();
    backgroundImg2.src = 'images/mountains1.png';
    backgroundImg2.height = canvas.height;
    backgroundImg2.width = canvas.width;

    magmacount = 0;
    time = 0;
}



//Draws the spanning background, works by drawing two images, one in front of the other by the image's width, and moving the x position of both with spanningBackground.speed
function drawSlowerSpanningBackground() {
    spanningBackground1.x -= spanningBackground1.speed;
    context.drawImage(backgroundImg1, spanningBackground1.x, spanningBackground1.y, canvas.width, canvas.height);
    // Draw another image at the top edge of the first image
    context.drawImage(backgroundImg1, spanningBackground1.x + canvas.width, spanningBackground1.y, canvas.width, canvas.height);

    // If the image scrolled off the screen, reset
    if (-spanningBackground1.x >= canvas.width) {
        spanningBackground1.x = 0;
    }
}

function drawFasterSpanningBackground() {
    spanningBackground2.x -= spanningBackground2.speed;
    context.drawImage(backgroundImg2, spanningBackground2.x, spanningBackground2.y, canvas.width, canvas.height);
    // Draw another image at the top edge of the first image
    context.drawImage(backgroundImg2, spanningBackground2.x + canvas.width, spanningBackground2.y, canvas.width, canvas.height);

    // If the image scrolled off the screen, reset
    if (-spanningBackground2.x >= canvas.width) {
        spanningBackground2.x = 0;
    }
}

function start() {
    audio0.pause();
    loadgame();
    animate();
    if (playmusic0) {
        audio1.play();
    }
    $('#score').html('Score: 0');
}

//Gravity and friction values
var gravity = 0,
        friction = 0.99;

//Loads game by fading out the homepage 
function loadgame() {
    $('#loadingpage').fadeOut('slow');
    $('#header').fadeOut('slow');
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

/*Drawing stuff**/
//the ground, with grass 'n' stuff
function drawGround() {
    var grd = context.createLinearGradient(0, canvas.height * 6 / 7, 0, canvas.height * 6 / 7 + canvas.height * 70 / 971);
    grd.addColorStop(0, "#00FF00");
    grd.addColorStop(1, "#934A00");
    context.fillStyle = grd;
    context.fillRect(0, canvas.height * 6 / 7, canvas.width, turf.height);
}

//Draws background with drawBackground function and bird with drawBird function and updates it with the update function
function animate() {
    update();
    //function that sets the limits of the player
    setBounds();
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!initialCondition)
        towerShoot++;
    if (towerShoot % 40 === 1 && building1.hp > 0) {
        shoot();
    }
    soldierSwitch++;
    if (soldierSwitch >= 400 && soldierSwitch % 260 === 0)
        soldier.velX = -2;
    if (soldierSwitch >= 400 && soldierSwitch % 260 === 130)
        soldier.velX = 2;

    context.beginPath();
    drawBackground();
    drawBird();
    drawSoldier();
    drawMagma();
    drawBlt();
    //drawPoop();
    context.closePath();
    updateScore();
    requestAnimationFrame(animate);
}

function update() {
    keyCheck();
    //friction of the player
    player.velX *= friction;
    if (player.velX < 1 && initialCondition && !finalCondition) {
        player.velX = 0;
        initialCondition = false;
    }
    if (!initialCondition && (counter > 0 || gravityCondition))
        gravity = 0.03;
    player.velY += gravity;
    spanningBackground1.speed = 0.7 * (player.velX + Math.abs(player.velX)) / 2 + 3;

    //updating player position
    player.x += player.velX;
    player.y += player.velY;

    //updating soldier position
    soldier.x += soldier.velX;
    soldier.y += soldier.velY;

    //updating bullet position
    for (var i = 0; i < blt.length; i++) {
        blt[i].x += blt[i].velX;
        blt[i].y += blt[i].velY;
    }
    /**
    //update poop position
    for (var i = 0; i < poop.length; i++) {
        poop[i].x += poop[i].velX;
        poop[i].y += poop[i].velY;
    }
    **/
}

function gameover() {
    player.height = 0;
    player.width = 0;
    player.alive = false;
    $('#gameoverpage').fadeIn('slow');
    $('#restartbutton').fadeIn('slow');
}

function updateScore() {
    if (player.alive)
        time += 16;
    $("#score").html("Score: " + time);
}

//Draws spanning background and the Ground

function drawBackground() {
    //PART OF PANNING
    // Initialize the background object
    drawFasterSpanningBackground();
    drawSlowerSpanningBackground();
    //END OF PANNING
    drawGround();
}

function drawBird() {
    flybird.flip(); // flaps once
    flybird.draw(player.x, player.y);
}

function drawSoldier() {
    soldiershoot.flip(); // flaps once
    soldiershoot.draw(soldier.x, soldier.y);
}


function drawMagma() {
    if (magma.length < 20) {
        if (magmacount === 99) {
            magma.push(new rock());
        }
        magmacount = (magmacount + 1) % 100;
    }
    for (var i = 0; i < magma.length; i++) {
        magma[i].update();
        magma[i].draw();
    }
}

//controls gunfire of enemies
//adds bullets to blt array


//function to shoot bullets
function shoot() {

    if (bltCount === 25)
        bltCount = 0;
    if (Math.abs(player.velX) < 1.8 || player.x + player.width > soldier.x - 1)
        x = soldier.x - player.x;
    else
        x = soldier.x - player.x - player.velX / Math.abs(player.velX) * (canvas.width - player.x) / 15;
    var y = soldier.y - player.y - player.height / 2;

    blt[bltCount].slope = y / x;

    var multiplier = player.x - soldier.x;
    blt[bltCount].radius = 4;
    blt[bltCount].x = soldier.x;
    blt[bltCount].y = soldier.y - 2 * canvas.height / 1920;
    blt[bltCount].velX = 6 / Math.sqrt(1 + Math.pow(blt[bltCount].slope, 2)) * multiplier / Math.abs(multiplier);
    blt[bltCount].velY = blt[bltCount].velX * blt[bltCount].slope;
    if (player.x + player.width === soldier.x)
        blt[bltCount].velY += 0.15;
    bltCount++;
}
//draws the bullets
function drawBlt() {
    context.beginPath();
    context.fillStyle = 'red';
    for (var i = 0; i < blt.length; i++) {
        context.moveTo(blt[i].x, blt[i].y);
        context.arc(blt[i].x, blt[i].y, blt[i].radius, 0, 2 * Math.PI, false);
        context.closePath();
    }
    context.fill();
}
/**
 //draws the poop
 function drawPoop() {
 context.beginPath();
 context.fillStyle = 'white';
 for (var i = 0; i < poop.length; i++) {
 context.moveTo(poop[i].x, poop[i].y);
 context.arc(poop[i].x, poop[i].y, poop[i].radius, 0, 2 * Math.PI, false);
 context.closePath();
 }
 context.fill();
 }
 **/
//Key controls
function keyCheck() {
    jump = 0;

    // check keys
    if (keys[38] && !initialCondition) {
        // up arrow
        gravityCondition = false;
        player.velY = -2.2;
        counter++;
        gravity = 0;
    }

    else if (keys[40] && !initialCondition) {
        //down arrow
        player.velY = 6;
    }
    else if (counter > 0) {
        player.velY = 0;
        counter = 0;
    }
    if (keys[39] && !initialCondition) {
        // right arrow
        finalCondition = true;
        player.velX = 2 + spanningBackground1.speed * 0.15;
    }
    if (keys[37] && !initialCondition) {
        // left arrow
        finalCondition = true;
        player.velX = -2 - spanningBackground1.speed * 1.2;
    }
    if (keys[32] && player.alive) {
        if (t1 >= 200 || Date.now() - t2 >= 200) {
            t1 = Date.now() - t2;

            t2 = Date.now();
        }
        /**
        if (!keys[32] || t1 >= 200) {
            if (poopCount >= poop.length)
                poopCount = 0;
            poop[poopCount].x = player.x + player.width / 3;
            poop[poopCount].y = player.y + player.height;
            poop[poopCount].radius = 2;
            poop[poopCount].velY = 10;
            poop[poopCount].velX = player.velX;
            poopCount++;
        }
        **/

    }
}
//spacebar for poop

//Limits of the bird, allowing it to land on ground, stay within screen, etc
function setBounds() {
    //bottom boundary for bird
    if (player.y >= canvas.height - player.height - turf.height) {
        player.y = canvas.height - player.height - turf.height;
        player.velY = 0;
    }
    //top boundary for bird
    if (player.y <= 0) {
        player.y = 0;
    }
    //right boundary for bird
    if (player.x >= canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }
    //left boundary for bird
    if (player.x <= 0) {
        player.x = 0;
    }
    // bottom boundary for blt
    for (var i = 0; i < blt.length; i++)
        if (blt[i].y >= canvas.height * 6 / 7) {
            blt[i].radius = 0;
        }
    //blt hits bird
    if (player.height > 0) {
        //top and bottom edges of player
        for (var i = 0; i < blt.length; i++)
            for (var j = player.x; j <= player.x + player.width; j += 2)
                for (var k = player.y; k <= player.y + player.height; k += 2)
                    if (Math.pow(j - blt[i].x, 2) + Math.pow(k - blt[i].y, 2) <= Math.pow(blt[i].radius, 2)) {
                        gameover();
                    }
    }
}
/**
 * Function to create spritesheets.
 * Animate spritesheets
 **/
function SpriteSheet(path, frameWidth, frameHeight) {
    this.image = new Image();
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;

    // calculate the number of frames in a row after the image loads
    var self = this;
    this.image.onload = function () {
        self.framesPerRow = Math.floor(self.image.width / self.frameWidth);
    };

    this.image.src = path;
}

function Animation(controller, frameSpeed) {
    // Update the animation
    this.flip = function () {
        // update to the next frame if it is time
        if (controller.counter === (frameSpeed - 1))
            controller.currentFrame = (controller.currentFrame + 1) % player.framenumber;
        // update the counter
        controller.counter = (controller.counter + 1) % frameSpeed;
    };

    // draw the current frame
    this.draw = function (x, y) {
        // get the row and col of the frame
        var row = Math.floor(controller.frameOrder[player.currentFrame] / (controller.spritesheet.framesPerRow + 1)); // 0 for first row
        var col = Math.floor(controller.frameOrder[player.currentFrame] % (controller.spritesheet.framesPerRow + 1)); // 0 for first column

        context.drawImage(controller.spritesheet.image, col * controller.spritesheet.frameWidth, row * controller.spritesheet.frameHeight, controller.spritesheet.frameWidth, controller.spritesheet.frameHeight, x, y, controller.width, controller.height);
    };
}

function rock() {
    this.x = 0;
    this.y = Math.random() * 6 / 7 * canvas.height;
    this.dx = Math.random() * canvas.width * 0.005;
    this.dy = Math.random() * canvas.height * 0.01 - canvas.width * 0.005;
    this.radius = 5 + Math.random() * 35;
    this.color = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + 0 + ',' + 0 + ')';
    this.image = new Image();
    var random = Math.floor(Math.random() * 4) + 1;
    if (random === 1) {
        this.image.src = "images/firstmeteor.png";
    }
    if (random === 2) {
        this.image.src = "images/secondmeteor.png";
    }
    if (random === 3) {
        this.image.src = "images/thirdmeteor.png";
    }
    if (random === 4) {
        this.image.src = "images/fourthmeteor.png";
    }
    this.opacity = 1;
    this.died = false;
}

rock.prototype = {
    update: function () {
        this.x += this.dx;
        this.y += this.dy;
        if (this.y < canvas.height * 6 / 7 - this.radius) {
            this.dy += 0.05;
        }
        else {
            this.dy = -0.5 * Math.abs(this.dy);
            this.died = true;
        }
        if (this.died === true) {
            this.radius -= 0.1;
            this.opacity -= 0.01;
            if (this.opacity <= 0.01) {
                this.opacity = 0;
            }
        }
        if (this.radius < 1) {
            this.died = false;
            this.x = 0;
            this.y = Math.random() * 6 / 7 * canvas.height;
            this.dx = Math.random() * canvas.width * 0.005;
            this.dy = Math.random() * canvas.height * 0.01 - canvas.width * 0.005;
            this.radius = 8 + Math.random() * 32;
        }
        this.detectCollision();
    },
    draw: function () {

        context.beginPath();
        //context.fillStyle = this.color;
        context.drawImage(this.image, this.x, this.y, this.radius * 2, this.radius * 2)
        //context.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        //context.fill();
        context.closePath();
    },
    detectCollision: function () {
        if (player.height > 0) {
            //top and bottom edges of player
            for (var j = player.x; j <= player.x + player.width; j += 2)
                for (var k = player.y; k <= player.y + player.height; k += 2)
                    if (Math.pow(j - this.x, 2) + Math.pow(k - this.y, 2) <= Math.pow(this.radius, 2)) {
                        gameover();
                    }
        }
    }
};

