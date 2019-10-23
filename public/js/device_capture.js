var config_options = {
    check_frequency: 1000, // How often to check for the image response, in milliseconds
    aspect_ratio: 0.75,
    default_width: 0.075,
    default_height: 0.1,
}

var hostname = location.protocol + "//" + location.host;
var beeId = "";

var timeRequested = Math.floor((new Date()/1000));
var interval;

var canvasImg = null;

// Box drawing attributes
let canvas_w = 600;
let canvas_h = 450;
let canvas;
let ctx;

var selected_idx;

// Bounding box management
boxes = [];
selectedBoxIndex = -1;

function checkDeviceImage() {
    $.post(`${hostname}/bee/img/fetch/${beeId}`, function (data) {
        if (data.rtime > timeRequested) {
            $("#loadIndicator").hide();
            canvasImg = new Image(canvas_w, canvas_h);
            canvasImg.src = "data:image/jpg;base64," + data.image;

            canvasImg.onload = function() {
                // Draw the retrieved image to the canvas
                redraw();
            }

            clearInterval(interval);
        }
    });
}

$(document).ready(function() {
    beeId = $("#beeID")[0].innerHTML;

    canvas = $("#boxDraw")[0];
    ctx = canvas.getContext("2d");

    canvas_w = $("#boxDraw").parent().width();
    canvas_h = canvas_w * config_options.aspect_ratio;

    canvas.width = canvas_w;
    canvas.height = canvas_h;

    // Register event handlers
    canvas.addEventListener('mousedown', onMouseDown);

    // Fetch the boxes from the server and draw them
    //drawBoxes();

    // Send a request to the server for an image of the bee current state
    $.post(`${hostname}/bee/img/request/${beeId}`, function(data) {
        console.log(data);
        timeRequested = Math.floor((new Date()) / 1000)
    }).fail(function(err) {
        //console.log(err);
    });

    // Continually send periodic requests for the new image until its timestamp is higher than the time we requested an image
    interval = setInterval(checkDeviceImage, config_options.check_frequency);
});

function onSelectionChanged(box) {
    console.log(box);

    // When the selected box changes
    $("#boxName").val(box.name);
    $("#boxX").val(box.x);
    $("#boxY").val(box.y);
    $("#boxW").val(box.width);
    $("#boxH").val(box.height);
}

function redraw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear the canvas for drawing
    if (canvasImg != null) ctx.drawImage(canvasImg, 0, 0, canvas_w, canvas_h);

    // Style for drawing boxes
    ctx.lineWidth = 6;

    // Draw each box with a random colour, normalizing the coordinates
    boxes.forEach((box, index) => {
        ctx.beginPath();
        ctx.strokeStyle = index == selectedBoxIndex ? "red" : "green";
        ctx.rect(box.x*canvas_w, box.y*canvas_h, box.width*canvas_w, box.height*canvas_h);
        ctx.stroke();
    });
}

function randomColor() {
    return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
}

function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const normX = (event.clientX - rect.left) / canvas_w;
    const normY = (event.clientY - rect.top) / canvas_h;

    var foundBox = -1;
    foundBox = boxes.findIndex(function (box) {
        return box.x < normX 
            && box.y < normY 
            && (box.x + box.width) > normX 
            && (box.y + box.height) > normY;
    });

    if (foundBox != -1) {
        selectedBoxIndex = foundBox;
        onSelectionChanged(boxes[selectedBoxIndex]);
        redraw();
        return;
    }

    boxes.push({
        name: "Area #" + boxes.length,
        x: normX - config_options.default_width / 2,
        y: normY - config_options.default_height  / 2,
        width: config_options.default_width,
        height: config_options.default_height
    });

    selectedBoxIndex = boxes.length-1;
    onSelectionChanged(boxes[selectedBoxIndex]);

    redraw();
}