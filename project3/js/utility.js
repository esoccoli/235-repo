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

// Increases score by specified value
function increaseScoreBy(value)
{
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

// Decreases life count by specified value
function decreaseLifeBy(value)
{
    lives -= value;
    lives = parseInt(lives);
    lifeLabel.text = `Lives: ${lives}`;
}

// these 2 helpers are used by classes.js
function getRandomUnitVector()
{
    let x = getRandom(-1, 1);
    let y = getRandom(-1, 1);
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

function getRandom(min, max)
{
    return Math.random() * (max - min) + min;
}

function rectsIntersect(a, b)
{
    let ab = a.getBounds();
    let bb = b.getBounds();
    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}