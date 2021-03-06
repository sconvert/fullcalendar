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
			timeFormat: 'H:mm',
			slotLabelFormat: "HH:mm",
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
		  	var bh = view.options.businessHours, myDate = new Date(); // BusinessHours de la view
				myDate.setDate(myDate.getDate());

				if (bh.dow.indexOf(date.day()) === -1) { // Si le jour cliqué ne fait pas partie des businessHours
		     	console.log("La salle est fermée le week-end.");
		    }
				else if (date < myDate) { // Si le jour cliqué est passé
					console.log("Cette date est passée.");
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
		var fcDate, fcHourBegins, fcHourEnds;

		fcDate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
		fcHourBegins = $.fullCalendar.moment(start).format('HH:mm:ss');
		fcHourEnds = $.fullCalendar.moment(end).format('HH:mm:ss');

		$("#popupEvent #eventDate").val(fcDate);
		$("#popupEvent #eventHourbegin").val(fcHourBegins);
  	$("#popupEvent #eventHourend").val(fcHourEnds);
  	$("#popupEvent #eventTitle").val("");

  	openModal();
  };

  /// Validate new event and closes modal
  function validateEvent() {
		calendarSelector.fullCalendar('unselect');
    closeModal();
		// return false;
}


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


////////////////////////////////////////////////////////
/////////////////// FORM VALIDATION ////////////////////
////////////////////////////////////////////////////////

// Format time
$.validator.addMethod( "time", function( value, element ) {
  return this.optional( element ) || /^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test( value );
}, "Please enter a valid time, between 00:00 and 23:59" );

// Comparaison heure fin - heure début > 30 minutes
$.validator.addMethod("compareTime", function (value, element, param) {
  var diff = (new Date('2000/01/01 ' + value) - new Date('2000/01/01 ' + $(param).val()))/60000;
  return this.optional(element) || diff >= 30;
}, "Vous devez réserver la salle pour une durée minimale de 30 minutes.");

// Heure de début après 8h30 (Pas réussi à récupérer le param de fullCalendar)
  $.validator.addMethod("businesshoursstart", function (value, element) {
    var diff = new Date('2000/01/01 08:30:00') - new Date('2000/01/01 ' + value);
    return this.optional(element) || diff <= 0;
  }, "Vous ne pouvez pas réserver la salle avant 8h30.");

  // Heure de fin avant 20h00 (Pas réussi à récupérer le param de fullCalendar)
  $.validator.addMethod("businesshoursend", function (value, element) {
    var diff = new Date('2000/01/01 ' + value) - new Date('2000/01/01 20:00:00');
    return this.optional(element) || diff <= 0;
  }, "Vous ne pouvez pas réserver la salle après 20h.");

// Champ nom + prénom en au moins 2 mots (tous caractères ou tiret) séparés d'un espace.
$.validator.addMethod( "twowords", function( value, element ) {
  return this.optional( element ) || /^[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ \'\-]+\s[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ \-\s\']+$/i.test( value );
}, "Un nom et un prénom");

// Champ téléphone contient uniquement des chiffres et les caractères suivants : -_\/()+ ou espace. 10 caractères min.
$.validator.addMethod( "phonevalid", function( value, element ) {
  return this.optional( element ) || /^[0-9\-\s\_\\\/\+\(\)]{10,}$/i.test( value );
}, "Veuillez saisir un numéro de téléphone valide");

// Vérification de la date de validité de la date.
$.validator.addMethod( "datenotpassed", function( value, element ) {
  var todayDate = new Date(), selectedDate = new Date(value);
  return this.optional( element ) || selectedDate > todayDate;
}, "Date passée");

// Vérification date hors week-end.
  $.validator.addMethod( "dateopenday", function( value, element ) {
    var selectedDay, selectedDate = new Date(value);
    selectedDay = selectedDate.getDay();

    return this.optional ( element ) || (selectedDay != 0);
  }, "Pas de réservation le dimanche");

// Notes
// Date au format 2016/09/31 accepte les jours incorrects, pas le format 2016-09-31

$("#newEvent").validate({
  rules: {
    eventTitle: {
      required: true,
      minlength: 5
    },
    eventDescription: {
      required: true,
      minlength: 5
    },
    eventDate: {
      required: true,
      date: true,
    datenotpassed: true,
    dateopenday: true
    },
    eventHourbegin:{
      required: true,
      time: true,
      businesshoursstart: true
    },
    eventHourend: {
      required: true,
      time: true,
      businesshoursend: true,
      compareTime: "#eventHourbegin"
    },
    eventOrganizer: {
      required: true,
      twowords: true
    },
    eventEmail: {
        required: true,
        email: true
      },
    eventPhone: {
      required: true,
      phonevalid: true
    }
  },
  messages: {
    eventTitle: {
      required: "Veuillez saisir un titre pour votre événement.",
      minlength: "Le titre doit faire au moins 5 caractères."
    },
    eventDescription:  {
      required: "Veuillez saisir une description de votre événement.",
      minlength: "La decription doit faire au moins 5 caractères."
    },
    eventDate: { // Attention à vérifier que la date est dans le futur.
      required: "Veuillez saisir une date.", // A changer sans doute pour une fonction perso.
      date: "Format : 2016-05-23",
      datenotpassed: "Désolé, mais cette date est déjà passée.",
      dateopenday: "Vous ne pouvez pas réserver le week-end."
    },
    eventHourbegin: {
      required: "Veuillez saisir un horaire de début",
      time: "Le format est le suivant : 12:30:00",
      businesshoursstart: "Vous ne pouvez pas réserver la salle avant 8h30"
    },
    eventHourend: {
      required: "Veuillez saisir un horaire de fin",
      time: "Le format est le suivant : 12:30:00",
      businesshoursend: "Vous ne pouvez pas réserver la salle après 20h",
      compareTime: "Vous devez réserver la salle pour une durée minimale de 30 minutes." // A tester avec d'autres navs
    },
    eventOrganizer: {
      required: "Veuillez saisir vos nom et prénom",
      twowords: "Veuillez saisir nom et prénom."
    },
    eventEmail: {
      required: "Veuillez saisir une adresse mail",
      email: "Veuillez saisir une adresse mail valide"
    },
    eventPhone: {
      required: "Veuillez saisir un numéro de téléphone.",
      phonevalid: "Veuillez saisir un numéro de téléphone valide."
    }
  },
  submitHandler: function() {
    validateEvent();
  }
});
});
