// 1
window.onload = (e) => { document.querySelector("#search").onclick = searchButtonClicked };

// 2
let displayTerm = "";

// 3
function searchButtonClicked() {
    console.log("searchButtonClicked() called");

    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";

    // public api key
    let GIPHY_KEY = "5PuWjWVnwpHUQPZK866vd7wQ2qeCeqg7";

    // build the url string
    let url = GIPHY_URL;
    url += "api_key=" + GIPHY_KEY;

    // parse the user entered search term
    let term = document.querySelector("#searchterm").value;
    displayTerm = term;

    // remove leading/trailing whitespace
    term = term.trim();

    // encode spaces and special characters
    term = encodeURIComponent(term);

    // checks if there is a search term, and returns if there isn't one
    if (term.length < 1) return;

    // append search term to url
    url += "&q=" + term;

    // get user chosen search limit and add it to url
    let limit = document.querySelector("#limit").value;
    url += "&limit=" + limit;

    // update ui
    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    // see what the url looks like
    console.log(url);

    // request data
    getData(url);

}

function getData(url) {
    // create new XHR object
    let xhr = new XMLHttpRequest();

    // set onload handler
    xhr.onload = dataLoaded;

    // set onerror handler
    xhr.onerror = dataError;

    // open connection and send request
    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e) {
    // e.target is the xhr object
    let xhr = e.target;

    // xhr.responseText is the JSON file that was just downloaded
    console.log(xhr.responseText);

    // turn text into parsable JSON object
    let obj = JSON.parse(xhr.responseText);

    // if there are no results, print a message and return
    if (!obj.data || obj.data.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return;
    }

    // start building an HTML string to display to the user
    let results = obj.data;
    console.log("results.length = " + results.length);
    let bigString = "";

    // loop through array of results
    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        // get url to the gif
        let smallURL = result.images.fixed_width.url;
        if (!smallURL) smallURL = "images/no-image-found.png";

        // get url to giphy page
        let url = result.url;

        // build a div to hold each result
        let line = `<div class='result'>Rating: ${result.rating.toUpperCase()}<br /><img src='${smallURL}' title='${result.id}' />`;
        line += `<span><a target='_blank' href='${url}'>View on Giphy</a></span></div>`;

        // add the div to bigString and loop
        bigString += line;
    }

    // done building the HTML - show it to the user
    document.querySelector("#content").innerHTML = bigString;

    // update the status
    document.querySelector("#status").innerHTML = "<b>Success!</b>";

    document.querySelector("#status").innerHTML += `<p><i>Here are ${results.length} results for '${displayTerm}'</i></p>`;
}

function dataError(e) {
    console.log("An error occurred");
}
