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


var minLoad = 1, loadCount = 0;

canvas.addEventListener("mousedown", clickOnCanvas);
canvas.addEventListener("mouseup", mouseUpHandler);

renderList.push(makeObject(PLAYER, 380, 200, 100, fishingRodWidth, "green"));
renderList.push(makeObject(FISH, 380, 200, 100, 70, "blue"));
renderList.push(makeObject(RODFLOAT, 450, 500, 40, 100, "red"));

renderList[1].image = new Image();
renderList[1].image.addEventListener('load', loadHandler, false);
renderList[1].image.src = "images/fish.png";

function render()
{
    ctx.clearRect(0, 0, 1600, 900);
    
    if(inGame)
    {
        fishingGame();
    }
    else
    {
        floatBitting();
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

    if(ID == FISH || ID == RODFLOAT)
    {
        if (ID == FISH)
        {
            obj.fishOffsetBounce = 200;
            obj.pointToMove = null;
            obj.weight = getRandomNum(0.5, 3.5);
            obj.moveMin = playetTopMargin;
            obj.moveMax = playerBottomMargin;
            obj.fishMoveSpeed = 70;
        }

        if(ID == RODFLOAT)
        {
            obj.fishOffsetBounce = 80;
            obj.pointToMove = 500;
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
            renderList[2].y = 500;
            newGame = true;
            inGame = false;
            waitingForBite = false;
        }
    }

    if(progress < 0)
    {
        renderList[2].y = 500;
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

    rF.floatSineCounter += 0.03;

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
        rF.moveMax = 620;
        rF.moveMin = 500;
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
            rF.pointToMove = 500;
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

    ctx.fillStyle = rF.color;
    ctx.fillRect(rF.x, rF.y, rF.width, rF.height);

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#6bd5ff";
    ctx.fillRect(0, 550, 1600, 600);
    ctx.globalAlpha = 1;
}

