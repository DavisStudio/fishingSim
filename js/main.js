canvas = document.getElementById("game");
ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.font = "40px Roboto";

// PlayerRectangle = 0
// FishImage = 1
var renderList = [];
var mouseDown = false;

var playetTopMargin = 120, playerBottomMargin = 850;
var bumpForce = 4;
var drag = 0.99;
var gravity = 0.22;
var bounce = 0.55;

var fishMoveSpeed = 70;

var fishingRodWidth = 200;

var progress = 25;
var inGame = true;
var newGame = true;

var initialBite = true;
var waitingForBite = false;
var biting = false;
var currentDate = Date.now();
var shakeCoef = 40;

var PLAYER = "PLAYER";
var FISH = "FISH";
var RODFLOAT = "RODFLOAT"


var minLoad = 4, loadCount = 0;

canvas.addEventListener("mousedown", clickOnCanvas);
canvas.addEventListener("mouseup", mouseUpHandler);

renderList.push(makeObject(PLAYER, 380, 200, 100, fishingRodWidth, "green"));
renderList.push(makeObject(FISH, 380, 200, 100, 70, "blue"));
renderList.push(makeObject(RODFLOAT, 450, 500, 6, 58, "red"));

renderList[1].image = new Image();
renderList[1].image.addEventListener('load', loadHandler, false);
renderList[1].image.src = "images/fish.png";

renderList[2].image = new Image();
renderList[2].image.addEventListener('load', loadHandler, false);
renderList[2].image.src = "images/float.png";

renderList[3] = {
    x: 0,
    y: 460,
};
renderList[3].image = new Image();
renderList[3].image.addEventListener('load', loadHandler, false);
renderList[3].image.src = "images/underwater.png";

renderList[4] = {
    x: 0,
    y: 460,
};
renderList[4].image = new Image();
renderList[4].image.addEventListener('load', loadHandler, false);
renderList[4].image.src = "images/uWtrGradient.png";

var coin = new Audio('sounds/coin.wav');
coin.volume = 0.5;


function render()
{
    ctx.clearRect(0, 0, 1600, 900);
    player = renderList[0];
    var grd = renderList[4];
    var wtrBg = renderList[3];

    if(inGame)
    {
        ctx.fillStyle = "#007697";
        ctx.fillRect(wtrBg.x, wtrBg.y, wtrBg.image.width * 5, wtrBg.image.height * 5);

        ctx.drawImage(wtrBg.image, wtrBg.x, wtrBg.y, wtrBg.image.width * 5, wtrBg.image.height * 5);
        ctx.drawImage(grd.image, grd.x, grd.y + 80, grd.image.width * 5, grd.image.height * 5);

        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "white";
        ctx.fillRect(20,20, canvas.width - 40, canvas.height - 40);
        ctx.globalAlpha = 1;

        fishingGame();
    }
    else
    {
        floatBitting();
        
        if (!(player.money == player.moneyDisplayed))
        {
            player.moneyAdd = Math.abs(player.money - player.moneyDisplayed) / 60;

            if(player.moneyAdd < 0.0009)
            {
                player.moneyDisplayed = player.money;
                player.moneyAdd = 0;
            }

            if (player.money < player.moneyDisplayed)
            {
                player.moneyDisplayed -= player.moneyAdd;
            }
            else if (player.money > player.moneyDisplayed)
            {
                console.log(Math.floor(player.moneyDisplayed) % 1);

                console.log(Math.floor(player.moneyAdd * 1000) / 1000);
                if(Math.floor(player.moneyAdd * 1000) / 1000 % 0.01 == 0)
                {
                    var newCoin = coin.cloneNode();
                    newCoin.volume = 0.5;
                    newCoin.play();
                }

                player.moneyDisplayed += player.moneyAdd;
            }
        }
       
    ctx.drawImage(rF.image, rF.x, rF.y, rF.width * 3.2, rF.height * 3.2);
    ctx.drawImage(wtrBg.image, wtrBg.x, wtrBg.y, wtrBg.image.width * 5, wtrBg.image.height * 5);

    ctx.drawImage(grd.image, grd.x, grd.y + 80, grd.image.width * 5, grd.image.height * 5);

    ctx.fillText("Money: " + Math.floor((player.moneyDisplayed / 10) * 100) / 100, 20, 50);
    console.log(player.money + " Money ------- Displayed money: " + player.moneyDisplayed);
    }
    
    requestAnimationFrame(render);
}

function clickOnCanvas(e)
{
    mouseDown = true;

    if(biting)
    {
        newGame = true;
        inGame = true;
        dateNow = 0;
        biting = false;
    }
}

function mouseUpHandler(e)
{
    mouseDown = false;
}


function makeObject(ID, x, y, width, height, color)
{
    var obj = {}

    obj.ID = ID;
    obj.x = x;
    obj.y = y;
    obj.width = width;
    obj.height = height;
    obj.force = 0;
    obj.color = color;

    if(ID == PLAYER)
    {
        obj.money = 0;
        obj.moneyDisplayed = 0;
        obj.profitCoef = 25;
        obj.moneyAdd = 0;
    }

    if(ID == FISH || ID == RODFLOAT)
    {
        if (ID == FISH)
        {
            obj.fishOffsetBounce = 200;
            obj.pointToMove = null;
            obj.weight = getRandomNum(1, 4.2);
            obj.moveMin = playetTopMargin;
            obj.moveMax = playerBottomMargin;
            obj.fishMoveSpeed = 70;
        }

        if(ID == RODFLOAT)
        {
            obj.fishOffsetBounce = 80;
            obj.pointToMove = 430;
            obj.weight = 1.2;
            obj.moveMin = 450;
            obj.moveMax = 550;
            obj.objMoveSpeed = 40;
            obj.floatAtDeafult = false;
        }

        obj.getNewPoint = function()
        {
            if(this.pointToMove == null)
            {
                this.pointToMove = getRandomNum(this.moveMin,this.moveMax);
            }
            
            var topOffset, bottomOffset;

            if(this.y - this.fishOffsetBounce * this.weight < this.moveMin)
            {
                topOffset = this.moveMin;
            }
            else
            {
                topOffset = this.y - this.fishOffsetBounce * this.weight;
            }

            
            if(this.y + this.fishOffsetBounce * this.weight > this.moveMax)
            {
                bottomOffset = this.moveMax;
            }
            else
            {
                bottomOffset = this.y + this.fishOffsetBounce * this.weight;
            }

            this.pointToMove = getRandomNum(bottomOffset, topOffset);

        }

        obj.isPointReached = function()
        {
            if(this.y > this.pointToMove - 6 * (this.weight * 0.6) && this.y < this.pointToMove + 6 * (this.weight * 0.6))
            {
                return true;
            }
            
            return false;
        }

        obj.moveToPoint = function()
        {
            //fishMoveSpeed *= this.weight;

            var distanceLeft = Math.abs(this.pointToMove - this.y); 
            
            var speed = distanceLeft / fishMoveSpeed;

            if(this.y > this.pointToMove)
            {
                this.y -= speed;
            }
            else if(this.y < this.pointToMove)
            {
                this.y += speed;
            }

            this.isPointReached();

        }
        
        obj.getNewWeight = function()
        {
            this.weight = getRandomNum(1,3);
        }
    }

    return obj;
}

function loadHandler(e) {

    if (++loadCount == minLoad) 
    {
        render();
    }
}

function getRandomNum(min, max)
{
    return min + Math.random() * (max - min);
}

function progressUpdate()
{
    fish = renderList[1];
    player = renderList[0];

    if(player.y < fish.y && player.y + fishingRodWidth > fish.y)
    {
        progress += 0.2;    
    }

    if (inGame) 
    {
        progress -= 0.1;

        if (fish.pointToMove == null) 
        {
            fish.getNewPoint();
        }
        else
        {
            if(fish.isPointReached())
            {
                fish.getNewPoint()
            }
            else
            {
                fish.moveToPoint();
            }
        }
        
        if(progress > 100)
        {
            renderList[2].y = 450;
            newGame = true;
            inGame = false;
            waitingForBite = false;
            player.money += Math.floor(fish.weight * player.profitCoef * 100) / 100;
        }
    }

    if(progress < 0)
    {
        renderList[2].y = 450;
        newGame = true;
        inGame = false;
        waitingForBite = false;
        progress = 0;
    }
    else if(progress > 100)
    {
        progress = 100;
        inGame = false;
        waitingForBite = false;
    }

    ctx.fillText(Math.floor(progress), 410, 40);
    
    ctx.beginPath()
    ctx.lineWidth = 2;
    ctx.rect(50,50, 800, 50);
    ctx.stroke();

    ctx.fillRect(50, 50,  800 * progress / 100, 50);
}

function fishingGame()
{
    if(newGame == true){
        newGame = false;
        renderList[1].getNewWeight();
        console.log(renderList[1].weight);
        inGame = true;
        progress = 25;
    }

    for (var i = 0; i < 2; i++)
    {
        obj = renderList[i];

        //move -------------------------
        if (obj.ID == PLAYER) 
        {
            obj.y -= obj.force;
            obj.force *= drag;
            obj.force -= gravity;
        }
        //collide ------------------------------

        if (obj.ID == PLAYER)
        {
            if(mouseDown)
            {
                obj.force =+ bumpForce;
            }

            if (obj.y < playetTopMargin)
            {
                obj.force = -Math.abs(obj.force);
            }
            else if (obj.y + fishingRodWidth > playerBottomMargin)
            {
               obj.force = Math.abs(obj.force);
            }
        }

        progressUpdate();

        //draw
        if (obj.ID == FISH)
        {
            ctx.drawImage(obj.image, obj.x + 18, obj.y, 64, 32);
        }
        else 
        {
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

            ctx.beginPath()
            ctx.lineWidth = 2;
            ctx.rect(380, playetTopMargin, 100, playerBottomMargin - playetTopMargin);
            ctx.stroke();
        }
    }
}

var bittingStartTime;
var bitingDuration;
var waitTimeTillBite;
renderList[2].floatSineCounter = 0;
function floatBitting()
{
    rF = renderList[2];
    wtrBg = renderList[3];

    rF.floatSineCounter += 0.03;

    ctx.fillStyle = "#007697";
    ctx.fillRect(wtrBg.x, wtrBg.y, wtrBg.image.width * 5, wtrBg.image.height * 5);

    if (!waitingForBite)
    {
        waitTimeTillBite = getRandomNum(4, 8) * 1000;
        currentDate = Date.now() + waitTimeTillBite;
        waitingForBite = true;
        initialBite = true;
    }

    if (currentDate + waitTimeTillBite < Date.now())
    {
        waitingForBite = false;
        if (initialBite)
        {
            initialBite = false;
            bitingDuration = getRandomNum(1.5, 3) * 1000;
            bittingStartTime = bitingDuration + Date.now();
        }
    }

    if (bittingStartTime + bitingDuration > Date.now())
    {
        console.log("bittinmg");
        biting = true;
    }
    else
    {
        console.log("NOOOOT BITTING");
        biting = false;
    }

    if (biting)
    {
        rF.weight = 5;
        rF.objMoveSpeed = 10;
        rF.moveMax = 600;
        rF.moveMin = 440;
        rF.fishOffsetBounce = 100;

        if (rF.pointToMove == null) 
        {
            rF.getNewPoint();
        }
        else
        {
            if (rF.isPointReached())
            {
                rF.getNewPoint()
            }
            else
            {
                rF.moveToPoint();
            }
        }
        console.log("BITTTING");
        rF.floatAtDeafult = false;
    }
    else
    {
        rF.weight = 3;
        rF.objMoveSpeed = 60;

        if(!rF.floatAtDeafult)
        {
            rF.pointToMove = 425;
            rF.moveToPoint();
        }
     
        if(rF.isPointReached() && !rF.floatAtDeafult)
        {
            rF.floatAtDeafult = true;
        }

        if(rF.floatAtDeafult)
        {
            rF.y += Math.sin(rF.floatSineCounter) / 4.2;
            rF.moveToPoint();
        }
       
    }
}

