var config_options = {};

var hostname = location.protocol + "//" + location.host;
var beeId = "";
var config_get_url = "";
var config_post_url = "";

var networks_get_url = "";
var networks_post_url = "";

function submit_form() {
    $('input').each(function(i) {  
        if (this.type == "checkbox") config_options.set(this.name, this.checked ? 1 : 0)
        else config_options.set(this.name, this.value)
    })

    var data = "";
    config_options.forEach(function(v, k) {
        data += (k + '=' + v + '|') 
    })
    data = data.slice(0, -1)
    console.log(data)

    $.ajax({
        type:   "POST",
        url:    config_post_url,
        data:   {'config' : data},
        success: function(data) {
            alert('configuration updated');
        },
        error: function(xhr, status, err) {
            alert("failed: " + status + ", " + "error: " + err);
        }
      });
}

function draw_form(config) {
    config_options = new Map(Object.entries(config));
    var outHtml = ""; 

    var read_only_types = ["uuid", "model", "config"];
    var boolean_types = ["raspi", "useOpenCL", "useCSRT", "useTracking"]
    var integer_types = ["frequency", "confidence", "skipFrames",
                        "imageWidth", "imageHeight", "neuralNetQuality",
                        "maxDisappeared", "searchDistance", "nmsThreshold", "image_quality"]

    config_options.forEach( function(v, k) {
        outHtml += "<tr>"
        outHtml += `<td>${k}</td>`

        if (read_only_types.includes(k)) {
            outHtml += `<td>${v}</td>`
        } else {
            outHtml += `<td>`
            if (boolean_types.includes(k)) outHtml += `<input type="checkbox" name="${k}" ${((v == 1 ? 'checked' : ''))}>`
            else if (integer_types.includes(k)) outHtml += `<input type="number" name="${k}" value="${v}" step="any">`
            else outHtml += `<input type="text" name="${k}" value="${v}">`
            outHtml += `</td>`
        }
        outHtml += "</tr>"
    })
    $("#configForm").html(outHtml);
}

function populate_ssids(networks) {
    if (networks.length == 0) {
        $("#networkDiv").hide();
        $("#configDiv").attr("class", "col-md-12");
        return;
    }

    outHtml = "";
    networks.forEach(function(network) {
        outHtml += `<option ${network.active ? "selected" : ""}>${network.ssid}</option>`;
    });

    $("#networkSelect").html(outHtml);
}

function submit_network() {

    console.log("Network Config submitted.");

    $.post(networks_post_url, { 
        ssid: $("#networkSelect option:selected").html(), 
        password: $("#passcodeInput").val()
    }, function() {
        // Submit network connection choice
        $("#netUpdateMsg").show();
        setTimeout(() => {$("#netUpdateMsg").fadeOut(1000)}, 2000);
    }).fail(function(err) {
        console.log(err);
    });
}

$(document).ready(function() {
    beeId = $("#beeID")[0].innerHTML;
    config_get_url = hostname + "/bee/" + beeId + "/config/json";
    config_post_url = hostname + "/dashboard/bees/" + beeId + "/configure";

    networks_get_url = hostname + "/bee/" + beeId + "/network";
    networks_post_url = hostname + "/bee/" + beeId + "/network/connect";

    $.getJSON(config_get_url, draw_form).fail(function(err) {
        console.log(err);
    });

    $("#netUpdateMsg").hide();
    $.post(networks_get_url, populate_ssids).fail(function(err) {
        console.log(err);
    });

    $("#submitconfig")[0].onclick = submit_form;
    $("#submitNetwork").on("click", submit_network);
});