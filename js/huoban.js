var QUERY = 'puppies',
	ajaxUrl = 'http://www.huoban.com/ajax.php';

function HuoBan() {
	this.isString = false; // 请求后的数据是否为字符串
	this.error = false;
	
	this.callback = function(){}; // 回掉函数
	this.domain = '.huoban.com';
	this.list = {};
	
	this.cookieCache = {};
	
	// 表单数据
  this.formData = function(data) {
  	var fd = new FormData();
  	for(var k in data) {
  		fd.append(k, data[k]);
  	}
  	fd.append('xsrf', this.cookieCache['xsrf']);
  	return fd;
  }
  
  // 读取cookies
  this.cookies = function(callback) {
  	var _this = this;
  	
  	chrome.cookies.getAll({}, function(cookies) {
  		var cookieString = '';
  		for(var k in cookies) {
  			_this.cookieCache[cookies[k].name] = cookies[k].value;
  		}
  		
  		callback && callback();
  	});
  }
  
  // 请求数据
  this.request = function(url, params) {
  	this.callback = params.callback || function() {};
  	this.isString = params.isString || false;
  	data = params.data || {};
  	
  	var _this = this,
  		requestType = params.isPost ? "POST" : "GET";
  	
    var req = new XMLHttpRequest();
    req.open(requestType, url, true);
    req.onload = this.afterRequest.bind(this);
    req.onerror = function() {
    	console.log("--error--");
    	console.log(arguments);
    };
    
    req.send(this.formData(data));
  }

	// 请求成功 回调
	this.afterRequest = function(e) {
		var res = e.target.response,
			returnData = {},
			error = false;
		
		if(this.isString) {
			returnData = res;
		} else {
	  	res = JSON.parse(res);
	  	
	  	if(res[0].header.errCode==0) {
	  		returnData = res[0].body;
	  		error = false;
	  	} else {
	  		returnData = res[0].header;
	  		error = true;
	  	}
	  }
  	
  	if(typeof this.callback == "function") this.callback(error, returnData);
  }
}

var huoban = new HuoBan();