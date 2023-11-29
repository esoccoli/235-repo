// 1 - Ball class
class Ball extends PIXI.Graphics {
    constructor(x = 0, y = 0, radius = 3, color = 0xFFFFFF) {
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
class Paddle extends PIXI.Graphics {
    constructor(x = 0, y = 0, width = 100, height = 20, color = 0xFFFFFF) {
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
// 3 - Brick class
class Brick extends PIXI.Graphics {
    constructor(x, y, width = 100, height = 20, color = 0xFFFFFF) {
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