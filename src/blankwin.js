
this.blankwin  = function(){
	var hostname = window.location.hostname;
	hostname = hostname.replace("www","").toLowerCase();
	var a = document.getElementsByTagName("a");
	this.check = function(obj){
		var href = obj.href.toLowerCase();
		return ((href.indexOf("http://")!=-1 || href.indexOf("https://")!=-1) && href.indexOf(hostname)==-1) ? true : false;
	};
	this.set = function(obj){
		obj.target = "_blank";
		obj.className = "external";
	};
	for (var i=0; i<a.length; i++) {
		if(check(a[i])) set(a[i]);
	};
};


