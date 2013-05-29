function Topic() {
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
}
var topic = new Topic();

$(function() {
	// 标星话题列表
	function starCallback(err, data) {
		if(false != err) return false;
		
		var html = topic.createHtml(data, true);
		$("#newTopic table").html(html[0]);
		$("#notRead table").html(html[1]);
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
		useCookie:true,
		callback: starCallback,
	});
	
	$("#showMyFavorite").click(function() {
		huoban.request(ajaxUrl, {
			data: favoriteData,
			isPost: true,
			useCookie:true,
			callback: favoriteCallback,
		});
	});
});
