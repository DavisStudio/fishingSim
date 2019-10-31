canvas = document.getElementById("game");
ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// PlayerRectangle = 0
// FishImage = 1
var renderList = [];

var bumpForce = 6;
var drag = 0.99;
var gravity = 0.22;
var bounce = 0.55;

var fishMoveSpeed = 25;
var fishOffsetBounce = 350;

var fishingRodWidth = 250;

var PLAYER = "PLAYER";
var FISH = "FISH";

var minLoad = 1, loadCount = 0;

canvas.addEventListener("click", clickOnCanvas);

makeObject(PLAYER, 100, 200, 100, 300, "green");
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

    //move 
    if (obj.ID == PLAYER) 
    {
        obj.y -= obj.force;
        obj.force *= drag;
        obj.force -= gravity;
    }

    //collide 
    if(obj.ID == PLAYER)
    {
        if(obj.y < 0)
        {
            obj.force -= obj.force;
            obj.y += 4;
        }
        else if(obj.y + 300 > 900)
        {
            if(obj.force < 1.5 && obj.force > -1.5)
            {
                obj.force = 0;
                obj.y = 600
            }
            else
            {
                obj.force *= -1;
                obj.force *= bounce;
                obj.y -= 1;
            }
        }
        
        console.log(obj.force);
    }

    if(obj.ID == FISH)
    {
        if(obj.pointToMove == null)
        {
            obj.getNewPoint();
        }

        obj.moveToPoint();
    }

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
            if(this.y > this.pointToMove - 3 && this.y < this.pointToMove + 3)
            {
                console.log("middle");
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