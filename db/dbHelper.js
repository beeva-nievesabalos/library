var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'mayadb.c86mtys4i6im.eu-west-1.rds.amazonaws.com',
  user     : 'root',
  password : 'innovacionmaya',
  port 	   : '3306',
  database : 'mayadb' 
});

/*var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'admin',
  port 	   : '3306',
  database : 'mayadb' 
});*/

///	+------------------------------------------------------------------------------------------
/// | @name Generic functions
///	+------------------------------------------------------------------------------------------

function existHashID(hashID, table, callback_func){

	//console.log(hashID);
	connection.query("SELECT * FROM " + table + " WHERE hashID = '" + hashID + "'", function(err, result){

		//console.log('length: ' + result.length);
		callback_func(result.length);
	});
};

///	+------------------------------------------------------------------------------------------
/// | @name Log Events functions
///	+------------------------------------------------------------------------------------------

var localInsertNewLogEvent = function(idUser, idEvent, callback_func){

	require('crypto').randomBytes(15, function(ex, buf) {
  		
  		var hash = buf.toString('hex');

  		existHashID(hash, "LogEvents", function(result){
  			
  			if (result == 0) {

  				// Insertamos en la BBDD en nuevo logEvent
  				var timestamp = new Date().getTime();
  				 

  				connection.query('INSERT INTO LogEvents (idUsers, idEvents, date, hashID) VALUES ('+ idUser +', '+ idEvent +', ' + timestamp + ', \'' + hash + '\')', function(err, result) {
      				if (err) throw err;
      				//console.log(result);
      				callback_func(hash);
    			});

  			}else{

  				// LLamamos de nuevo a insertNewLogEvent
  				localInsertNewLogEvent(idUser, idEvent, callback_func);
  			}
  		});
	});
};
exports.insertNewLogEvent = localInsertNewLogEvent;

exports.getAllEventsFromUserOrderedByDate = function(idUser, idEvent, callback_func){

	connection.query('SELECT * FROM LogEvents WHERE idEvents = '+ idEvent +' AND idUsers = '+idUser+' ORDER BY date DESC', function(err, result) {
	  if (err) throw err;

	  //console.log(result);
	  callback_func(result);
	});
};

///	+------------------------------------------------------------------------------------------
/// | @name Notifications functions
///	+------------------------------------------------------------------------------------------

var localInsertNewNotification = function(idEvent, message, callback_func){


	require('crypto').randomBytes(15, function(ex, buf) {

		var hash = buf.toString('hex');

		existHashID(hash, "Notifications", function(result){

			if (result == 0) {

				var timestamp = new Date().getTime();

				connection.query('INSERT INTO Notifications (message, received, dateSended, dateReceived, priority, idEvents, hashID) VALUES (\''+ message +'\', \'0\', \''+ timestamp +'\', \'0\', \'0\', \''+ idEvent +'\', \''+ hash +'\')', function(err, result) {
					if (err) throw err;

					//console.log(result);
					callback_func(hash);
				});

			}else{

  				// LLamamos de nuevo a insertNewLogEvent
  				localInsertNewNotification(idEvent, message, callback_func);
  			}
  		});
	});
};
exports.insertNewNotification = localInsertNewNotification;

/*
* idSender = 0 --> maya sends the message
* idReceiver = 0 --> all users receive the message
*
*/
var localInsertNewNotificationSenderReceiver = function(idSender, idReceiver, idEvent, message, callback_func){


	require('crypto').randomBytes(15, function(ex, buf) {

		var hash = buf.toString('hex');

		existHashID(hash, "Notifications", function(result){

			if (result == 0) {

				var timestamp = new Date().getTime();

				connection.query('INSERT INTO Notifications (message, received, dateSended, dateReceived, priority, idEvents, hashID, idSender, idReceiver) VALUES (\''+ message +'\', \'0\', \''+ timestamp +'\', \'0\', \'0\', \''+ idEvent +'\', \''+ hash +'\', \''+idSender+'\', \''+idReceiver+'\')', function(err, result) {
					if (err) throw err;

					//console.log(result);
					callback_func(hash);
				});

			}else{

  				// LLamamos de nuevo a insertNewLogEvent
  				localInsertNewNotificationSenderReceiver(idEvent, message, callback_func);
  			}
  		});
	});
};
exports.insertNewNotificationSenderReceiver = localInsertNewNotificationSenderReceiver;

exports.showNotificationsIdEvent = function(idEvent, callback_func){

	connection.query('SELECT * FROM Notifications WHERE idEvents = ' + idEvent + ' AND received = 0 ORDER BY dateSended ASC', function(err, result) {
	  if (err) throw err;

	  //console.log(result);
	  callback_func(result);
	});
};

exports.updateNotificationFlagAndDate = function(hashNotification, callback_func){

	var timestamp = new Date().getTime();

	connection.query("UPDATE Notifications SET received = 1, dateReceived = '" + timestamp + "' WHERE hashID = '" + hashNotification + "'", function(err, result) {
	  if (err) throw err;

	  console.log(result);
	  callback_func(result);
	});
};

exports.showNotifications = function(idEvent, callback_func){

	connection.query('SELECT * FROM Notifications', function(err, result) {
	  if (err) throw err;

	  //console.log(result);
	  callback_func(result);
	});
};

exports.associatedNotificationToLogEvent = function(hashIDNotif, hashIDLogEvent, callback_func){

	var sql = "UPDATE LogEvents SET hashNotifications = '" + hashIDNotif +"' WHERE hashID = '" + hashIDLogEvent + "'";

	connection.query(sql, function(err, result) {
	  if (err) throw err;

	  //console.log(result);
	  callback_func(result);
	});
};

///	+------------------------------------------------------------------------------------------
/// | @name Users functions
///	+------------------------------------------------------------------------------------------
exports.getUserAlias = function(idUser, callback_func){

	connection.query('SELECT alias FROM Users WHERE idUsers = '+ idUser, function(err, result) {
	  if (err) throw err;

	  //console.log("getUserName",result[0].name);

	  callback_func(result[0].alias);
	});
};

exports.getUserName = function(idUser, callback_func){

	connection.query('SELECT name FROM Users WHERE idUsers = '+ idUser, function(err, result) {
	  if (err) throw err;

	  //console.log("getUserName",result[0].name);

	  callback_func(result[0].name);
	});
};

exports.getUserFullName = function(idUser, callback_func){

	connection.query('SELECT name, surname FROM Users WHERE idUsers = '+ idUser, function(err, result) {
	  if (err) throw err;

	  //console.log("getUserName",result[0].name);

	  callback_func(result[0].name + " " + result[0].surname);
	});
};

exports.getUserId= function(aliasUser, callback_func){

	connection.query('SELECT idUsers FROM Users WHERE alias = \''+ aliasUser +'\'', function(err, result) {
	  if (err) throw err;
	  
	  callback_func(result);
	});
};

exports.getUserAccount = function(idUser, callback_func){

	connection.query('SELECT idAccount FROM Users WHERE idUsers = '+ idUser, function(err, result) {
	  if (err) throw err;

	  //console.log("getUserName",result[0].name);

	  callback_func(result[0].name);
	});
};

exports.getUserIDFromAgent = function(idAgent, callback_func){

	connection.query('SELECT idUsers FROM Users WHERE idAgents = '+ idAgent, function(err, result) {
	  if (err) throw err;

	  //console.log("getUserIDFromAgent",result[0].idUsers);

	  callback_func(result[0].idUsers);
	});
};

exports.getUserData = function(idAgent, callback_func){

	connection.query('SELECT * FROM Users WHERE idAgents = '+ idAgent, function(err, result) {
	  if (err) throw err;

	  //console.log("\ngetUserData --> " + JSON.stringify(result));
	  //console.log("getUserData --> " + result);
	  //callback_func(JSON.stringify(result));
	  callback_func(result);
	});
};

exports.getUserAccessToken = function(idUsers, callback_func){

	connection.query('SELECT accessToken FROM Users WHERE idUsers = '+ idUsers, function(err, result) {
	  if (err) throw err;

	  //console.log("getUserAccessToken",result[0].accessToken);

	  callback_func(result[0].accessToken);
	});
};


exports.setUserAccessToken = function(token, idUsers, callback_func){
	//UPDATE `mayadb`.`Users` SET `accessToken`='4/baoi_YSRbLJ782tm5hbrYmNfK03b.4hceJmttsOAUOl05ti8ZT3ZB42wnfgI' WHERE `idUsers`='2';
	var sql = "UPDATE Users SET accessToken = '" + token +"' WHERE idUsers = '" + idUsers + "'";

	connection.query(sql, function(err, result) {
	  if (err) throw err;

	  //console.log("setUserAccessToken", result);

	  callback_func(result);
	});
};

///	+------------------------------------------------------------------------------------------
/// | @name Agents functions
///	+------------------------------------------------------------------------------------------


exports.getURIFromAgent = function(idAgent, callback_func){

	connection.query('SELECT uri FROM Agents WHERE idAgents = ' + idAgent, function(err, result) {
	  if (err) throw err;
	  callback_func(result[0].uri);
	});
};

exports.getIDFromAliasAgent = function(alias, callback_func){

	connection.query('SELECT * FROM Agents WHERE alias = \'' + alias + '\' AND blaster = 1', function(err, result) {
	  if (err) throw err;
	  callback_func(result[0].idAgents);
	});
};

exports.getAliasFromIDAgent = function(idAgents, callback_func){

	connection.query('SELECT alias FROM Agents WHERE idAgents = ' + idAgents, function(err, result) {
	  if (err) throw err;
	  callback_func(result[0].alias);
	});
};


exports.getBlasters = function(callback_func){

	connection.query('SELECT * FROM Agents WHERE blaster = 1', function(err, result) {
	  if (err) throw err;
	  callback_func(result);
	});
};

exports.getActiveBlasters = function(callback_func){

	connection.query('SELECT * FROM Agents WHERE blaster = 1 AND active = 1', function(err, result) {
	  if (err) throw err;
	  callback_func(result);
	});
};

exports.getActivesAgents = function(callback_func){

	connection.query('SELECT idAgents, uri FROM Agents WHERE blaster = 0 AND active = 1', function(err, result) {
	  if (err) throw err;
	  callback_func(result);
	});
};


exports.getActivesAgentsInformation = function(callback_func){

	connection.query('SELECT * FROM Agents WHERE blaster = 0 AND active = 1', function(err, result) {
	  if (err) throw err;
	  callback_func(result);
	});
};


///	+------------------------------------------------------------------------------------------
/// | @name Events functions
///	+------------------------------------------------------------------------------------------

exports.getEventName = function(idEvent, callback_func){

	connection.query('SELECT name FROM Events WHERE idEvents = '+idEvent, function(err, result) {
	  if (err) throw err;

	  //console.log("getEventName",result[0].name);
	  callback_func(result[0].name);
	});
};

exports.getEventId = function(nameEvent, callback_func){

	connection.query('SELECT idEvents FROM Events WHERE name = \''+ nameEvent + '\'', function(err, result) {
	  if (err) throw err;

	  //console.log('SELECT idEvents FROM Events WHERE name = \''+ nameEvent + '\'');
	  callback_func(result);
	});
};

///	+------------------------------------------------------------------------------------------
/// | @name Preferences functions
///	+------------------------------------------------------------------------------------------

exports.getMessagePreferences = function(idUser, idEvent, callback_func){

	connection.query("SELECT * FROM Preferences WHERE idUsers = " + idUser + " AND idEvent = " + idEvent, function(err, result){
		//console.log("\nuser-> " + idUser);
		//console.log("\nevent-> " + idEvent);
		//console.log("\nPreferences -> " + JSON.stringify(result));
		callback_func(result);
	});
};


///	+------------------------------------------------------------------------------------------
/// | @name Rules functions
///	+------------------------------------------------------------------------------------------

exports.getGeneralRules = function(callback_func){

	connection.query("SELECT name, salience, constraints, action FROM Rules WHERE type = 'general'", function(err, result){
		//console.log("\n\n\n Rules -> " + JSON.stringify(result));
		callback_func(result);
	});
};

exports.getUserRules = function(idUser, callback_func){

	connection.query("SELECT name, salience, constraints, action FROM Rules WHERE type="+ idUser, function(err, result){
		//console.log("\n\n\n Rules -> " + JSON.stringify(result));
		callback_func(result);
	});
};

///	+------------------------------------------------------------------------------------------
/// | @name Constraints functions
///	+------------------------------------------------------------------------------------------
exports.getConstraintsByID = function(idConstraint, callback_func){

	connection.query("SELECT type, alias, pattern FROM Constraints WHERE idConstraints = " + idConstraint, function(err, result){
		//console.log("\n\n\n Constraint -> " + JSON.stringify(result));
		callback_func(result);
	});
};

///	+------------------------------------------------------------------------------------------
/// | @name Books functions
///	+------------------------------------------------------------------------------------------

exports.getBookByID = function(idBook, callback_func){

	connection.query("SELECT * FROM BooksDetails WHERE idBooksDetails = " + idBook, function(err, result){
		//console.log("\n Book-> " + idBook);
		//console.log("\n Details -> " + JSON.stringify(result));
		callback_func(result);
	});
};

exports.getBookHistoryByID = function(idBook, callback_func){
    // Las fechas aquí son del estilo a: "2011-05-26T07:56:00.123Z" (jsonDate)
	connection.query("SELECT * FROM BooksHistory WHERE idBook = " + idBook + ' ORDER BY FromDate DESC', function(err, result){
		//console.log("\n Book-> " + idBook);
		//console.log("\n History -> " + JSON.stringify(result));
		callback_func(result);
	});
};

exports.getBookCurrentUserByID = function(idBook, callback_func){
    // Las fechas aquí son del estilo a: "2011-05-26T07:56:00.123Z" (jsonDate)
	connection.query("SELECT User, FromDate FROM BooksHistory WHERE idBook =" + idBook + ' ORDER BY FromDate DESC', function(err, result){
		//console.log("\n Book-> " + idBook);
		//console.log("\n Ordenado ASC por From -> " + JSON.stringify(result));
		callback_func(result);
	});
};

exports.getBookListAll = function(callback_func){

	connection.query("SELECT * FROM BooksDetails", function(err, result){
		//console.log("\n List book -> " + JSON.stringify(result));
		callback_func(result);
	});
};

exports.getBookListAvailable = function(callback_func){

	connection.query("SELECT * FROM BooksDetails WHERE Status = 'DISPONIBLE'", function(err, result){
		//console.log("\n List book -> " + JSON.stringify(result));
		callback_func(result);
	});
};

exports.getBookListBorrowed = function(callback_func){

	connection.query("SELECT * FROM BooksDetails WHERE Status = 'PRESTADO'", function(err, result){
		//console.log("\n List book -> " + JSON.stringify(result));
		callback_func(result);
	});
};