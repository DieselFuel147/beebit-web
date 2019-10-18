var hostname = "";
var submit_url = "";

// severity: success, info, warning, danger
function setFormFeedback(msg, severity) {
    $("#feedback")[0].innerHTML = '<div id="feedback" class="alert alert-' + severity + '"><strong>' + msg + '</strong></div>';
}

function submit_form() {
    var data = {};

    $('input').each(function(i) {  
        if (this.type == "checkbox") config_options.set(this.name, this.checked ? 1 : 0)
        else data[this.name] = this.value;
    })

    $.ajax({
        type:   "POST",
        url:    submit_url,
        data:   data,
        success: function(data, textStatus, xhr) {
            setFormFeedback(data, 'success');
            window.location.replace(hostname + '/dashboard')
        },
        error: function(xhr, status, err) {
            setFormFeedback(xhr.responseText, 'danger');
        }
      });
}

$(document).ready(function() {
    hostname = location.protocol + "//" + location.host;
    submit_url = hostname + "/dashboard/register-a-bee/";

    $("#submitbtn")[0].onclick = submit_form;
});