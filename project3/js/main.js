"use strict";

// Creates the game canvas with the specified dimensions
const app = new PIXI.Application({
    width: 800,
    height: 800
});

// Creates an object to store any keyboard keys that will be used for inputs
const keyboard = Object.freeze({
    LEFT: "LeftArrow",
    RIGHT: "RightArrow",
    A: "a",
    D: "d"
});

const colors = Object.freeze({
    red: 0xCC0900,
    orange: 0xFFAA00,
    yellow: 0xFFE200,
    lightgreen: 0x00FF00,
    green: 0x00BB00,
    aqua: 0x00FFFF,
    blue: 0x008FD0,
    purple: 0x9900CC,
    pink: 0xFF00FF,
    brown: 0x765000,
    gray: 0x555555,
    black: 0x000000,
    white: 0xFFFFFF
});

// Adds the game canvas to the page
document.body.appendChild(app.view);

//#region Delcaring game variables
let stage;
let buttonStyle, textStyle;
let dt; // Delta time

let menuScene, gameScene, gameOverScene, infoScene;

let scoreLabel, lifeLabel, levelLabel, scoreMultLabel, statsText, gameOverText, titleLabel, controlsLabel, goalLabel, powersLabel;
let returnToMenuButton, infoButton, startButton, menuButton, playAgainButton;
let hitSound, levelClearSound, loseLifeSound, gameOverSound, powerupSound;

let paddle;
let ball;
let bricks = [];
let powers = [];
const numPowerTypes = 2;
let numPowersInLevel = 0;
let extraLifeTexture;

let inv = [];
let score = 0;
let scoreMult = 0;
let lives = 5;
let level = 0;
const keys = [];

let left = false;
let right = false;

const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
//#endregion

//#region Variables used for calculating brick sizes and positions
const numRows = 6;
const numCols = 6;
const brickSpacing = 10;
let brickAreaHeight = sceneHeight / 3;
const brickAreaTopOffset = 70;
const brickAreaSideOffset = 15;
let brickWidth;
let brickHeight;
//#endregion

// Logs the loading progress in the console
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Does setup required to start the actual game
function startGame()
{
    for (let brick of bricks)
    {
        gameScene.removeChild(brick);
    }

    setLevelTo(1);
    setLivesTo(5);
    setScoreMultTo(1);
    setScoreTo(0);
    resetBall();
    resetBricks();
    resetPaddle();
    resetPowerups();
    goToGame();
}

// The main loop that executes every frame that the game is running
function gameLoop()
{
    // Keeps track of delta time
    dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12)
    {
        dt = 1 / 12;
    }

    // Moves the paddle if the appropriate key is currently being pressed
    if (left)
    {
        paddle.moveLeft(dt);
    }
    if (right)
    {
        paddle.moveRight(dt);
    }

    // Moves the ball in the scene each frame
    // Bounces ball off of objects as necessary
    ball.move(dt);

    // Ball bounces off top and side walls
    if (ball.x <= ball.radius || ball.x >= sceneWidth - ball.radius)
    {
        ball.reflectX();
        ball.move(dt);
    }

    if (ball.y <= ball.radius)
    {
        ball.reflectY();
        ball.move(dt);
    }

    // Checks for collisions between the ball and other objects
    checkBallPaddleCollisions();
    checkBallBrickCollisions();

    for (let i = 0; i < powers.length; i++)
    {
        let isPowerCollected = circleCollision(ball, powers[i]);

        if (isPowerCollected)
        {
            collectPower(powers[i]);
            powerupSound.play();
        }
    }
    // If the ball falls below the screen, reset the ball and paddle and decrease life counter
    if (isBallBelowScreen() == true)
    {
        loseLifeSound.play();
        resetBall();
        resetPaddle();
        decreaseLifeBy(1);
        increaseScoreMultBy(-0.5);
        if (scoreMult <= 1)
        {
            setScoreMultTo(1);
        }
    }

    // If there are no bricks left, move to the next level
    if (bricks.length == 0)
    {
        levelClearSound.play();
        nextLevel();
    }

    if (lives == 0)
    {
        statsText.text = `Your final score was ${score}\nYou reached level ${level}`;
        gameOverSound.play();
        goToGameOver();
    }
}

// Creates an appropriate number of bricks (with appropriate positions and sizes)
// and adds them to an array
function resetBricks()
{
    bricks = [];
    // Calculates the dimensions of the bricks based on the window size and the above values
    brickWidth = (sceneWidth - (numCols * brickSpacing) - (2 * brickSpacing)) / numCols;
    brickHeight = ((brickAreaHeight - (numRows * brickSpacing)) / numRows);

    // Adds all the bricks to the list
    for (let row = 0; row < numRows; row++)
    {
        for (let col = 0; col < numCols; col++)
        {
            let color;

            switch (row)
            {
                case 0:
                    color = colors.red;
                    break;
                case 1:
                    color = colors.orange;
                    break;
                case 2:
                    color = colors.yellow;
                    break;
                case 3:
                    color = colors.lightgreen;
                    break;
                case 4:
                    color = colors.green;
                    break;
                case 5:
                    color = colors.aqua;
                    break;
                case 6:
                    color = colors.blue;
                    break;
                case 7:
                    color = colors.purple;
                    break;
                case 8:
                    color = colors.pink;
                    break;
                default:
                    color = colors.red;
                    break;
            }

            let newBrick = new Brick(
                brickAreaSideOffset + col * (brickWidth + brickSpacing),
                brickAreaTopOffset + row * (brickHeight + brickSpacing),
                brickWidth,
                brickHeight,
                color
            );

            bricks.push(newBrick);
        }
    }

    // Adds all the bricks to the scene
    for (let brick of bricks)
    {
        gameScene.addChild(brick);
    }
}

// Resets the ball to its starting position (slightly above the center of the paddle)
function resetBall()
{
    ball.x = (sceneWidth / 2) - (ball.radius / 2);
    ball.y = (sceneHeight - 130);
    ball.fwd = getRandomUnitVector();

    if (ball.fwd.y > 0)
    {
        ball.fwd.y *= -1;
    }
}

// Resets the paddle to its starting position (centered horizontally on the screen)
function resetPaddle()
{
    paddle.x = (sceneWidth / 2) - (paddle.width / 2);
}

// Resets the powerups on screen by removing all 
// existing ones and then adds new ones
function resetPowerups()
{

    for (let power of powers)
    {
        gameScene.removeChild(power);
    }

    powers = [];

    // Sets the number of powerups on screen to the appropriate numbers based on the level number
    switch (level)
    {
        case 1:
            numPowersInLevel = 0;
            break;
        case 2:
            numPowersInLevel = 1;
            break;
        case 3:
        case 4:
            numPowersInLevel = 2;
            break;
        default:
            numPowersInLevel = 3;
            break;
    }

    // Creates the appropriate number of powers, each of a random type
    for (let i = 0; i < numPowersInLevel; i++)
    {
        let powerType = randomPower();
        if (powerType == 0)
        {
            powers.push(new ScoreMultiplier(colors.yellow));
        }
        else if (powerType == 1)
        {
            powers.push(new ExtraLife(colors.green));
        }
    }

    for (let i = 0; i < powers.length; i++)
    {
        gameScene.addChild(powers[i]);
    }
}

// Moves to the next level by resetting the game and incrementing level count
function nextLevel()
{
    advanceLevel();
    resetBricks();
    resetBall();
    resetPaddle();
    resetPowerups();
}

// When ball collides with a power, that power gets collected
// This means the power is removed from the scene and the array of powers,
// and the power specific effect is triggered
function collectPower(power)
{
    if (power.powerType == "score multiplier")
    {
        power.collected = true;
        increaseScoreMultBy(0.5);
        gameScene.removeChild(power);
    }
    else if (power.powerType == "extra life")
    {
        power.collected = true;
        decreaseLifeBy(-1); // adds 1 to life count
        gameScene.removeChild(power);
    }

    powers = powers.filter(power => !power.collected);
}