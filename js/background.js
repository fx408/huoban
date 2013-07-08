function HuobanBackground() {
	var busy = false,
		testTimes = 0, // 繁忙尝试次数
		maxTestTime = 15, // 最大繁忙尝试次数
		starData = {
			'data[0][header][method]': 'markproject.listTopics',
			'data[0][header][uri]': 'http://www.huoban.com/#/starredProjects/view',
			'data[0][body][order][field]': 'tSorted',
			'data[0][body][order][type]': 'DESC',
			'data[0][body][nextPageSorted]': ''
		},
		_this = this;
	
	this.maxFrequency = 1500;
	this.minFrequency = 100;
	this.defaults = {
		frequency: 600,
		time: 10
	};
	
	// 请求数据
	function request() {
		if(busy) return false;
		busy = true;
		
		var params = {
			callback: function(err, data) {
				if(false != err) return false;
				
				var c = _this.count(data, true);
				c = c ? (c > 10 ? '10+' : c.toString()) : "0";
				
				_this.updateIcon(c);
				busy = false;
			},
			isPost: true,
			data: starData
		};
		
		huoban.request(ajaxUrl, params);
	}
	
	// 计算未读话题数量
	this.count = function(data, showNoti) {
		var notReadCount = 0;
  	for(var k in data.topics) {
  		if(data.topics[k].isRead == false) {
  			
  			// 只检查第一条未读提示
  			if(showNoti && notReadCount == 0 && this.notification == null) {
  				this.showNotification(data.topics[k].tId, {
  					title: data.topics[k].tSubject,
  					content: data.topics[k].teSummary+"  "+data.topics[k].tPublished
  				});
  			}
  			notReadCount++;
  		}
  	}
  	return notReadCount;
	}
	
	// 计算尝试次数
	function countTestTimes() {
		if(testTimes > maxTestTime) {
			testTimes = 0;
			busy = false;
			return false;
		}
		testTimes++;
	}
	
	// 更新图标,显示未读话题数量
	this.updateIcon = function(string) {
		string = string.toString();
		
		chrome.browserAction.setIcon({path: "/images/icon.png"});
		chrome.browserAction.setBadgeBackgroundColor({color:[208, 0, 24, 255]});
		chrome.browserAction.setBadgeText({text: string});
	}
	
	// 桌面消息通知
	this.notification = null;
	this.showNotification = function(tid, data) {
		if(LDB.item("desktopNotify") != 1 || !tid) return false;
		var notifyHistory = LDB.item("notifyHistory") || {};
		if(notifyHistory[tid]) return false;
		notifyHistory[tid] = 1;
		LDB.set("notifyHistory", JSON.stringify(notifyHistory));
		
		data = data || {};
		data.title = data.title || "消息提示";
		data.content = data.content || "消息提示";
		data.icon = 'http://www.findlark.com/static/icons/icon.png';
		
		if(window.webkitNotifications && this.notification==null) {
			this.notification = window.webkitNotifications.createNotification(data.icon, data.title, data.content);
			this.notification.onclick = function() {
				//window.open("http://www.huoban.com");
			}
			
		  this.notification.show();
		  var closeTime = Math.abs( parseInt(LDB.item("notifyCloseTime")) );
		  if(closeTime) {
		  	closeTime = Math.min(100, Math.max(closeTime, 3));
		  	
			  setTimeout(function() {
			  	_this.notification.close();
			  	_this.notification=null;
			  }, closeTime*1000);
			}
		}
	}
	
	this.timeOutCache = {};
	this._setTimeout = function(func, time) {
		var _this = this;
		
		if(this.timeOutCache[func]) clearTimeout(this.timeOutCache[func]);
		this.timeOutCache[func] = setTimeout(function() {
			_this[func]();
		}, time*1000);
	}
	
	// 运行
	this.run = function() {
		var auto = LDB.item('autoCheck');
		
		if(auto === 0 || busy == true) {
			this._setTimeout("run", this.defaults.time);
			countTestTimes();
			return false;
		}
		
		var frequency = LDB.item("frequency");
		if(frequency === null) frequency = this.defaults.frequency;
		frequency = Math.max(this.minFrequency, Math.min(parseInt(frequency), this.maxFrequency));
		
		showLoadingAnimation = false;
		this._setTimeout("run", frequency);
		request();
	}
}
huoban.cookies();
var HB = new HuobanBackground();

var isRun = false;
function initHandle () {
	console.log("initHandle");
	console.log(arguments);
	console.log("isRun: "+isRun);
	if(!isRun) {
		console.log("App running!");
		isRun = true;
		HB.run();
	}
}
function alarmHandle(alarm) {
	initHandle();
}

chrome.runtime.onInstalled.addListener(initHandle);
chrome.alarms.onAlarm.addListener(alarmHandle);
chrome.windows.onCreated.addListener(initHandle);
chrome.webNavigation.onDOMContentLoaded.addListener(initHandle);