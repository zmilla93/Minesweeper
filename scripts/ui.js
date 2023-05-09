function run() {
    let closeButtons = document.getElementsByClassName("closeButton");
    let overlayItems = document.getElementsByClassName("overlayItem");
    let overlay = document.getElementById("overlay");

    let howToPlayButton = document.getElementById("howToPlayButton");
    let howToPlayDialog = document.getElementById("howToPlay");
    howToPlayButton.onclick=function(){
        overlay.style.display = "flex";
        howToPlayDialog.style.display = "block";
    };

    // let w = document.getElementById("t")
    // w.onclick = function(){alert("!");};

    for(let closeButton of closeButtons){
        closeButton.onclick = function(){
            overlay.style.display = "none";
            for(let overlayItem of overlayItems){
                overlayItem.style.display = "none";
            }
        }
    }


    // let startButton = document.getElementById("startButton");
    let beginnerButton = document.getElementById("beginnerButton");
    let intermediateButton = document.getElementById("intermediateButton");
    let expertButton = document.getElementById("expertButton");
    // cheatCheckbox = document.getElementById("cheatModeCheckbox");
    // cheatCheckbox.onchange = handleCheatCheckbox;
    // startButton.onclick = function () { startGame(currentDifficulty); }
    beginnerButton.onclick = function () { startGame(Difficulty.Beginner); }
    intermediateButton.onclick = function () { startGame(Difficulty.Intermediate); }
    expertButton.onclick = function () { startGame(Difficulty.Expert); }

}

window.addEventListener("load", run);