var express = require('express');
var User = require('../model/Login');

var app = require('../app.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var router = express.Router();


module.exports = router