var footer = '<div class="navbar" style="margin: 0px 5px 5px 0px;"><div class="navbar-inner">'+
	'<ul class="nav">'+
		'<li><a href="/pages/popup.html">主题</a></li>'+
		'<li class="divider-vertical"></li>'+
		'<li><a href="/pages/contact.html">通讯录</a></li>'+
		'<li class="divider-vertical"></li>'+
		'<li><a href="/pages/setting.html">设置</a></li>'+
	'</ul>'+
  '</div></div>';
document.write(footer);

//$(".navbar .nav li").css({"border-right": "0px", "border-left": "0px"});
var _href = window.location.href.replace(/.*?\/pages\/(.*?)\.html$/, "/pages/$1.html");

console.log(_href);

$(".navbar a[href='"+_href+"']").parent("li").removeClass().addClass("active");
