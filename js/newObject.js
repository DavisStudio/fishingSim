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
        obj.money = 100;
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
            obj.weight = getRandomNum(shop.baitBought - 0.8, shop.baitBought * 1.5);
            obj.moveMin = playetTopMargin + 10;
            obj.moveMax = playerBottomMargin - 35;
            obj.fishMoveSpeed = 60;
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
            var bounceCoef = this.weight * 0.85;


            if(this.y - this.fishOffsetBounce * bounceCoef < this.moveMin)
            {
                topOffset = this.moveMin;
                bottomOffset += 50;
            }
            else
            {
                topOffset = this.y - this.fishOffsetBounce * bounceCoef * 0.5;
            }

            
            if(this.y + this.fishOffsetBounce * bounceCoef > this.moveMax)
            {
                bottomOffset = this.moveMax;
                topOffset -= 50;
            }
            else
            {
                bottomOffset = this.y + this.fishOffsetBounce * bounceCoef;
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

            var speed = distanceLeft / (fishMoveSpeed - this.weight * 2.5);

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
            this.weight = getRandomNum(0.2 * shop.baitBought * 0.5, shop.baitBought * 1.2);
        }
    }

    return obj;
}