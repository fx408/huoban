function ContactGroup() {
	this.list = {};
	this.lastId = 0;
	
	this.init = function() {
		this.list = LDB.item("groupList") || {};
		this.show();
	}
	
	this.show = function() {
		var html = "";
		
		for(var k in this.list) {
			html += '<tr  gid="'+k+'">'+
				'<td><div class="input-prepend settingInput">'+
					'<span class="add-on">'+k+'</span>'+
					'<input class="span2 inputGroupName" value="'+this.list[k].name+'" type="text" placeholder="">'+
				'</div></td>'+
  			'<td class="va-inherit"><a href="javascript:;" class="del">删除</a></td>'+
  			'</tr>';
			
			this.lastId = k;
		}
		
		$("#groupList").html(html);
	}
	
	// 保存
	this._save = function() {
		LDB.set("groupList", JSON.stringify(this.list));
		this.init();
	}
	
	// 添加
	this.add = function(val) {
		val = $.trim(val);
		if(val == "") return false;
		
		var k = this.lastId*1 + 1;
		this.list[k] = {};
		this.list[k].name = val;
		
		this._save();
	}
	
	// 删除
	this.del = function(gid) {
		for(var k in this.list) {
			if(k == gid) delete this.list[k];
		}
		
		this._save();
	}
	
	// 更新
	this.update = function(gid, val) {
		for(var k in this.list) {
			if(k == gid) this.list[k].name = val;
		}
		
		this._save();
	}
}

var CG = new ContactGroup();

$(function() {
	CG.init();
	
	$("#addGroup").click(function() {
		var val = $("#groupName").val();
		CG.add(val);
		$("#groupName").val("");
	});
	
	$(document).on("change", ".inputGroupName", function() {
		var gid = $(this).parents("tr:eq(0)").attr("gid"),
			val = $(this).val();
		CG.update(gid, val);
	}).on("click", "a.del", function() {
		var gid = $(this).parents("tr:eq(0)").attr("gid");
		CG.del(gid);
		return false;
	});
	
});