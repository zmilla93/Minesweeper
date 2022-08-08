// Minesweeper by Zach Miller

// Get a reference to the canvas
var canvas = document.getElementById("myCanvas");
canvas.onmousedown = handleMouseDown;
canvas.onmouseup = handleMouseUp;
canvas.onmousemove = handleMouseMove;
// Get a reference to a 2D context of the canvas.
// This is what holds the drawing functions.
var ctx = canvas.getContext('2d');

// Contants
const iconSize = 16;
const boardOffsetX = 10;
const boardOffsetY = 10;
const boarderSize = 10;

// Images
var imagesLoaded = 0;
const imageCount = 4;
var facesImage = new Image();
var numberImage = new Image();
var numberDebugImage = new Image();
var tileImage = new Image();
var debugBombs = true;
var debugNumbers = true;

// Settings
var tileCountX = 30;
var tileCountY = 20;
var bombCount = 10;

// Game
var canvasRect;
var boardRect;
// var field;
var tiles;
// var mineField;
var randomIndices;

// Interactions
var pressed = false;
var pressedIndex = -1;
var clickPos;

// Bind UI
window.onload = function () {
    var startButton = document.getElementById("startButton");
    startButton.onclick = function () { startGame(30, 20, 1); }
};


function handleMouseDown(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;


    // if (x >= boardRect.x && y >= boardRect.y && x < boardRect.x + boardRect.width && y < boardRect.y + boardRect.height) {
    if (isWithinBoard(x, y)) {
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
    if (pressed && isWithinBoard(x, y)) {
        // REVEAL TILE
        var pos = posToCoords(x, y);
        revealTile(pos.x, pos.y);
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
    x = Math.floor(x / iconSize);
    y = Math.floor(y / iconSize);
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
}

function drawTile(x, y, pressed) {
    image = tileImage;
    index = 0;
    let tile = tiles[x][y];
    if (tile.revealed) {
        image = numberImage;
        index = tile.number;
    } else {
        if (pressed) {
            index = 1;
        } else {
            if (debugNumbers) {
                index = tile.number;
                image = numberDebugImage;
            } else {
                index = 0;
            }
        }
    }
    drawTileFromSheet(image, index, x, y);
}

function drawTileFromSheet(sheet, index, x, y) {
    ctx.drawImage(sheet,
        (iconSize + 1) * index, 0, iconSize, iconSize,      // Sprite Sheet Position
        boardOffsetX + x * iconSize, boardOffsetY + y * iconSize, iconSize, iconSize);    // Canvas Position
}

function drawBoard() {
    for (let x = 0; x < tileCountX; x++) {
        for (let y = 0; y < tileCountY; y++) {
            drawTile(x, y, false);
            if (tiles[x][y].bomb) {
                // drawTileFromSheet(tileImage, 8, x, y);
                // ctx.drawImage(facesImage,
                //     iconSize + 1, 0, iconSize, iconSize,
                //     x * iconSize, y * iconSize, iconSize, iconSize);
            } else {
                // drawTileFromSheet(numberDebugImage, tiles[x][y].number, x, y)
                // drawTile(tileImage, 2, x, y)
                // ctx.drawImage(tileImage,
                //     0, 0, iconSize, iconSize,
                //     x * iconSize, y * iconSize, iconSize, iconSize);
            }
        }
    }
}

function revealTile(x, y) {
    var tile = tiles[x][y];
    if (tile.revealed) return;
    tile.revealed = true;
    // var neighborOffsets = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 },
    // { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }];
    // if (x == 28 && y == 19) {
    //     console.log("Starting target tile...");
    // }
    if (tile.number == 0) {
        for (var offsetX = -1; offsetX <= 1; offsetX++) {
            for (var offsetY = -1; offsetY <= 1; offsetY++) {
                // if (x == 28 && y == 19) {
                //     console.log("neighbor check...");
                // }
                if (offsetX == 0 && offsetY == 0) continue;
                var neighborX = x + offsetX;
                var neighborY = y + offsetY;
                // if (x == 28 && y == 19) {
                //     console.log("Neighbor: " + neighborX + ", " + neighborY);
                // }
                if (neighborX < 0 || neighborX >= tileCountX || neighborY < 0 || neighborY >= tileCountY) continue;
                revealTile(neighborX, neighborY);
            }
        }
        // for (let i = 0; i < neighborOffsets.length; i++) {
        //     var neighborX = x + neighborOffsets[i].x;
        //     var neighborY = y + neighborOffsets[i].y;
        //     if (neighborX < 0 || neighborX >= tileCountX || neighborY < 0 || neighborY >= tileCountY) continue;
        //     revealTile(neighborX, neighborY);
        // }
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
    canvasRect = canvas.getBoundingClientRect();
    boardRect = { x: boardOffsetX, y: boardOffsetY, width: tileCountX * iconSize, height: tileCountY * iconSize }
    canvas.width = boardOffsetX + boarderSize + tileCountX * iconSize;
    canvas.height = boardOffsetY + boarderSize + tileCountY * iconSize;
    tileCountX = width;
    tileCountY = height;
    bombCount = bombs;
    tiles = [width];
    randomIndices = [width * height]

    // Initialize Tiles & Random Indices
    for (let x = 0; x < width; x++) {
        tiles[x] = [height]
        for (let y = 0; y < height; y++) {
            tiles[x][y] = { number: 0, bomb: false, revealed: false };
            randomIndices[toIndex(x, y)] = toIndex(x, y);
        }
    }
    shuffleArray(randomIndices);

    // Generate Game Board
    placeBombs(width, height);
    generateNumbers(width, height);

    drawBoard();
}

// The game will initialize after all sprite sheets have been loaded
loadSpriteSheets();