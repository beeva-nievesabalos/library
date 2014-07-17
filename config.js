//config.js

/*
 * Configuration SERVER params
 */
/**
 * EXPRESS : Module dependencies.
 */
var express = require('express')
	, stylus = require('stylus')
 	, nib = require('nib')
  , routes = require('./routes')
  , appconf = require('./agents/googleapis/googleappconfig')
  , path = require('path')
  , beevalibs = require('./agents/beevalibs');

var server =  express();

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

// all environments
server.set('port', process.env.PORT || 3000);
server.set('views', __dirname + '/views');
server.set('view engine', 'jade');
server.use(express.favicon());
server.use(express.logger('dev'));
server.use(express.bodyParser());
server.use(express.methodOverride());
server.use(server.router);
server.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
server.use(express.static(path.join(__dirname, 'public')));

if ('development' == server.get('env')) {
	server.use(express.errorHandler());
}

// REST GENERALES
server.get('/', routes.index);
server.get('/login/:idUser', routes.login);
server.get('/unknown', routes.unknown_event);      // evento desconocido
server.get('/googleapis', appconf.login);
//server.get('/ioe', routes.ioe);  //pasarle el usuario??
//server.get('/ioe/error', routes.ioe_error);  //pasarle el usuario??
//server.get('/ioe/success', routes.ioe_success);  //pasarle el usuario??

server.get('/beevalibs/book/list', beevalibs.show_book_list);
server.get('/beevalibs/book/:idbook', beevalibs.show_book_details);
server.get('/beevalibs/book/:idbook/history', beevalibs.show_book_history);

module.exports = server;
