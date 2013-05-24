function HuobanBackground() {
	var showLoadingAnimation,
		busy = false,
		testTimes = 0, // 繁忙尝试次数
		maxTestTime = 15; // 最大繁忙尝试次数
	
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
				var c = huoban.notReadCount ? (huoban.notReadCount > 10 ? '10+' : huoban.notReadCount.toString()) : "0";
				
				if(showLoadingAnimation) LA.stop();
				
				chrome.browserAction.setIcon({path: "images/icon.png"});
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
	
	// 运行
	this.run = function() {
		var auto = LDB.item('autoCheck'),
			_this = this;
		
		if(auto === 0 || busy == true) {
			setTimeout(function() {
				_this.run();
			}, this.defaults.time*1000);
			
			countTestTimes();
			return false;
		}
		
		var frequency = LDB.item("frequency");
		if(frequency === null) frequency = this.defaults.frequency;
		frequency = Math.max(10, Math.min(parseInt(frequency), 1000));
		
		showLoadingAnimation = false;
		
		setTimeout(function() {
			_this.run();
		}, frequency*1000);
		
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

function installedHandle () {
	console.log(arguments);
	HB.run();
}
function alarmHandle(alarm) {
	console.log(arguments);
	HB.run();
}

chrome.runtime.onInstalled.addListener(installedHandle);
chrome.alarms.onAlarm.addListener(alarmHandle);