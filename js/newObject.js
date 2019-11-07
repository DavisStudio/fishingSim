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
            obj.weight = getRandomNum(shop.baitBought, shop.baitBought * 1.5 + 1);
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