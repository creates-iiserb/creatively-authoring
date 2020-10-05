
var app=angular.module('manageAuthorlistApp', ['ui.bootstrap','ui.utils','angularUtils.directives.dirPagination']);

app.service('utilityService',[function(){
    var service = this;
    service.utcTolocaldate = function(utcdate){
        if (typeof utcdate !== 'undefined'){
            var startd = new Date(utcdate);
            var startTime = startd.toString().split(" ")[4];
            var getstartDate = startd.getDate();
            var getstartMonth = startd.getMonth() + 1;
            var getstartFullYear = startd.getFullYear();
            if(getstartMonth < 10)
            getstartMonth = "0"+getstartMonth;
            if(getstartDate < 10)
            getstartDate = "0"+getstartDate;
            var startDate = getstartFullYear+"-"+getstartMonth+"-"+getstartDate;
            var openOn =  startDate.substring(2, 10) + " " + startTime; 
            return openOn;
		}else{
			return '';
		}	
    }
	
}]);

app.controller('manageAuthorlistContoller',function($scope,$http,$timeout,$compile,utilityService){

	$('.ld').show();
    $('.wrapper').addClass('ld-over-full-inverse running');
    
    angular.element(document).ready(function () {
        var url = document.location.toString();
        if (url.match('#')) {
           $('#mainTab .nav-tabs a[href="#' + url.split('#')[1] + '"]').tab('show');
        } 

        // Change hash for page-reload
        $('#mainTab .nav-tabs a').on('shown.bs.tab', function (e) {
           window.location.hash = e.target.hash;
        })
    });

    $scope.data = {
        'active' : [],
        'pending':[],
        'blocked':[],
        'rejected':[]
    }

    $scope.initData = function(data){
        
        $http.post("/author_adminFetchAuthorList").then(function (callback){
            if (callback.data.status) {
               let data = callback.data.data;
               if(data.active.length == 0){
                $scope.isLoading_allAuthors = false;
               }

               if(data.pending.length == 0){
                $scope.isLoading_newRequest = false;
               }

               if(data.blocked.length == 0){
                $scope.isLoading_blocked = false;
               }

               if(data.rejected.length == 0){
                $scope.isLoading_rejected = false;
               }

                //change date formate to local
                data.active.forEach((x,index)=>{
                    data.active[index]['createdOn'] = utilityService.utcTolocaldate(x['createdOn']);
                });
                
                data.rejected.forEach((x,index)=>{
                    data.rejected[index]['createdOn'] = utilityService.utcTolocaldate(x['createdOn']);
                });

                data.pending.forEach((x,index)=>{
                    data.pending[index]['createdOn'] = utilityService.utcTolocaldate(x['createdOn']);
                });

                data.blocked.forEach((x,index)=>{
                    data.blocked[index]['createdOn'] = utilityService.utcTolocaldate(x['createdOn']);
                });

                $scope.data = data;
            }
        },function(err){
            console.log(err);
            $('.ld').hide();
            $('.wrapper').removeClass('ld-over-full-inverse running');
            $("#mainPanelDiv").show();

            swal({
                title: "Error",
                text: err.data.msg,
                buttonsStyling: false,
                confirmButtonClass: "btn btn-danger btn-fill",
                type: "error"
            });
        });

    }
   
   $scope.isNoteEdit = false;
   $scope.viewDetail = function(data){
       $scope.isNoteEdit = false;
       $scope.userPreNote = data.note; 
       $scope.user = data;
       $scope.user.permission = {
           admin : data.auth.access.includes('admin'),
           quiz : data.auth.access.includes('quiz'),
           publicRead: data.auth.access.includes('publicRead'),
           publicWrite: data.auth.access.includes('publicWrite'),
           workbook: data.auth.access.includes('workbook'),
       }
       $('#detailTab .nav-tabs a[href="#userinfo"]').tab('show');
       $("#userDetailMdl").modal("show");
   }

   $scope.cancelEditNote = function(){
     $scope.user.note  =  $scope.userPreNote;
     $scope.isNoteEdit = false;
   }

   $scope.publicWriteChange = function(){
      if($scope.user.permission.publicWrite){
        $scope.user.permission.publicRead = true;
      } 
   }
    
    $scope.setStatus = function(status,user){
       let currAccStatus = user.accStatus;
       let msg = '';
       switch(status) {
        case 'active':
            msg = 'active'
            break;
        case 'rejected':
            msg = 'reject. <br> The user will be notified via email. In the notes field you can mention the reason for rejection.'
            break;
        case 'blocked':
            msg = 'block'
            break;
        }
       swal({
        title: 'Are you sure?',
        html: "You want to change account status to "+msg,
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes',
        cancelButtonText:'No',
        buttonsStyling: false,
       }).then(function() {
                $('.ld').show();
                $('.wrapper').addClass('ld-over-full-inverse running');

                $http.post("/author_adminChangeAccStatus",{ 
                    id: user.shortname,
                    status: status
                }).then(function (callback){
                    $('.ld').hide();
                    $('.wrapper').removeClass('ld-over-full-inverse running');

                    if (callback.data.status) {
                        user.accStatus = status;
                        if(currAccStatus == 'active'){
                          let index = $scope.data.active.findIndex(x => x.shortname === user.shortname);
                          $scope.data.active.splice(index,1);
                        }

                        if(currAccStatus == 'pending'){
                            let index = $scope.data.pending.findIndex(x => x.shortname === user.shortname);
                            $scope.data.pending.splice(index,1);
                        }

                        if(currAccStatus == 'blocked'){
                            let index = $scope.data.blocked.findIndex(x => x.shortname === user.shortname);
                            $scope.data.blocked.splice(index,1);
                        }

                        if(currAccStatus == 'rejected'){
                            let index = $scope.data.rejected.findIndex(x => x.shortname === user.shortname);
                            $scope.data.rejected.splice(index,1);
                        }

                        if(status == 'active'){
                            $scope.data.active.push(user);
                        }

                        if(status == 'rejected'){
                            $scope.data.rejected.push(user);
                        }

                        if(status == 'blocked'){
                            $scope.data.blocked.push(user);
                        }

                        $('#userDetailMdl').modal("hide");
                        //$("#mainCard").addClass("blurEffect");
                        swal({
                            title: "Done",
                            text: "Account status changed successfully!",
                            buttonsStyling: false,
                            confirmButtonClass: "btn btn-success btn-fill",
                            type: "success",
                            allowOutsideClick: false
                        }).then(function(){
                           // location.reload();
                        });

                    }
                },function(err){
                    
                    $('.ld').hide();
                    $('.wrapper').removeClass('ld-over-full-inverse running');
                
                    swal({
                        title: "Error",
                        text: err.data.msg,
                        buttonsStyling: false,
                        confirmButtonClass: "btn btn-danger btn-fill",
                        type: "error"
                    });
                    
                });

        },function(){

        });

    }

    $scope.changePermission = function(user){
        
        let accStatus = user.accStatus;
        let permissions = Object.keys(user.permission)
        .filter(function(k){return user.permission[k]});
        
        let msg = "You want to change permissions of user";
        if(permissions.length>0){
            let perTxt = permissions.join(',');
            msg = `Are you sure you want to give <b>${perTxt}</b> access to this user ?`;
        }
        

        swal({
            title: 'Are you sure?',
            html: msg ,
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            confirmButtonText: 'Yes',
            cancelButtonText:'No',
            buttonsStyling: false,
           }).then(function() {
                $('.ld').show();
                $('.wrapper').addClass('ld-over-full-inverse running');
                $http.post("/author_adminChangePermissions",{ 
                    id: user.shortname,
                    permissions: permissions
                }).then(function (callback){
                    $('.ld').hide();
                    $('.wrapper').removeClass('ld-over-full-inverse running');

                    if (callback.data.status) {

                        if(accStatus == "active"){
                            let index = $scope.data.active.findIndex(x => x.shortname === user.shortname);
                            $scope.data.active[index]['auth']['access'] =  permissions;
                        }

                        if(accStatus == "blocked"){
                            let index = $scope.data.blocked.findIndex(x => x.shortname === user.shortname);
                             $scope.data.blocked[index]['auth']['access'] =  permissions;
                        }

                        if(accStatus == "rejected"){
                            let index = $scope.data.rejected.findIndex(x => x.shortname === user.shortname);
                             $scope.data.rejected[index]['auth']['access'] =  permissions;
                        }

                        if(accStatus == "pending"){
                            let index = $scope.data.pending.findIndex(x => x.shortname === user.shortname);
                             $scope.data.pending[index]['auth']['access'] =  permissions;
                        }
                       
                        $('#userDetailMdl').modal("hide");
                        //$("#mainCard").addClass("blurEffect");
                        swal({
                            title: "Done",
                            text: "Account permissions changed successfully!",
                            buttonsStyling: false,
                            confirmButtonClass: "btn btn-success btn-fill",
                            type: "success",
                            allowOutsideClick: false
                        }).then(function(){
                            //location.reload();
                        });

                    }
                },function(err){
                    console.log(err.data.msg);
                    $('.ld').hide();
                    $('.wrapper').removeClass('ld-over-full-inverse running');
                
                    swal({
                        title: "Error",
                        text: err.data.msg,
                        buttonsStyling: false,
                        confirmButtonClass: "btn btn-danger btn-fill",
                        type: "error"
                    });
                    
                });
        
           },function(){

           })



    }

    $scope.activeBtnText = function(status){
      if(status=='blocked'){
          return 'Unblock';
      }else 
      if(status=='rejected' || status=='pending'){
        return 'Accept';
      }

    }

    $scope.disRejBtn = false;
    $scope.saveNote = function(data){
        
        let payLoad = {
            id: data.shortname,
            note: $scope.user.note1,
        }
        
        $scope.disRejBtn = true;
        $http.post("/author_adminEditAuthorNote",payLoad).then(function (callback){
            if (callback.data.status) {
                $scope.disRejBtn = false;
                // $.notify({
                //     icon: "ti-thumb-up",
                //     message: "Author Note update"
                // },{
                //     type: 'success',
                //     timer: 2000,
                //     placement: {
                //         from: 'top',
                //         align: 'right'
                //     }
                // });


                let index = -1;
                if(data.accStatus=="active"){
                    index = $scope.data.active.findIndex(x=>x.shortname == data.shortname);
                    $scope.data['active'][index].note = $scope.user.note1;
                }else
                if(data.accStatus=="pending"){
                    index = $scope.data.pending.findIndex(x=>x.shortname == data.shortname);
                    $scope.data['pending'][index].note = $scope.user.note1;
                }else
                if(data.accStatus=="rejected"){
                    index = $scope.data.rejected.findIndex(x=>x.shortname == data.shortname);
                    $scope.data['rejected'][index].note = $scope.user.note1;
                }else 
                if(data.accStatus == "blocked"){
                    index = $scope.data.blocked.findIndex(x=>x.shortname == data.shortname);
                    $scope.data['blocked'][index].note = $scope.user.note1;
                }
                $scope.userPreNote = $scope.user.note1;
                $scope.isNoteEdit = false;
            }
        },function(err){
            console.log(err.data.msg);
            swal({
                title: "Error",
                text: err.data.msg,
                buttonsStyling: false,
                confirmButtonClass: "btn btn-danger btn-fill",
                type: "error"
            });
        });
    }

    $scope.editNote = function(data){
        $scope.isNoteEdit=true
        $scope.user.note1 = data.note;
    }

    // new changes
    $scope.sortKeyAllAuth = 'createdOn';
    $scope.sortKeyNewReq = 'createdOn';
    $scope.sortKeyBlocked = 'createdOn';
    $scope.sortKeyRejected = 'createdOn';
    
    $scope.currPageAllAuth = 1;
    $scope.currPageNewReq = 1;
    $scope.currPageBlocked = 1;
    $scope.currPageRejected = 1;

    $scope.reverseAllAuth = true;
    $scope.reverseNewReq = true;
    $scope.reverseBlocked = true;
    $scope.reverseRejected = true;

    $scope.isLoading_allAuthors = true;
    $scope.isLoading_newRequest = true;
    $scope.isLoading_blocked = true;
    $scope.isLoading_rejected = true;

    $scope.sort = function(key,tab){
        switch(tab) {
            case 'allAuthors':
                if($scope.currPageAllAuth>1){
                    $scope.currPageAllAuth = 1;
                }
                $scope.sortKeyAllAuth = key;
                $scope.reverseAllAuth = !$scope.reverseAllAuth;
              break;
            case 'newRequest':
                if($scope.currPageNewReq>1){
                    $scope.currPageNewReq = 1;
                }
                $scope.sortKeyNewReq = key;
                $scope.reverseNewReq = !$scope.reverseNewReq;
              
              break;
            case 'blocked':
                if($scope.currPageBlocked>1){
                    $scope.currPageBlocked = 1;
                }
                $scope.sortKeyBlocked = key;
                $scope.reverseBlocked = !$scope.reverseBlocked;

                break;
            case 'rejected':
                if($scope.currPageRejected>1){
                    $scope.currPageRejected = 1;
                }
                $scope.sortKeyRejected = key;
                $scope.reverseRejected = !$scope.reverseRejected;
                break;      
            
        }
    }

    
    $scope.showFilterStatus = function(tab){
        switch(tab) {
            case 'allAuthors':
                let filter_allAuthors =  $scope.filter_allAuthors.length;
                $scope.from_allAuthors  = ($scope.currPageAllAuth-1)*$scope.itemsPerPages_allAuthors+ 1;
                $scope.to_allAuthors = $scope.currPageAllAuth*$scope.itemsPerPages_allAuthors;
                if(filter_allAuthors<=$scope.itemsPerPages_allAuthors || $scope.to_allAuthors >= filter_allAuthors){
                 $scope.to_allAuthors = filter_allAuthors;
                }
              break;
            case 'newRequest':
                let filter_newRequest =  $scope.filter_newRequest.length;
                $scope.from_newRequest  = ($scope.currPageNewReq-1)*$scope.itemsPerPages_newRequest+ 1;
                $scope.to_newRequest = $scope.currPageNewReq*$scope.itemsPerPages_newRequest;
                if(filter_newRequest<=$scope.itemsPerPages_newRequest || $scope.to_newRequest >= filter_newRequest){
                 $scope.to_newRequest = filter_newRequest;
                }
              break;
            case 'blocked':
                let filter_blocked =  $scope.filter_blocked.length;
                $scope.from_blocked  = ($scope.currPageBlocked-1)*$scope.itemsPerPages_blocked+ 1;
                $scope.to_blocked = $scope.currPageBlocked*$scope.itemsPerPages_blocked;
                if(filter_blocked<=$scope.itemsPerPages_blocked  || $scope.to_blocked >= filter_blocked){
                 $scope.to_blocked = filter_blocked;
                }
                break;
            case 'rejected':
                let filter_rejected =  $scope.filter_rejected.length;
                $scope.from_rejected  = ($scope.currPageRejected-1)*$scope.itemsPerPages_rejected+ 1;
                $scope.to_rejected = $scope.currPageRejected*$scope.itemsPerPages_rejected;
                if(filter_rejected<=$scope.itemsPerPages_rejected || $scope.to_rejected >= filter_rejected){
                 $scope.to_rejected = filter_rejected;
                }
                break;      
            
        }
    } 

    let defaultPerPage = 10;
    $scope.resetPage = function(tab){
		switch(tab) {
            case 'allAuthors':
                if($scope.currPageAllAuth>1){
                    $scope.currPageAllAuth = 1;
                }
               
                if($scope.itemsPerPages_allAuthors < defaultPerPage){
                    $scope.showFilterStatus(tab);
                }
              break;
            case 'newRequest':
                if($scope.currPageNewReq>1){
                    $scope.currPageNewReq = 1;
                }
                
                if($scope.itemsPerPages_newRequest < defaultPerPage){
                    $scope.showFilterStatus(tab);
                }
              break;
            case 'blocked':
                if($scope.currPageBlocked>1){
                    $scope.currPageBlocked = 1;
                }
                if($scope.itemsPerPages_blocked < defaultPerPage){
                    $scope.showFilterStatus(tab);
                }

                break;
            case 'rejected':
                if($scope.currPageRejected>1){
                    $scope.currPageRejected = 1;
                }
                if($scope.itemsPerPages_rejected < defaultPerPage){
                    $scope.showFilterStatus(tab);
                }
                break;      
            
        }
		
	}

    $scope.$on('LastElem', function(event,data){
        switch(data) {
            case 'allAuthors':
                $timeout(()=>{
                    $('.ld').hide();
                    $('.wrapper').removeClass('ld-over-full-inverse running');
                    $("#mainPanelDiv").show();
                },1000);
                $scope.isLoading_allAuthors = false;
                $scope.showFilterStatus('allAuthors');
                break;
            case 'newRequest':
                $scope.isLoading_newRequest = false;
                $scope.showFilterStatus('newRequest');
                break;
            case 'blocked':
                $scope.isLoading_blocked = false;
                $scope.showFilterStatus('blocked');
                break;
            case 'rejected':
                $scope.isLoading_rejected = false;
                $scope.showFilterStatus('rejected');
                break;
        }
        $('[rel="tooltip"]').tooltip();
        
    });

    $scope.onSearch = function(tab){
        switch(tab) {
            case 'allAuthors':
                if($scope.currPageAllAuth>1){
                    $scope.currPageAllAuth = 1;
                }
                break;
            case 'newRequest':
                if($scope.currPageNewReq>1){
                    $scope.currPageNewReq = 1;
                }
                break;
            case 'blocked':
                if($scope.currPageBlocked>1){
                    $scope.currPageBlocked = 1;
                }
                break;
            case 'rejected':
                if($scope.currPageRejected>1){
                    $scope.currPageRejected = 1;
                }
                break;
        }
    }

    
    //end of new changes


});    


app.filter("localDate",function(){
	return function(utcdate){
		if (typeof utcdate !== 'undefined'){
            var startd = new Date(utcdate);
            var startTime = startd.toString().split(" ")[4];
            var getstartDate = startd.getDate();
            var getstartMonth = startd.getMonth() + 1;
            var getstartFullYear = startd.getFullYear();
            if(getstartMonth < 10)
            getstartMonth = "0"+getstartMonth;
            if(getstartDate < 10)
            getstartDate = "0"+getstartDate;
            var startDate = getstartFullYear+"-"+getstartMonth+"-"+getstartDate;
            var openOn =  startDate.substring(2, 10) + " " + startTime; 
            return openOn;
		}else{
			return '';
		}
	}
});

app.directive('myRepeatDirective', function() {
    return  function (scope, element, attrs) {
		    if (scope.$last){
		      scope.$emit('LastElem',attrs.myRepeatDirective);
		    }
        }
})




