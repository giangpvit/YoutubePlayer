// This script is Automatic generation by tapper

var Tapper = Tapper || {}

var Tapper_Debug = false;
var Tapper_Debug_Host = "pepper.local";

Tapper.session = null;
Tapper.proxy = {}

/**
 * Core
 */
Tapper.core = function ($) {

    // T.B.D
    var PROXY_LEN = 2;
    // connect alproxy.
    var _connect = function (callback) {
        var proxy_num = PROXY_LEN;

        var get_service = function (name) {
            Tapper.session.service(name).then(
                // onSuccess.
                function (proxy) {
                    Tapper.proxy[name] = proxy;
                    proxy_num--;
                    if (proxy_num <= 0) callback();
                },
                // onFailed.
                function (error) {
                    console.error(error);
                    result_func();
                }
            );
        };

        QiSession(function (session) {
            Tapper.session = session;

            get_service('ALMemory');
            get_service('ALTabletService');
        }, null, Tapper_Debug ? Tapper_Debug_Host : null);
    };

    var _bind = function () {
        // bind events.
        Tapper.utl.subscribeEvent("Tapper/View/ChangeScene", function (id) {
            Tapper.view.changeScene(id);
        });

        Tapper.utl.subscribeEvent("YoutubePlayer/Control/Recognition", function (id) {
            Tapper.utl.raiseEvent("YoutubePlayer/View/Search", id);
            $("#modalContent").text(id);
            $("#input-search").val(id);
            var modal = document.getElementById('myModal');
            setTimeout(function() {
                modal.style.display = "none";
            }, 10000);
        });

        Tapper.utl.subscribeEvent("YoutubePlayer/Control/NoRecognition", function (id) {
            $("#modalContent").text(id);
            Tapper.utl.raiseEvent("YoutubePlayer/View/Search", id);
            var modal = document.getElementById('myModal');
            setTimeout(function() {
                modal.style.display = "none";
            }, 10000);
        });

        Tapper.utl.subscribeEvent("YoutubePlayer/Control/Processing", function (id) {
            $("#modalContent").text(id);
        });
    };

    var _self = {
        init: function () {
            Tapper.view.changeScene('{"id":"pageSearch"}');
            Tapper.view.init();
            Tapper.contents.onLoad();
            _connect(function () {
                _bind();
                // Tapper.utl.getData("Tapper/InitData", function (data) {
                //     Tapper.init_data = JSON.parse(data);
                //     Tapper.contents.onStart();
                // }, Tapper.contents.onStart);
                // _preload_img();
                // Tapper.audio.init();
            });
        }
    };
    return _self;
}(jQuery);


/**
 * Common utility
 */
Tapper.utl = {
    raiseEvent: function (name, val) {
        Tapper.proxy.ALMemory.raiseEvent(name, val);
    },
    subscribeEvent: function (name, func) {
        var evt = new EventSubscription(name);
        Tapper.proxy.ALMemory.subscriber(name).then(function (sub) {
            evt.setSubscriber(sub);
            sub.signal.connect(func).then(function (id) {
                evt.setId(id);
            });
        });
        return evt;
    },
    getData: function (name, succeeded, failed) {
        Tapper.proxy.ALMemory.getData(name).then(succeeded, failed);
    }
};


/**
 * View utility
 */
Tapper.view = {
    init: function () {
      $("#btn-search").on('click touchstart', function () {
        $(this).css('background-color', 'gray');
        // Tapper.view.changeScene('{"id":"pageResults"}');
        window.location.href = 'listVideos.html';
        localStorage.setItem("keyword", $("#input-search").val());
        Tapper.utl.raiseEvent("YoutubePlayer/View/Search", "Search");
      }).on('click touchend', function () {
        $(this).css('background-color', 'inherit');
      });

      $("#btn-stop").on('click touchstart', function () {
        localStorage.removeItem('keyword');
        localStorage.removeItem('pageToken');
        localStorage.removeItem('listvideo');
        Tapper.utl.raiseEvent("YoutubePlayer/View/Stop", "Stop");
      });

      $("#btn-back").on('click touchstart', function () {
        window.location.href = 'listVideos.html';
      });

      $("#btn-voice").on('click touchstart', function () {
        $(this).css('background-color', 'gray');
        Tapper.utl.raiseEvent("YoutubePlayer/View/Voice", "Voice");
      }).on('click touchend', function () {
        $(this).css('background-color', 'inherit');
        });

        // Get the modal
        var modal = document.getElementById('myModal');
        // Get the button that opens the modal
        var btn_voice = document.getElementById("btn-voice");
        // Get the <span> element that closes the modal
        var btn_close = document.getElementsByClassName("close")[0];
        // When the user clicks the button, open the modal
        btn_voice.onclick = function() {
            modal.style.display = "block";
        }
        // When the user clicks on <span> (x), close the modal
        btn_close.onclick = function() {
            modal.style.display = "none";
            Tapper.utl.raiseEvent("YoutubePlayer/Control/StopVoice", "Stop");
        }
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
        //$('section#pageSearch').hide();
        // When the user clicks on <span> (x), close the modal
      // $("#closePopup").on('click touchstart', function () {
      //   $("#myModal").style.display = "none";
      //   Tapper.utl.raiseEvent("YoutubePlayer/Control/StopVoice", "Stop");
      // });
      // When the user clicks anywhere outside of the modal, close it
      // window.on('click touchstart', function (e) {
      //   var modal = document.getElementById('myModal');
      //   if (e.target == modal) {
      //     modal.style.display = "none";
      //     Tapper.utl.raiseEvent("YoutubePlayer/Control/StopVoice", "Stop");
      //   }
      // });
    },
    changeScene: function (request) {
        request = $.parseJSON(request);
        var scene_id = request.id;
        $('section#' + scene_id).show();
        $('section:not(#' + scene_id + ')').hide();
        try {
            //Tapper.contents[scene_method](request.param);
        } catch (e) {
            console.error("Undefined scene" + scene_id + ".")
        }
    }//,
    // buttonSelect: function (id) {
    //     var scene_id = parseInt(id, 10);
    //     var node = $('[data-btn-id=' + scene_id + ']');
    //     if(node){
    //         $('#filter').show();
    //         node.removeClass('touched');
    //         node.addClass('selected');
    //         Tapper.utl.raiseEvent("Tapper/View/ButtonTouched", node.attr('data-btn-id'));
    //     }
    // },
    // buttonReset: function (id) {
    //     $('[data-btn-id].selected').removeClass('selected');
    // }
};


/**
 * SubscribeEvent info class
 */
function EventSubscription(event) {
    this._event = event;
    this._internalId = null;
    this._sub = null;
    this._unsubscribe = false;
}
EventSubscription.prototype.setId = function (id) {
    this._internalId = id;
}
EventSubscription.prototype.setSubscriber = function (sub) {
    this._sub = sub;
}
EventSubscription.prototype.unsubscribe = function () {
    if (this._internalId != null && this._sub != null) {
        this._sub.signal.disconnect(this._internalId);
    } else {
        this._unsubscribe = true;
    }
}

$(Tapper.core.init);
