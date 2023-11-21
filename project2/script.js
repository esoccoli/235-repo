window.onload = init;

let obj = null;

// beginning of the api url
const SERVICE_URL = "https://pokeapi.co/api/v2/pokemon/";

// Adds event listeners to UI elements when the page loads
function init() {

    const searchField = document.querySelector("#searchterm");

    const storedTerm = localStorage.getItem("efs8086-searchterm");

    document.querySelector("#searchterm").addEventListener("change", (e) => {
        localStorage.setItem("efs8086-searchterm", e.target.value);
    });

    if (storedTerm) {
        searchField.value = storedTerm;
    } else {
        searchField.value = "Pikachu"; // a default value if `nameField` is not found
    }

    document.querySelector("#search").addEventListener("click", getData);

    // Adds the event listener for clicking the previous button
    document.querySelector("#prev").addEventListener("click", () => {
        let prev_id = 1;

        if (obj !== null) {
            prev_id = obj.id - 1;
        }

        if (prev_id <= 0) {
            prev_id = 1;
            document.querySelector("#debug").innerHTML = `<p>No previous Pokemon to display</p>`;
        }

        // Sends the request to the API
        sendXHRRequest(`${SERVICE_URL}${prev_id}`);
    });

    // Adds the event listener for clicking the next button
    document.querySelector("#next").addEventListener("click", () => {
        let next_id = 1;

        if (obj !== null) {
            next_id = obj.id + 1;
        }

        if (next_id > 1017) {
            next_id = 1017
            document.querySelector("#debug").innerHTML = `<p>No further Pokemon to display</p>`;
        }

        sendXHRRequest(`${SERVICE_URL}${next_id}`);
    });

    // Adds the event listener for clicking the random button
    document.querySelector("#random").addEventListener("click", randomPkmn);
}

// Builds the API url to use for the request
function getData() {

    let url = SERVICE_URL;

    // appends the search term to the url
    let term = document.querySelector("#searchterm").value.toLowerCase().trim();

    if (term != "") {
        term = encodeURIComponent(term);
        url += term;

        // Display the url the request is sent to
        document.querySelector("#debug").innerHTML = `<b>Querying web service with:</b> <a href="${url}" target="_blank">${url}</a>`;
        sendXHRRequest(url);
    }
    else {
        document.querySelector("#debug").innerHTML = `<p>Please enter a parameter before searching</p>`;
    }


    localStorage.setItem("lastSearchTerm", term);
}

// Creates and sends a request to the API
function sendXHRRequest(url) {
    let xhr = new XMLHttpRequest();

    xhr.onload = dataLoaded;
    xhr.onerror = dataError;

    xhr.open("GET", url);
    xhr.send();
}

// If an error occurs and the api can't return data, logs an error message in the console
function dataError() {
    console.log("An error occurred.");
}

// Code to execute once the page gets a response from the API
function dataLoaded(e) {

    let xhr = e.target;

    // Parses the returned data into a JSON

    try {
        obj = JSON.parse(xhr.responseText);
    }
    catch {
        document.querySelector("#debug").innerHTML = `<p><b>Error:</b> Failed to return data.</p>`;
        return;
    }

    document.querySelector("#debug").innerHTML = `<b>Displaying data for search term: "</b>${reformatString(obj.name).trim()}"`;

    // Displays some of the returned data on the page
    displayResults(obj);
}

// Builds a url to get info about the next pokemon in pokedex order
function nextPkmn() {

    if (obj !== null) {
        url = SERVICE_URL + (obj.id + 1);
    }

    sendXHRRequest(url);
}

// Builds a url to get info about the previous pokemon in pokedex order
function prevPkmn() {
    if (obj !== null) {
        url = SERVICE_URL + (obj.id - 1);
    }

    sendXHRRequest(url);
}

// Picks a random pokedex number and requests info about that pokemon from the API
function randomPkmn() {
    let dexNo = (Math.random() * 1017).toFixed(0);
    url = SERVICE_URL + dexNo;

    sendXHRRequest(url);
}

// Displays various data on the page
function displayResults() {

    // Sprites
    let boxLeftContents = `<img id="sprite-default" src="${obj.sprites["front_default"]}" alt="">`;

    if (obj.sprites["front_shiny"] != null) {
        boxLeftContents += `<img id="sprite-shiny" src="${obj.sprites["front_shiny"]}" alt="">`;
    }

    // Name and pokedex number
    boxLeftContents += `<h2 id="name-number">#${obj.id} - ${reformatString(obj.name).trim()}</h2>`;

    // Type(s)
    if (obj.types.length == 1) {
        boxLeftContents += `<p id="type">Type: ${reformatString(obj.types[0]["type"]["name"]).trim()}</p>`;
    }
    else if (obj.types.length == 2) {
        boxLeftContents += `<p id="type">Type: ${reformatString(obj.types[0]["type"]["name"]).trim()} ${reformatString(obj.types[1]["type"]["name"].trim())}</p>`;
    }

    // Height and weight (after converting units)
    boxLeftContents += `<p id="height">Height: ${convertDecimetersToFeet(obj.height)}</p>`;
    boxLeftContents += `<p id="weight">Weight: ${convertHectogramsToPounds(obj.weight)} lbs</p>`;

    // Possible abilities
    boxLeftContents += createAbilitiesString(obj.abilities);


    // Base stats box header
    let boxMiddleContents = `<h2 id="stats">Base Stats</h2>`;

    // Name and value of each base stat
    boxMiddleContents += `<p id="hp"><strong>HP</strong>: ${obj.stats[0]["base_stat"]}</p>`;
    boxMiddleContents += `<p id="attack"><strong>Attack</strong>: ${obj.stats[1]["base_stat"]}</p>`;
    boxMiddleContents += `<p id="defense"><strong>Defense</strong>: ${obj.stats[2]["base_stat"]}</p>`;
    boxMiddleContents += `<p id="sp-atk"><strong>Special Attack</strong>: ${obj.stats[3]["base_stat"]}</p>`;
    boxMiddleContents += `<p id="sp-def"><strong>Special Defense</strong>: ${obj.stats[4]["base_stat"]}</p>`;
    boxMiddleContents += `<p id="speed"><strong>Speed</strong>: ${obj.stats[5]["base_stat"]}</p>`;

    // Base stat total
    boxMiddleContents += `<p id="bst"><strong>Total</strong>: ${calcBST(obj.stats)}</p>`;

    // Adds all contents to the page
    document.querySelector("#box-left").innerHTML = boxLeftContents;
    document.querySelector("#box-right").innerHTML = boxMiddleContents;

    let movesBox = "";

    // Possible moves
    movesBox += createMovesString(obj.moves);
    // document.querySelector("#content").appendChild(movesBox);
    const box_moves = document.createElement("div");
    box_moves.id = "box-moves";
    document.querySelector("#content").appendChild(box_moves);
    document.querySelector("#box-moves").innerHTML = movesBox;
}

// Converts a value in decimeters to feet and inches
function convertDecimetersToFeet(decimeters) {

    let converted = (decimeters / 10) * 3.281;
    let feet = Math.floor(converted);

    let remainder = converted - feet;
    let inches = Math.floor(remainder * 12);

    let displayVal = `${feet}' ${inches}"`;
    return displayVal;
}

// Converts a value in hectograms to lbs
function convertHectogramsToPounds(hectograms) {
    let lbs = (hectograms * 100) / 453.6;
    lbs = lbs.toFixed(1);

    let displayVal = `${lbs}`;
    return displayVal;
}

// Lists all abilities this pokemon could have
function createAbilitiesString(abilities) {

    let abilityStr = `<h3 id="abilities-header">Abilities:</h3>`;
    abilityStr += `<div id="abilities">`;

    for (let i = 0; i < abilities.length; i++) {
        if (abilities[i]["is_hidden"] == false) {
            abilityStr += `<p class="ability-item">${reformatString(abilities[i]["ability"]["name"]).trim()}</p>`;
        }
        else {
            abilityStr += `<p class="ability-item">${reformatString(abilities[i]["ability"]["name"]).trim()} (hidden)</p>`;
        }
    }

    abilityStr += `</div>`;
    return abilityStr;
}

// Creates a bulleted list of moves the pokemon can learn
function createMovesString(moves) {

    // let movesStr = `<div id="box-moves">`;
    movesStr = `<h3 id="moves-header">Possible Moves</h3> `;
    movesStr += `<ul id="moves">`;

    for (let i = 0; i < moves.length; i++) {
        movesStr += `<li>${reformatString(moves[i]["move"]["name"]).trim()}</li>`;
    }

    movesStr += `</ul>`;
    // movesStr += `</div>`;
    return movesStr
}

// Calculates the pokemon's base stat total
function calcBST(stats) {
    let bst = 0;

    for (let i = 0; i < stats.length; i++) {
        bst += stats[i]["base_stat"];
    }

    return bst;
}

// Capitalizes the first letter of the first word in a string
function capitalizeFirstLetter(word) {
    let firstLetter = word.charAt(0);
    word = word.substring(1);

    let newWord = `${firstLetter.toUpperCase()}${word}`;
    return newWord;
}

// Reformat a string to have the first letter of each word capitalized
function reformatString(str) {
    let words = str.split("-");
    let newStr = "";

    for (let word of words) {
        let newWord = capitalizeFirstLetter(word);
        newStr += `${newWord} `;
    }

    return newStr;
}