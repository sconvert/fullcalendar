$(document).ready(function() {
  ////////////////////////////////////////////////////////
  /////////////// FULL CALENDAR INIT /////////////////////
  ////////////////////////////////////////////////////////

  $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    // Default date = today
    defaultDate: $.fullCalendar.moment(new Date()).format(),
    defaultView: 'month',
    selectable: {
      month: false,
      agenda: true
   },
    selectHelper: false,
    businessHours: {
      start: '10:00',
      end: '18:00',
      dow: [ 1, 2, 3, 4, 5 ]
      },
    selectConstraint: 'businessHours', 

    dayClick: function(date, jsEvent, view) {
      var bh = view.options.businessHours; // BusinessHours de la view

      if (bh.dow.indexOf(date.day()) === -1) { // Si le jour cliqué ne fait pas partie des businessHours
        alert("La salle est fermée le week-end.");
        }
      else {
        if (view.name === "month") {
          $('#calendar').fullCalendar('changeView', 'agendaDay');
          $('#calendar').fullCalendar('gotoDate', date);
        }
      }
    },

    select: function(start, end) {
      addEventData(start, end);
    },
    editable: false, // Other events may not be moved.
    eventLimit: true, // allow "more" link when too many events
    events: 'bdrest.json'
  });

  ////////////////////////////////////////////////////////
  ////////////////// EVENTS TREATMENT  ///////////////////
  ////////////////////////////////////////////////////////
  function addEventData(start, end) {
    var b, e, actualView = $('#calendar').fullCalendar('getView');

    b = $.fullCalendar.moment(start).format();
    e = $.fullCalendar.moment(end).format();

    if (actualView.type == 'month'){
      b += "T08:00:00";
      e += "T18:00:00";
    }

    $("#popupEvent #eventDatebegin").val(b);
    $("#popupEvent #eventDateend").val(e);
    $("#popupEvent #eventTitle").val("");

    openModal();
  };

/// Validate new event and closes modal
function validateEvent() {
  var title  = $("#popupEvent #eventTitle").val(),
      startDate = $("#popupEvent #eventDatebegin").val(),
      endDate = $("#popupEvent #eventDateend").val();

    if (title) {
      eventData = {
        title: title,
        start: startDate,
        end: endDate,
        color: "#84B1C8"
      };
    }

    if (eventData) {
      $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
    }
  $('#calendar').fullCalendar('unselect');

  loadAjax("test.php", ajaxCallback, eventData);

  return false;
  }


  $("#newEvent").on("submit", function() {
    validateEvent();
    return false;
  })


  ////////////////////////////////////////////////////////
  ////////////////////// MODAL BOX ///////////////////////
  ////////////////////////////////////////////////////////

  function openModal() {
    var popID = "#popupEvent";

    $(popID).find("#popupTitle").text("Données de votre événement");
    $(popID).find("#returnEvent").css("display", "none");
    $(popID).find("#newEvent").css("display", "block");

    $(popID).fadeIn();

    var popMargTop = ($(popID).height() + 80) / 2;
    var popMargLeft = ($(popID).width() + 80) / 2;

    $(popID).css({
      'margin-top' : -popMargTop,
      'margin-left' : -popMargLeft
    });

    //Effet fade-in du fond opaque
    $('body').append('<div id="fade"></div>'); //Ajout du fond opaque noir
    //Apparition du fond - .css({'filter' : 'alpha(opacity=80)'}) pour corriger les bogues de IE
    $('#fade').css({'filter' : 'alpha(opacity=80)'}).fadeIn();

    return false;
  };


function closeModal() {
  $('#fade , .popup_block').fadeOut(function() {
    $('#fade').remove();  //...ils disparaissent ensemble
  });
}

// Close popup on click on close button
  $('a.close, #fade').on('click', function() {
    closeModal();
    return false;
  });


  $("#returnEvent").on("submit", function() {
    closeModal();
    return false;
  })

});

////////////////////////////////////////////////////////
///////////////////////// AJAX /////////////////////////
////////////////////////////////////////////////////////
function formatdatapost(data) {
  var temp = "";

  $.each( data, function( key, value ) {
    temp += "&" + key + "=" + value;
  });

  // Supprimer le premier "&"
  temp = temp.substr(1, temp.length);
  return temp;
}


function loadAjax(url, cfunc, data) {
  var xhttp, datasent;
  xhttp=new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      cfunc(xhttp);
    }
  };
  datasent = formatdatapost(data);
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(datasent);
  }

  function ajaxCallback(mxhttp) {
    var popID = "#popupEvent";

    mxhttp.responseText;
    $(popID).find("#popupTitle").text("Votre réservation suivante :");
    $(popID).find("#returnEvent").css("display", "block");
    $(popID).find("#newEvent").css("display", "none");
    $(popID).find("#texteAjax").html(mxhttp.responseText + "<br /><br />est en attente de validation.");
  }
