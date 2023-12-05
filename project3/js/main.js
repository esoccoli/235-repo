"use strict";

const app = new PIXI.Application({
    width: 1000,
    height: 1000
});

const keyboard = Object.freeze({
    LEFT: "LeftArrow",
    RIGHT: "RightArrow",
    A: "a",
    D: "d"
});

document.body.appendChild(app.view);

let stage;

let buttonStyle;

let dt;

// Game variables
let menuScene, gameScene, gameOverScene, infoScene;

let scoreLabel, lifeLabel, levelLabel;
let hitSound, levelClearSound, lossSound;

let paddle;
let balls = [];
let bricks = [];
let powers = [];
let inv = [];
let score = 0;
let lives = 5;
let level = 1;
const keys = [];

// Constants for scene width and height
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// app.loader.
//     add([
//         "images/spaceship.png",
//         "images/explosions.png"
//     ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Does the initial set up for the game
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

    // Create paddle
    paddle = new Paddle();
    gameScene.addChild(paddle);

    // paddle.addEventListener("")
    let startBall = new Ball();
    balls.push(startBall);
    gameScene.addChild(startBall);

    // TODO: Create bricks

    // TODO: Create powers

    // Starts the game loop
    app.ticker.add(gameLoop);

    window.addEventListener("keydown", (e) =>
    {
        if (e.key == "a" || e.key == "ArrowLeft")
        {
            paddle.moveLeft(dt);
        }

        if (e.key == "d" || e.key == "ArrowRight")
        {
            paddle.moveRight(dt);
        }

        // console.log(`Paddle pos: (${paddle.x}, ${paddle.y})`);
    });
}

// Create buttons on start screen
function createLabelsAndButtons()
{
    // Shared styling for all buttons
    buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
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
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);
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
    level = 1;
    score = 0;
    lives = 5;
    goToGame();
}

function gameLoop()
{
    // if (paused) return;

    dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12)
    {
        dt = 1 / 12;
    }

    return;
}