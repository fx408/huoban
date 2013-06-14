function HuoBanContact() {
	this.url = 'http://www.huoban.com/jsonp.php?method=user.listCompanyAllUsers&cb=HB.jsonp.callback';
	this.data = {};
	this.uidToUname = {};
	this.QQNumbers = {};
	this.groupListKey = 'groupList';
	this.settingKey = 'setting_';
	this.settingUid = 0;
	
	// 初始化
	this.init = function() {
		var _this = this;
		this.QQNumbers = QQNumbers;
		
		huoban.request(this.url, {
			isString: true,
			callback: function(err, data) {
				if(false != err) return false;
				
				var data = data.replace("try { HB.jsonp.callback('user.listCompanyAllUsers', ", "").replace(");} catch (e) {};", "");
				data = JSON.parse(data);
				
				if(data && data.header && data.header.errCode == 0) {
					_this.data = data.body;
					_this.show();
				}
			}
		});
	}
	
	// 或取 指定用户的详细信息
	this.getUserDetail = function(uid, object) {
		var _this = this;
		
		this.showDetailLayer('<img src="/images/loading.gif">');
		huoban.request(ajaxUrl, {
			isPost: true,
			callback: function(err, data) {
				if(err == false) {
					_this.showUserDetail(data);
				}
			},
			data: {
				'data[0][header][method]': 'user.getContactDetail',
				'data[0][header][uri]': 'http://www.huoban.com/#/contact',
				'data[0][body][uId]': uid
			}
		});
	}
	
	// 显示列表
	this.show = function() {
		var groups = LDB.item(this.groupListKey) || {},
			html = {},
			setting = {};
		
		$("#groupList").empty();
		groups[0] = {name:"未分组"};
		
		for(var k in this.data) {
			setting = LDB.item(this.settingKey+this.data[k]['uId']) || {};
			if(!setting.group || !groups[setting.group]) setting.group = 0;
			if(!html[setting.group]) html[setting.group] = "";
			
			html[setting.group] += '<li class="user" s="'+this.data[k]['searchField']+'" show="true" uid="'+this.data[k]['uId']+'">'+
			'<a href="###">'+
	  		'<img src="'+this.data[k]['uAvatar']+'" class="img-rounded avatar">'+
	  		'<span class="uName">'+this.data[k]['uName']+'</span>'+
	  		'<span class="uValue">'+this.data[k]['value']+'</span>'+
	  		'<button type="button" class="btn btn-info pull-right btnSet" style="display:none">备注</button>'+
  		'</a>'+
  		'</li>';
  		
  		this.uidToUname[this.data[k]['uId']] = this.data[k]['uName'];
		}
		
		for(var k in html) {
			if(!$("#group"+k).length) {
				var groupHtml = '<div id="group'+k+'" class="group">'+
	  			'<div class="groupTitle"><span class="groupName">'+groups[k].name+'</span> <span class="groupCount">(0)</span></div>'+
	  			'<ul style="display:none" class="nav nav-tabs nav-stacked"></ul>'+
	  			'</div>';
				
				$("#groupList").prepend(groupHtml);
			}
			
			$("#group"+k).find("ul").html(html[k]);
		}
		this.groupCount();
	}
	
	// 显示详细资料
	this.showUserDetail = function(data) {
		var html = '',
			setting = LDB.item(this.settingKey+data.uId) || {},
			groups = LDB.item(this.groupListKey) || {},
			QQNumber = setting.qq || this.QQNumbers[data.uId];
		
		data.uGender = data.uGender == 1 ? "男" : (data.uGender == 2 ? "女" : "保密");
		html += '<div><span class="uName">'+data.uName+'</span>, '+data.uGender+'<div>';
		if(groups[setting.group]) html += '<div>分组: '+groups[setting.group].name+'<div>';
		if(data.uJobTitle != "") html += '<div>职务: '+data.uJobTitle+'<div>';
		if(data.uEmail != "") html += '<div>邮箱: <a href="mailto:'+data.uEmail+'" class="mailto" target="_blank">'+data.uEmail+'</a></div>';
		if(data.uMobile != "") html += '<div>手机: '+data.uMobile+'<div>';
		if(data.uTelephone != "") html += '<div>座机: '+data.uTelephone+'<div>';
		// if(this.QQNumbers[data.uId]) html += '<div>QQ: '+this.QQNumbers[data.uId]+'<div>';
		if(QQNumber) html += '<div><a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin='+QQNumber+'&site=qq&menu=yes"><img border="0" src="http://wpa.qq.com/pa?p=2:'+this.QQNumbers[data.uId]+':41" alt="给我发消息" title="给我发消息"/></a></div>'
		if(setting.remark) html += '<div>备注: '+setting.remark+'<div>';
		
		this.showDetailLayer(html);
	}
	
	// 显示详细资料层
	this.detailLayerTime = 0;
	this.showDetailLayer = function(html) {
		$("#userDetail").fadeIn(300);
		if(html) $("#userDetail").children(".contents").html(html);
		
		if(this.detailLayerTime) clearTimeout(this.detailLayerTime);
		this.detailLayerTime = setTimeout(function() {
			$("#userDetail").fadeOut(300);
		}, 10*1000);
	}
	
	// 筛选查找
	this.search = function(string) {
		$("li.user").each(function() {
			var s = $(this).attr("s");
			if(s.indexOf(string) == -1) {
				$(this).attr("show", "false").hide();
			} else {
				$(this).attr("show", "true").show();
			}
		});
		
		this.groupCount();
	}
	
	// 统计组内用户数量
	this.groupCount = function() {
		$("div.group").each(function() {
			var l = $(this).find("ul li[show=true]").length;
			$(this).find("span.groupCount").html("("+l+")");
		});
	}
	
	// 用户设置
	this.showUserSetting = function(uid) {
		if(!uid) return false;
		this.settingUid = uid;
		
		var _selected,
			html = '',
			groups = LDB.item(this.groupListKey) || {},
			setting = LDB.item(this.settingKey+uid) || {};
		
		html += '<div class="uName">'+this.uidToUname[uid]+'</div>';
		
		html += '<table class="userSettingTable">'+
			'<tr><td class="l">选择分组：</td><td><select id="userGroup">'+
			'<option value="">请选择分组</option>';
		for(var k in groups) {
			_selected = k == setting.group ? ' selected="selected"' : "";
			
			html += '<option value="'+k+'"'+_selected+'>'+groups[k].name+'</option>';
		}
		html += '</select></td></tr>'; 
		html += '<tr><td class="l">QQ号码：</td><td><input type="text" id="userQQ" value="'+(this.QQNumbers[uid] || "")+'"></td></tr>';
		html += '<tr><td class="l">备注：</td><td><input type="text" id="userRemark" value="'+(setting.remark || "")+'"></td></tr>';
		// html += '<tr><td class="l"></td><td></td></tr>';
		html += '<tr><td class="l"></td><td><input type="button" id="saveUserSetting" class="btn btn-right" value="保存"><span id="saveInfo"></span></td></tr>';
		html += '</table>';
		this.showDetailLayer(html);
	}
	
	// 保存设置
	this.saveUserSetting = function() {
		var setting = {
			group: $("#userGroup").val(),
			qq: $("#userQQ").val(),
			remark: $("#userRemark").val()
		};
		
		LDB.set(this.settingKey+this.settingUid, setting);
		$("#saveInfo").html("保存成功!");
	}
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
		$(this).find(".btnSet").show();
	}).on("mouseleave", "li.user", function() {
		$(this).find(".btnSet").hide();
	});
	
	$(document).on("click", ".btnSet", function(e) {
		var uid = $(this).parents("li:eq(0)").attr("uid");
		HBC.showUserSetting(uid);
		e.stopPropagation();
		return false;
	});
	
	$(document).on("click", "#saveUserSetting", function(e) {
		HBC.saveUserSetting();
		e.stopPropagation();
		return false;
	});
	
	$(document).on("click", "div.groupTitle", function() {
		$(this).siblings("ul").slideToggle();
	});
	
	$("#closeDetail").click(function(e) {
		$("#userDetail").fadeOut(200);
		e.stopPropagation();
		return false;
	});
	
	$("#userDetail").click(function() {
		HBC.showDetailLayer();
	});
});