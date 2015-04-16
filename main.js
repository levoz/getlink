/*global Dropzone, console, alert, $*/

(function () {
    "use strict";
    var uptoken = '';
    $.post('http://qiniu.coding.io/uptoken', function (data) {
        uptoken = data;
    }).fail(function () {
        alert('Oops! Get uptoken error.');
    });
    Dropzone.options.myAwesomeDropzone = {
        maxFilesize: 6,
        maxFiles: 50,
        acceptedFiles: 'image/*',
        init: function () {
            var param = this.params;
            this.on("sending", function (file, xhr, formData) {
                var suffix = file.name.split('.').pop();
                suffix = file.name.length - suffix.length <= 1 ? '' : suffix;
                formData.append('key', Math.random().toString(36).substring(5) + '.' + suffix);
                formData.append('token', uptoken);
            });
        }
    };
}());