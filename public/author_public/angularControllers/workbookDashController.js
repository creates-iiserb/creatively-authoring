
var app = angular.module('workbookDashApp', []);

app.controller('workbookDashController', function ($scope, $http ,localDateFormateFilter) {
$scope.pageLoadStatus =false;

$scope.utcToLocal=function(input){		
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

    $scope.initData = function(data,author,basketCount){

      //  JSON.parse(studentObject);
      //console.log(data);
		$scope.wb_author = author;
		 
		var data1 =  JSON.parse(data);
		
        data1.map(function(obj){

			obj.lastUpdate = new Date(obj.lastUpdate).getTime();
			if(obj.currentVersion.date)
			{
				obj.currentVersion.date =  localDateFormateFilter(obj.currentVersion.date);
			    obj.currentVersion.versionNo =	obj.currentVersion.versionNo.toString();

			}

			//obj.name = obj.name+' lorem ipsum data xyz pqr rrr ';
			
			return obj;
		});

		

		$scope.workbooks = data1;
		var basketCount = JSON.parse(basketCount);
		$scope.basket = basketCount;
		setTimeout(function(){$scope.pageLoadStatus=true;$scope.$digest()},1000)
    // console.log($scope.workbooks);
    }

    $scope.addWorkSheet = function(){
        
        if($scope.workbooks.length>=50)
        {
            swal({
                    title: 'Workbook Limit',
                    text: 'You can add only 50 workbooks',
                    type: 'error',
                    confirmButtonClass: "btn btn-info btn-fill",
                    buttonsStyling: false
                });
            return;
        }

        $scope.wb_name = "";
        $("#newWorkbook").modal()
	}
	
	// $scope.openReviewDetails = function(wbid){
    //    console.log(wbid)
    //     $("#reviewDetailsMdl").modal()
    // }


    $scope.saveWorkBook = function(){

		var data = {};
		data.author = $scope.wb_author;
		data.wb_name = $scope.wb_name;
		if(data.wb_name.trim()=='')
		{
			swal({
				title: 'Error',
				text: 'Workbook name can not be empty',
				type: 'error',
				confirmButtonClass: "btn btn-info btn-fill",
				buttonsStyling: false
			});
			return;
		}
		
		
        $http.post("/author_addNewWorkbook", data).then(function (callback) {
			// console.log(callback.data);
			if (callback.data.status === "success") {
				
				swal({
					title: 'Success',
					text: "Workbook add successfully",
					type: 'success',
					confirmButtonClass: "btn btn-info btn-fill",
					buttonsStyling: false
				}).then(function() {
					//location.reload();
				}).catch(function(){
					//console.log("Aborted clone req");
				});

				
				var  newWb = callback.data.wb;
				newWb.currentVersion.date = localDateFormateFilter(newWb.currentVersion.date);
				newWb.currentVersion.versionNo =	newWb.currentVersion.versionNo.toString();
				newWb.lastUpdate = new Date(newWb.lastUpdate).getTime();
				$scope.workbooks.unshift(newWb);
				$("#newWorkbook").modal("hide");
                

			} else {
				if (callback.data.status === "already") {
					swal({
						title: 'Error',
						text: 'This workbook name is already exist',
						type: 'error',
						confirmButtonClass: "btn btn-info btn-fill",
						buttonsStyling: false
					});
				} else {
					swal({
						title: 'Error',
						text: 'Something Went Wrong. Please Contact Administrator !!',
						type: 'error',
						confirmButtonClass: "btn btn-info btn-fill",
						buttonsStyling: false
					});
				}
				// $scope.reset();
				return false;
			}
		},
			function (error) {
				
				swal({
					title: 'Error',
					text: 'Something Went Wrong. Please Contact Administrator !!',
					type: 'error',
					confirmButtonClass: "btn btn-info btn-fill",
					buttonsStyling: false
				});
				
				return false;
		});
       
	}
	

	$scope.editworkbook = function(wb){
		window.location.href='/author_getWorkbookPage?id='+wb.id;
	}

	
});


app.filter('wbFilter', function() {
    return function(input, searchText) {
        if(angular.isArray(input)) {
          if(searchText != null && searchText != ""){
            var filteredList = [];

        angular.forEach(input, function (val) {
            //Not Match exact comments
            if (val.name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
                filteredList.push(val);
            }else{
				if(val.publishVersion.hasOwnProperty('versionNo'))
				{
					if (val.publishVersion.versionNo.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || val.publishVersion.date.toLowerCase().indexOf(searchText.toLowerCase()) >= 0)
					{
						filteredList.push(val);
					}
				}else 
				
				if(val.currentVersion.hasOwnProperty('versionNo'))
				{
					if (val.currentVersion.versionNo.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || val.currentVersion.date.toLowerCase().indexOf(searchText.toLowerCase()) >= 0)
					{
						filteredList.push(val);
					}
				}
			}
            
        });
        input = filteredList;
          }        
       
        return input;
      }
    };
});



