var StaticDeviceInfo = {
    totalDevices : 0,
    activeDevices: 0,
    initialized: false
};

function initialize() {
    var $fail = $("[id^=label]");
    $fail.attr("class", "label label-warning");
    $fail.html("Idle");
}

function displayDevice(deviceIndex, device) {
    var labelUpdate = document.getElementById("update" + deviceIndex);

    var newDate = new Date(device.time * 1000);
    var oldDate = new Date(labelUpdate.innerHTML);

    if (newDate > oldDate) {

        if (StaticDeviceInfo.initialized) {
            StaticDeviceInfo.activeDevices++;
            var labelSuccess = document.getElementById("label" + deviceIndex);
            labelSuccess.className = "label label-success";
            labelSuccess.innerHTML = "Detecting";
        }

        labelUpdate.innerHTML = newDate.toLocaleDateString() + " " + newDate.toLocaleTimeString();

        var status = document.getElementById("status" + deviceIndex);
        status.innerHTML = device.dstatus;
            
        var people = document.getElementById("device" + deviceIndex);
        people.innerHTML = device.people;
            
    } else {
        var fail = document.getElementById("label" + deviceIndex);  // Change to IDLE
        fail.className = "label label-warning";
        fail.innerHTML = "Idle";
    }
    StaticDeviceInfo.initialized = true;
}

function displayData(devices) {
    StaticDeviceInfo.totalDevices = devices.devices.length;
    StaticDeviceInfo.activeDevices = 0;
    $.each(devices.devices, displayDevice);

    $("#devicesCounter").html(`${StaticDeviceInfo.activeDevices}/${StaticDeviceInfo.totalDevices}`);
}

// Get the beebit devices registered and update the list
function makeRequest() {
    var updateLoc = location.protocol + "//" + location.host + "/bee/stats";
    $.getJSON(updateLoc, displayData)  .fail(function(err) {
    console.log( "error" + err);
    });
}


$(function() {
    initialize();
    setInterval(makeRequest, 1000);
});