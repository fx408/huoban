$(function() {
	var defaults = LDB.list();
	$("#setting input").each(function() {
		var t = $(this).attr("type"),
			k = $(this).attr("name"),
			v = defaults[k];
		
		switch(t) {
			case "radio":
				$(this).removeAttr("checked");
				$("#setting input[name="+k+"][value="+v+"]").click();
				break;
			case "textarea":
			case "text":
			case "hidden":
				$(this).val(v);
				break;
			default: break;
		}
	});
	
	$("input[name=autoCheck]").change(function() {
		var val = $(this).val();
		
		if(val == 1) $("tr.frequency").show();
		else $("tr.frequency").hide();
	});
	
	$("#setting input").change(function() {
		var k = $(this).attr("name"),
			v = $(this).val();
		
		LDB.set(k, v);
	});
});