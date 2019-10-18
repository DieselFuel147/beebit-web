var hostname = "";
var submit_url = "";

var err;
// severity: success, info, warning, danger
function setFormFeedback(msg, severity) {
    err.innerHTML = err.innerHTML + '<div id="feedback" class="alert alert-' + severity + '"><strong>' + msg + '</strong></div>';
}

function submit_form() {
    var data = {};

    $('input').each(function(i) {  
        if (this.type == "checkbox") data[this.name] = ((this.checked) ? 1 : 0);
        else data[this.name] = this.value;
    })

    err.innerHTML = '';

    $.ajax({
        type:   "POST",
        url:    submit_url,
        data:   data,
        success: function(data, textStatus, xhr) {
            setFormFeedback(data, 'success');
            window.location.replace(hostname + '/dashboard')
        },
        error: function(xhr, status, err) {
            errs = xhr.responseText.split('\n');
            errs.forEach(e => {
                setFormFeedback(e, "danger");
            });
        }
      });
}

$(document).ready(function() {
    hostname = location.protocol + "//" + location.host;
    submit_url = hostname + "/dashboard/login";

    err = $("#feedback")[0];
    $("#submitbtn")[0].onclick = submit_form;
});