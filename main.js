(function() {
    // 'This is a {0} {1} function'.format('string', 'format')
    // ==> 'This is a string format function'
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }

    // Constant
    var previewTemplate = '\
        <div class="col s12 m6 l3">\
        <div class="card hoverable">\
            <div class="card-image">\
                <img src="{0}" height="200px">\
            </div>\
            <div class="card-action">\
                <a class="copy-btn" data-clipboard-text=\'{0}\'>URL</a>\
                <a class="copy-btn" data-clipboard-text=\'{1}\'>HTML</a>\
                <a class="copy-btn" data-clipboard-text=\'{2}\'>Markdown</a>\
                <i class="fa fa-check"></i>\
                <i class="fa fa-times"></i>\
            </div>\
        </div>\
    </div>\
    ';

    // Settings localStorage methods
    var GL = {
            default: {
                server: 'https://pub.get-link.xyz/uptoken',
                authKey: 'getlink',
                isAutoRename: 'true'
            },
            isDefaultServer: function () {
                if (this.get('server') === this.default['server']
                    && this.get('authKey') === this.default['authKey']) {
                    return true;
                }
                return false;
            },
            get: function(k, d) {
                var val = localStorage.getItem('getlink_' + k) || this.default[k];
                if (d) {
                    val = this.default[k];
                }
                if (val === 'true') {
                    return true;
                }
                if (val === 'false') {
                    return false;
                }
                return val;
            },
            set: function(k, v) {
                localStorage.setItem('getlink_' + k, v);
            }
        },
        domain, token;

    var getUpToken = function() {
        // Set logo color
        if (GL.isDefaultServer()) {
            $('.brand-logo').css('color', 'white');
        } else {
            $('.brand-logo').css('color', '#FBC605');
        }
        // Get uptoken
        $.post(GL.get('server'), {
            getlink_key: GL.get('authKey')
        }, function(data) {
            if (data.err) {
                Materialize.toast('Oops! Authorized error!', 5000);
            } else {
                token = data.token;
                domain = data.domain;
            }
        }).fail(function() {
            Materialize.toast('Oops! Get token error!', 5000);
        });
    };

    $('#getlink_default_server').change(function() {
        if ($(this).is(':checked')) {
            $('#getlink_server').prop('disabled', true);
            $('#getlink_auth_key').prop('disabled', true);
            $('#getlink_server').val(GL.get('server', true));
            $('#getlink_auth_key').val(GL.get('authKey', true));
        } else {
            $('#getlink_server').prop('disabled', false);
            $('#getlink_auth_key').prop('disabled', false);
            $('#getlink_server').val('').focus();
            $('#getlink_auth_key').val('');
        }
    });

    // Dropzone settings
    Dropzone.options.myAwesomeDropzone = {
        addRemoveLinks: true,
        maxFilesize: 100,
        maxFiles: 100,
        acceptedFiles: 'image/*',
        init: function() {
            var param = this.params;
            var self = this;
            this.on('sending', function(file, xhr, formData) {
                var filename = file.name;
                if (GL.get('isAutoRename')) {
                    var suffix = file.name.split('.').pop();
                    suffix = file.name.length - suffix.length <= 1 ? '' : ('.' + suffix);
                    filename = Math.random().toString(36).substring(5) + suffix;
                }
                formData.append('key', filename);
                formData.append('token', token);
            });
            this.on('success', function(file, response) {
                var fileUrl = domain + '/' + response.key;
                var preview = previewTemplate.format(
                    fileUrl,
                    '<img src="' + fileUrl + '">',
                    '![](' + fileUrl + ')'
                );
                $('#getlink_preview').append(preview);
                self.removeFile(file);
            });
        }
    };

    // Modal & SideNav init
    $(".button-collapse").sideNav();
    $('.modal-trigger').leanModal({
        ready: function() {
            $('#getlink_server').val(GL.get('server'));
            $('#getlink_auth_key').val(GL.get('authKey'));
            $('#getlink_default_server').prop('checked', GL.isDefaultServer());
            $('#getlink_auto_rename').prop('checked', GL.get('isAutoRename'));
            if (GL.isDefaultServer()) {
                $('#getlink_server').prop('disabled', true);
                $('#getlink_auth_key').prop('disabled', true);
            }
        },
        complete: function() {
            var server = $('#getlink_server').val(),
                authKey = $('#getlink_auth_key').val();

            // If input value is empty, then set it to default
            if (!server || !authKey) {
                server = GL.get('server', true);
                authKey = GL.get('authKey', true);
            }
            GL.set('server', server);
            GL.set('authKey', authKey);
            GL.set('isAutoRename', $('#getlink_auto_rename').is(':checked'));
            getUpToken();
        }
    });

    // ClipBoard
    var clipboard = new Clipboard('.copy-btn');
    clipboard.on('success', function(e) {
        $(e.trigger).parent().find('.fa-check').show();
        setTimeout(function() {
            $(e.trigger).parent().find('.fa-check').hide();
        }, 1000);
    });
    clipboard.on('error', function(e) {
        $(e.trigger).parent().find('.fa-times').show();
        setTimeout(function() {
            $(e.trigger).parent().find('.fa-times').hide();
        }, 1000);
    });

    // Let's Rock!
    getUpToken();
}());
