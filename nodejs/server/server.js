require('./config');

var io = require('socket.io').listen(config.socketPort),
	redis = require("redis"),
	mysql = require("mysql"),
	user = require('./user');

global.cookie = require("cookie");

global.redisClient = redis.createClient(config.redis.port, config.redis.host);
global.redisClient.on("error", function (err) {
	console.log("Error " + err);
});

global.mysqlClient = mysql.createConnection(config.mysql);
mysqlClient.on('error', function(err) {
  console.log(err);
});

setInterval(function(){
	mysqlClient.ping();
},60000);

var broadcast = require("./broadcast");
io.of('/broadcast')
.authorization(user.auth)
.on('connection', function (socket) {
	var uid = socket.handshake.cookies.uid;
	if(!uid) return false;
	
	socket.userId = uid;
	broadcast.listenEvent(socket);
});
