(function() {
    // 'This is a {0} {1} function'.format('string', 'format')
    // ==> 'This is a string format function'
    if (!String.prototype.format) {
      String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
          return typeof args[number] != 'undefined'
            ? args[number]
            : match
          ;
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
    var DEFAULT = {
        server: 'https://pub.get-link.xyz/uptoken',
        authKey: 'getlink',
        defaultServer: 'true',
        autoRename: 'true'
    };
    var STORAGE = {
        server: 'getlink_server',
        authKey: 'getlink_authKey',
        defaultServer: 'getlink_defaultServer',
        autoRename: 'getlink_autoRename'
    };
    var CONFIG = {
        server: localStorage.getItem(STORAGE.server) || DEFAULT.server,
        authKey: localStorage.getItem(STORAGE.authKey) || DEFAULT.authKey,
        defaultServer: localStorage.getItem(STORAGE.defaultServer) || DEFAULT.defaultServer,
        autoRename: localStorage.getItem(STORAGE.autoRename) || DEFAULT.autoRename
    };
    var domain, token;

    var getUpToken = function() {
        $.post(CONFIG.server, {
            getlink_key: CONFIG.authKey
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

    // Settings event
    $('#getlink_default_server').change(function() {
        if ($(this).is(':checked')) {
            $('#getlink_server').prop('disabled', true);
            $('#getlink_auth_key').prop('disabled', true);
            CONFIG.defaultServer = 'true';
            CONFIG.server = DEFAULT.server;
            CONFIG.authKey = DEFAULT.authKey;
            $('#getlink_server').val(CONFIG.server);
            $('#getlink_auth_key').val(CONFIG.authKey);
        } else {
            CONFIG.defaultServer = 'false';
            $('#getlink_server').prop('disabled', false);
            $('#getlink_auth_key').prop('disabled', false);
            $('#getlink_server').val('');
            $('#getlink_auth_key').val('');
        }
    });
    $('#getlink_auto_rename').change(function() {
        if ($(this).is(':checked')) {
            CONFIG.autoRename = 'true';
        } else {
            CONFIG.autoRename = 'false';
        }
    });
    $('#getlink_confirm_btn').click(function() {
        CONFIG.server = $('#getlink_server').val();
        CONFIG.authKey = $('#getlink_auth_key').val();
        CONFIG.defaultServer = $('#getlink_default_server').is(':checked') + '';
        CONFIG.autoRename = $('#getlink_auto_rename').is(':checked') + '';
        localStorage.setItem(STORAGE.server, CONFIG.server);
        localStorage.setItem(STORAGE.authKey, CONFIG.authKey);
        localStorage.setItem(STORAGE.defaultServer, CONFIG.defaultServer);
        localStorage.setItem(STORAGE.autoRename, CONFIG.autoRename);
        getUpToken();
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
                if (CONFIG.autoRename === 'true') {
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
                    '![](' + fileUrl+ ')'
                );
                $('#getlink_preview').append(preview);
                self.removeFile(file);
            });
        }
    };

    (function init() {
        // Settings init
        $('#getlink_server').val(CONFIG.server);
        $('#getlink_auth_key').val(CONFIG.authKey);
        $('#getlink_default_server').prop('checked', CONFIG.defaultServer === 'true');
        $('#getlink_auto_rename').prop('checked', CONFIG.autoRename === 'true');
        if (CONFIG.defaultServer === 'true') {
            $('#getlink_server').prop('disabled', true);
            $('#getlink_auth_key').prop('disabled', true);
        }

        // Get uptoken for upload
        getUpToken();

        // Modal & SideNav init
        $(".button-collapse").sideNav();
        $('.modal-trigger').leanModal();

        // ClipBoard
        var clipboard = new Clipboard('.copy-btn');
        clipboard.on('success', function(e) {
            $(e.trigger).parent().find('.fa-check').show();
            setTimeout(function () {
                $(e.trigger).parent().find('.fa-check').hide();
            }, 1000);
        });
        clipboard.on('error', function(e) {
            $(e.trigger).parent().find('.fa-times').show();
            setTimeout(function () {
                $(e.trigger).parent().find('.fa-times').hide();
            }, 1000);
        });
    })();
}());
