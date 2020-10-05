var app=angular.module('managewbPublishApp', ['ui.bootstrap','ui.utils']);
app.directive('math', function () {
    return {
        restrict: 'EA',
        scope: {
            math: '@'
        },
        link: function (scope, elem, attrs) {
            scope.$watch('math', function (value) {
                if (!value) return;

                elem.html(value);
                setTimeout(function () {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                }, 0);
            });
        }
    };
});
app.controller('managewbPublishContoller',function($scope,$http,$timeout,$compile){

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

    $scope.initData = function(data){
        // console.log(1)
        $http.post("/author_adminFetchWbPublishList").then(function (callback){
            if (callback.data.status) {
                $scope.data = callback.data.data;
                $scope.authorEmail = callback.data.authorEmail;
                console.log( $scope.authorEmail)
                // console.log(JSON.stringify($scope.data))
                setTimeout(() => {
                    var $table1 = $('#newRequestTab');
                    var $table2 = $('#publishedTab');
                    var $table3 = $('#blockedTab');
                    var $table4 = $('#rejectedTab');
    
                    $table1.DataTable({
                    "order": [[1, "desc"]]
                    });
                    $table2.DataTable({
                    "order": [[1, "desc"]]
                    });
                    $table3.DataTable({
                    "order": [[1, "desc"]]
                    });
    
                    $table4.DataTable({
                    "order": [[1, "desc"]]
                    });

                    $('.ld').hide();
                    $('.wrapper').removeClass('ld-over-full-inverse running');
                    $("#mainPanelDiv").show();
                    $('[rel="tooltip"]').tooltip();
                }, 3000);
               
            }
        },function(err){
            console.log(err);
            $('.ld').hide();
            swal({
                title: "Error",
                text: err.data.msg,
                buttonsStyling: false,
                confirmButtonClass: "btn btn-danger btn-fill",
                type: "error"
            });
        });

    }

     //-----------------------add admin as beta user----------------------------------------
     $scope.addAsBetauser = function (betaId,author,pubId) {
        $http.post("/author_adminAddAsBetauser", {'betaId':betaId,'wbauthor':author,"pubId":pubId }).then(function (callback) {
            if (callback.data.status === "success") {
                swal({
                    type: 'success',
                    title: 'Success',
                    html: callback.data.msg
                }).then(function () {
                    location.reload();
                });
            } else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        }, function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }

     //-----------------------remove admin as beta user----------------------------------------
     $scope.removeAsBetauser = function (betaId,author,pubId) {
        $http.post("/author_adminRemoveAsBetauser", {'betaId':betaId,'wbauthor':author,"pubId":pubId }).then(function (callback) {
            if (callback.data.status === "success") {
                swal({
                    type: 'success',
                    title: 'Success',
                    html: callback.data.msg
                }).then(function () {
                    location.reload();
                });
            } else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        }, function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }

    //-----------------------open modal for publish----------------------------------------
    $scope.publishWb = function (pubId,author) {
        // $("#publishVerMdl").modal('show');
        // $scope.mdlData = {};
        // $scope.mdlData.author=author;
        // $scope.mdlData.pubId=pubId;

        
        $http.post("/author_adminWbRequestDetails", {'pubId':pubId }).then(function (callback) {
            if (callback.data.status === "success") {
                // console.log(callback.data.dataBody)
                // $("#workbookInfoMdl").modal('show');
                // $scope.wbData = {};
                // $scope.wbData=callback.data.dataBody;

                $("#publishVerMdl").modal('show');
                $scope.mdlData = {};
                $scope.mdlData.author=author;
                $scope.mdlData.pubId=pubId;
                $scope.mdlData.wbData=callback.data.dataBody;


            } else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        }, function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });

    }

    //-----------------------accept req for publish----------------------------------------
    $scope.acceptPublishReq = function () {
        $("#rejectDiv").hide();
        var all_checkboxes = $('#myDiv input[type="checkbox"]');

        if (all_checkboxes.length === all_checkboxes.filter(":checked").length) {
            // alert('all checked');
            var author = $scope.mdlData.author;
            var pubId = $scope.mdlData.pubId;

            // console.log(author+"====="+pubId)
            $http.post("/author_adminAcceptPublishReq", {'pubId':pubId,'wbauthor':author }).then(function (callback) {
                if (callback.data.status === "success") {
                    swal({
                        type: 'success',
                        title: 'Success',
                        html: callback.data.msg
                    }).then(function () {
                        location.reload();
                    });
                } else {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: callback.data.msg
                    });
                }
            }, function (error) {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!'
                });
            });
        }else{
            swal({
                type: 'warning',
                title: 'warning',
                html: "Check all checkbox before Accept"
            });
        }
    }

    //----------------------reject req for publish----------------------------------------
    $scope.rejectPublishReq = function () {
        $("#publishVerMdl").modal('hide');
        var author = $scope.mdlData.author;
        var pubId = $scope.mdlData.pubId;

        swal({
			title: 'Reason to reject workbook',
			input: 'textarea',
			showCancelButton: true,
			confirmButtonText: 'Reject',
			confirmButtonClass: "btn btn-success btn-fill",
			cancelButtonClass: "btn btn-danger btn-fill",
			buttonsStyling: false,
			showLoaderOnConfirm: true,
			inputValidator: function (value) {
				return new Promise(function (resolve, reject) {
					if (value !== '') {
						resolve();
					} else {
						reject('You need to write a reason to reject workbook');
					}
				});
			},
			allowOutsideClick: () => !swal.isLoading()
		}).then(function (result) {
            console.log(result)
           
			$.ajax({
				type: "POST",
				data: {
					'pubId': pubId,
					'wbauthor': author,
					'rejectMsg': result
				},
				url: '/author_adminRejectPublishReq',
				success: function (data) {
					if(data.status=="success"){
						swal({
                            type: 'success',
                            title: 'Success',
							html: data.msg
						}).then(function () {
                            location.reload();
                        });
					
					}else{
						swal({
							type: 'error',
							title: "Error: Please Contact Administrator"
						})
					}
				},
				error: function (data) {
                    // console.log("2");
                    swal("Cancelled", "Error: Please Contact Administrator ", " error ");
				}
			});
		}).catch(function () {
			console.log("Aborted clone req");
		});

        // $http.post("/author_adminRejectPublishReq", {'pubId':pubId,'wbauthor':author }).then(function (callback) {
        //     if (callback.data.status === "success") {
        //         swal({
        //             type: 'success',
        //             title: 'Success',
        //             html: callback.data.msg
        //         }).then(function () {
        //             location.reload();
        //         });
        //     } else {
        //         swal({
        //             type: 'error',
        //             title: 'Error',
        //             html: callback.data.msg
        //         });
        //     }
        // }, function (error) {
        //     swal({
        //         type: 'error',
        //         title: 'Error',
        //         html: 'Something Went Wrong. Please Contact Administrator !!'
        //     });
        // });
    }

    //-----------------------open modal for block publish----------------------------------------
    $scope.blockPublishWb = function (pubId,author) {
        swal({
			title: 'Reason to block workbook',
			input: 'textarea',
			showCancelButton: true,
			confirmButtonText: 'Block',
			confirmButtonClass: "btn btn-success btn-fill",
			cancelButtonClass: "btn btn-danger btn-fill",
			buttonsStyling: false,
			showLoaderOnConfirm: true,
			inputValidator: function (value) {
				return new Promise(function (resolve, reject) {
					if (value !== '') {
						resolve();
					} else {
						reject('You need to write a reason to block workbook');
					}
				});
			},
			allowOutsideClick: () => !swal.isLoading()
		}).then(function (result) {
            console.log(result)
			$.ajax({
				type: "POST",
				data: {
					'pubId': pubId,
					'wbauthor': author,
					'blockMsg': result
				},
				url: '/author_adminBlockPublishReq',
				success: function (data) {
					if(data.status=="success"){
						swal({
							type: 'success',
                            title: 'success',
                            html: data.msg
						}).then(function () {
                            location.reload();
                        });
					
					}else{
						swal({
							type: 'error',
							title: "Error: Please Contact Administrator"
						})
					}
				},
				error: function (data) {
                    // console.log("2");
                    swal("Cancelled", "Error: Please Contact Administrator ", " error ");
				}
			});
		}).catch(function () {
			console.log("Aborted clone req");
		});
    }

    //----------------------reject req for publish----------------------------------------
    $scope.unblockPublishWb = function (pubId,author) {
       
        $http.post("/author_adminUnblockPublishReq", {'pubId':pubId,'wbauthor':author }).then(function (callback) {
            if (callback.data.status === "success") {
                swal({
                    type: 'success',
                    title: 'Success',
                    html: callback.data.msg
                }).then(function () {
                    location.reload();
                });
            } else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        }, function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }

    //----------------------view complete history for publish----------------------------------------
    $scope.viewHistory = function (pubId,history) {
        // console.log(history);
        // $("#blockReasonMdl").modal('show');
        $scope.historyMdl = {};
        
        $scope.historyMdl.pubId=pubId;
         arry =[];

        let gexist = history.findIndex(itm=>{
            // if(itm.action=="blocked"){
                var msgjson={};
                msgjson["action"]=itm.action;
                msgjson["msg"]=itm.msg;
                msgjson["time"]=itm.time;
                msgjson["adminUser"]=itm.adminUser;

               arry.push(msgjson)
               
            //  }
            
        })

    //    console.log(arry)

       $scope.mdlHistory = arry
       $("#fullHistoryMdl").modal('show'); 
        // $('#blockReasonMdl .modal-body #abc').html("<p ng-repeat='msgArry in arry'>"+msgArry+"</p>");

    }

     //----------------------view block msg for publish----------------------------------------
     $scope.viewBlockMsg = function (pubId,history) {
        // console.log(history);
        // $("#blockReasonMdl").modal('show');
        $scope.blockmsgMdl = {};
        
        $scope.blockmsgMdl.pubId=pubId;
         arry =[];

        let gexist = history.findIndex(itm=>{
            if(itm.action=="blocked"){
                var msgjson={};
                msgjson["msg"]=itm.msg;
                msgjson["time"]=itm.time;
                msgjson["adminUser"]=itm.adminUser;

               arry.push(msgjson)
               
             }
            
        })

    //    console.log(arry)

       $scope.mdlreason = arry
       $("#blockReasonMdl").modal('show'); 
        // $('#blockReasonMdl .modal-body #abc').html("<p ng-repeat='msgArry in arry'>"+msgArry+"</p>");

    }

    //----------------------view reject msg for publish----------------------------------------
    $scope.viewRejectMsg = function (pubId,history) {
        // console.log(history);
        $("#rejectReasonMdl").modal('show');
        $scope.rejectmsgMdl = {};
        
        $scope.rejectmsgMdl.pubId=pubId;
         arry =[];

        let gexist = history.findIndex(itm=>{
            if(itm.action=="rejected"){
                var rmsgjson={};
                rmsgjson["msg"]=itm.msg;
                rmsgjson["time"]=itm.time;
                rmsgjson["adminUser"]=itm.adminUser;

               arry.push(rmsgjson)
               
             }
            
        })

    //    console.log(arry)

       $scope.mdlRejectReason = arry
       $("#rejectReasonMdl").modal('show');
        // $('#blockReasonMdl .modal-body #abc').html("<p ng-repeat='msgArry in arry'>"+msgArry+"</p>");

    }

     //----------------------view block msg for publish----------------------------------------
     $scope.wbinfo = function (pubId) {
       
        // $("#blockReasonMdl").modal('show');
        $http.post("/author_adminWbRequestDetails", {'pubId':pubId }).then(function (callback) {
            if (callback.data.status === "success") {
                console.log(callback.data.dataBody)
                $("#workbookInfoMdl").modal('show');
                $scope.wbData = {};
                $scope.wbData=callback.data.dataBody;


            } else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        }, function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });

    }
    
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