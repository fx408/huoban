function HuoBanContact() {
	this.url = 'http://www.huoban.com/jsonp.php?method=user.listCompanyAllUsers&cb=HB.jsonp.callback';
	this.data = {};
	this.QQNumbers = {
		'100887': '664712890',
		'100285': '369291921',
		'100494': '1055892920'
	};
	
	// 初始化
	this.init = function() {
		var _this = this;
		
		huoban.request(
			this.url,
			{
				isString: true,
				callback: function() {
					var data = huoban.list.replace("try { HB.jsonp.callback('user.listCompanyAllUsers', ", "").replace(");} catch (e) {};", "");
					data = JSON.parse(data);
					
					if(data && data.header && data.header.errCode == 0) {
						_this.data = data.body;
						_this.show();
					}
				}
			}
		);
	}
	
	// 或取 指定用户的详细信息
	this.getUserDetail = function(uid, object) {
		var _this = this;
		
		this.showDetailLayer();
		huoban.request(
			ajaxUrl,
			{
				isPost: true,
				callback: function() {
					if(huoban.error == false) {
						_this.showUserDetail(huoban.list);
					}
				},
				data: {
					'data[0][header][method]': 'user.getContactDetail',
					'data[0][header][uri]': 'http://www.huoban.com/#/contact',
					'data[0][body][uId]': uid
				},
				useCookie: true
			}
		);
	}
	
	// 显示列表
	this.show = function() {
		var html = '';
		
		for(var k in this.data) {
			html += '<li class="user" s="'+this.data[k]['searchField']+'" uid="'+this.data[k]['uId']+'">'+
  		'<img src="'+this.data[k]['uAvatar']+'" class="avatar">'+
  		'<span class="uName">'+this.data[k]['uName']+'</span>'+
  		'<span class="uValue">'+this.data[k]['value']+'</span>'+
  		'<a href="javascript:;" class="btnSet" id="userSet" style="display:none"></a>'+
  		'</li>';
		}
		
		$("#group0 ul").html(html);
		
		this.groupCount();
	}
	
	// 显示详细资料
	this.showUserDetail = function(data) {
		console.log(data);
		var html = '';
		
		data.uGender = data.uGender == 1 ? "男" : (data.uGender == 2 ? "女" : "保密");
		html += '<div><span class="uName">'+data.uName+'</span>, '+data.uGender+'<div>';
		if(data.uEmail != "") html += '<div>邮箱: <a href="mailto:'+data.uEmail+'" class="mailto" target="_blank">'+data.uEmail+'</a></div>';
		if(data.uJobTitle != "") html += '<div>职务: '+data.uJobTitle+'<div>';
		if(data.uMobile != "") html += '<div>手机: '+data.uMobile+'<div>';
		if(data.uTelephone != "") html += '<div>座机: '+data.uTelephone+'<div>';
		// if(this.QQNumbers[data.uId]) html += '<div>QQ: '+this.QQNumbers[data.uId]+'<div>';
		if(this.QQNumbers[data.uId]) html += '<div><a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin='+this.QQNumbers[data.uId]+'&site=qq&menu=yes"><img border="0" src="http://wpa.qq.com/pa?p=2:'+this.QQNumbers[data.uId]+':41" alt="给我发消息" title="给我发消息"/></a></div>'
		
		this.showDetailLayer(html);
	}
	
	// 显示详细资料层
	this.detailLayerTime = 0;
	this.showDetailLayer = function(html) {
		html = html || '<img src="/images/loading.gif">';
		$("#userDetail").fadeIn(300).children(".contents").html(html);
		
		if(this.detailLayerTime) clearTimeout(this.detailLayerTime);
		this.detailLayerTime = setTimeout(function() {
			$("#userDetail").fadeOut(300);
		}, 8*1000);
	}
	
	// 筛选查找
	this.search = function(string) {
		$("li.user").each(function() {
			var s = $(this).attr("s");
			if(s.indexOf(string) == -1) {
				$(this).hide();
			} else {
				$(this).show();
			}
		});
		
		this.groupCount();
	}
	
	// 统计组内用户数量
	this.groupCount = function() {
		$("div.group").each(function() {
			var l = $(this).find("ul li:visible").length;
			$(this).children(".groupCount").html("("+l+")");
		});
	}
	// this.init();
}

var HBC = new HuoBanContact();

$(function() {
	HBC.init();
	
	$("#search").keyup(function() {
		var val = $(this).val();
		HBC.search(val);
	});
	
	$(document).on("click", "li.user", function() {
		var uid = $(this).attr("uid");
		HBC.getUserDetail(uid, this);
	}).on("mouseenter", "li.user", function() {
		console.log(this);
		$(this).find("a.btnSet").show();
	}).on("mouseleave", "li.user", function() {
		$(this).find("a.btnSet").hide();
	});
	
	$(document).on("click", "#userSet", function(e) {
		
		return false;
		e.stopPropagation();
	});
	
	$("#closeDetail").click(function() {
		$("#userDetail").fadeOut();
	});
});