canvas = document.getElementById("game");
ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.font = "40px Roboto";

// PlayerRectangle = 0
// FishImage = 1
var renderList = [];
var mouseDown = false;

var buttonList = [];

var shop = {
    deafultPrice: 3,
    priceCoef: 1.2,
    baitBought: 1,
    rodBought: 1,
    lineBought: 1
}

var playetTopMargin = 130, playerBottomMargin = 850;
var bumpForce = 4;
var drag = 0.99;
var gravity = 0.22;
var bounce = 0.55;

var fishMoveSpeed = 70;

var fishingRodWidth = 130;

var progress = 25;
var inGame = false;
var newGame = true;

var initialBite = true;
var waitingForBite = false;
var biting = false;
var currentDate = Date.now();
var shakeCoef = 40;

var PLAYER = "PLAYER";
var FISH = "FISH";
var RODFLOAT = "RODFLOAT"


var minLoad = 6, loadCount = 0;

canvas.addEventListener("mousedown", clickOnCanvas);
canvas.addEventListener("mouseup", mouseUpHandler);

renderList.push(makeObject(PLAYER, 380, 200, 100, fishingRodWidth, "green"));
renderList.push(makeObject(FISH, 380, 200, 100, 70, "blue"));
renderList.push(makeObject(RODFLOAT, 450, 500, 6, 58, "red"));

buttonList.push(newButton("ROD",50,100,120,70,"Buy", buyRod));
buttonList.push(newButton("BAIT",50,190,120,70,"Buy", buyBait));
buttonList.push(newButton("LINE",50,280,120,70,"Buy", buyLine));
buttonList.push(newButton("BITE",0, 450, canvas.width, 500," ", function(){
    console.log("bait");
}));


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

var shopBg = {};
shopBg.image = new Image();
shopBg.image.addEventListener('load', loadHandler, false);
shopBg.image.src = "images/shopBg.png";

var bg = {};
bg.image = new Image();
bg.image.addEventListener('load', loadHandler, false);
bg.image.src = "images/bG.png";

var bgMusic = new Audio('sounds/bgMusic.mp3')
bgMusic.volume = 0.1;

var coin = new Audio('sounds/coin.mp3');
coin.volume = 0.5;

var biteSplash = new Audio('sounds/biteNot.mp3');
biteSplash.volume = 1;

var progressLossReelSound = new Audio('sounds/progresLossReel.mp3');

var progressGainReelSound = new Audio('sounds/progresGainReel.mp3');


playerStats =
{
    fishCaught: 0,
    biggestFish: 0,
    lastFish: 0
}

function render()
{
    ctx.clearRect(0, 0, 1600, 900);
    
    player = renderList[0];
    var grd = renderList[4];
    var wtrBg = renderList[3];
    bgMusic.play();

    ctx.fillStyle = "#007697";
    ctx.fillRect(wtrBg.x, wtrBg.y, wtrBg.image.width * 5, wtrBg.image.height * 5);
    ctx.drawImage(bg.image, 0, 0, bg.image.width * 5, bg.image.height * 5);

    if(inGame)
    {
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
        ctx.drawImage(shopBg.image, 20, 75, shopBg.image.width * 5, shopBg.image.height * 5);
        ctx.drawImage(shopBg.image, 460, 75, shopBg.image.width * 5, shopBg.image.height * 5);

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
                player.moneyDisplayed += player.moneyAdd;
            }
        }
    
    ctx.drawImage(rF.image, rF.x, rF.y, rF.width * 3.2, rF.height * 3.2);
    ctx.drawImage(wtrBg.image, wtrBg.x, wtrBg.y, wtrBg.image.width * 5, wtrBg.image.height * 5);

    ctx.drawImage(grd.image, grd.x, grd.y + 80, grd.image.width * 5, grd.image.height * 5);

    ctx.fillStyle = "black";
    ctx.fillText("Money: " + Math.floor((player.moneyDisplayed / 10) * 100) / 100, 20, 50);
    }

    requestAnimationFrame(render);
}

function clickOnCanvas(e)
{
    mouseDown = true;

    var mouseX = e.clientX - canvas.offsetLeft;
    var mouseY = e.clientY - canvas.offsetTop;

    if (!inGame)
    {   
        for (var f = 0; f < buttonList.length; f++)
        {
            but = buttonList[f];

            if (but.isClicked(mouseX, mouseY))
            {
                but.onClickFunc();
            } 

            if(biting)
            {
                if(but.ID == "BITE" && but.isClicked(mouseX,mouseY))
                {
                newGame = true;
                inGame = true;
                dateNow = 0;
                biting = false;
                }
            }
        }
    }
}

function mouseUpHandler(e)
{
    mouseDown = false;
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
        progress += 0.18 + (shop.lineBought / 100) * 0.4;    
        progressGainReelSound.play();
    }
    else
    {
        progressLossReelSound.play();
    }

    if (inGame) 
    {
        progress -= (0.11 - (shop.lineBought / 100) * 0.2);

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
            coin.play();
            playerStats.lastFish = Math.floor(renderList[1].weight * 100) / 100;
            
            if(playerStats.lastFish > playerStats.biggestFish)
            {
                playerStats.biggestFish = playerStats.lastFish;
            }

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
    ctx.lineWidth = 5;
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
    
    player.height = fishingRodWidth;

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
            ctx.lineWidth = 5;
            ctx.rect(380, playetTopMargin, 100, playerBottomMargin - playetTopMargin);
            ctx.stroke();
        }
    }
}

var bittingStartTime;
var bitingDuration;
var waitTimeTillBite;
renderList[2].floatSineCounter = 0;



function newButton(ID,x, y, width, height, text, onClickFunc)
{
    var butt = {};
    
    butt.ID = ID;
    butt.x = x;
    butt.y = y;
    butt.width = width;
    butt.height = height;
    butt.text = text;
    butt.onClickFunc = onClickFunc;

    butt.isClicked = function(mouseX, mouseY)
    {
        if((mouseX > this.x && mouseX < this.x + this.width)
            && (mouseY > this.y && mouseY < this.y + this.height))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    // http://jsfiddle.net/robhawkes/gHCJt/
    //https://grtcalculator.com/math/
    butt.drawButon = function (radius, stroke, fillColor, strokeColor, invisible)
    {
        ctx.save();

        if (!invisible)
        {
            ctx.lineJoin = "round";
            ctx.lineWidth = stroke;
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;


            fontSize = this.height * 0.5;
            ctx.font = fontSize + "px Roboto";

            var textSpace;
            var gap;
            if (this.text.length > 0)
            {
                //golden value 2.04 || tempFontSize = wC * 2.04;
                // wC = textSpace / this.text.length

                var wC = fontSize / 2.04;
                textSpace = this.text.length * wC
                gap = this.width - textSpace;
            }


            //this.height = fontSize * 2;


            ctx.strokeRect((this.x + radius / 2), this.y + (radius / 2), this.width - radius, this.height - radius);
            ctx.fillRect(this.x + (radius / 2), this.y + (radius / 2), this.width - radius, this.height - radius);

            ctx.fillStyle = "black";
            this.topPadding = fontSize * 1.3;
            ctx.fillText(this.text, this.x + gap * 0.45, this.y + this.topPadding);
        }

        ctx.restore();

    }

    return butt;
}

function shopControl()
{
    ctx.fillStyle = "white";
    for (var f = 0; f < buttonList.length; f++)
    {
        var price = shop.deafultPrice;

        var b = buttonList[f];
        //radius, stroke, fillColor, strokeColor, invisible

        if (b.ID == "BITE")
        {
            b.drawButon(0, 0, "0", "0", true);
        }

        if (b.ID == "ROD")
        {
            ctx.save()
            b.drawButon(30, 20, "#4dd1b5", "#36b59a", false);

            ctx.font = "28px Roboto"
            ctx.fillText("New Rod: " + Math.floor((price * Math.pow(shop.priceCoef + 0.3, shop.rodBought))* 100) / 100, b.x + b.width * 1.2, b.y + b.topPadding);
            ctx.restore();
        }

        if (b.ID == "BAIT")
        {
            ctx.save()
            b.drawButon(30, 20, "#4dd1b5", "#36b59a", false);

            ctx.font = "28px Roboto"
            ctx.fillText("New Bait: " +  Math.floor(shop.deafultPrice * Math.pow(shop.priceCoef + 0.13,shop.baitBought) * 100) / 100, b.x + b.width * 1.2, b.y + b.topPadding);
            ctx.restore();
        }

        if (b.ID == "LINE")
        {
            ctx.save()
            b.drawButon(30, 20, "#4dd1b5", "#36b59a", false);

            ctx.font = "28px Roboto"
            ctx.fillText("New Line: " + Math.floor((price * Math.pow(shop.priceCoef + 0.2, shop.lineBought))* 100) / 100, b.x + b.width * 1.2, b.y + b.topPadding);
            ctx.restore();
        }

    }
}

function updateStats()
{
    ctx.save();

    //ctx.text = "60px Roboto";
    ctx.fillText("Stats", 612, 120, 400);

    ctx.font = "28px Roboto";
    ctx.fillText("Last fish caught: " + playerStats.lastFish + "Kg", 480, 160);
    ctx.fillText("Biggest Fish: " + playerStats.biggestFish + "Kg", 480, 210);

    ctx.restore();
}

function buyRod()
{
    player = renderList[0];
    var price = shop.deafultPrice * Math.pow(shop.priceCoef + 0.19,shop.rodBought) * 10;
    console.log(price);

    if(player.money >= price)
    {   
        player.money -= price;
        shop.rodBought++;
        fishingRodWidth = fishingRodWidth + 25;
    }
}

function buyLine()
{
    player = renderList[0];
    var price = shop.deafultPrice * Math.pow(shop.priceCoef + 0.17,shop.lineBought) * 10;

    if(player.money >= price)
    {   
        player.money -= price;
        shop.lineBought++;
    }
}

function buyBait()
{
    player = renderList[0];
    var price = shop.deafultPrice * Math.pow(shop.priceCoef + 0.13,shop.baitBought) * 10;

    if(player.money >= price)
    {   
        player.money -= price;
        shop.baitBought++;
    }
}




