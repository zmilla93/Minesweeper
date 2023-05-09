let overlay;
let overlayItems;

function run() {
    let howToPlayButton = document.getElementById("howToPlayButton");
    let howToPlayDialog = document.getElementById("howToPlay");
    howToPlayButton.onclick = function () {
        overlay.style.display = "flex";
        howToPlayDialog.style.display = "block";
    };

    let cheatModeButton = document.getElementById("cheatModeButton");
    cheatModeButton.onclick = toggleCheatMode;

    let closeButtons = document.getElementsByClassName("closeButton");
    overlayItems = document.getElementsByClassName("overlayItem");
    overlay = document.getElementById("overlay");

    overlay.onclick = closeOverlays;
    howToPlayDialog.onclick = function (e) {
        e.stopPropagation();
    }

    for (let closeButton of closeButtons) {
        closeButton.onclick = closeOverlays;
    }

    let beginnerButton = document.getElementById("beginnerButton");
    let intermediateButton = document.getElementById("intermediateButton");
    let expertButton = document.getElementById("expertButton");
    beginnerButton.onclick = function () { startGame(Difficulty.Beginner); }
    intermediateButton.onclick = function () { startGame(Difficulty.Intermediate); }
    expertButton.onclick = function () { startGame(Difficulty.Expert); }

}

function closeOverlays() {
    overlay.style.display = "none";
    for (let overlayItem of overlayItems) {
        overlayItem.style.display = "none";
    }
}

window.addEventListener("load", run);