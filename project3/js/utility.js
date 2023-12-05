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
    menuScene.visible = false;
    gameOverScene.visible = false;
    infoScene.visible = false;
    gameScene.visible = true;
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