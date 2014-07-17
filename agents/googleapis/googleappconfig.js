//googleappconfig.js
function define(name, value) {
	  //console.log('define: '+ name +"="+value);
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

// Client ID and client secret are available at https://code.google.com/apis/console
define("CLIENT_ID", "785633617966-egc2hoff03jeqs3c2s5gl5k9qpsreedj.apps.googleusercontent.com");
define("CLIENT_SECRET", "CADqtCzYxTAtQl4NLs1wDVHf");
define("REDIRECT_URL", "urn:ietf:wg:oauth:2.0:oob");

var config = this;

var readline = require('readline');
var dbHelper = require('../../db/dbHelper');
var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// to get ACCESS TOKEN -> 1st get the code here: 
// https://accounts.google.com/o/oauth2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&response_type=code&client_id=785633617966-egc2hoff03jeqs3c2s5gl5k9qpsreedj.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob
exports.getAccessToken = function (idUser, oauth2Client, callback) {  

	// miro en la DB si existe token
    dbHelper.getUserAccessToken(idUser, function(result_token){ 
      // token de la BD not null 
      if(result_token != null){
          if(oauth2Client.accessToken() != null){
            //token del objeto oauth2 not null
            callback && callback();
          }
          else{ 
            //token del objeto oauth2 vacio
            oauth2Client.credentials = JSON.parse(result_token);
            callback && callback();
          } 
      }
      else{ //access token null (1st time)
      	  // generate consent page url
      	  var url = oauth2Client.generateAuthUrl({
     		 	//response_type: 'code',
      			access_type: 'offline',
      			scope: 'https://www.googleapis.com/auth/calendar'
    		});

          console.log('Visit the url: ', url);
          rl.question('Enter the code here:', function(code) {
              // request access token 
              oauth2Client.getToken(code, function(err, tokens) {
                  // set tokens to the client
                  // TODO: tokens should be set by OAuth2 client.
                  oauth2Client.credentials = tokens;
                  var token_serializado = JSON.stringify(tokens);

                  dbHelper.setUserAccessToken(token_serializado, idUser, function(){
                      console.log('\nNew token stored into DB: ' + token_serializado);
                  });
                  callback && callback();
              }); 
          }); 
       } // else
    });//del dbHelper     
}

exports.login =  function(request, response){
	var code = request.param('Codigo');
	
  //var constants = require("./B"+ request.param('idUser') +"/constants");

  //console.log("constants B X " + constants.URI);
  //console.log("constants idUser X " + constants.idUser);

	var oauth = new OAuth2Client(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);

	// request access token 
    oauth.getToken(code, function(err, tokens) {
    	if(!err){
	        // set tokens to the client
	        // TODO: tokens should be set by OAuth2 client.
	        oauth.credentials = tokens;
	        var token_serializado = JSON.stringify(tokens);
	       // console.log("\nauth " + JSON.stringify(oauth));
	       // console.log("\ntoken " + token_serializado);
	        dbHelper.setUserAccessToken(token_serializado, constants.idUser, function(){
	            console.log('\nNew token stored into DB: ' + token_serializado);
	         });
	     }
	     else {
	     	console.log("\n getToken err " + JSON.stringify(err));
	     }
    }); 
    response.send(200);
}