// load configuration data from data.json
function loadConfiguration() {
  showLoader("#home");
  $.ajax({
    url: "data/data.json",
    dataType: "json",
  }).done(function(data, textStatus, jqXHR) {
    $("#version").html(data.version);
    populateCams(data);
    populateActions(data);
    hideLoader("#home");
  }).fail(function(jqXHR, textStatus, errorThrown) {
    showMessage("Si &egrave; verificato un errore: ["
      + textStatus + "]", "alert-danger");
  });
  jQuery("#menu a").each(function(index) {
    $(this).on("click", function(e) {
      e.preventDefault();
      $(".app-panel").addClass("hidden");
      $($(this).attr("href")).removeClass("hidden");
    });
  });
}

// populate actions
function populateActions(data) {
  $("#save_configuration").on("click", saveConfiguration);
  if (data && data.cams) {
    $("#home .camaction button").each(function(index) {
      var i = (!index%5 ? index : Math.floor(index/5));
      var code = data["cams"][i]["code"];
      var action = "";
      switch(index) {
        case 0 :
          action = "_on";
          break;
        case 1 :
          action = "_off";
          break;
        case 2 :
          action = "_record";
          break;
        case 3 :
          action = "_snap";
          break;
        case 4 :
          action = "_load";
          break;
      }
      $(this).attr("cam-code", code);
      $(this).attr("cam-action", action);
      $(this).on("click", execute);
    });
  }
}

// populate name of cameras
function populateCams(data) {
  if (data && data.cams) {
    $("#home .camname").each(function(index) {
      $(this).html(data["cams"][index]["name"]);
    });
    $("#settings .camname").each(function(index) {
      $(this).val(data["cams"][index]["name"]);
    });
    $("#settings .camip").each(function(index) {
      $(this).val(data["cams"][index]["ip"]);
    });
    $("#settings .videolength").val(data["duration"]);
  } else {
    showMessage("Si &egrave; verificato un errore: ["
      + "Impossibile recuperare i nomi delle camere!" + "]", "alert-danger");
  }
}

// save configuration to data.json
function saveConfiguration() {
  showLoader("#settings");
  var data = '{ "cams" : [';
  var cams = $("#settings .camname");
  var ips = $("#settings .camip");
  var duration = $("#settings .videolength").val();
  for (var i = 0; i < cams.length; i++) {
    data += '"' + $(cams[i]).val() + '",';
  }
  data = data.substring(0, data.length - 1)
      + '], "ips" : [';
  for (var i = 0; i < ips.length; i++) {
    data += '"' + $(ips[i]).val() + '",';
  }
  data = data.substring(0, data.length - 1)
      + '], "duration" : "' + duration + '" }';
  $.ajax({
    url: "data/save_configuration.php",
    method: "GET",
    contentType: 'text/plain; charset=utf-8',
    data: { data : data },
    dataType: 'json'
  }).done(function(data, textStatus, jqXHR) {
    showMessage("Configurazione salvata con successo!", "alert-success");
    populateCams(data);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    showMessage("Si &egrave; verificato un errore: ["
      + textStatus + "]", "alert-danger");
  }).always(function() {
    hideLoader("#settings");
  });
}

// execute "action" for camera
function execute() {
  var camera = $(this).attr("cam-code");
  var action = $(this).attr("cam-action");
  var ip = $($("#settings .camip")[camera]).val();
  showLoader("#home");
  $.ajax({
    url: "http://" + ip + "/securpeye/data/execute.php",
    method: "GET",
    contentType: 'text/plain; charset=utf-8',
    data: { action : action },
    dataType: 'json'
  }).done(function(data, textStatus, jqXHR) {
    complete(data, ip);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    showMessage("Si &egrave; verificato un errore: ["
      + textStatus + "]", "alert-danger");
    hideLoader("#home");
  });
}

// complete "action" for camera
function complete(data, ip) {
  if (data.status == "ok") {
    hideIframe();
    hideArchive();
    if (data.port) {
      showIframe("http://" + ip + ":" + data.port);
    } else if (data.files) {
      showArchive(data.files, ip);
    } else {
      showMessage("Operazione completata con successo!", "alert-success");
    }
  } else {
    showMessage("Si &egrave; verificato un errore : [" + 
      data.status + "]", "alert-danger");
  }
  hideLoader("#home");
};

// show iframe
function showIframe(url) {
  showLoader("#video");
  $("#video-frame").attr("src", url);
  setTimeout(function () {
    $("#video-frame").attr("src", $("#video-frame").attr("src"));
    hideLoader("#video");
  }, 3000);
}

// hide iframe
function hideIframe() {
  $("#video-frame").attr("src", "");
  $("#video").addClass("hidden");
}

function showArchive(list, ip) {
  if (!list || !list.length) {
    showMessage("Si &egrave; verificato un errore : [" + 
      "Non ci sono files video o foto da mostrare]", "alert-danger");
  } else {
    showLoader("archive");
    var html = '<ul class="list-group">';
    for (var i = 0; i < list.length; i++) {
      html += '<li class="list-group-item"><a target="_blank" href="http://'
 	+ ip + '/securpeye/data/snaps/' + list[i] + '">' + list[i] + '</a></li>';
    }
    html += "</ul>";
    $("#archive").html(html);
    hideLoader("#archive");
  }
}

function hideArchive() {
  $("#archive").addClass("hidden");
  $("#archive").html("");
}

// show loader
function showLoader(page) {
  $("#progress").removeClass("hidden");
  $(page).addClass("hidden");
}

// hide loader
function hideLoader(page) {
  $("#progress").addClass("hidden");
  $(page).removeClass("hidden");
}

// show alert message
function showMessage(msg, status) {
  $("#message").html(msg).removeClass("hidden").addClass(status);
  setTimeout(hideMessage, 6000);
}

// hide alert message
function hideMessage() {
  $("#message").html("").removeClass().addClass("alert hidden");
}

// start!
if (typeof jQuery !== 'undefined') {
  jQuery(window).ready(loadConfiguration);
}
