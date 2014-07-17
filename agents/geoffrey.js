/**
 * RulesManager = Gestor del Motor de reglas (INT)
 * @param -  
 */

 var RulesManager = new function(){
	/** Motor de reglas: Knowledge base **/
	var nools = require("../node_modules/nools");         // https://github.com/C2FO/nools    

	//console.log("->Directorio nools: " + __dirname);

	/* La variable FLOW con el flujo de las reglas ha de ser GLOBAL (conoc. global) + INDIVIDUAL (por blaster) */
	// 1. COMPILA: use the flow of rules defined at rules.nools (GLOBAL)
	// + otro fichero con las individuales

	var flow = nools.compile(__dirname + "/rules.nools"),
	 	Event = flow.getDefined("event"),
	    User = flow.getDefined("user");   //define el objeto de rules.nools

	this.fire = function(nameEvent, nameUser, idUser){
		// 2. To obtain an engine session from the flow invoke the getSession method.
		// Si le paso objetos como parametros, también serán evaluados
		var currentEvent = new Event(nameEvent.toLowerCase(), "Evento de "+nameEvent); //parseInt(
		var currentUser = new User(nameUser.toLowerCase(), idUser); 
		
		var session = flow.getSession(currentEvent, currentUser);
		
		// FIRING: When you get a session from a flow no rules will be fired until 
		// the match method is called.
		session.match(function(err){  //matchUntilHalt
		    if(err){
		        console.error(err);
		    }else{
		        //console.log("Done match");
		    }
		})

		session.match().then(  //matchUntilHalt
		  function(){
		      //console.log("Done match then");
		  }, 
		  function(err){
		    //uh oh an error occurred
		    console.error(err);
		  });

		//session.dispose();
		return currentEvent.action;
	}

	//nools.deleteFlow("flow");
	//Si no ha hecho match con ningún evento:
	var error = "/unknown";
	return error;
}


/*
 *  Agent:      GEOFFREY!!!!
 */
/**
* new Event (EXT + [INT]). Registro de un nuevo evento
* @param user = nameUser
* @param event = idEvent
*/
exports.newEvent = function(nameUser, nameEvent){  

	maya.db.getUserId(nameUser, function(res){  
		if(res.length > 0){  //si está definido...
			var idUser = res[0].idUsers;

	        maya.db.getEventId(nameEvent, function(res){  
	        	if(res.length > 0){  //si está definido...
					var idEvent = res[0].idEvents;

		        	maya.db.insertNewLogEvent(idUser, idEvent, function(result){
					    	var hash = result;
					    	// Lanzo el motor de reglas
					    	var action = RulesManager.fire(nameEvent, nameUser, idUser);
					    	console.log("\nEVENT: "+ nameEvent +" - Action TODO: " + action);
					    	
					    	eval(action);
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
    var nameEvent = request.param('nameEvent');
    var nameUser = request.param('nameUser');

    exports.newEvent(nameUser, nameEvent);
    
    response.send(200, "Hola "+ nameUser +", Maya ha recibido un nuevo evento tuyo de " + nameEvent + ".");
};


