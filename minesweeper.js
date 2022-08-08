// Minesweeper by Zach Miller

// Get a reference to the canvas
var canvas = document.getElementById("myCanvas");
canvas.onmousedown = handleMouseDown;
canvas.onmouseup = handleMouseUp;
canvas.onmousemove = handleMouseMove;
canvas.oncontextmenu = function (e) { e.preventDefault(); };
// Get a reference to a 2D context of the canvas.
// This is what holds the drawing functions.
var ctx = canvas.getContext('2d');

// Contants
const tileSize = 16;
const borderSize = 10;
const boardOffsetX = 10;
const boardOffsetY = borderSize * 2 + tileSize * 2;

// Images
var imagesLoaded = 0;
const imageCount = 7;
var facesImage = new Image();
var numberImage = new Image();
var numberDebugImage = new Image();
var borderHorizontalImage = new Image();
var borderVerticalImage = new Image();
var cornersImage = new Image();
var tileImage = new Image();

var faceSprites;
var numberSprites;
var tileSprites;
var borderHorizontalSprite;
var borderVerticalSprite;
var cornerSprites;




// Settings
var tileCountX = 30;
var tileCountY = 20;
var bombCount = 10;
var debugBombs = true;
var debugNumbers = true;

// Game
var canvasRect;
var boardRect;
var tiles;
var randomIndices;
var ended = false;
var endBomb;
var targetRevealCount;
var tilesRevealed;

// Interactions
var pressed = false;
var pressedIndex = -1;
var clickPos;

// Bind UI
window.onload = function () {
    var startButton = document.getElementById("startButton");
    var beginnerButton = document.getElementById("beginnerButton");
    var intermediateButton = document.getElementById("intermediateButton");
    var advancedButton = document.getElementById("advancedButton");
    startButton.onclick = function () { startGame(30, 20, 1); }
    beginnerButton.onclick = function () { startGame(9, 9, 10); }
    intermediateButton.onclick = function () { startGame(16, 16, 30); }
    advancedButton.onclick = function () { startGame(30, 16, 99); }
};


function handleMouseDown(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
    // if (x >= boardRect.x && y >= boardRect.y && x < boardRect.x + boardRect.width && y < boardRect.y + boardRect.height) {
    if (!ended && isWithinBoard(x, y)) {
        var pos = posToCoords(x, y);
        clickPos = posToCoords(x, y);
        drawTile(pos.x, pos.y, true);
        console.log(x);
        console.log(y);
        pressed = true;
    }
}

function handleMouseUp(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
    if (!ended && pressed && isWithinBoard(x, y)) {
        var pos = posToCoords(x, y);
        revealTile(pos.x, pos.y);
        checkWin();
        drawBoard();
    }
    pressed = false;
}

function handleMouseMove(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
    if (pressed) {
        var pos = posToCoords(x, y);
        if (pos.x != clickPos.x || pos.y != clickPos.y) {
            drawTile(clickPos.x, clickPos.y, false);
            if (isWithinBoard(x, y)) {
                drawTile(pos.x, pos.y, true);
                clickPos = pos;
            }
            console.log("goodn");
        } else {

        }
    }
}

function isWithinBoard(x, y) {
    return x >= boardRect.x && y >= boardRect.y && x < boardRect.x + boardRect.width && y < boardRect.y + boardRect.height;
}

function posToCoords(x, y) {
    x -= boardOffsetX;
    y -= boardOffsetY;
    x = Math.floor(x / tileSize);
    y = Math.floor(y / tileSize);
    return { x: x, y: y }
}

function canvasToIndex() {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
}

faces = {
    smile: { x: 0 },
    smilePressed: { x: 1 },
    surprised: { x: 2 },
    cool: { x: 3 },
    sad: { x: 4 },
}

// Calls start game when all images are loaded
function imageLoadedCallback() {
    imagesLoaded++;
    if (imagesLoaded == imageCount) {
        startGame(tileCountX, tileCountY, bombCount);
    }
}

function loadSpriteSheet(image, path) {
    image.onload = imageLoadedCallback;
    image.src = path;
}

function loadSpriteSheets() {
    loadSpriteSheet(facesImage, "sprites/faces.png");
    loadSpriteSheet(numberImage, "sprites/numbers.png");
    loadSpriteSheet(numberDebugImage, "sprites/numbers_debug.png");
    loadSpriteSheet(tileImage, "sprites/tiles.png");
    loadSpriteSheet(borderHorizontalImage, "sprites/border_horizontal.png");
    loadSpriteSheet(borderVerticalImage, "sprites/border_vertical.png");
    loadSpriteSheet(cornersImage, "sprites/corners.png");
}

function drawTile(x, y, pressed) {
    image = tileImage;
    index = 0;
    let tile = tiles[x][y];
    if (tile.revealed) {
        if (tile.bomb) {
            image = tileImage;
            index = 5;
            if (endBomb != null && endBomb.x == x && endBomb.y == y) index = 6;

            // FIXME : Add red bomb
        } else {
            image = numberImage;
            index = tile.number;
        }
    } else {
        if (pressed) {
            index = 1;
        } else {
            if (debugNumbers) {
                if (tile.bomb) {
                    image = tileImage;
                    index = 8;

                } else {
                    image = numberDebugImage;
                    index = tile.number;
                }
            } else {
                index = 0;
            }
        }
    }
    drawTileFromSheet(image, index, x, y);
}

function drawTileFromSheet(sheet, index, x, y) {
    ctx.drawImage(sheet,
        (tileSize + 1) * index, 0, tileSize, tileSize,      // Sprite Sheet Position
        boardOffsetX + x * tileSize, boardOffsetY + y * tileSize, tileSize, tileSize);    // Canvas Position
}

function drawBorders() {
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(borderSize, borderSize, boardRect.width, tileSize*2)
    // Corners Top
    ctx.drawImage(cornersImage, 0, 0, borderSize, borderSize, 0, 0, borderSize, borderSize);
    ctx.drawImage(cornersImage, borderSize * 1, 0, borderSize, borderSize, borderSize + boardRect.width, 0, borderSize, borderSize);
    // Corners Mid
    ctx.drawImage(cornersImage, borderSize * 2, 0, borderSize, borderSize, 0, borderSize + tileSize * 2, borderSize, borderSize);
    ctx.drawImage(cornersImage, borderSize * 3, 0, borderSize, borderSize, borderSize + boardRect.width,  borderSize + tileSize * 2, borderSize, borderSize);
    // Corners Bottom
    ctx.drawImage(cornersImage, borderSize * 4, 0, borderSize, borderSize, 0, boardRect.y + boardRect.height, borderSize, borderSize);
    ctx.drawImage(cornersImage, borderSize * 5, 0, borderSize, borderSize, borderSize + boardRect.width, boardRect.y + boardRect.height, borderSize, borderSize);

    // Horizontal Bars
    for (var i = 0; i < tileCountX; i++) {
        ctx.drawImage(borderHorizontalImage, borderSize + tileSize * i, 0);
        ctx.drawImage(borderHorizontalImage, borderSize + tileSize * i, borderSize + tileSize * 2)
        ctx.drawImage(borderHorizontalImage, borderSize + tileSize * i, boardRect.y + boardRect.height)
    }
    // Vertical Bars
    let offset = borderSize;
    for (var i = 0; i < 2; i++) {
        ctx.drawImage(borderVerticalImage, 0, offset + tileSize * i)
        ctx.drawImage(borderVerticalImage, boardRect.x + boardRect.width, offset + tileSize * i)
    }
    offset = borderSize * 2 + tileSize * 2;
    for (var i = 0; i < tileCountY; i++) {
        ctx.drawImage(borderVerticalImage, 0, offset + tileSize * i)
        ctx.drawImage(borderVerticalImage, boardRect.x + boardRect.width, offset + tileSize * i)
    }
}

function drawBoard() {
    for (let x = 0; x < tileCountX; x++) {
        for (let y = 0; y < tileCountY; y++) {
            drawTile(x, y, false);
        }
    }
}

function drawFace(){
    ctx.drawImage(facesImage, 0, offset + tileSize * i)
}

function revealTile(x, y) {
    var tile = tiles[x][y];
    if (tile.revealed) return;
    tile.revealed = true;
    tilesRevealed++;
    if (tile.number == 0) {
        for (var offsetX = -1; offsetX <= 1; offsetX++) {
            for (var offsetY = -1; offsetY <= 1; offsetY++) {
                if (offsetX == 0 && offsetY == 0) continue;
                var neighborX = x + offsetX;
                var neighborY = y + offsetY;
                if (neighborX < 0 || neighborX >= tileCountX || neighborY < 0 || neighborY >= tileCountY) continue;
                revealTile(neighborX, neighborY);
            }
        }
    } else if (tile.bomb) {
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
        item1 = array[i];
        tempItem = array[i];
        array[i] = array[randomIndex];
        array[randomIndex] = tempItem;
    }
    return array;
}


function placeBombs(width, height) {
    // console.log("mineField:");
    // console.log(mineField);
    for (let i = 0; i < bombCount; i++) {
        console.log("adding bomb #" + i);
        let rng = randomIndices[i]
        console.log(rng);
        let index = indexToCoords(rng);
        console.log(index);
        // mineField[index[0]][index[1]] = true;
        tiles[index[0]][index[1]].bomb = true;
    }
}

function generateNumbers(width, height) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (tiles[x][y].bomb) {
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
                    if (tiles[indexX][indexY].bomb == true)
                        bombs++
                }
            }
            tiles[x][y].number = bombs;
        }
    }
}

function startGame(width, height, bombs) {
    ended = false;
    endBomb = null;

    tileCountX = width;
    tileCountY = height;
    boardRect = { x: boardOffsetX, y: boardOffsetY, width: tileCountX * tileSize, height: tileCountY * tileSize }
    canvas.width = boardOffsetX + borderSize + tileCountX * tileSize;
    canvas.height = boardOffsetY + borderSize + tileCountY * tileSize;
    canvasRect = canvas.getBoundingClientRect();
    bombCount = bombs;
    targetRevealCount = width * height - bombs;
    tilesRevealed = 0;
    tiles = [width];
    randomIndices = [width * height]

    // Initialize Tiles & Random Indices
    for (let x = 0; x < width; x++) {
        tiles[x] = [height]
        for (let y = 0; y < height; y++) {
            tiles[x][y] = { number: 0, bomb: false, revealed: false, flagged: false };
            randomIndices[toIndex(x, y)] = toIndex(x, y);
        }
    }
    shuffleArray(randomIndices);

    // Generate Game Board
    placeBombs(width, height);
    generateNumbers(width, height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBorders();
    drawBoard();
}

function checkWin() {
    if (targetRevealCount == tilesRevealed) {
        endGame(true);
    }
}

function endGame(win) {
    ended = true;
    for (x = 0; x < tileCountX; x++) {
        for (y = 0; y < tileCountY; y++) {
            let tile = tiles[x][y];
            if (tile.bomb) {
                tile.revealed = true;
                if (win) tile.flagged = true;
            }
        }
    }
    drawBoard();
}

// The game will initialize after all sprite sheets have been loaded
loadSpriteSheets();