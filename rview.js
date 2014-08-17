(function() {
	var rview = {
			views : {},
			view : function(id, _html, init) {
				this.views[id] = {
						html : document.getElementById(_html).innerHTML,
						init : init
				}
			},
			transition : function(id, args) {
				var content = document.getElementById("content")
				content.innerHTML = this.views[id].html;
				this.views[id].init(args);
			}
	}
	
	window.rview = rview;
}())