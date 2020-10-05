//sessionStorage.removeItem('basketitems');

var app = angular.module('recentViewApp', ['ui.bootstrap','ngTagsInput','angularUtils.directives.dirPagination']);


app.filter('localdateformate',function(){
	return function(input)
	{		
		var d = new Date(input);
		var time = d.toString().split(" ")[4];
		var getDate = d.getDate();
		var getMonth = d.getMonth() + 1;
		var getFullYear = d.getFullYear();
		if(getMonth < 10)
		getMonth = "0"+getMonth;
		if(getDate < 10)
		getDate = "0"+getDate;
		var startDate = getFullYear+"-"+getMonth+"-"+getDate;
		var updatedAt =  startDate.substring(0, 10) + " " + time;		
		return updatedAt;
	}
});


app.filter('recentViewFilter', function() {
    return function(input, searchText) {
        if(angular.isArray(input)) {
          if(searchText != null && searchText != ""){
            var filteredList = [];

        angular.forEach(input, function (val) {
            //Not Match exact comments
            if (val.comments.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || val.id.toLowerCase().indexOf(searchText.toLowerCase()) >= 0  || val.author.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 ) {
                filteredList.push(val);
            }else{
			 var array=	val.tags.filter(function(el) {
					return el.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
				})
				if(array.length){
					filteredList.push(val);					
				}				

			}
            
        });
        input = filteredList;
          }        
       
        return input;
      }
    };
});



app.controller('recentViewController',function($scope,$http,$timeout){

var bqdata = document.getElementById('bqdata');
var bqdataHtml = bqdata.innerHTML.trim();
var data = JSON.parse(bqdataHtml);
$scope.recentViewQuestions = data.questiondata;
$scope.basket = data.basket;

$("#LiBasket").show();

$scope.subjectPubList = [];
$scope.topicPubList = [];


$scope.addtobasket = function(qid){	

	var indexnumber = $scope.basket.findIndex(x => x==qid);
	//var removeindex	= $scope.basket.indexOf(qid);
	//console.log(indexnumber);

	if(indexnumber>-1)
	{
		$.notify({
			message: "Question <b>"+ qid +"</b> already in the basket"

		},{
		type: 'info',
		delay:1000,
		placement: {
		from: 'top',
		align: 'center'
		}
		});

		return;
	}
	

	$http.post("/author_addToBaseketQuestion", { 'question': qid }).then(function (callback)
	{
        // console.log(callback);
	    if(callback.data.status === "ok")
	    {
			$scope.basket.push(qid);
			$("#ad"+qid).removeClass('inbasket').addClass('inbasket');
			
			$.notify({
				message: "Question <b>"+qid+"</b> has been added to basket"

			},{
			type: 'success',
			delay:1000,
			placement: {
			from: 'top',
			align: 'center'
			}
			});

		}else		
		if(callback.data.status === "maxlimit")
		{
			swal({
				title: 'Basket Limit',
				text: 'You can add only 20 questions in the basket',
				type: 'warning',
				confirmButtonClass: "btn btn-info btn-fill",
				buttonsStyling: false
			});
		}
		   		
	},
	function (error)
	{
		$.notify({
			message: "Something Goes Try Again"
		},{
		type: 'danger',
		delay:1000,
		placement: {
		from: 'top',
		align: 'center'
		}
		});

	});

	// end of http


}


});	 