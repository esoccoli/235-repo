"use strict";

const app = new PIXI.Application({
    width: 1000,
    height: 1000
});

document.body.appendChild(app.view);

// Constants for scene width and height
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

let stage;

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

// Does the initial set up for the game
function setup() {
    stage = app.stage;

    // Create the menu scene
    menuScene = new PIXI.Container();
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

    // Create labels for all scenes [NEED TO IMPLEMENT]
    createLabelsAndButtons();

    // Create paddle
    paddle = new Paddle();
    gameScene.addChild(paddle);
}

function createLabelsAndButtons() {
    return;
}