//biix --> id = 1 / 2
var idHelloEvent = 1;
var idGoodbyeEvent = 2;

/*
 *  Agent:      BIIX!!!!
 */

/**
* new Event (EXT + [INT]). Registro de un nuevo evento
* @param nameUser
* @param nameEvent
* @param hashNotif
* Ej: biix.newEvent(salida,pepe,hash) || /biix/newEvent/salida/pepe?hashID=djhfskjdhfkd
*/
exports.newEvent = function(nameEvent, nameUser, hashNotif, callback){               
     maya.db.getUserId(nameUser, function(res){ 
        if(res.length > 0){  //si está definido...
        var idUser = res[0].idUsers;
        maya.db.getEventId(nameEvent, function(res){  
            if(res.length > 0){  //si está definido...
            var idEvent = res[0].idEvents;
            
            // LOGICA DE BIIX 
            maya.db.getAllEventsFromUserOrderedByDate(idUser, idEvent, function(result){
                // Geoffrey <= evento actual en LogEvent result[0] // el último evento result[1]
                var numEvents = result.length;
                var lastEvent = result[1];

                maya.db.getMessagePreferences(idUser, idEvent, function(prefs){
                    message = "";
                    if(prefs.length > 0){
                        message = prefs[0].message + " ";
                    }
                    else{
                        // Dafault message:
                        if(idEvent == 1) message = "Buenos días ";
                        else message = "Hasta luego ";
                    }
                    
                    if(numEvents > 1){
                        var today = new Date().setHours(0, 0, 0, 0);
                        var eventDate = new Date(lastEvent.date).setHours(0, 0, 0, 0);

                        if(today == eventDate){
                            console.log("\nBIIX -> Same day");   // No saluda porque ya ha saludado antes
                            if(callback) callback("No ha enviado ninguna notificación.");
                        }
                        else{
                            // Primera vez que alguien llega / se va en el día de hoy
                            maya.db.getUserFullName(idUser, function(fullName){  
                                message = message + fullName;
                                console.log("\nBIIX -> "+ message);
                               // maya.notify.newNotification(message, idEvent, hashNotif);
                                maya.notify.newNotificationToUser(0, idUser, message, idEvent, hashNotif);
                                if(callback) callback("Enviada la notificación: " + message);
                            });
                        }
                    }
                    else{
                        // Este es el primer evento de este usuario almacenado en la BD
                       // maya.db.getUserFullName(idUser, function(fullName){
                        maya.db.getUserName(idUser, function(name){  
                            message = message + name;
                            console.log("\nBIIX -> "+ message);
                            //maya.notify.newNotification(message, idEvent, hashNotif);
                            maya.notify.newNotificationToUser(0, idUser, message, idEvent, hashNotif);
                            if(callback) callback("Enviada la notificación: " + message);
                        });
                    }
                });
            });
            
            }
            else{
                console.log("\nERROR: Evento no definido: "+ nameEvent);
            }
        });
        }
        else{
            console.log("\nERROR: Usuario no definido: "+ nameUser);
        }
    });  
}

// Idem: Comunicación para REST
exports.new_event =  function(request, response) {
   var user = request.param('nameUser');
   var event = request.param('nameEvent');
   var hash = request.query.hashID;

   exports.newEvent(event, user, hash, function(result){
         response.send(200, result);

   });
};


