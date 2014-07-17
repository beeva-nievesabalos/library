//beevalibs.js

/**
* Show Book Details (INT+EXT). Gets all the details from book id 
*/
exports.showBookDetails = function(idBook, callback){
	maya.db.getBookByID(idBook, function(result){
		if(result.length > 0){ 
			if(result[0].Status=="PRESTADO"){
				maya.db.getBookCurrentUserByID(idBook, function(users){
					console.log("\n >> Este es el usuario actual del libro: "+users[0].User);
					result[0].User = users[0].User
					callback(result);
				});
			}
			else callback(result);
		}
		else{
			console.log("\nERROR: Libro no definido: "+ idBook);
			callback("Error, libro no definido");
		}

	});
};

/* Comunicación REST */
exports.show_book_details = function(request, response){
	var idBook = request.param('idbook');
	
    exports.showBookDetails(idBook, function(result){
    	response.render('book_detail', {title: 'Beeva Library', subtitle: 'Book Details', result: result});
    });
};


/**
* Show Book History (INT+EXT). Gets all the history from book id 
*/
exports.showBookHistory = function(idBook, callback){
	maya.db.getBookHistoryByID(idBook, function(result){
		var historyAll = [""];
		if(result.length > 0){ 
            for(var i = 0; i < result.length; i++){
            	var history = {};
            	history.id = result[i].idBooksHistory;
				var from = new Date(result[i].FromDate);
            	var until = new Date(result[i].UntilDate);
            	var from_m = maya.moment(from.getTime()).format("dddd, D MMMM YYYY");
            	if(!isNaN(until)){
            		var until_m = maya.moment(until.getTime()).format("dddd, D MMMM YYYY");
            	}
            	else var until_m = "";
            	history.from = from_m;
            	history.until = until_m;
            	history.user = result[i].User;
            	historyAll[i] = history;
            }
			callback(historyAll);
		}
		else{
			console.log("\nNo hay historial para este libro "+ idBook);
			callback("No hay historial para este libro.");
		}

	});
};

/* Comunicación REST */
exports.show_book_history = function(request, response){
	var idBook = request.param('idbook');
	
    exports.showBookHistory(idBook, function(result){
    	console.log("\n" + JSON.stringify(result));
    	response.render('book_detail', {title: 'Beeva Library', subtitle: 'Book History', result: result});
    });
};

/**
* Show Book List (INT+EXT). Gets all the details from book id 
*/
exports.showBookList = function(callback){
	// DISPONIBLES
	//maya.db.getBookListAvailable(function(result){
	// TODOS
	maya.db.getBookListAll(function(result){
		if(result.length > 0){ 
			//console.log("\nDETALLES: "+JSON.stringify(result));
			callback(result);
		}
		else{
			console.log("\nERROR: No hay ningún libro disponible.");
			callback("Error, no hay ningún libro disponible.");
		}
	});
};

/* Comunicación REST */
exports.show_book_list = function(request, response){
    exports.showBookList(function(result){
    	//response.send(200, result);
    	response.render('book_list', {title: 'Beeva Library', subtitle: 'Book List', result: result});
    });
};