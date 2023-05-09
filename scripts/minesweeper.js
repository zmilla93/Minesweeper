// Minesweeper by Zach Miller

let canvas;
let ctx;

// Contants
const tileSize = 16;
const borderSize = 10;
const boardOffsetX = 10;
const boardOffsetY = borderSize * 2 + tileSize * 2;
let digitY;
let mineCounterX;
let timerX;

// Images
const imageCount = 8;
let imagesLoaded = 0;
let borderHorizontalImage = new Image();
let borderVerticalImage = new Image();
let faceSprites;
let numberSprites;
let debugNumberSprites;
let tileSprites;
let cornerSprites;
let digitSprites;

// Settings
let tileCountX = 30;
let tileCountY = 20;
let bombCount = 10;
// let debugBombs = true;
let cheatMode = false;

// Game
let canvasRect;
let boardRect;
let faceRect;
let tiles;
let randomIndices;
let ended = false;
let endBomb;
let displayBombCount;
let targetRevealCount;
let tilesRevealed;
let timer;
let elapsedTime = 0;
let extraBombs;

const GameState = Object.freeze({
    Loading: 0,
    Launched: 1,
    Running: 2,
    Won: 3,
    Lost: 4,
});

const Difficulty = Object.freeze({
    Beginner: { width: 9, height: 9, mineCount: 10 },
    Intermediate: { width: 16, height: 16, mineCount: 40 },
    Expert: { width: 30, height: 16, mineCount: 99 },
});

let state = GameState.Loading;
let currentDifficulty = Difficulty.Beginner;


// Interactions
let pressed = false;
let pressedIndex = -1;
let facePressed = false;
let clickPos;

// UI Elements
let cheatCheckbox;

// Bind UI

function init() {
    // bindUI();

    canvas = document.getElementById("minesweeperCanvas");
    canvas.onmousedown = handleMouseDown;
    canvas.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;
    canvas.oncontextmenu = function (e) { e.preventDefault(); };
    ctx = canvas.getContext('2d');

    // Game will auto start when all sprites have been loaded
    loadSpriteSheets();
}

function bindUI() {
    let startButton = document.getElementById("startButton");
    let beginnerButton = document.getElementById("beginnerButton");
    let intermediateButton = document.getElementById("intermediateButton");
    let advancedButton = document.getElementById("advancedButton");
    cheatCheckbox = document.getElementById("cheatModeCheckbox");
    cheatCheckbox.onchange = handleCheatCheckbox;
    startButton.onclick = function () { startGame(currentDifficulty); }
    beginnerButton.onclick = function () { startGame(Difficulty.Beginner); }
    intermediateButton.onclick = function () { startGame(Difficulty.Intermediate); }
    advancedButton.onclick = function () { startGame(Difficulty.Expert); }
}

function toggleCheatMode(){
    cheatMode = !cheatMode;
    drawBoard();
}

function handleMouseDown(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
    if (isWithinRect(faceRect, x, y)) {
        drawFace(1);
        facePressed = true;
    }
    if (!ended && isWithinBoard(x, y)) {
        if (e.button == 0) {
            let pos = posToCoords(x, y);
            clickPos = posToCoords(x, y);
            let tile = tiles[clickPos.x][clickPos.y]
            if (tile.flagged != 1) {
                drawTile(pos.x, pos.y, true);
                pressed = true;
                drawFace(2);
            }
        } else if (e.button == 2) {
            let pos = posToCoords(x, y);
            let tile = tiles[pos.x][pos.y];
            if (!tile.revealed) {
                tile.flagged++;
                if (tile.flagged == 1) displayBombCount--;
                else if (tile.flagged == 2) displayBombCount++;
                else if (tile.flagged > 2) tile.flagged = 0;
                drawBoard();
                drawBombCounter();
            }
        }
    }
}

function handleMouseUp(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
    if (!ended)
        drawFace(0);
    if (isWithinRect(faceRect, x, y) && facePressed) {
        startGame(currentDifficulty);
    }
    if (!ended && pressed && isWithinBoard(x, y)) {
        let pos = posToCoords(x, y);
        let tile = tiles[pos.x][pos.y];
        if (tile.flagged != 1) {
            if (state != GameState.Running) {
                state = GameState.Running;
                timer = setInterval(incrementTimer, 1000);
                if (tile.mine) {
                    tile.mine = false;
                    // let newTile = tile[extraBombs[0][0]][extraBombs[0][1]];
                    if (extraBombs[0].x == pos.x && extraBombs[0].y == pos.y) {
                        newTile = tiles[extraBombs[1][0]][extraBombs[1][1]].mine = true;
                    } else {
                        tiles[extraBombs[0][0]][extraBombs[0][1]].mine = true;
                    }
                    generateNumbers();

                    // let 
                }
            }
            revealTile(pos.x, pos.y);
            checkWin();
        }
    }
    drawBoard();
    pressed = false;
    facePressed = false;
}

function incrementTimer() {
    elapsedTime++;
    drawTimer();
    if (elapsedTime >= 999) clearInterval(timer);
}

function handleMouseMove(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
    if (pressed) {
        let pos = posToCoords(x, y);
        if (clickPos == null || pos.x != clickPos.x || pos.y != clickPos.y) {
            if (clickPos != null)
                // Depress old tile
                drawTile(clickPos.x, clickPos.y, false);
            if (isWithinBoard(x, y)) {
                // Press new tile
                let tile = tiles[pos.x][pos.y];
                if (tile.flagged != 1) {
                    drawTile(pos.x, pos.y, true);
                    clickPos = pos;
                } else {
                    clickPos = null;
                }
            } else {
                clickPos = null;
            }
        } else {

        }
    }
}

function isWithinBoard(x, y) {
    return x >= boardRect.x && y >= boardRect.y && x < boardRect.x + boardRect.width && y < boardRect.y + boardRect.height;
}

function isWithinRect(rect, x, y) {
    return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}

function posToCoords(x, y) {
    x -= boardOffsetX;
    y -= boardOffsetY;
    x = Math.floor(x / tileSize);
    y = Math.floor(y / tileSize);
    return { x: x, y: y }
}

// Calls start game when all images are loaded
function imageLoadedCallback() {
    imagesLoaded++;
    if (imagesLoaded == imageCount) {
        startGame(currentDifficulty);
    }
}

function loadImage(image, path) {
    image.onload = imageLoadedCallback;
    image.src = path;
}

function loadSpriteSheet(path, width, height, offset) {
    let spriteSheet = { image: new Image(), width: width, height: height, offset: offset };
    spriteSheet.image.onload = imageLoadedCallback;
    spriteSheet.image.src = path;
    return spriteSheet;
}

function loadSpriteSheets() {
    loadImage(borderHorizontalImage, "sprites/border_horizontal.png");
    loadImage(borderVerticalImage, "sprites/border_vertical.png");
    faceSprites = loadSpriteSheet("sprites/faces.png", 24, 24, 1);
    numberSprites = loadSpriteSheet("sprites/numbers.png", 16, 16, 1);
    debugNumberSprites = loadSpriteSheet("sprites/numbers_debug.png", 16, 16, 1);
    tileSprites = loadSpriteSheet("sprites/tiles.png", 16, 16, 1);
    cornerSprites = loadSpriteSheet("sprites/corners.png", 10, 10, 0);
    digitSprites = loadSpriteSheet("sprites/digits.png", 13, 23, 1);
}

function drawTile(x, y, pressed) {
    image = tileSprites;
    index = 0;
    let tile = tiles[x][y];
    if (tile.revealed) {
        if (tile.mine) {
            if (state == GameState.Won) index = 2;
            else if (state == GameState.Lost) index = 5
            if (endBomb != null && endBomb.x == x && endBomb.y == y) index = 6;
        } else {
            image = numberSprites;
            index = tile.number;
        }
    } else {
        if (pressed) {
            if (tile.flagged == 2) index = 4
            else index = 1;
        } else {
            if (tile.flagged == 1) {
                if (state == GameState.Lost) index = 7;
                else index = 2;
            } else if (tile.flagged == 2) {
                index = 3;
            } else {
                if (cheatMode) {
                    if (tile.mine) {
                        index = 8;
                    } else {
                        image = debugNumberSprites;
                        index = tile.number;
                    }
                } else {
                    index = 0;
                }
            }
        }
    }
    let boardX = boardRect.x + x * tileSize;
    let boardY = boardRect.y + y * tileSize;
    drawSprite(image, index, boardX, boardY)
}

function drawTileFromSheet(sheet, index, x, y) {
    ctx.drawImage(sheet,
        (tileSize + 1) * index, 0, tileSize, tileSize,      // Sprite Sheet Position
        boardOffsetX + x * tileSize, boardOffsetY + y * tileSize, tileSize, tileSize);    // Canvas Position
}

function drawSprite(sheet, index, x, y) {
    ctx.drawImage(sheet.image,
        (sheet.width + sheet.offset) * index, 0, sheet.width, sheet.height,      // Sprite Sheet Position
        x, y, sheet.width, sheet.height);    // Canvas Position
}

function drawBorders() {
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(borderSize, borderSize, boardRect.width, tileSize * 2)
    // Corners
    drawSprite(cornerSprites, 0, 0, 0);
    drawSprite(cornerSprites, 1, borderSize + boardRect.width, 0);
    drawSprite(cornerSprites, 2, 0, borderSize + tileSize * 2);
    drawSprite(cornerSprites, 3, borderSize + boardRect.width, borderSize + tileSize * 2);
    drawSprite(cornerSprites, 4, 0, boardRect.y + boardRect.height, borderSize);
    drawSprite(cornerSprites, 5, borderSize + boardRect.width, boardRect.y + boardRect.height, borderSize);
    // Horizontal Bars
    for (let i = 0; i < tileCountX; i++) {
        ctx.drawImage(borderHorizontalImage, borderSize + tileSize * i, 0);
        ctx.drawImage(borderHorizontalImage, borderSize + tileSize * i, borderSize + tileSize * 2)
        ctx.drawImage(borderHorizontalImage, borderSize + tileSize * i, boardRect.y + boardRect.height)
    }
    // Vertical Bars
    let offset = borderSize;
    for (let i = 0; i < 2; i++) {
        ctx.drawImage(borderVerticalImage, 0, offset + tileSize * i)
        ctx.drawImage(borderVerticalImage, boardRect.x + boardRect.width, offset + tileSize * i)
    }
    offset = borderSize * 2 + tileSize * 2;
    for (let i = 0; i < tileCountY; i++) {
        ctx.drawImage(borderVerticalImage, 0, offset + tileSize * i)
        ctx.drawImage(borderVerticalImage, boardRect.x + boardRect.width, offset + tileSize * i)
    }
}

function drawBoard() {
    switch (state) {
        case GameState.Loading:
        case GameState.Launched:
        case GameState.Running:
            drawFace(0);
            break;
        case GameState.Won:
            drawFace(3);
            break;
        case GameState.Lost:
            drawFace(4);
            break;
    }
    for (let x = 0; x < tileCountX; x++) {
        for (let y = 0; y < tileCountY; y++) {
            drawTile(x, y, false);
        }
    }
}

function drawFace(index) {
    drawSprite(faceSprites, index, faceRect.x, faceRect.y);
}

function drawTimer() {
    let text = Math.abs(clamp(elapsedTime, -0, 999)).toString().padStart(3);
    drawSprite(digitSprites, text.charAt(text.length - 3), timerX, digitY);
    drawSprite(digitSprites, text.charAt(text.length - 2), timerX + digitSprites.width, digitY);
    drawSprite(digitSprites, text.charAt(text.length - 1), timerX + digitSprites.width * 2, digitY);
}

function drawBombCounter() {
    let negative = displayBombCount < 0;
    let text = Math.abs(clamp(displayBombCount, -99, 999)).toString().padStart(3);
    let index1 = negative ? 10 : text.charAt(text.length - 3);
    drawSprite(digitSprites, index1, mineCounterX, digitY);
    drawSprite(digitSprites, text.charAt(text.length - 2), mineCounterX + digitSprites.width, digitY);
    drawSprite(digitSprites, text.charAt(text.length - 1), mineCounterX + digitSprites.width * 2, digitY);
}

function revealTile(x, y) {
    let tile = tiles[x][y];
    if (tile.revealed) return;
    tile.revealed = true;
    if (!tile.mine) tilesRevealed++;
    if (tile.number == 0) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            for (let offsetY = -1; offsetY <= 1; offsetY++) {
                if (offsetX == 0 && offsetY == 0) continue;
                let neighborX = x + offsetX;
                let neighborY = y + offsetY;
                if (neighborX < 0 || neighborX >= tileCountX || neighborY < 0 || neighborY >= tileCountY) continue;
                if (tiles[neighborX][neighborY].flagged > 0) continue;
                revealTile(neighborX, neighborY);
            }
        }
    } else if (tile.mine) {
        ended = true;
        endBomb = { x: x, y: y };
        endGame(false);
    }
}

function toIndex(x, y) {
    return x + y * tileCountX;
}

function indexToCoords(index) {
    let h = Math.floor(index / tileCountX);
    let w = index - h * tileCountX;
    return [w, h];
}

function shuffleArray(array) {
    indexCount = tileCountY * tileCountY;
    for (let i = 0; i < array.length; i++) {
        randomIndex = Math.floor(Math.random() * indexCount);
        let item1 = array[i];
        let tempItem = array[i];
        array[i] = array[randomIndex];
        array[randomIndex] = tempItem;
    }
    return array;
}


function placeBombs() {
    for (let i = 0; i < bombCount; i++) {
        let rng = randomIndices[i]
        let index = indexToCoords(rng);
        tiles[index[0]][index[1]].mine = true;
    }
    extraBombs = [indexToCoords(randomIndices[bombCount]), indexToCoords(randomIndices[bombCount + 1])];
}

function generateNumbers() {
    for (let x = 0; x < tileCountX; x++) {
        for (let y = 0; y < tileCountY; y++) {
            if (tiles[x][y].mine) {
                tiles[x][y].number = -1;
                continue;
            }
            bombs = 0;
            let check = 0;
            for (offsetX = -1; offsetX <= 1; offsetX++) {
                for (offsetY = -1; offsetY <= 1; offsetY++) {
                    if (offsetX == 0 && offsetY == 0) continue;
                    let indexX = x + offsetX;
                    let indexY = y + offsetY;
                    if (indexX < 0 || indexX >= tileCountX || indexY < 0 || indexY >= tileCountY) {
                        continue;
                    }
                    if (tiles[indexX][indexY].mine == true)
                        bombs++
                }
            }
            tiles[x][y].number = bombs;
        }
    }
}

function startGame(difficulty) {

    currentDifficulty = difficulty;
    let width = difficulty.width;
    let height = difficulty.height;
    let bombs = difficulty.mineCount;


    state = GameState.Launched;
    elapsedTime = 0;
    ended = false;
    endBomb = null;
    tileCountX = width;
    tileCountY = height;
    if (timer != null) clearInterval(timer);
    boardRect = { x: boardOffsetX, y: boardOffsetY, width: tileCountX * tileSize, height: tileCountY * tileSize }
    canvas.width = boardOffsetX + borderSize + tileCountX * tileSize;
    canvas.height = boardOffsetY + borderSize + tileCountY * tileSize;
    canvasRect = canvas.getBoundingClientRect();
    faceRect = {
        x: boardRect.x + boardRect.width / 2 - faceSprites.width / 2, y: borderSize + tileSize - faceSprites.height / 2,
        width: faceSprites.width, height: faceSprites.height
    }
    bombCount = bombs;
    displayBombCount = bombCount;
    targetRevealCount = width * height - bombs;
    tilesRevealed = 0;
    tiles = [width];
    randomIndices = [width * height]

    // Load data that relies on sprite sheets
    let offset = Math.floor(tileSize - digitSprites.height / 2);
    digitY = borderSize + offset;
    mineCounterX = borderSize + offset;
    timerX = boardRect.x + boardRect.width - offset - digitSprites.width * 3;

    // Initialize Tiles & Random Indices
    for (let x = 0; x < width; x++) {
        tiles[x] = [height]
        for (let y = 0; y < height; y++) {
            tiles[x][y] = { number: 0, mine: false, revealed: false, flagged: 0 };
            randomIndices[toIndex(x, y)] = toIndex(x, y);
        }
    }
    shuffleArray(randomIndices);

    // Generate Game Board
    placeBombs();
    generateNumbers();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBorders();
    drawBoard();
    drawTimer(0);
    drawBombCounter(0);

}

function checkWin() {
    if (targetRevealCount == tilesRevealed) {
        endGame(true);
    }
}

function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num))
}

function endGame(win) {
    if (win) state = GameState.Won;
    else state = GameState.Lost;
    ended = true;
    clearInterval(timer);
    // Reveal Bombs
    for (x = 0; x < tileCountX; x++) {
        for (y = 0; y < tileCountY; y++) {
            let tile = tiles[x][y];
            if (tile.mine) {
                tile.revealed = true;
                if (win) tile.flagged = true;
            }
        }
    }
    drawBoard();
}

window.addEventListener("load", init)