// Get a reference to the canvas
var canvas = document.getElementById("myCanvas");
// Get a reference to a 2D context of the canvas.
// This is what holds the drawing functions.
var ctx = canvas.getContext('2d');

// Contants
const iconSize = 16;
const imageCount = 4;
const boardOffsetX = 10;
const boardOffsetY = 10;

// Images
var imagesLoaded = 0;
let facesImage = new Image();
let numberImage = new Image();
let numberDebugImage = new Image();
let tileImage = new Image();

// Game
var canvasRect;
var field;
var mineField;
var randomIndices;

let tileCountX = 10;
let tileCountY = 10;
let bombCount = 10;

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

function loadImages() {
    facesImage = new Image();
    numberImage = new Image();
    numberDebugImage = new Image();
    tileImage = new Image();
    facesImage.onload = imageLoadedCallback;
    numberImage.onload = imageLoadedCallback;
    numberDebugImage.onload = imageLoadedCallback;
    tileImage.onload = imageLoadedCallback;
    facesImage.src = 'sprites/faces.png';
    numberImage.src = 'sprites/numbers.png';
    numberDebugImage.src = 'sprites/numbers_debug.png';
    tileImage.src = 'sprites/tiles.png';
}

function drawTile(x, y) {

}

function drawTile(sheet, index, x, y) {
    ctx.drawImage(sheet,
        (iconSize + 1) * index, 0, iconSize, iconSize,      // Sprite Sheet Position
        boardOffsetX + x * iconSize, boardOffsetY + y * iconSize, iconSize, iconSize);    // Canvas Position
}



function drawBoard() {
    for (let x = 0; x < tileCountX; x++) {
        for (let y = 0; y < tileCountY; y++) {

            if (mineField[x][y]) {
                drawTile(tileImage, 8, x, y);
                // ctx.drawImage(facesImage,
                //     iconSize + 1, 0, iconSize, iconSize,
                //     x * iconSize, y * iconSize, iconSize, iconSize);
            } else {
                drawTile(numberDebugImage, field[x][y], x, y)
                // drawTile(tileImage, 2, x, y)
                // ctx.drawImage(tileImage,
                //     0, 0, iconSize, iconSize,
                //     x * iconSize, y * iconSize, iconSize, iconSize);
            }
        }
    }
}

function toIndex(x, y) {
    return x + y * tileCountX;
}

function indexToCoords(index) {
    let h = Math.floor(index / tileCountY);
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

canvas.onmousedown = function (e) {
    console.log("canvas:::" + canvas)
    console.log(e.x - canvasRect.x);
    console.log(e.y - canvasRect.y);
    let x = e.x - canvasRect.x - boardOffsetX;
    let y = e.y - canvasRect.y - boardOffsetY;
}


function placeBombs(width, height){
    for (let i = 0; i < bombCount; i++) {
        rng = randomIndices[i]
        console.log("rng" + rng);
        let h = Math.floor(rng / height);
        console.log("h" + h);
        console.log("w" + (rng - h * width));
        console.log(indexToCoords(rng));
        index = indexToCoords(rng);
        mineField[index[0]][index[1]] = true;
    }
}

function generateNumbers(width, height){
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (mineField[x][y]) {
                field[x][y] = -1;
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
                        console.log("SKIP");
                        continue;
                    }
                    if (mineField[indexX][indexY] == true)
                        bombs++
                }
            }
            console.log("check:" + check);
            field[x][y] = bombs;
        }
    }
}


function startGame(width, height, bombCount) {
    canvasRect = canvas.getBoundingClientRect();
    canvas.width = boardOffsetX + tileCountX * iconSize;
    canvas.height = boardOffsetY + tileCountY * iconSize;
    tileCountX = width;
    tileCountY = height;
    field = [width];
    mineField = [width];
    randomIndices = [width * height]
    for (let x = 0; x < width; x++) {
        field[x] = [height];
        mineField[x] = [height];
        for (let y = 0; y < height; y++) {
            mineField[x][y] = false;
            randomIndices[toIndex(x, y)] = toIndex(x, y);
        }
    }
    shuffleArray(randomIndices);

    // Place Bombs
    placeBombs(width, height);
    generateNumbers(width, height);
    console.log(mineField)
    console.log(field)
    drawBoard();
}

loadImages();
// startGame(10, 10, 10);