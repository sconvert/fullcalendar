$(document).ready(function() {//FULL CALENDAR

	var calendarSelector = $('#calendar'), pagelang;
	
	if ($('html').attr('lang') == "en") pagelang = "en";
	else pagelang = "fr";

	var loadFullCalendar = function(){
		calendarSelector.fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'

			},
			lang: pagelang,
			defaultDate: $.fullCalendar.moment(new Date()).format(),
			selectable: true,
			selectHelper: false,
			select: function(start, end) {
				addEventData(start, end);
			},
			firstDay: 1,
			businessHours: {
				start: '08:30',
				end: '18:00',
				dow: [ 1, 2, 3, 4, 5 ]
			},
			allDaySlot: false,
			dayClick: function(date, jsEvent, view) {
		  	var bh = view.options.businessHours; // BusinessHours de la view

				if (bh.dow.indexOf(date.day()) === -1) { // Si le jour cliqué ne fait pas partie des businessHours
		     	console.log("La salle est fermée le week-end.");
		    }
		    else {
		     	if (view.name === "month") {
		     		calendarSelector.fullCalendar('gotoDate', date);
		     		calendarSelector.fullCalendar('changeView', 'agendaDay');
					}
		    }
 			},
			// Deals with fc-message.
			eventAfterAllRender: function(view) {
				if (view.name != "month") {
					if (calendarSelector.find('.fc-toolbar > .fc-message').length > 0) {
						calendarSelector.find('.fc-message').html("<h2>Choisissez votre horaire</h2>");
					}
					else {
						calendarSelector.find('.fc-toolbar').append('<div class="fc-message"><h2>Choisissez votre horaire</h2></div>');
					}
				}
				else {
					calendarSelector.find('.fc-message').remove();
				}
			},
			selectConstraint: 'businessHours',
			editable: false, // Other events may not be moved.
			eventLimit: true, // allow "more" link when too many events
			//      events: '/restcalendar/' + drupalSettings.webians.salle.nid // attention, si script inclu trop tôt, pas initialisé
			events: 'bdrest.json'

		});
	}


	loadFullCalendar();


	 ////////////////////////////////////////////////////////
  ////////////////// EVENTS TREATMENT  ///////////////////
  ////////////////////////////////////////////////////////
  function addEventData(start, end) {
  	var fcDateBegins, fcDateEnds, fcHourBegins, fcHourEnds;

  	fcDateBegins = $.fullCalendar.moment(start).format('YYYY-MM-DD');
  	fcDateEnds = $.fullCalendar.moment(end).format('YYYY-MM-DD');
  	fcHourBegins = $.fullCalendar.moment(start).format('HH:mm:ss');
  	fcHourEnds = $.fullCalendar.moment(end).format('HH:mm:ss');

  	console.log(fcDateBegins);

  	$("#popupEvent #eventDatebegin").val(fcDateBegins);
  	$("#popupEvent #eventDateend").val(fcDateEnds);
  	$("#popupEvent #eventHourbegin").val(fcHourBegins);
  	$("#popupEvent #eventHourend").val(fcHourEnds);
  	$("#popupEvent #eventTitle").val("");

  	openModal();
  };

  /// Validate new event and closes modal
  function validateEvent() {

		calendarSelector.fullCalendar('unselect');

    // closeModal();

    return false;
}

$("#newEvent").on("submit", function() {
	validateEvent();
	return false;
});


  ////////////////////////////////////////////////////////
  ////////////////////// MODAL BOX ///////////////////////
  ////////////////////////////////////////////////////////

  function openModal() {
  	var popID = "#popupEvent";

  	$(popID).find("#popupTitle").text("Données de votre événement");
  	$(popID).find("#returnEvent").css("display", "none");
  	$(popID).find("#newEvent").css("display", "block");

  	$(popID).fadeIn();

  	// var popMargLeft = ($(popID).width() + 80) / 2;

  	// $(popID).css({
  	// 	'margin-left' : -popMargLeft
  	// });

    //Effet fade-in du fond opaque
    $('body').append('<div id="fade"></div>'); //Ajout du fond opaque noir
    //Apparition du fond - .css({'filter' : 'alpha(opacity=80)'}) pour corriger les bogues de IE
    $('#fade').css({'filter' : 'alpha(opacity=80)'}).fadeIn();

    return false;
};


function closeModal() {
	$('#fade , .popup_block').fadeOut(function() {
		$('#fade').remove();
	});
}

$('a.close, #fade').on('click', function() {
	closeModal();
	return false;
});

})
