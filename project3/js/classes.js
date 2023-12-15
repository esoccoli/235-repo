// Manages the ball
class Ball extends PIXI.Graphics
{
    constructor(x = 0, y = 0, radius = 10, color = colors.white)
    {
        super();
        this.x = 0;
        this.y = 0;
        this.beginFill(color);
        this.drawCircle(x, y, radius);
        this.endFill();
        this.radius = radius;
        this.speed = 300;
        this.fwd = getRandomUnitVector();
    }

    // Moves the ball forward an approptiate amount based on delta time
    move(dt = 1 / 60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    // Reverses the x velocity
    reflectX()
    {
        this.fwd.x *= -1;
    }

    // Reverses the y velocity
    reflectY()
    {
        this.fwd.y *= -1;
    }
}
// 2 - Paddle class
class Paddle extends PIXI.Graphics
{
    constructor(x = 0, y = 0, width = 150, height = 20, color = colors.white)
    {
        super();
        this.width = width;
        this.height = height;
        this.x = (sceneWidth / 2) - width / 2;
        this.y = (sceneHeight - 100);
        this.speed = 500;

        this.beginFill(color);
        this.drawRect(x, y, width, height);
        this.endFill();
    }

    // Move the paddle left without going off screen
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

    // Move the paddle right without going off screen
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
    constructor(x, y, width, height, color = colors.white)
    {
        super();
        this.x = x;
        this.y = y;
        this.beginFill(color);
        this.drawRect(0, 0, width, height);
        this.endFill();
        this.width = width;
        this.height = height;
        this.broken = false
    }
}

class Powerup extends PIXI.Graphics
{
    constructor(color, x = 0, y = 0, radius = 20)
    {
        super();

        // Sets a random x and y position that are on screen and within the area
        // between the bottom of the lowest brick and the top of the paddle
        x = (Math.random() * (sceneWidth - (2 * ball.radius)) + ball.radius);

        let powerAreaHeight = paddle.y - brickAreaHeight;
        y = (Math.random() * (powerAreaHeight)) + (brickAreaHeight + brickAreaTopOffset) + ball.radius;

        if (y >= paddle.y)
        {
            y = paddle.y - this.radius;
        }

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.collected = false;

        this.beginFill(this.color);
        this.drawCircle(0, 0, this.radius);
        this.endFill();
    }
}

class ScoreMultiplier extends Powerup
{
    constructor(color)
    {
        super(color);
        this.powerType = "score multiplier";
    }
}

class ExtraLife extends Powerup
{
    constructor(color)
    {
        super(color);
        this.powerType = "extra life";
    }
}