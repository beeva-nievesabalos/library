
/*
 *  USE: node js module googleapis (alpha)!!
 * 
 *  GOOGLE Calendar API v3:
 *  API Reference: https://developers.google.com/google-apps/calendar/v3/reference/  <-- ver json devueltos
 *  APIS explorer: https://developers.google.com/apis-explorer/#p/calendar/v3/
 *  OAuth 2.0: https://developers.google.com/google-apps/calendar/auth
*/
var app_config = require("./googleappconfig"); 
var googleapis = require('googleapis');
var async = require('async');

idTodayEvent = 3;
idListCalendar = 4;
hashCalNotif = 0;

/***************************************************************/
/*
 *  Agent:      CALENDAR!!!!
 */
/**
* agendaHoy (EXT + INT). Lista los eventos de HOY del calendario PRINCIPAL del usuario
* @param user = nameUser (ALIAS)
* @param hashNotif = hash
*/
exports.agendaHoy =  function(nameUser, hashNotif) {
  
  hashCalNotif = hashNotif;
   // load google calendar v3 API resources and methods
  googleapis
    .discover('calendar', 'v3')
    .execute(function(err, client) {

        var OAuth2Client = googleapis.OAuth2Client;
        var oauth2Client = new OAuth2Client(app_config.CLIENT_ID, app_config.CLIENT_SECRET, app_config.REDIRECT_URL);

        // retrieve an access token
        maya.db.getUserId(nameUser, function(res){
          if(res.length > 0){  //si está definido...
              var idUser = res[0].idUsers;
              idUsuarioActual = idUser;
              app_config.getAccessToken(idUser, oauth2Client, function() { 
                  // retrieve events of PRIMARY calendar XX
                  getEventsByCalendar(client, oauth2Client, printTodayEventsList);
              });

          }
          else{
              console.log("\nERROR: Usuario no definido: "+ nameUser);
          }   
        });
  });

}

// Idem: Comunicación para REST
exports.agenda_hoy =  function(request, response) {
	 var hashID = request.query.hashID;
   var nameUser = request.param('nameUser');

   exports.agendaHoy(nameUser, hashID);
  
   response.send(200);
}

/**
* listaHoy (EXT + INT). Lista los eventos de HOY del calendario PRINCIPAL del usuario
* @param user = nameUser (ALIAS)
* @param hashNotif = hash
*/
exports.listaCalendarios =  function(nameUser, hashNotif) {
 
  hashCalNotif = hashNotif;
  // load google calendar v3 API resources and methods
  googleapis
    .discover('calendar', 'v3')
    .execute(function(err, client) {

        var OAuth2Client = googleapis.OAuth2Client;
        var oauth2Client = new OAuth2Client(app_config.CLIENT_ID, app_config.CLIENT_SECRET, app_config.REDIRECT_URL);

        // retrieve an access token
        maya.db.getUserId(nameUser, function(res){
          if(res.length > 0){   //si está definido...
              var idUser = res[0].idUsers;
              idUsuarioActual = idUser;
              app_config.getAccessToken(idUser, oauth2Client, function() { 

                // retrieve calendars
                getUserCalendars(client, oauth2Client, printCalendarList);   //'me', 
              });
          }
          else{
              console.log("\nERROR: Usuario no definido: "+ nameUser);
          }     
        });
  });

}

// Idem: Comunicación para REST
exports.lista_calendarios =  function(request, response){
  var hashID = request.query.hashID;
  var nameUser = request.param('nameUser');

  exports.listaCalendarios(nameUser, hashID);

  response.send(200);
}


/*************************************************************************************/

/*
* List of settings associated to current user
*/
function getUserSettings(client, authClient, callback) {  // 
  client
    .calendar.settings.list()         
    .withAuthClient(authClient)
    .execute(callback);
}

/*
* List of calendars associated to current user
*/
function getUserCalendars(client, authClient, callback) {  // 
  client
    .calendar.calendarList.list()         
    .withAuthClient(authClient)
    .execute(callback);
}

/*
* List of events associated to the primary calendar 
*/
function getEventsByCalendar(client, authClient, callback) {
  var todayMin = new Date();
  var todayMax = new Date();
  todayMin.setHours(0, 0, 0, 0);
  todayMax.setHours(23, 59, 59, 0);
  client
    .calendar.events.list({
      'calendarId': 'primary',
      'timeMin': todayMin,
      'timeMax': todayMax                     
    })
    .withAuthClient(authClient)
    .execute(callback);
}

/*
* List of events associated to a given calendar (by calendarID = string)
*/
function getEventsByIdCalendar(client, authClient, idCal, callback) {
  client
    .calendar.events.list({
      'calendarId': idCal                           
    })
    .withAuthClient(authClient)
    .execute(callback);
}


/*
* List of events associated to the primary calendar 
*/
function getInfoPrimaryCalendar(client, authClient, callback) {
  client
    .calendars.get({
      'calendarId': 'primary'                          
    })
    .withAuthClient(authClient)
    .execute(callback);
}


/******************************************************************************************/
/*
* Print TODAY events list
*/
function printTodayEventsList(err, list) {
  if (err) {
    console.log('An error occurred: ' + JSON.stringify(err));
  } 
  else {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var numEvents = 0;
    var listaEventos = "";
   
    // list.items no existe si no hay eventos en el calendario principal... numEvents quedará a cero
    // asi que hay que comprobar que haya items antes

    //console.log("ITEMS: " + JSON.stringify(list));
    
    if(list.items){
        //async.forEach(list.items, function(item, callback) {
        for (var cont = 0; cont < list.items.length; cont++){  
          var item = list.items[cont];
          var itemStatus = item.status;
           
          if(itemStatus == "confirmed"){
            //start time (day) of the event
            var dayEvent = new Date(item.start.dateTime);
            dayEvent.setHours(0, 0, 0, 0);
            
            if(today.getTime() == dayEvent.getTime()){
              maya.moment.lang('es'); 
              maya.moment().local();
              numEvents++;
              var startEvent = new Date(item.start.dateTime);
              var endEvent = new Date(item.end.dateTime);
              //console.log("\nEvento "+ numEvents +" : " + item.summary +" de "+    // + ": " + item.id + "("+item.status +")""
              //          startEvent.toLocaleTimeString() + " a " + endEvent.toLocaleTimeString());  
              listaEventos += "\nEvento "+ numEvents +" : " + item.summary +" de "+    // + ": " + item.id + "("+item.status +")""
                        startEvent.toLocaleTimeString() + " a " + endEvent.toLocaleTimeString();
            }
          }  
        } //del for 
    }
    
    if(numEvents == 0){
        var message = "No tienes eventos confirmados hoy " + maya.moment(today.getTime()).format("dddd, D MMMM YYYY")+". ";
    }
    else{
        var message = "Tienes " + numEvents + " eventos confirmados hoy " + maya.moment(today.getTime()).format("dddd, D MMMM YYYY")+". ";
    }
    
    console.log("\nAGENDA: "+ message);
    console.log("\nEVENTOS: "+ listaEventos);
    // Asociarlo a Geoffrey y a nools tambien: eventID = 3
    //maya.notify.newNotification(message+listaEventos, idTodayEvent, hashCalNotif);
    maya.notify.newNotificationToUser(0, idUsuarioActual, message+listaEventos, idTodayEvent, hashCalNotif);
  }
}

/*
* Print settings list
*/
function printSettingsList(err, list) {
  if (err) {
    console.log('An error occurred: ' + err);
  } 
  else {
    async.forEach(list.items, function(item, callback) {
      //someAsyncFunction(item, callback);
      console.log("{"+item.id+"}:"+item.value);
    }, function(err){
      // if any of the async callbacks produced an error, err would equal that error
      console.log("printSettingsList err =" + err);
    });
  }
}

/*
* Print calendar list
*/
function printCalendarList(err, list) {
  if (err) {
    console.log('An error occurred: ' + err);
  } 
  else {
    console.log("\nCALENDARIOS: ");
    var calList = "CALENDARIOS: \n";
    async.forEach(list.items, function(item, callback) {
      console.log("\n" + item.summary + ":" + item.description);
      calList += item.summary + "\n";
      
    }
    , function(err){
      // if any of the async callbacks produced an error, err would equal that error
      console.log("printCalendarList err =" + err);
    });
    // Asociarlo a Geoffrey y a nools tambien: eventID = 4
    //maya.notify.newNotification(calList, idListCalendar, hashCalNotif);
    maya.notify.newNotificationToUser(0, idUsuarioActual, calList, idListCalendar, hashCalNotif);
  }
}

/*
* Print events list
*/
function printEventsList(err, list) { 
  if (err) {
    console.log('An error occurred: ' + err);
  } 
  else {
    async.forEach(list.items, function(item, callback) {
      //someAsyncFunction(item, callback);
      console.log("Event ID = " + item.id + " => " + item.summary);
      console.log("FROM => " + item.start.dateTime + " TO => " + item.end.dateTime);
    }, function(err){
      // if any of the async callbacks produced an error, err would equal that error
      console.log("printEventsList err =" + err);
    });

  }
}

/*
* Print Info Primary Calendar
*/
function printInfoPrimaryCalendar(err, calendar) {
  if (err) {
    console.log('An error occurred: ' + err);
  } 
  else {
    async.forEach(calendar.items, function(calendar, callback) {
      //someAsyncFunction(item, callback);
      console.log("{"+item.id+"}:"+item.value);
    }, function(err){
      // if any of the async callbacks produced an error, err would equal that error
      console.log("printInfoPrimaryCalendar err =" + err);
    });
  }
}

