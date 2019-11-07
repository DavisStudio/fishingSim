function floatBitting()
{
    shopControl();

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
        //console.log("bittinmg");
        biting = true;
    }
    else
    {
        //console.log("NOOOOT BITTING");
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
        //console.log("BITTTING");
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