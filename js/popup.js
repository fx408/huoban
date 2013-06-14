function Topic() {
	
	// 生成话题列表
	this.createHtml = function(data, isRead, commentNum) {
		var a, suffix, topic, tr, topicHtml = '', notRead = '', titleLen = 16;
		
		for(var k in data.topics) {
			topic = data.topics[k];
			if(!topic.tId) break;
			
			suffix = topic.tSubject.length > titleLen ? '...' : '';
			
			a = this.createElement("a", {
				href: "http://www.huoban.com/#/topic/viewForStarredProjects?tId="+topic.tId,
				title: topic.tSubject+', '+topic.teSummary,
				innerHTML: topic.tSubject.substring(0, titleLen)+suffix,
				target: "_blank"
			});
			tr = '<tr><td>'+a.outerHTML+'</td><td>'+topic.tPublished.substring(5,16)+'</td></tr>';
			
	  	topicHtml += tr;
			if(isRead && topic.isRead == false) notRead += tr;
		}
		
		return [topicHtml, notRead];
	}
	
  // 创建 元素
  this.createElement = function(eleName, options) {
  	var ele = document.createElement(eleName);
  	for(var k in options) {
  		ele[k] = options[k];
  	}
  	return ele;
  }
  
  // 查询话题
  this.searchTopic = function(keyword, searchType, authorId) {
  	searchType = searchType == "author" ? "author" : "complex";
  	
		var searchData = {
			'data[0][header][method]': 'search.search',
			'data[0][body][currentPage]': 1,
			'data[0][body][searchTxt]': keyword,
			'data[0][body][searchType]': searchType
		};
		if(searchType == "author") {
			console.log(authorId)
			if(!authorId) return false;
			
			searchData['data[0][header][uri]'] = 'http://www.huoban.com/#/search/list?searchType=author&authorId='+authorId;
			searchData['data[0][body][authorId]'] = authorId;
		} else {
			searchData['data[0][header][uri]'] = 'http://www.huoban.com/#/search/list?searchType=complex&searchTxt='+keyword;
		}
		
		var _this = this;
		huoban.request(ajaxUrl, {
			data: searchData,
			isPost: true,
			callback: function(err, data) {
				if(false == err) _this.searchTopicCallback(data);
			}
		});
  }
  
  // 话题查询回调函数
  this.searchTopicCallback = function(data) {
  	var newData = {};
  	newData.topics = [];
  	
  	for(var k in data.contents.docs) {
  		var doc = data.contents.docs[k];
  		var temp = {
  			tId: doc.scSourceId,
  			tSubject: doc.scSubject,
  			teSummary: doc.scContent,
  			tPublished: doc.scCreated,
  			isRead:true
  		};
  		
  		newData.topics.push(temp);
  	}
  	
  	console.log(newData);
  	
  	var html = this.createHtml(newData);
  	$("#searchTopic table").html(html[0]);
  }
  
  // 获取用户列表
  this.userList = null;
  this.getUserList = function() {
  	if(this.userList != null) return false;
  	
  	var _this = this;
  	
  	huoban.request('http://www.huoban.com/jsonp.php?method=user.listCompanyAllUsers&cb=HB.jsonp.callback', {
			isString: true,
			callback: function(err, data) {
				if(false != err) return false;
				
				var data = data.replace("try { HB.jsonp.callback('user.listCompanyAllUsers', ", "").replace(");} catch (e) {};", "");
				data = JSON.parse(data);
				
				if(data && data.header && data.header.errCode == 0) {
					_this.userList = data.body;
				}
			}
		});
	}
	
	// 匹配用户列表
	this.matchUser = function(string) {
		var html = "";
		if(this.userList != null) {
			var c = 0;
			for(var k in this.userList) {
				if(this.userList[k].searchField.indexOf(string) != -1) {
					html += '<li uid='+this.userList[k].uId+'><a href="#">'+this.userList[k].uName+' ('+this.userList[k].uHandle+')</a></li>';
					if(++c >= 30) break;
				}
			}
		}
		// if(html == "") return this.matchUser("");
		$("#matchUserList").html(html);
	}
  
  // 绑定事件
  this.bindEvent = function() {
  	var _this = this;
  	
  	$("#searchTopic .searchBtn").click(function() {
  		var keyword = $("#searchTopic .searchTopicText").val();
  		_this.searchTopic(keyword, "complex");
  		
  		return false;
  	});
  	$("#matchUserList").on("click", "li", function() {
  		_this.searchTopic('', "author", $(this).attr("uid"));
  		$("#showMatchUser").trigger("click").blur();
  		return false;
  	});
  	
  	$("#showSearchTopic").click(function() {
  		_this.getUserList();
  	});
  	
  	$("#showMatchUser").click(function(){
  		var keyword = $("#searchTopic .searchTopicText").val();
  		_this.matchUser(keyword);
  	});
  }
}
var topic = new Topic();

$(function() {
	topic.bindEvent();
	
	// 标星话题列表
	function starCallback(err, data) {
		if(false != err) return false;
		
		var html = topic.createHtml(data, true);
		$("#newTopic table").html(html[0]);
		$("#notRead table").html(html[1]);
		
		try{
			var backWin = chrome.extension.getBackgroundPage(),
				c = backWin.HB.count(data);
			backWin.HB.updateIcon(c);
		} catch(e) {
			console.log(e);
		}
	}
		
	// 收藏话题列表
	function favoriteCallback(err, data) {
		if(false != err) return false;
		
		var html = topic.createHtml(data);
		$("#myFavorite table").html(html[0]);
	}
	
	var starData = {
		'data[0][header][method]': 'markproject.listTopics',
		'data[0][header][uri]': 'http://www.huoban.com/#/starredProjects/view',
		'data[0][body][order][field]': 'tSorted',
		'data[0][body][order][type]': 'DESC',
		'data[0][body][nextPageSorted]': ''
	};
	
	var favoriteData = {
		'data[0][header][method]': 'favorite.listFavoriteTopics',
		'data[0][header][uri]': 'http://www.huoban.com/#/favorite/topic',
		'data[0][body][nextPageSorted]': ''
	};
	
	huoban.request(ajaxUrl, {
		data: starData,
		isPost: true,
		callback: starCallback,
	});
	
	$("#showMyFavorite").click(function() {
		huoban.request(ajaxUrl, {
			data: favoriteData,
			isPost: true,
			callback: favoriteCallback,
		});
	});
});
