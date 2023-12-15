//#region Scene management

// Makes menu scene the only visible scene
function goToMenu()
{
    gameScene.visible = false;
    gameOverScene.visible = false;
    infoScene.visible = false;
    menuScene.visible = true;
}

// Makes game scene the only visible scene
function goToGame()
{
    gameScene.visible = true;
    menuScene.visible = false;
    gameOverScene.visible = false;
    infoScene.visible = false;

}

// Makes info scene the only visible scene
function goToInfo()
{
    menuScene.visible = false;
    gameScene.visible = false;
    gameOverScene.visible = false;
    infoScene.visible = true;
}

// Makes game over scene the only visible scene
function goToGameOver()
{
    menuScene.visible = false;
    gameScene.visible = false;
    gameOverScene.visible = true;
    infoScene.visible = false;
}

//#endregion

// Gets a random unit vector
function getRandomUnitVector()
{
    let x = getRandom(-1, 1);
    let y = getRandom(-1, 1);

    if (x <= 0.25 && x >= -0.25)
    {
        x = 0.25;
    }

    if (y <= 0.25 && y >= -0.25)
    {
        y = 0.25;
    }

    let length = Math.sqrt(x * x + y * y);
    if (length == 0)
    { // very unlikely
        x = 1; // point right
        y = 0;
        length = 1;
    } else
    {
        x /= length;
        y /= length;
    }

    return { x: x, y: y };
}

// Gets a random number within the provided range
function getRandom(min, max)
{
    return Math.random() * (max - min) + min;
}

//#region Collision checking methods

// Performs circle collision calculations to determine if 2 circles are colliding
function circleCollision(circle1, circle2)
{
    let xDist = Math.pow((circle1.x - circle2.x), 2);
    let yDist = Math.pow((circle1.y - circle2.y), 2);

    let dist = Math.sqrt((xDist + yDist));

    if (dist <= circle1.radius + circle2.radius)
    {
        return true;
    }
    return false;
}

// Checks if the ball is colliding with a specified rectangle
function ballRectCollision(rect)
{
    if (ball.x - ball.radius < rect.x + rect.width &&
        ball.x + ball.radius > rect.x &&
        ball.y + ball.radius > rect.y &&
        ball.y - ball.radius < rect.y + rect.height)
    {
        return true;
    }

    return false;
}

// Checks if the ball is colliding with a brick, and breaks bricks as necessary
function checkBallBrickCollisions()
{
    for (let brick of bricks)
    {
        if (ballRectCollision(brick))
        {
            gameScene.removeChild(brick);
            brick.broken = true;
            increaseScoreBy(10 * scoreMult);
            ball.reflectY();
        }
    }

    bricks = bricks.filter(brick => !brick.broken);
}

// Checks whether the ball is colliding with the paddle
// if it is, reverses the ball's y velocity
function checkBallPaddleCollisions()
{
    if (ball.fwd.y > 0 &&
        ballRectCollision(paddle))
    {
        let paddleCenterX = paddle.x + (paddle.width / 2);

        let ballRelativeX = ball.x - paddleCenterX;

        if (ballRelativeX < (-paddle.width / 2))
        {
            ballRelativeX = -paddle.width / 2;
        }
        if (ballRelativeX > (paddle.width / 2))
        {
            ballRelativeX = paddle.width / 2;
        }

        let reflectionAngle = ballRelativeX / (paddle.width / 2);

        ball.fwd.x *= Math.min(Math.acos(reflectionAngle), 0.90);
        ball.fwd.y *= -1;
    }
}

//#endregion

// Checks if the ball is below the bottom of the screen
function isBallBelowScreen()
{
    return (ball.y - ball.radius >= sceneHeight);
}

// Chooses a random power out of the available options
function randomPower()
{
    return Math.round(Math.random() * numPowerTypes);
}

//#region Counter management

// Increases score by specified value
function increaseScoreBy(value)
{
    score += value * scoreMult;
    scoreLabel.text = `Score: ${score}`;
}

function setScoreTo(value)
{
    score = value;
    increaseScoreBy(0);
}

// Decreases life count by specified value
function decreaseLifeBy(value)
{
    lives -= value;
    lifeLabel.text = `Lives: ${lives}`;
}

function setLivesTo(value)
{
    lives = value;
    decreaseLifeBy(0);
}
// Increases level counter and updates the display text
function advanceLevel()
{
    level += 1;
    levelLabel.text = `Level: ${level}`;
}

function setLevelTo(value)
{
    level = value;
    levelLabel.text = `Level: ${level}`;
}

// Increases the score multiplier by the specified amount
// Pass a negative value to decrease the multiplier
function increaseScoreMultBy(value)
{
    scoreMult += value;
    scoreMultLabel.text = `Score Multiplier: ${scoreMult}`;
}

function setScoreMultTo(value)
{
    scoreMult = value;
    increaseScoreMultBy(0);
}
//#endregion