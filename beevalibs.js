//var db = require('./db/dbHelper')
var http = require('http')
  , async = require('async')
  , EventEmitter = require('events').EventEmitter;

/* MAYA GLOBAL */
maya = new EventEmitter(); 
maya["server"] = require('./config');        //crea una variable que configura el server (express)
maya["info"] = "Maya rules";
maya["db"] = require('./db/dbHelper');
maya["moment"] = require('moment');
maya.moment.lang('es'); 
maya.moment().local();

maya.db.getActivesAgentsInformation(function(result){
    var numAgents = result.length;
    for (var i = 0; i < numAgents; i++) {
      var agent = result[i].alias;
      console.log(agent);
      if(agent == "beevalibs"){
         maya[agent] = require(result[i].uri);
         maya[agent].info = result[i];
      }
    }

      /**
        *  REST de la APP
        
        // Avisa a geoffrey de que se ha recibido un nuevo evento
        // para REST: pide user y evento  || sin REST user, event y (function opc.)
        // newEvent: function(user, event, callback) con callback opcional, ya que si no es llamado, se evalua como un exec..
        maya.server.get('/api/events/new/:nameEvent/:nameUser',  maya.geoffrey.new_event); 

        // Avisa a Biix de que se ha recibido un nuevo evento
        // URL nueva /biix/newEvent/salida/pepe?hashID=djhfskjdhfkd
        maya.server.get('/biix/newEvent/:nameEvent/:nameUser',  maya.biix.new_event);

        // Calendar: lista de los eventos de hoy
        // URL nueva /calendar/agendaHoy/pepe?hashID=djhfskjdhfkd
        maya.server.get('/calendar/agendaHoy/:nameUser',  maya.calendar.agenda_hoy);
        maya.server.get('/calendar/listaCalendarios/:nameUser',  maya.calendar.lista_calendarios);

        // Devuelve la siguiente notificación pendiente de ser enviada.
        maya.server.get('/api/notify/:nameEvent',  maya.notify.show_notification_event);

        // Modifica en la base de datos la notificación marcándola como que ya ha sido recibida y enviada.
        maya.server.get('/api/notify/ack/:hashNotif',  maya.notify.notification_received);
      */
        // Creamos el servidor y lo lanzamos 
        http.createServer(maya.server).listen(maya.server.get('port'), function(){
        console.log('\n\n...Maya server listening on port ' + maya.server.get('port'));
        });
});

