﻿(function (window, undefined) {
    var wordpress = {};
    var post = null;
    OAuthError = function(code, source) {
        console.log(arguments);
    };
    OAuthCallback = function (code, source) {
        wordpress.code = code;
        wordpress.source = source;
        var data = {
            code: code
        };
        $.ajax({
            url: '/api/2.0/files/wordpress-save',
            type: "POST",
            data: data,
            success: function (res) {
              udpateForm(res);
            },
        });
    };
    window.Asc.plugin.init = function (html) {
        getBlogInfo();
        $('#sent-auth, #update-auth').on('click', function () {
            showButtons(false);
            window.open("/thirdparty/wordpress.aspx", null, "width=500,height=700");
        });
        $('#delete-site').on('click', function () {
            if (confirm("Do you really want to delete this site?")) {
                $.ajax({
                    url: '/api/2.0/files/wordpress-delete',
                    type: "GET",
                    success: function (res) {
                        if (res.response.success) {
                            $('#main-container').addClass('unauthorized');
                            $('#main-container').removeClass('authorized');
                        }
                    },
                });
            } 
        });
        $('#publish').on('click', function() {
            if (post == null) {
                showButtons(false);
                post = {
                    code: wordpress.code,
                    title: $('#title')[0].value,
                    status: 1 //publish status code
                };
                window.Asc.plugin.executeMethod("GetFileHTML", []);
            }
        });
        $('#draft').on('click', function () {
            if (post == null) {
                showButtons(false);
                post = {
                    code: wordpress.code,
                    title: $('#title')[0].value,
                    status: 0 //draft status code
                };
                window.Asc.plugin.executeMethod("GetFileHTML", []);
            }
        });
    };

    window.Asc.plugin.onMethodReturn = function (returnValue) {
        var _plugin = window.Asc.plugin;
        if (_plugin.info.methodName == "GetFileHTML") {
            if (post != null) {
               
                var content = returnValue.replace(/&nbsp;/gi, '');

                content = content.replace(/&apos;/gi, '\'');
                post.content = content;

                sentToWordpress(post);
            }
        }
    };
    window.Asc.plugin.button = function (id) {
        this.executeCommand("close", '');
    };

    function sentToWordpress(data) {
        $.ajax({
            url: '/api/2.0/files/wordpress',
            type: "POST",
            data: data,
            success: function (res) {
                //TODO
                if (res.response) {
                    $('#title')[0].value = "";
                    if (post.status == 0)
                        alert("The current document was successfully saved on the website");
                    else
                        alert("The current document was successfully published on the website");
                        showButtons(true);
                } else {
                    alert("Error");
                }
                post = null;
            },
        });
    };

    function getBlogInfo() {
        $.ajax({
            url: '/api/2.0/files/wordpress-info',
            type: "GET",
            success: function (res) {
                udpateForm(res);
            },
            error: function (err) {
                $('#main-container').addClass('unauthorized');
                $('#main-container').removeClass('authorized');
            }
        });
    }

    function udpateForm(data) {
        if (data.response.success) {
            var info = JSON.parse(data.response.data);
            var host = new URL(info.URL).host;
            showButtons(true);
            $('#main-container').addClass('authorized');
            $('#main-container').removeClass('unauthorized');
            $('.blog p.blog-url').html(host);
            $('.blog p.username').html("@"+info.username);
        }else{
            $('#main-container').addClass('unauthorized');
            $('#main-container').removeClass('authorized');
        }
    };

    function showButtons(show){
        if(show){
            $('#publish-form .publish button').prop( "disabled", false );
            $('#publish-form .publish button').css('opacity', 1);
        }else{
            $('#publish-form .publish button').prop( "disabled", true );
            $('#publish-form .publish button').css( "opacity", 0.5 );
        }
    }
})(window);