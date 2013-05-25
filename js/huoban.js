var QUERY = 'puppies',
	ajaxUrl = 'http://www.huoban.com/ajax.php',
	markData = {
		'data[0][header][method]': 'markproject.listTopics',
		'data[0][header][uri]': 'http://www.huoban.com/#/starredProjects/view',
		'data[0][body][order][field]': 'tSorted',
		'data[0][body][order][type]': 'DESC',
		'data[0][body][nextPageSorted]': ''
	};

function HuoBan() {
	this.isBackground = false;
	this.isString = false; // 请求后的数据是否为字符串
	this.error = false;
	
	this.callback = function(){}; // 回掉函数
	this.domain = '.huoban.com';
	this.list = {};
	
	// 表单数据
  this.formData = function(data) {
  	var fd = new FormData();
  	for(var k in data) {
  		fd.append(k, data[k]);
  	}
  	return fd;
  }
  
  // 读取cookies
  this.cookies = function() {
  	var cookieString = '';
  	
  	chrome.cookies.getAll({'domain': this.domain}, function(cookies) {
  		for(var k in cookies) {
  			cookieString += cookies[k].name+"="+cookies[k].value+"; ";
  		}
  	});
  	
  	return cookieString;
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
    
    if(params.useCookie) req.setRequestHeader('Cookie', this.cookies());
    req.send(this.formData(data));
  }

	// 请求成功 回调
	this.afterRequest = function(e) {
		var res = e.target.response;
		
		if(this.isString) {
			this.list = res;
		} else {
	  	res = JSON.parse(res);
	  	
	  	if(res[0].header.errCode==0) {
	  		this.list = res[0].body;
	  		this.error = false;
	  	} else {
	  		this.list = res[0].header;
	  		this.error = true;
	  	}
	  }
  	
  	if(typeof this.callback == "function") this.callback();
  }
  
  // 显示列表
	this.show = function() {
  	console.log(this.list);
  	
  	var newTopic = document.getElementById("newTopic"),
  		notRead = document.getElementById("notRead"),
  		count = {0:0, 1:1},
  		a, li, suffix, topic;
  	
  	for(var k in this.list.topics) {
  		topic = this.list.topics[k];
  		if(!topic.tId) break;
  		
  		suffix = topic.tSubject.length > 20 ? '...' : '';
  		
  		a = this.createElement("a", {
  			href: "http://www.huoban.com/#/topic/viewForStarredProjects?tId="+topic.tId,
  			title: topic.tSubject,
  			innerHTML: topic.tSubject.substring(0, 20)+suffix,
  			target: "_blank"
  		});
  		li = this.createElement("li", {innerHTML: '&nbsp; &nbsp;'+a.outerHTML+' &nbsp; <span class="data_time">'+topic.tPublished.substring(5,16)+'</span>&nbsp;'});
  		
  		if(count[0] < 10) {
	  		newTopic.appendChild(li);
	  		count[0]++;
	  	}

  		if(topic.isRead == false && count[1] < 10) {
  			notRead.appendChild(li);
  			count[1]++;
  		}
  	}
  	
  	$("#newTopic li:odd").addClass("odd");
  	$("#notRead li:odd").addClass("odd");
  }
  
  this.createElement = function(eleName, options) {
  	var ele = document.createElement(eleName);
  	
  	for(var k in options) {
  		ele[k] = options[k];
  	}
  	
  	return ele;
  }
  
	this.showError = function() {
  	document.body.innerHTML = "Error: "+this.list.errCode+"; <br>" + this.list.errMessage;
  }
  
  // 统计未读主题数量
	this.count = function() {
  	for(var k in this.list.topics) {
  		var topic = this.list.topics[k];
  		
  		if(topic.isRead == false) {
  			this.notReadCount++;
  		}
  	}
  }
}

var huoban = new HuoBan();