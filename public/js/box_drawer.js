var config_options = {};

var hostname = location.protocol + "//" + location.host;
var beeId = "";
var config_post_url = "";

let canvas_w = 400;
let canvas_h = 400;
let drawArea;

var selected_idx;

boxes = [];

function drawBox(b) {
    drawArea.append(b);
}

function clearDrawArea() {
    $("#graph").children().not("defs").remove();
}

function onBoxClick(e) {
	e.preventDefault();
	e.stopPropagation();

    idx = this.getAttribute('index');
   
    if (idx == selected_idx) {
        boxes[idx].setAttribute("stroke", "black");
        selected_idx = null;
        removeDraggable(boxes[idx])
    }
    else {
        if (selected_idx != null) {
            boxes[selected_idx].setAttribute("stroke", "black");
            removeDraggable(boxes[selected_idx])
        }
        boxes[idx].setAttribute("stroke", "red");
        selected_idx = idx;
        makeDraggable(boxes[idx])
    }
}


function addRandomBox() {

    let x = Math.random()  * (1 - .15);
    let y = Math.random()  * (1 - .15);

    let x2 = (Math.random() * (1 - x)) + x;
    let y2 = (Math.random() * (1 - y)) + y;

    let w = x2 - x;
    let h = y2 - y;

    //console.log("[x, y, x2, y2, w, h] " + x + " " + y + " " + x2 + " " + y2 + " " + w + " " + h + " ");

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "rect"); 
    svg.setAttribute("x", x * canvas_w);
    svg.setAttribute("y", y * canvas_h);
    svg.setAttribute("width", w * canvas_w);
    svg.setAttribute("height", h * canvas_h);

    svg.setAttribute("stroke", "black");
	svg.setAttribute("fill", "#d2d2d2");
    svg.setAttribute("fill-opacity", "0.5");

    svg.setAttribute('index', boxes.length);
    svg.onclick = onBoxClick;

    boxes.push(svg);
    drawBox(svg);
}

function drawBoxes() {
    clearDrawArea();
    boxes.forEach(b => {
        drawBox(b);
    });
}


$(document).ready(function() {
    beeId = $("#beeID")[0].innerHTML;
    config_post_url = hostname + "/dashboard/bees/" + beeId + "/boxes";

    drawArea = $("#graph")[0];
    drawArea.setAttribute("width", canvas_w);
    drawArea.setAttribute("height", canvas_h);
    drawBoxes();
});


/* Moveable svg */
// http://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
function removeDraggable(e) {
    e.removeEventListener('mousedown', startDrag);
    e.removeEventListener('mousemove', drag);
    e.removeEventListener('mouseup', endDrag);
    e.removeEventListener('mouseleave', endDrag);
}

function makeDraggable(e) {
    e.addEventListener('mousedown', startDrag);
    e.addEventListener('mousemove', drag);
    e.addEventListener('mouseup', endDrag);
    e.addEventListener('mouseleave', endDrag);
}

var svg = null;
function startDrag(e) {
}

function drag(e) {
    e.preventDefault();
    boxes[selected_idx].setAttribute('x', boxes[selected_idx].getAttribute('x') * 1.01);
}

function endDrag(e) {
}