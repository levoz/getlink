/*global Dropzone, console, alert, $*/

(function () {
    "use strict";
    var uptoken = '',
        domain = 'http://7xih5a.com1.z0.glb.clouddn.com/';
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
            this.on('sending', function (file, xhr, formData) {
                var suffix = file.name.split('.').pop();
                suffix = file.name.length - suffix.length <= 1 ? '' : ('.' + suffix);
                formData.append('key', Math.random().toString(36).substring(5) + suffix);
                formData.append('token', uptoken);
            });
            this.on('success', function (file, response) {
                var preEle = $(file.previewElement);
                preEle.attr('title', 'Click && Get Link!');
                preEle.zclip({
                    path: 'ZeroClipboard.swf',
                    copy: domain + response.key,
                    afterCopy: function () {
                        $('#copy-status').css('color', '#3BE269');
                        setTimeout(function () {
                            $('#copy-status').css('color', '#457DB6');
                        }, 1000);
                    }
                });
            });
        }
    };
}());