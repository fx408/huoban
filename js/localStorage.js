// 本地 key-value 数据库
var LocalDatabase = function() {
	this.LS = localStorage;
}

LocalDatabase.prototype.item = function(k) {
	var val = this.LS.getItem(k);
	if(val===null) return null;

	try{
		val = JSON.parse(val);
	} catch(e) {
		console.log(e);
		val = val;
	}

	return val;
};

LocalDatabase.prototype.set = function(k, val) {
	try{
		if(typeof(val) != 'string') val = JSON.stringify(val);

		this.LS.setItem(k, val);
	} catch(e) {
		console.log(e);
	}
};

LocalDatabase.prototype.list = function() {
	var k = '', list = {};

	for(var i = 0, l = this.LS.length; i < l; i++) {
		k = this.LS.key(i);
		list[k] = this.item(k);
	}

	return list;
};

LocalDatabase.prototype.clear = function() {
	this.LS.clear();
};

LocalDatabase.prototype.del = function(k) {
	this.LS.removeItem(k);
};

var LDB = new LocalDatabase();