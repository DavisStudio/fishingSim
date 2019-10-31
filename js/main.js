canvas = document.getElementById("game");
ctx = canvas.getContext("2d");

var renderList = [];

var bumpForce = 6;
var drag = 0.99;
var gravity = 0.22;

var PLAYER = "PLAYER";
var FISH = "FISH";

canvas.addEventListener("click", clickOnCanvas);

makeObject(PLAYER, 100, 200, 100, 300, "green");
makeObject(FISH, 100, 200, 100, 70, "blue");

render();

function render()
{
    ctx.clearRect(0, 0, 1600, 900);

    for(var i = 0; i < renderList.length; i++)
    {
    obj = renderList[i];

    //move 
    if(obj.ID == PLAYER)
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
            obj.force *= -1;
            obj.y -= 4;
        }
    }

    //draw
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
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
    obj.force = force;
    obj.color = color;

    if(ID == FISH)
    {
        obj.pointToMove = null;
        
        obj.getNewPoint = function()
        {

        }

        obj.isPointReached = function()
        {

        }

        obj.moveToPoint() = function()
        {

        }
    }

    renderList.push(obj);
}