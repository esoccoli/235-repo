"use strict";

// Creates the game canvas with the specified dimensions
const app = new PIXI.Application({
    width: 800,
    height: 800
});

globalThis.__PIXI_APP__ = app;


// Creates an object to store any keyboard keys that will be used for inputs
const keyboard = Object.freeze({
    LEFT: "LeftArrow",
    RIGHT: "RightArrow",
    A: "a",
    D: "d"
});

// Adds the game canvas to the page
document.body.appendChild(app.view);

//#region Delcaring game variables
let stage;
let buttonStyle;
let dt; // Delta time

let menuScene, gameScene, gameOverScene, infoScene;

let scoreLabel, lifeLabel, levelLabel, scoreMultLabel;
let hitSound, levelClearSound, lossSound;

let paddle;
let ball;
let bricks = [];
let powers = [];
const numPowerTypes = 2;
let numPowersInLevel = 0;

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
const numRows = 2;
const numCols = 2;
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

// Does the initial set up for the game
// Creates the scenes and many of the things that will be in the scenes
function setup()
{
    stage = app.stage;

    // Create the menu scene
    menuScene = new PIXI.Container();
    menuScene.visible = true;
    stage.addChild(menuScene);

    // Creates the instructions scene and makes it invisible
    infoScene = new PIXI.Container();
    infoScene.visible = false;
    stage.addChild(infoScene);

    // Create the scene for the main game and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // Create the game over scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // Create labels for all scenes
    createLabelsAndButtons();

    // Create the paddle
    paddle = new Paddle();
    gameScene.addChild(paddle);

    // Create the starting ball (there will be chances to have multiple balls with powerups)
    ball = new Ball();

    // Sets the initial position to be centered slightly above the center of the paddle
    ball.x = (sceneWidth / 2) - (ball.radius / 2);
    ball.y = (sceneHeight - 130);

    // Ensures that the ball never starts out moving downwards
    if (ball.fwd.y > 0)
    {
        ball.fwd.y *= -1;
    }

    gameScene.addChild(ball);

    // Creates all the bricks and stores then in an array
    resetBricks();

    // TODO: Create powers

    // Starts the game loop
    app.ticker.add(gameLoop);

    // Listens for when a key is pressed
    window.addEventListener("keydown", (e) =>
    {
        if (e.key == "a" || e.key == "ArrowLeft")
        {
            left = true;
        }

        if (e.key == "d" || e.key == "ArrowRight")
        {
            right = true;
        }

    });

    // Listens for when a key is released
    window.addEventListener("keyup", (e) =>
    {
        if (e.key == "a" || e.key == "ArrowLeft")
        {
            left = false;
        }

        if (e.key == "d" || e.key == "ArrowRight")
        {
            right = false;
        }
    });
}

// Create buttons on start screen
function createLabelsAndButtons()
{
    // Shared styling for all buttons
    buttonStyle = new PIXI.TextStyle({
        fill: 0x008FD0,
        fontSize: 48,
        fontFamily: "Verdana"
    });

    //#region Text to display the game title in the main menu
    let titleLabel = new PIXI.Text("Brick Breaker");
    titleLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Verdana",
        stroke: 0xFF0000,
        strokeThickness: 6
    });

    titleLabel.x = (sceneWidth / 2) - titleLabel.width / 2;
    titleLabel.y = 100;
    menuScene.addChild(titleLabel);
    //#endregion

    //#region Instructions button for the menu scene
    let infoButton = new PIXI.Text("Instructions");
    infoButton.style = buttonStyle;
    infoButton.x = (sceneWidth / 2) - infoButton.width / 2;
    infoButton.y = (sceneHeight / 2) - 100;
    infoButton.interactive = true;
    infoButton.buttonMode = true;
    infoButton.on("pointerup", showInstructions);
    infoButton.on("pointerover", e => e.target.alpha = 0.7);
    infoButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    menuScene.addChild(infoButton);
    //#endregion

    //#region Start button for the menu scene
    let startButton = new PIXI.Text("Begin Game");
    startButton.style = buttonStyle;
    startButton.x = (sceneWidth / 2) - startButton.width / 2;
    startButton.y = (sceneHeight / 2) + 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e => e.target.alpha = 0.7);
    startButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    menuScene.addChild(startButton);
    //#endregion

    // Defines text styling that all labels in the game scene use
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Verdana",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    //#region Label for current score
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);
    //#endregion

    //#region Label for number of lives remaining
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = scoreLabel.y + scoreLabel.height;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);
    //#endregion

    //#region Label for the current level number
    levelLabel = new PIXI.Text();
    levelLabel.style = textStyle;
    levelLabel.x = (sceneWidth / 2) - (levelLabel.width / 2);
    levelLabel.y = 5;
    gameScene.addChild(levelLabel);
    //#endregion

    //#region Label for the current score multiplier
    scoreMultLabel = new PIXI.Text();
    scoreMultLabel.style = textStyle;
    scoreMultLabel.x = (sceneWidth / 2) - (scoreMultLabel.width / 2);
    scoreMultLabel.y = levelLabel.y + levelLabel.height;
    gameScene.addChild(scoreMultLabel);
    //#endregion

    //#region Game over text for the game over scene
    let gameOverText = new PIXI.Text("Game Over!\n        :-O");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 1
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);
    //#endregion

    //#region Play again button for the game over scene
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7);
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);
    //#endregion

    return;
}

// Creates and displays all labels and buttons for the info scene, and sets this to be the only visible scene
function showInstructions()
{
    //#region Text telling the user what the controls are
    let controlsLabel = new PIXI.Text("Use WASD or Arrow keys to move the paddle left and right");
    controlsLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Verdana",
        // stroke: 0xFF0000,
        // strokeThickness: 6
    });

    controlsLabel.x = (sceneWidth / 2) - controlsLabel.width / 2;
    controlsLabel.y = 200;
    infoScene.addChild(controlsLabel);
    //#endregion

    //#region Text explaining the goal of the game
    let goalLabel = new PIXI.Text("Break all the bricks to complete a level. \nTry to complete as many levels as possible.");
    goalLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Verdana",
        // stroke: 0xFF0000,
        // strokeThickness: 6
    });

    goalLabel.x = (sceneWidth / 2) - goalLabel.width / 2;
    goalLabel.y = 300;
    infoScene.addChild(goalLabel);
    //#endregion

    //#region Button to return to main menu
    let returnToMenuButton = new PIXI.Text("Return to Menu");
    returnToMenuButton.style = buttonStyle;
    returnToMenuButton.x = (sceneWidth / 2) - (returnToMenuButton.width / 2);
    returnToMenuButton.y = sceneHeight - 300;
    returnToMenuButton.interactive = true;
    returnToMenuButton.buttonMode = true;
    returnToMenuButton.on("pointerup", goToMenu);
    returnToMenuButton.on('pointerover', e => e.target.alpha = 0.7);
    returnToMenuButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    infoScene.addChild(returnToMenuButton);
    //#endregion

    goToInfo();
}

// Does setup required to start the actual game
function startGame()
{
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
        }
    }
    // If the ball falls below the screen, reset the ball and paddle and decrease life counter
    if (isBallBelowScreen() == true)
    {
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
        nextLevel();
    }

    if (lives == 0)
    {
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
            let newBrick = new Brick(
                brickAreaSideOffset + col * (brickWidth + brickSpacing),
                brickAreaTopOffset + row * (brickHeight + brickSpacing),
                brickWidth,
                brickHeight,
                0xFF0000
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
    // console.log("here");
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
            powers.push(new ScoreMultiplier(0xFFCC00));
        }
        else if (powerType == 1)
        {
            powers.push(new ExtraLife(0x00C920));
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