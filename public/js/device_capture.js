var config_options = {
    check_frequency: 1000 // How often to check for the image response, in milliseconds
}

var hostname = location.protocol + "//" + location.host;
var beeId = "";

var timeRequested = Math.floor((new Date()/1000));
var interval;

function checkDeviceImage() {
    $.post(`${hostname}/bee/img/fetch/${beeId}`, function (data) {
        if (data.rtime > timeRequested) {
            $("#loadIndicator").hide();
            $("#previewImg").attr("src", "data:image/jpg;base64," + data.image);
            clearInterval(interval);
        }
    });
}

$(document).ready(function() {
    beeId = $("#beeID")[0].innerHTML;

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