var broadcast = function() {
	this.socketList = {}; // 连接的用户列表
	this.connectCount = 0; // 当前连接数
	this.maxConnect = 100; // 允许最大连接数
	
	this.maxBlockTime = 10; // redis 最长阻塞时间 (s)
	
	this.msgList = []; // 消息列表
	
	this.msgPraiseCount = {};
	
	this.redisKeys = {
		msgCountY: 'broadcast_msg_yes_', // 吐槽
		msgCountN: 'broadcast_msg_no_' // 无力
	};
	
	this.runTime = 0;
	// 运行，从 redis 中取消息发送广播
	this.run = function() {
		var _this = this,
			msg = {};
		
		console.log(this.msgList);
		
		while(this.msgList.length) {
			msg = this.msgList.shift(); 
			_this.send(msg[0]);
		}
		
		if(this.runTime) clearTimeout(this.runTime);
		this.runTime = setTimeout(function() {
			_this.run();
		}, 500);
	}
	
	// 监听事件
	this.listenEvent = function(socket) {
		if(this.connectCount > this.maxConnect) return false;
		++this.connectCount;
		
		this.socketList[socket.id] = socket;
		console.log("connect:"+socket.id);
		
		var _this = this;
		socket.on('disconnect', function () {
			delete _this.socketList[socket.id];
			--_this.connectCount;
			console.log("disconnect:"+socket.id);
		});
		
		socket.on('post', function(data) {
			_this.userPost(socket, data);
		});
		
		socket.on('tc', function(data) {
			var k = data.type == "yes" ? _this.redisKeys.msgCountY : _this.redisKeys.msgCountN;
			k = k+data.id;
			
			redisClient.incr(k, function(err, i) {
				_this.msgPraiseCount[data.id][k] = i;
			});
		});
		
		this.firstConnectMsg();
	}
	
	// 首次连接
	this.firstConnectMsg = function() {
		var msg = '{"title":"Hello. Click me!", "content":"Hello, Do you want to say something?"}';

		this.send(msg, "init");
	}
	
	// 用户提交请求
	this.userPost = function(socket, data) {
		console.log(data);
		
		data.content = data.content.replace('"', '&quot;')
			.replace("'", '&acute;')
			.replace('<', '&gt;')
			.replace('>', '&lt;');
		
		var date = new Date(),
			msg = {uid:parseInt(socket.userId), content:data.content},
			_this = this,
			sql = "INSERT INTO message (`id`, `uid`, `content`, `timeline`) VALUES (NULL, "+msg.uid+", '"+msg.content+"', '"+date.toLocaleTimeString()+"')";
		
		mysqlClient.query(sql, function() {
			console.log("---> insert");
			console.log(arguments);
			if(arguments[0] != null) return false;
			
			msg.id = arguments[1]['insertId'];
			_this.msgList.push(msg);
		});
	}
	
	// 发送广播
	this.send = function(msg, method) {
		method = method || "news";
		
		msg = this.formatMsg(msg);
		if(!msg) return this.run();
	
		for(var k in this.socketList) {
			this.socketList[k].emit(method, msg);
		}
	}
	
	// 格式化消息
	this.formatMsg = function(msg) {
		if(typeof msg == "string") msg = JSON.parse(msg);
		
		var date = new Date(),
			count = {},
			defaults = {id:0, content: '', uid: '', time: 0};
			
		for(var k in msg) {
			defaults[k] = msg[k];
		}
		defaults.id = defaults.id || 0;
		
		count = this.msgPraiseCount[defaults.id] || {};
		defaults.yes = count[this.redisKeys.msgCountY+defaults.id] || 0;
		defaults.no = count[this.redisKeys.msgCountN+defaults.id] || 0;
		defaults.time = defaults.time || date.toLocaleTimeString();
		return defaults;
	}
	
	this.run();
}

module.exports = new broadcast();