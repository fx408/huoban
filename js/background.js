function HuobanBackground() {
	var showLoadingAnimation,
		busy = false,
		testTimes = 0, // 繁忙尝试次数
		maxTestTime = 15; // 最大繁忙尝试次数
	
	this.maxFrequency = 1500;
	this.minFrequency = 100;
	this.defaults = {
		frequency: 600,
		time: 10
	};
	
	function request() {
		if(busy) return false;
		busy = true;
		
		if(showLoadingAnimation) LA.start();
		huoban.notReadCount = 0;
		
		var params = {
			callback: function() {
				if(showLoadingAnimation) LA.stop();
				var c = "0";
				
				if(huoban.error == false) {
					huoban.count();
					c = huoban.notReadCount ? (huoban.notReadCount > 10 ? '10+' : huoban.notReadCount.toString()) : "0";
				}
				
				chrome.browserAction.setIcon({path: "/images/icon.png"});
				chrome.browserAction.setBadgeBackgroundColor({color:[208, 0, 24, 255]});
				chrome.browserAction.setBadgeText({text: c});
				
				busy = false;
			},
			isPost: true,
			data: markData,
			useCookie: false
		};
		
		huoban.request(ajaxUrl, params);
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

// A "loading" animation displayed while we wait for the first response from
// Gmail. This animates the badge text with a dot that cycles from left to
// right.
function LoadingAnimation() {
  this.timerId = 0;
  this.maxCount = 8;  // Total number of states in animation
  this.current = 0;  // Current state
  this.maxDot = 4;  // Max number of dots in animation

	this.paintFrame = function() {
	  var text = "";
	  for(var i = 0; i < this.maxDot; i++) {
	    text += (i == this.current) ? "." : " ";
	  }
	  if (this.current >= this.maxDot)
	    text += "";
	
	  chrome.browserAction.setBadgeText({text:text});
	  this.current++;
	  if(this.current == this.maxCount)
	    this.current = 0;
	};
	
	this.start = function() {
		if(this.timerId) return false;
		
		var _this = this;
		this.timerId = window.setInterval(function() {
		  _this.paintFrame();
		}, 100);
	}
	
	this.stop = function() {
	  if(!this.timerId) return false;

	  window.clearInterval(this.timerId);
	  this.timerId = 0;
	}
}
// END LoadingAnimation

var LA = new LoadingAnimation();
var HB = new HuobanBackground();

huoban.isBackground = true;

var isRun = false;
function initHandle () {
	console.log(arguments);
	if(!isRun) {
		console.log("App running!");
		isRun = true;
		HB.run();
	}
}
function alarmHandle(alarm) {
	console.log(arguments);
	initHandle();
}

chrome.runtime.onInstalled.addListener(initHandle);
chrome.alarms.onAlarm.addListener(alarmHandle);
chrome.windows.onCreated.addListener(initHandle);
//chrome.webNavigation.onDOMContentLoaded.addListener(initHandle);