document.addEventListener('DOMContentLoaded', function () {
	huoban.request(
		ajaxUrl,
		{
			data: markData,
			isPost: true,
			useCookie:true,
			callback: function() {
				huoban.show();
			}
		}
	);
});