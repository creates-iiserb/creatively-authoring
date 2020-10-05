app.filter('localDateFormate',function(){
	return function(input)
	{		
		var date= new Date(input);
		var localFormat = date.toString();
		var localDate = new Date(localFormat);
		let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		
		var dd = localDate.getDate();//dat
		// Oct 11, 2018
		if (dd < 10) { dd = '0' + dd }//    
		let ldate = month[localDate.getMonth()] + " " + dd + ", " + localDate.getFullYear();
		return ldate;
	}
});