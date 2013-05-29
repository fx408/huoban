var user = function() {
	this.list = {};
	
	this.auth = function(handshakeData, callback) {
		if(!handshakeData.headers.cookie) {
			return callback("Cookie is null!", false);
		}
		
		var cookies = cookie.parse(handshakeData.headers.cookie);
		if(!cookies.uid) {
			return callback("Login status error!", false);
		}
		
		handshakeData.cookies = cookies;
		callback(null, true);
	}
};

module.exports = new user();