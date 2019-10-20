var hostname = "";
var submit_url = "";

// severity: success, info, warning, danger
function setFormFeedback(msg, severity) {
    $("#feedback")[0].innerHTML = '<div id="feedback" class="alert alert-' + severity + '"><strong>' + msg + '</strong></div>';
}

function submit_form() {
    var data = {};

    $('input').each(function(i) {  
        if (this.type == "checkbox") data[this.name] = this.checked;
        else data[this.name] = this.value;
    })

    $.ajax({
        type:   "POST",
        url:    submit_url,
        data:   data,
        success: function(data, textStatus, xhr) {
            setFormFeedback(data, 'success');
            window.location.replace(submit_url)
        },
        error: function(xhr, status, err) {
            setFormFeedback(xhr.responseText, 'danger');
        }
      });
}

$(document).ready(function() {
    hostname = location.protocol + "//" + location.host;
    submit_url = hostname + "/dashboard/AccountSettings";

    $("#submitbtn")[0].onclick = submit_form;

    $('[data-toggle="tooltip"]').tooltip();

    $("#checkbox_editpasswd").click(function(){
        $('input[name*=password]').each(function(i, v) {v.toggleAttribute('disabled')});
    });
});