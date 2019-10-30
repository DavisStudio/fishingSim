canvas = document.getElementById("game");
ctx = canvas.getContext("2d");

var renderList = [];

var bumpForce = 2;
var drag = 0.99;
var gravity = 0.1;

canvas.addEventListener("click", clickOnCanvas);

makePlayerSquare(100, 200, 100, 400, 0, "green");

function render()
{
    for(var i = 0; i < renderList.length; i++)
    {
    obj = renderList[i];

    //move 
    
    //collide 

    //draw
    }
}

function clickOnCanvas(e)
{
    var playerSq = renderList[0];
    
    playerSq.force =+ bumpForce;
}

function makePlayerSquare(x, y, width, height, force)
{
    var obj = {}

    obj.x = x;
    obj.y = y;
    obj.width = width;
    obj.height = height;
    obj.force = force

    renderList.push(obj);
}