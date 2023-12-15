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

    powerupSound = new Howl({
        src: ['sounds/collected-power.wav']
    });

    hitSound = new Howl({
        src: ['sounds/hit.mp3']
    });

    levelClearSound = new Howl({
        src: ['sounds/level-clear.mp3']
    });

    loseLifeSound = new Howl({
        src: ['sounds/lose-life.mp3']
    });

    gameOverSound = new Howl({
        src: ['sounds/gameover.mp3']
    });

    // Creates all the bricks and stores then in an array
    resetBricks();

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

function createLabelsAndButtons()
{
    // Shared styling for all buttons
    buttonStyle = new PIXI.TextStyle({
        fill: colors.blue,
        fontSize: 48,
        fontFamily: "roboto medium"
    });

    //#region Text to display the game title in the main menu
    titleLabel = new PIXI.Text("Brick Breaker");
    titleLabel.style = new PIXI.TextStyle({
        fill: colors.red,
        fontSize: 72,
        fontFamily: "pixelony"
    });

    titleLabel.x = (sceneWidth / 2) - titleLabel.width / 2;
    titleLabel.y = 100;
    menuScene.addChild(titleLabel);
    //#endregion

    //#region Instructions button for the menu scene
    infoButton = new PIXI.Text("Instructions");
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
    startButton = new PIXI.Text("Begin Game");
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
    textStyle = new PIXI.TextStyle({
        fill: colors.white,
        fontSize: 18,
        fontFamily: "roboto medium",
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
    gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: colors.red,
        fontSize: 64,
        fontFamily: "pixelony",
    });
    gameOverText.style = textStyle;
    gameOverText.x = (sceneWidth / 2) - (gameOverText.width / 2);
    gameOverText.y = 100;
    gameOverScene.addChild(gameOverText);
    //#endregion

    statsText = new PIXI.Text(`Your final score was ${score}\nYou reached level ${level}`);
    textStyle = new PIXI.TextStyle({
        fill: colors.white,
        fontSize: 32,
        fontFamily: "roboto medium",
    });

    statsText.style = textStyle;
    statsText.x = (sceneWidth / 2) - (statsText.width / 2);
    statsText.y = (sceneHeight / 2) - 150;
    gameOverScene.addChild(statsText);

    //#region Play again button for the game over scene
    playAgainButton = new PIXI.Text("Play Again");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = (sceneWidth / 2) - (playAgainButton.width / 2);
    playAgainButton.y = (sceneHeight / 2);
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7);
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);
    //#endregion

    menuButton = new PIXI.Text("Return to Menu");
    menuButton.style = buttonStyle;
    menuButton.x = (sceneWidth / 2) - (menuButton.width / 2);
    menuButton.y = sceneHeight / 2 + 100;
    menuButton.interactive = true;
    menuButton.buttonMode = true;
    menuButton.on("pointerup", goToMenu);
    menuButton.on('pointerover', e => e.target.alpha = 0.7);
    menuButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(menuButton);

    return;
}

// Creates and displays all labels and buttons for the info scene, and sets this to be the only visible scene
function showInstructions()
{
    //#region Text telling the user what the controls are
    controlsLabel = new PIXI.Text("Use A & D or Arrow keys to move the paddle left and right");
    controlsLabel.style = new PIXI.TextStyle({
        fill: colors.white,
        fontSize: 28,
        fontFamily: "roboto medium",
    });

    controlsLabel.x = (sceneWidth / 2) - controlsLabel.width / 2;
    controlsLabel.y = 200;
    infoScene.addChild(controlsLabel);
    //#endregion

    //#region Text explaining the goal of the game
    goalLabel = new PIXI.Text("Break all the bricks to complete a level. \nTry to complete as many levels as possible.");
    goalLabel.style = new PIXI.TextStyle({
        fill: colors.white,
        fontSize: 28,
        fontFamily: "roboto medium"
    });

    goalLabel.x = (sceneWidth / 2) - goalLabel.width / 2;
    goalLabel.y = 250;
    infoScene.addChild(goalLabel);
    //#endregion

    //#region Text explaining the goal of the game
    powersLabel = new PIXI.Text("Collect power ups (colored circles) to gain bonuses.\nGreen circles give you an extra life.\nYellow circles add 0.5 to your score multiplier");
    powersLabel.style = new PIXI.TextStyle({
        fill: colors.white,
        fontSize: 28,
        fontFamily: "roboto medium"
    });

    powersLabel.x = (sceneWidth / 2) - powersLabel.width / 2;
    powersLabel.y = 350;
    infoScene.addChild(powersLabel);
    //#endregion

    //#region Button to return to main menu
    returnToMenuButton = new PIXI.Text("Return to Menu");
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