/*global Dropzone, console, alert, ActiveXObject, $*/

(function () {
    "use strict";
    var uptoken = '',
        hasFlash = false,
        domain = 'https://dn-getlink.qbox.me/';
    $.post('http://qiniu.coding.io/uptoken', function (data) {
        uptoken = data;
    }).fail(function () {
        alert('Oops! Get uptoken error.');
    });
    hasFlash = (function (a, b) {
        try {
            a = new ActiveXObject(a + b + '.' + a + b);
        } catch (e) {
            a = navigator.plugins[a + ' ' + b];
        }
        return !!a;
    }('Shockwave', 'Flash'));
    Dropzone.options.myAwesomeDropzone = {
        maxFilesize: 6,
        maxFiles: 50,
        //acceptedFiles: 'image/*',
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
                if (hasFlash) {
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
                } else {
                    preEle.on('click', function () {
                        window.prompt("Copy to clipboard: Ctrl+C, Enter", domain + response.key);
                    });
                }
            });
        }
    };
}());
