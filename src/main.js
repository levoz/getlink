(function() {
    // 'This is a {0} {1} function'.format('string', 'format')
    // ==> 'This is a string format function'
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
            });
        };
    }

    // Constant
    var previewTemplate = '\
        <div class="col s12 m6 l3">\
        <div class="card hoverable">\
            <div class="card-image">\
                <img class="materialboxed" src="{5}" {3}>\
            </div>\
            <div class="card-action">\
                <a style="margin-right: 8px;" class="copy-btn" data-clipboard-text=\'{0}\'>URL</a>\
                <a style="margin-right: 8px;display: {4}" class="copy-btn" data-clipboard-text=\'{1}\'>HTML</a>\
                <a style="margin-right: 8px;display: {4}" class="copy-btn" data-clipboard-text=\'{2}\'>Markdown</a>\
                <i class="fa fa-check"></i>\
                <i class="fa fa-times"></i>\
                <i class="right fa fa-trash getlink-remove"></i>\
            </div>\
        </div>\
    </div>\
    ';

    // Settings localStorage methods
    var GL = {
            default: {
                server: 'https://pub.get-link.xyz/uptoken',
                authKey: 'getlink',
                preffix: '',
                fixHeight: 'true',
                isAutoRename: 'true'
            },
            isDefaultServer: function() {
                if (this.get('server') === this.default['server'] && this.get('authKey') === this.default['authKey']) {
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
            },
            addUrl: function(url) {
                var urls = JSON.parse(localStorage.getItem('getlink_urls')) || [];
                urls.unshift(url);
                localStorage.setItem('getlink_urls', JSON.stringify(urls));
            },
            getUrls: function() {
                return JSON.parse(localStorage.getItem('getlink_urls')) || [];
            },
            removeUrl: function(url) {
                var urls = JSON.parse(localStorage.getItem('getlink_urls')) || [];
                urls.splice(urls.indexOf(url), 1);
                localStorage.setItem('getlink_urls', JSON.stringify(urls));
                return urls;
            },
            removeAllUrls: function() {
                localStorage.setItem('getlink_urls', '[]');
            }
        },
        domain,
        token;

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

    var updateExtension = function(server, authKey) {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            // https://goo.gl/S7YxOS && https://goo.gl/zgZnjG
            var editorExtensionId = "fmlfbdbgfhlppienpoodlglaecilpgml";
            chrome.runtime.sendMessage(editorExtensionId, {
                method: 'setStorage',
                data: {
                    server: server,
                    authKey: authKey
                }
            });
        }
    };

    var getFileUrl = function(url) {
        if (/\.(gif|jpe?g|tiff|png|bmp|ico)$/.test(url)) {
            return url;
        }
        return 'https://dn-getlink.qbox.me/no_preview.jpg';
    };

    var getDisplayStyle = function(url) {
        if (/\.(gif|jpe?g|tiff|png|bmp|ico)$/.test(url)) {
            return 'inline';
        }
        return 'none';
    };

    var reloadGallery = function() {
        $('.getlink-remove-all').hide();
        $('.card').parent().remove();
        GL.getUrls().forEach(function(fileUrl) {
            var preview = previewTemplate.format(fileUrl, '<img src="' + fileUrl + '">', '![](' + fileUrl + ')', GL.get('fixHeight')
                ? 'height="200px"'
                : '', getDisplayStyle(fileUrl), getFileUrl(fileUrl));
            $('#getlink_preview').append(preview);
            $('.getlink-remove-all').show();
        });
        $('.materialboxed').materialbox();
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

    $('body').on('click', '.getlink-remove', function() {
        $(this).parents('.card').parent().remove();
        var urls = GL.removeUrl($(this).parents('.card').find('img').attr('src'));
        if (urls.length === 0) {
            $('.getlink-remove-all').hide();
        }
    });

    $('.getlink-remove-all').click(function() {
        $('.card').parent().remove();
        $(this).hide();
        GL.removeAllUrls();
    });

    // Dropzone settings
    Dropzone.options.myAwesomeDropzone = {
        addRemoveLinks: true,
        maxFilesize: 100,
        maxFiles: 100,
        init: function() {
            var param = this.params;
            var self = this;
            this.on('sending', function(file, xhr, formData) {
                var filename = file.name;
                if (GL.get('isAutoRename')) {
                    var suffix = file.name.split('.').pop();
                    suffix = file.name.length - suffix.length <= 1
                        ? ''
                        : ('.' + suffix);
                    filename = Math.random().toString(36).substring(5) + suffix;
                }
                formData.append('key', GL.get('preffix') + filename);
                formData.append('token', token);
            });
            this.on('success', function(file, response) {
                var fileUrl = domain + '/' + response.key;
                var preview = previewTemplate.format(fileUrl, '<img src="' + fileUrl + '">', '![](' + fileUrl + ')', GL.get('fixHeight')
                    ? 'height="200px"'
                    : '', getDisplayStyle(fileUrl), getFileUrl(fileUrl));
                $('#getlink_preview').prepend(preview);
                $('.getlink-remove-all').show();
                GL.addUrl(fileUrl);
                $('.materialboxed').materialbox();
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
            $('#getlink_preffix').val(GL.get('preffix'));
            $('#getlink_default_server').prop('checked', GL.isDefaultServer());
            $('#getlink_auto_rename').prop('checked', GL.get('isAutoRename'));
            $('#getlink_fixheight').prop('checked', GL.get('fixHeight'));
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
            updateExtension(server, authKey);
            GL.set('preffix', $('#getlink_preffix').val())
            GL.set('isAutoRename', $('#getlink_auto_rename').is(':checked'));
            GL.set('fixHeight', $('#getlink_fixheight').is(':checked'));
            reloadGallery();
            getUpToken();
        }
    });

    // ClipBoard
    var clipboard = new Clipboard('.copy-btn');
    clipboard.on('success', function(e) {
        $(e.trigger).parent().find('.fa-check').css('visibility', 'visible');
        setTimeout(function() {
            $(e.trigger).parent().find('.fa-check').css('visibility', 'hidden');
        }, 1000);
    });
    clipboard.on('error', function(e) {
        $(e.trigger).parent().find('.fa-times').css('visibility', 'visible');
        setTimeout(function() {
            $(e.trigger).parent().find('.fa-times').css('visibility', 'hidden');
        }, 1000);
    });

    // Let's Rock!
    reloadGallery();
    getUpToken();
}());
