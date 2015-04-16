/*global Dropzone, console, alert*/

(function () {
    "use strict";
    var xhr = new XMLHttpRequest(),
        uptoken = '';
    xhr.open('GET', 'http://qiniu.coding.io/uptoken', false);
    xhr.onload = function (e) {
        if (this.status === 200) {
            uptoken = this.response;
        } else {
            alert('Oops! Get uptoken error.');
        }
    };
    xhr.send();
    Dropzone.options.myAwesomeDropzone = {
        maxFilesize: 6,
        maxFiles: 50,
        params: {
            token: uptoken
        },
        acceptedFiles: 'image/*',
        init: function () {
            var param = this.params;
            this.on("sending", function (file, xhr, formData) {
                var suffix = file.name.split('.').pop();
                suffix = file.name.length - suffix.length <= 1 ? '' : suffix;
                formData.append('key', Math.random().toString(36).substring(5) + '.' + suffix);
            });
        }
    };
}());