var request = require('request');
 
var GCM = function(api_key) {
  this._api_key = api_key;
}


/*
BaaS - Notificaciones PUSH

Send notification
-----------------

POST /notification HTTP/1.1
Host: pre.push.digitalservices.es
Content-Type: application/json
Accept: application/json
Authorization: basic Y29tLmJidmEuYmFhcy5ub3RpZmllci50ZXN0Og==
Cache-Control: no-cache


*/
 
GCM.prototype.send = function(msg, callback) {
  console.log("\nSEND JSON: " + msg + "\n");
  request.post({
    uri: 'http://pre.push.digitalservices.es/notification',
    body: msg,
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' : 'basic Y29tLmJidmEuYmFhcy5ub3RpZmllci50ZXN0Og==',             // 'key=' + this._api_key
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    }
  }, function(err, response, body) {
    callback(err, body);
  })
}
 
module.exports = GCM;