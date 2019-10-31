canvas = document.getElementById("game");
ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.font = "20px Arial";

// PlayerRectangle = 0
// FishImage = 1
var renderList = [];

var bumpForce = 6;
var drag = 0.99;
var gravity = 0.22;
var bounce = 0.55;

var fishMoveSpeed = 50;
var fishOffsetBounce = 300;

var fishingRodWidth = 200;

var progress = 25;
var inGame = true;

var PLAYER = "PLAYER";
var FISH = "FISH";

var minLoad = 1, loadCount = 0;

canvas.addEventListener("click", clickOnCanvas);

makeObject(PLAYER, 100, 200, 100, fishingRodWidth, "green");
makeObject(FISH, 100, 200, 100, 70, "blue");

renderList[1].image = new Image();
renderList[1].image.addEventListener('load', loadHandler, false);
renderList[1].image.src = "images/fish.png";

function render()
{
    ctx.clearRect(0, 0, 1600, 900);
    
    for(var i = 0; i < renderList.length; i++)
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
    if(obj.ID == PLAYER)
    {  
        if(obj.y < 0)
        {
            obj.force -= obj.force;
            obj.y += 4;
        }
        else if(obj.y + fishingRodWidth > 900)
        {
            if(obj.force < 1.3 && obj.force > -1.3)
            {
                obj.force = 0;
                obj.y = 900 - fishingRodWidth
            }
            else
            {
                obj.force *= -1;
                obj.force *= bounce;
                obj.y -= 1;
            }
        }
    }

    progressUpdate();
    //draw
    if(obj.ID == FISH)
    {
        ctx.drawImage(obj.image, obj.x + 18, obj.y,64,32);
    }
    else 
    {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
    }
    requestAnimationFrame(render);
}

function clickOnCanvas(e)
{
    var playerSq = renderList[0];
    
    playerSq.force =+ bumpForce;
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

    if(ID == FISH)
    {
        obj.pointToMove = null;
        
        obj.getNewPoint = function()
        {
            if(this.pointToMove == null)
            {
                this.pointToMove = getRandomNum(10,890);
            }
            
            var topOffset, bottomOffset;

            if(this.y - fishOffsetBounce < 10)
            {
                topOffset = 10;
            }
            else
            {
                topOffset = this.y - fishOffsetBounce;
            }

            
            if(this.y + fishOffsetBounce > 890)
            {
                bottomOffset = 890
            }
            else
            {
                bottomOffset = this.y + fishOffsetBounce;
            }

            this.pointToMove = getRandomNum(bottomOffset, topOffset);

        }

        obj.isPointReached = function()
        {
            if(this.y > this.pointToMove - 6 && this.y < this.pointToMove + 6)
            {
                this.getNewPoint();
            }
        }

        obj.moveToPoint = function()
        {
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
    }

    renderList.push(obj);
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
            fish.moveToPoint();
        }
        
        if(progress > 100)
        {
            inGame = false;
        }
    }

    if(progress < 0)
    {
        inGame = false;
        progress = 0;
    }
    else if(progress > 100)
    {
        progress = 100;
        inGame = false;
    }

    ctx.fillText(Math.floor(progress), 300, 50);
    
    ctx.beginPath()
    ctx.lineWidth = 2;
    ctx.rect(300,50, 500, 50);
    ctx.stroke();

    ctx.fillRect(300, 50,  500 * progress / 100, 50);
}