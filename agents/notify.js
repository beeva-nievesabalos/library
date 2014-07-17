var GCM = require('./gcm/gcm');
var gcm = new GCM("AIzaSyCHDWV2x32I7OYJ0eiIkES3W8SqshU2HDk"); // API Key for Server apps de https://code.google.com/apis/console
//var gcm = new GCM("6dc636e046d9613d5889a62b4626a40628153a49"); //BAAS

// CLASS: Manage JSON in Node.js
// Uses native JSON
// - JSON.stringify() method accepts a JavaScript object and returns its JSON equivalent.
//   Example: object.name = "jack";
//            object.age = 31;
//  		  var jsonString = JSON.stringify(object);   --> '{"name":"jack","age":31}'.
//         
// - JSON.parse() method parses a JSON string, reconstructing the original JavaScript object.
// Constructor
// By default: receives a JavaScript object (and creates its string representation)
var JSONClass = function(object) {
  this.objJSON = object;
  this.stringJSON = this.toString(object);
}

// properties and methods
JSONClass.prototype = {
  toJSON: function(argString) {
  	//if(argString == null)
  	//	this.objJSON = new Object();
  	//else
  		this.objJSON = JSON.parse(argString);

  },
  toString: function(argObject) {
  	//var result = "";
  	//if(argObject == null)
  	//	result = '{}';
  	//else
  		result = JSON.stringify(argObject);
  	return result;
  },
  getJSONString: function() {
  	return this.stringJSON;
  },
  getJSONObject: function() {
  	return this.objJSON;
  },
  getHeader: function(){
  	var length = this.stringJSON.length;
  	var header = {
	  'Content-Type': 'application/json',
	  'Content-Length': length
	};
	return header;
  }
};

// CLASS: Maya Notifications with JSON
// Uses JSONClass
// Constructor
// By default: receives information to notify and creates a JSON
var notificationClass = function(code, id, message) {
	
	var notification = new Object(); 
	notification.code = code;
	notification.id = "" + id + "";
	notification.message = message;

	// constructor call
	var object = new JSONClass(notification);
	//console.log(object.getJSONString());

	this.notify = object.getJSONString();

}

// properties and methods
notificationClass.prototype = {
	getJSON: function() {
		return this.notify;
	}
};


/*
 *  Agent:      NOTIFY!!!!
 */

/**
* New notification (INT). Creates a new notification and sends it to a PUSH Server (GCM)
* @param message: message to send
* @param idEvent: type of event that creates the notification
* @param hashIDLogEvent: hash of the entry of the LogEvent table (to associate notification with entry log)
*/

exports.newNotification = function(message, idEvent, hashIDLogEvent) {

   // Guardar notificación en base de datos 
  maya.db.insertNewNotification(idEvent, message, function(result){
      console.log("Se ha creado una nueva notificación de tipo "+ idEvent);
      
      //result  = notification hash 
      var infoEventHash = result;

      //given by BaaS-PUSH service
      var msg = {
              "notification": {
                "platforms": "ios, android, wp, bb",    
                "target": {
                  "users":"mayaTest"
                }
                ,
                "message": {
                  "title": "Mensaje a todas las plataformas",
                  "number": infoEventHash,
                  "content": message,
                  "extra": "1" 
                }
              }
      };

      var msgJSON = JSON.stringify(msg);

      // send notification PUSH and waits + associates notification in LogEvent table
      gcm.send(msgJSON, function(err, response) {
             // that error is from the http request, not gcm callback
             console.log("\nGCM Response JSON: " + response); // http://developer.android.com/guide/google/gcm/gcm.html#response
      }); 

      maya.db.associatedNotificationToLogEvent(result, hashIDLogEvent, function(result){
          console.log("\nSe ha asociado la notificación al log del evento"); 
      });
  });  

}


/**
* New notification (INT). Creates a new notification (send to a user) and sends it to a PUSH Server (GCM)
* @param idSender: who sends the notification (or devices associated)
* @param idReceiver: who receives the notification (or devices associated)
* @param message: message to send
* @param idEvent: type of event that creates the notification
* @param hashIDLogEvent: hash of the entry of the LogEvent table (to associate notification with entry log)
*/

exports.newNotificationToUser = function(idSender, idReceiver, message, idEvent, hashIDLogEvent) {
  //var idEventoAviso = 5;  //evento: "aviso"

   // Guardar notificación en base de datos 
  maya.db.insertNewNotificationSenderReceiver(idSender, idReceiver, idEvent, message, function(result){

      maya.db.getUserAlias(idReceiver, function(aliasUser){

        console.log("Se ha creado una nueva notificación de tipo "+ idEvent);
        
        //result  = notification hash 
        var infoEventHash = result;

        //given by BaaS-PUSH service
        // ¿enviado a...? 
        // APP Android:  http://bbvapush.dev.gobernalianet.org  APP ID: com.bbva.baas.notifier.test
        // Notification Manager:  ??
        var msg = {
                "notification": {
                  "platforms": "ios, android, wp, bb",    
                  "target": {
                    "users": aliasUser
                  }
                  ,
                  "message": {
                    "title": "Mensaje a todas las plataformas",
                    "number": infoEventHash,
                    "content": message,
                    "extra": "1" 
                  }
                }
        };

        var msgJSON = JSON.stringify(msg);

        // send notification PUSH and waits + associates notification in LogEvent table
        gcm.send(msgJSON, function(err, response) {
               // that error is from the http request, not gcm callback
               console.log("\nGCM Response JSON: " + response); // http://developer.android.com/guide/google/gcm/gcm.html#response
        }); 

        maya.db.associatedNotificationToLogEvent(result, hashIDLogEvent, function(result){
            console.log("\nSe ha asociado la notificación al log del evento"); 
        });

    });
  });  

}


/**
* Show notification (INT + EXT). Show the last notifications from a kind of event
* @param idEvent: id of event 
* @param callback función que maneja el resultado de la notificación
*/
exports.showNotificationEvent = function(idEvent, callback){
  maya.db.showNotificationsIdEvent(idEvent, function(result){
      if (result.length){ 
        var dayEvent = new Date(result[0].dateSended);
        var dia = maya.moment(dayEvent.getTime()).format("dddd, D MMMM YYYY, h:mm:ss a");

        console.log('\nHay ' + result.length + " notificaciones pendientes.");
        console.log("\n*  Notificación más antigua: ");
        console.log('Fecha siguiente notificación: ' + dia);
        console.log('ID siguiente notificación: ' + result[0].idNotifications);
        console.log('Message siguiente notificación: ' + result[0].message);


        var notificacion = new notificationClass("200", result[0].idNotification, result[0].message);
        console.log('new_notification: ' + notificacion.getJSON());    

      }
      else{
        var notificacion = new notificationClass("200", "-1", " ");
        console.log('new_notification: ' + notificacion.getJSON());
      }

      //HTTP
      //response.type('application/json');
      //response.send(200, notificacion.getJSON());
      callback(notificacion.getJSON());
  });
}

// Idem: Comunicación para REST
exports.show_notification_event = function(request, response){
  var nameEvent = request.param('nameEvent');

  maya.db.getEventId(nameEvent, function(res){  
    if(res.length > 0){  //si está definido...
      var idEvent = res[0].idEvents;

      exports.showNotificationEvent(idEvent, function(result){
          //HTTP
          response.type('application/json');
          response.send(200, "Evento de "+ nameEvent + " --> notificación más antigua sin ACK: " + result);
      });
    }
    else{
        console.log("\nERROR: Evento no definido: "+ nameEvent);
        response.type('application/json');
        response.send(400, "ERROR: Evento no definido: "+ nameEvent);
    }
  });
  //response.send(200);
}


/**
* Notification received (EXT + [INT]). ACK of the notification with hashID
* @param hashID: hash id of the notification received 
* 
*/
exports.notificationReceived = function(hashID){
  maya.db.updateNotificationFlagAndDate(hashID, function(result){
      //response.send(200);
      console.log("Notificación recibida.");
  });
}

// Idem: Comunicación para REST
exports.notification_received = function(request, response){
  var hash = request.params.hashNotif;
  
  exports.notificationReceived(hash);

  response.send(200, "Notificación recibida.");
}