// 1 - Ball class
class Ball extends PIXI.Graphics
{
    constructor(x = 0, y = 0, radius = 3, color = 0xFFFFFF)
    {
        super();
        this.beginFill(color);
        this.drawCircle(x, y, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = 10;
    }
}
// 2 - Paddle class
class Paddle extends PIXI.Graphics
{
    constructor(x = 0, y = 0, width = 100, height = 20, color = 0xFFFFFF)
    {
        super();
        this.width = width;
        this.height = height;
        this.x = (sceneWidth / 2) - width / 2;
        this.y = (sceneHeight - 100);
        this.speed = 400;

        this.beginFill(color);
        this.drawRect(x, y, width, height);
        this.endFill();
    }

    moveLeft(dt = 1 / 60)
    {
        let newPos = this.x - (this.speed * dt);

        if (newPos < 0)
        {
            this.x = 0;
        }
        else
        {
            this.x -= this.speed * dt;
        }
    }

    moveRight(dt = 1 / 60)
    {
        let newPos = this.x + (this.speed * dt);

        if (newPos + this.width > sceneWidth)
        {
            this.x = sceneWidth - this.width;
        }
        else
        {
            this.x += this.speed * dt;
        }
    }
}

// 3 - Brick class
class Brick extends PIXI.Graphics
{
    constructor(x, y, width = 100, height = 20, color = 0xFFFFFF)
    {
        super();
        this.beginFill(color);
        this.drawRect(x, y, width, height);
        this.endFill();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
// 4 - Powerup class(es)