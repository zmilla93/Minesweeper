// Minesweeper by Zach Miller

// Get a reference to the canvas
var canvas = document.getElementById("minesweeperCanvas");
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
let digitY;
let mineCounterX;
let timerX;

// Images
var imagesLoaded = 0;
const imageCount = 8;
var borderHorizontalImage = new Image();
var borderVerticalImage = new Image();
var faceSprites;
var numberSprites;
var debugNumberSprites;
var tileSprites;
var cornerSprites;
var digitSprites;

// Settings
var tileCountX = 30;
var tileCountY = 20;
var bombCount = 10;
var debugBombs = true;
var debugNumbers = true;

// Game
var canvasRect;
var boardRect;
var faceRect;
var tiles;
var randomIndices;
var ended = false;
var endBomb;
var displayBombCount;
var targetRevealCount;
var tilesRevealed;

const GameState = Object.freeze({
    Loading: 0,
    Launched: 1,
    Running: 2,
    Won: 3,
    Lost: 4,
})
var state = GameState.Loading;

// Interactions
var pressed = false;
var pressedIndex = -1;
var facePressed = false;
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
    if (isWithinRect(faceRect, x, y)) {
        drawFace(1);
        facePressed = true;
    }
    if (!ended && isWithinBoard(x, y)) {
        var pos = posToCoords(x, y);
        clickPos = posToCoords(x, y);
        drawTile(pos.x, pos.y, true);
        console.log(x);
        console.log(y);
        pressed = true;
        drawFace(2);
    }
}

function handleMouseUp(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
    if (!ended)
        drawFace(0);
    if (isWithinRect(faceRect, x, y) && facePressed) {
        startGame(10, 10, 3);
    }
    if (!ended && pressed && isWithinBoard(x, y)) {
        var pos = posToCoords(x, y);
        revealTile(pos.x, pos.y);
        checkWin();
    }
    drawBoard();
    pressed = false;
    facePressed = false;
}

function handleMouseMove(e) {
    let x = e.x - canvasRect.x;
    let y = e.y - canvasRect.y;
    if (pressed) {
        var pos = posToCoords(x, y);
        if (clickPos == null || pos.x != clickPos.x || pos.y != clickPos.y) {
            if (clickPos != null)
                drawTile(clickPos.x, clickPos.y, false);
            if (isWithinBoard(x, y)) {
                drawTile(pos.x, pos.y, true);
                clickPos = pos;
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
        startGame(tileCountX, tileCountY, bombCount);
    }
}

function loadImage(image, path) {
    image.onload = imageLoadedCallback;
    image.src = path;
}

function loadSpriteSheet(path, width, height, offset) {
    var spriteSheet = { image: new Image(), width: width, height: height, offset: offset };
    spriteSheet.image.onload = imageLoadedCallback;
    spriteSheet.image.src = path;
    // console.log(spriteSheet.image);
    return spriteSheet;
}

function loadSpriteSheets() {
    // loadImage(facesImage, "sprites/faces.png");
    // loadImage(numberImage, "sprites/numbers.png");
    // loadImage(numberDebugImage, "sprites/numbers_debug.png");
    // loadImage(tileImage, "sprites/tiles.png");
    loadImage(borderHorizontalImage, "sprites/border_horizontal.png");
    loadImage(borderVerticalImage, "sprites/border_vertical.png");
    // loadImage(cornersImage, "sprites/corners.png");

    faceSprites = loadSpriteSheet("sprites/faces.png", 24, 24, 1);
    numberSprites = loadSpriteSheet("sprites/numbers.png", 16, 16, 1);
    debugNumberSprites = loadSpriteSheet("sprites/numbers_debug.png", 16, 16, 1);
    tileSprites = loadSpriteSheet("sprites/tiles.png", 16, 16, 1);
    // borderHorizontalSprite = loadSpriteSheet("sprites/border_horizontal.png", 16, 10, 0);
    // borderVerticalSprite = loadSpriteSheet("sprites/border_vertical.png", 10, 16, 0);
    cornerSprites = loadSpriteSheet("sprites/corners.png", 10, 10, 0);
    digitSprites = loadSpriteSheet("sprites/digits.png", 13, 23, 1);
}

function drawTile(x, y, pressed) {
    image = tileSprites;
    index = 0;
    let tile = tiles[x][y];
    if (tile.revealed) {
        if (tile.bomb) {
            image = tileSprites;
            index = 5;
            if (endBomb != null && endBomb.x == x && endBomb.y == y) index = 6;

            // FIXME : Add red bomb
        } else {
            image = numberSprites;
            index = tile.number;
        }
    } else {
        if (pressed) {
            index = 1;
        } else {
            if (debugNumbers) {
                if (tile.bomb) {
                    image = tileSprites;
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

function drawTimer(time) {
    drawSprite(digitSprites, 0, timerX, digitY);
    drawSprite(digitSprites, 2, timerX + digitSprites.width, digitY);
    drawSprite(digitSprites, 3, timerX + digitSprites.width * 2, digitY);
}

function drawBombCounter(time) {
    drawSprite(digitSprites, 0, mineCounterX, digitY);
    drawSprite(digitSprites, 2, mineCounterX + digitSprites.width, digitY);
    drawSprite(digitSprites, 3, mineCounterX + digitSprites.width * 2, digitY);
}

function revealTile(x, y) {
    var tile = tiles[x][y];
    if (tile.revealed) return;
    tile.revealed = true;
    if (!tile.bomb) tilesRevealed++;
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
    state = GameState.Launched;
    ended = false;
    endBomb = null;
    tileCountX = width;
    tileCountY = height;
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
    // if (win) drawFace(3);
    // else drawFace(4);
}

// The game will initialize after all sprite sheets have been loaded
loadSpriteSheets();