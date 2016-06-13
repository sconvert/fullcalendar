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
    selectable: true,
    selectHelper: false,
    businessHours: {
      start: '10:00',
      end: '18:00',
      dow: [ 1, 2, 3, 4, 5 ]
      },
    selectConstraint: 'businessHours', // Ca, ça marche, mais du coup, on ne peut pas sélectionner une journée.

    dayClick: function(date, jsEvent, view) {
      //if ($.fullCalendar.businessHours.contains(date)) console.log ("ok");
        console.log( $('#calendar').fullCalendar('businessHours'));
        if (view.name === "month") {
            $('#calendar').fullCalendar('gotoDate', date);
            $('#calendar').fullCalendar('changeView', 'agendaDay');
        }
      },

    select: function(start, end) {
      addEventData(start, end);
    },
    editable: false, // Other events may not be moved.
    eventLimit: true, // allow "more" link when too many events
    events: 'http://localhost/webians/fullCalendar/bdrest.json'
  });


  ////////////////////////////////////////////////////////
  ////////////////// EVENTS TREATMENT  ///////////////////
  ////////////////////////////////////////////////////////
  function addEventData(start, end) {
    var d, e;
alert(start + " " + end);
    d = $.fullCalendar.moment(start).format();
    e = $.fullCalendar.moment(end).format();
    alert($.fullCalendar.moment(start) + " " + $.fullCalendar.moment(end));

    $("#popupEvent #eventDatebegin").val(d);
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

  loadAjax("http://localhost/webians/fullCalendar/test.php", ajaxCallback, eventData);

  // closeModal();

  return false;
  }

  /*$("#validateEventbutton").on("click", function() {
    validateEvent();
    return false;
  })*/

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

/*  $("popupEvent").find("#returnEvent").on("submit", function() {
    alert("Vu");
    closeModal();
    return false;
  })*/

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
//    alert("Hello from Ajax " + mxhttp.responseText);
  }

/*  $("#okbutton").on("click", function() {
    closeModal();
  })*/
