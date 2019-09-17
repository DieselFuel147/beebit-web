
var settings = {
    inactiveTime: 30, // Time until a device is considered inactive, in seconds.
    updateFrequency: 5 // Update frequency in seconds
};

var StaticDeviceInfo = {
    totalDevices : 0,
    activeDevices: 0,
    totalDetected: 0,
    initialized: false
};

var devices = {};

var hostname = location.protocol + "//" + location.host;
var updateLoc = hostname + "/bee/status";
var avgLog = hostname + "/bee/avg/day/";
var statsLoc = hostname + "/bee/stats/";

function initialize() {
    var $fail = $("[id^=label]");
    $fail.attr("class", "label label-danger");
    $fail.html("Disconnected");
}

function displayDevice(deviceIndex, device) {
    var labelUpdate = document.getElementById("update" + deviceIndex);

    var newDate = new Date(device.time * 1000);
    var oldDate = new Date(labelUpdate.innerHTML);

    // If the new date is newer or the time since the last detection is less than the inactive counter
    var timeSinceLast = Math.floor(((new Date()) - newDate) / 1000);

    if (newDate > oldDate || timeSinceLast < settings.inactiveTime) {

        if (StaticDeviceInfo.initialized) {
            StaticDeviceInfo.activeDevices++;
            StaticDeviceInfo.totalDetected += device.people;
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
        fail.className = "label label-danger";
        fail.innerHTML = "Disconnected";
    }
}

function sortDevices(da, db) {
    return da.people < db.people;
}

function displayData(devices) {
    StaticDeviceInfo.totalDevices = devices.devices.length;
    StaticDeviceInfo.activeDevices = 0;
    StaticDeviceInfo.totalDetected = 0;

    if (devices == undefined || devices.length == 0) return;

    $.each(devices.devices, displayDevice);

    devices.devices.sort(sortDevices);

    $("#mostPopular").html(devices.devices[0].description);
    $("#devicesCounter").html(`${StaticDeviceInfo.activeDevices}/${StaticDeviceInfo.totalDevices}`);
    $("#totalDetected").html(StaticDeviceInfo.totalDetected);
    StaticDeviceInfo.initialized = true;
}

function displayIncrease(previousAverage, currentAverage) {
    var percent = Math.round(((currentAverage/previousAverage) - 1.0) * 100);
    if (percent > 0) {
        percent = "+" + percent;
    }
    $("#diffYesterday").html(percent + '%');
}

function getDateStr(date) {
    var dd = String(date.getDate()).padStart(2, '0' );
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    return yyyy + "-" + mm + "-" + dd;
}

// Get the beebit devices registered and update the list
function makeRequest() {
    $.getJSON(updateLoc, displayData).fail(function(err) {
        console.log( "error" + err);
    });

    var today = new Date();
    var yesterday = (new Date());
    yesterday.setDate(today.getDate() - 1);
    $.getJSON(avgLog + getDateStr(today), function(today) {
        $.getJSON(avgLog + getDateStr(yesterday), function(yesterday) {
            displayIncrease(yesterday.average, today.average);
        });
    });
}

function displayRanks(devices) {
    var outHtml = ""; 
    var devices = devices.devices;

    devices.sort(sortDevices);

    var totalPeople = devices.reduce(function (total, curr) {
        return total.people + curr.people;
    });

    console.log(totalPeople);
    var counter = 1;
    for (d in devices) {
        outHtml += "<tr>"
        outHtml += `<td>#${counter}</td>`
        outHtml += `<td>${devices[d].description}</td>`
        outHtml += `<td>${devices[d].people}</td>`
        outHtml += `<td>${Math.round(devices[d].people/totalPeople*100)}%</td>`
        outHtml += `<td><a href="${hostname + "/dashboard/bees/" + devices[d].uuid}">Bee ${devices[d].uuid} </a></td>`
        outHtml += "</tr>"
        counter++;
    }

    $("#rankTable").html(outHtml);
}

function fillRankTable() {
    // Generate a new table of the devices and their relative rankings
    var newVal = $("#rankTimeSelect").val();
    
    $.getJSON(updateLoc, displayRanks).fail(function(err) {
        console.log( "error" + err);
    });
}

$("#rankTimeSelect").change(fillRankTable);

$(function() {
    initialize();
    makeRequest();
    setInterval(makeRequest, settings.updateFrequency*1000);
    fillRankTable();
});