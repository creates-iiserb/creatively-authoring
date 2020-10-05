var app = angular.module('betaFeedbackApp', ['ui.bootstrap','ui.utils','ngTagsInput','frapontillo.bootstrap-switch','ngValidate','ngSanitize']);

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

app.controller('betaFeedbackController', function ($scope, $http, $timeout) {
    $('.ld').show();
    $('.wrapper').addClass('ld-over-full-inverse running');
   
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
    
    $scope.initData = function(author,wbid){
        // console.log(wbid)
        $http.post("/author_getBetaFeedbackData", { 'wbId': wbid ,'author':author}).then(function (callback) {
            // console.log(callback.data.status)
            if (callback.data.status==="success") {
                var data1 = callback.data;
                var quesAry = data1.quesAry;
                $scope.quesAry=quesAry;

                var feedbackWithQues = data1.feedbackWithQues;
                $scope.feedbackWithQues=feedbackWithQues;

                // console.log(versionDocMeta1)
                var basketCount = data1.basketCount;
                $scope.basket = basketCount;

                // console.log($scope.feedbackWithQues)
                // var quesjsonNew = {};
                //     let isNew =  false;
                //    let  quesAry.find(itm=>{return itm.status=='new'})
                //     if(quesAry)


                // console.log()
                let newq = {};
                Object.keys($scope.feedbackWithQues).map(itm=>{
                    let obj = {
                        isNew :false,
                        notComplete:false,
                        ref:""
                    }
                    // console.log(itm)
                    $scope.feedbackWithQues[itm].map(que=>{
                        obj.ref=itm;
                        if(que['status']=='new'){
                            obj.isNew=true;
                        }else if(que['status']!='new' && que['status']!='complete'){
                            obj.notComplete=true;
                        }else{

                        }
                    })
                    newq[itm]=obj

                })

            $scope.quesObj=newq;

                // console.log(newq)
               



                setTimeout(function(){$scope.pageLoadStatus=true;$scope.$digest()},1000)
            } else if (callback.data.status === "authorError") {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'You are not authorised to access this workbook'
                }).then(function () {
                    window.location = "/author_workbook_dash";
                });
            }else if (callback.data.status === "nodata") {
                $.notify({
                    icon: "",
                    message: "Their are no beta feedback for this workbook"
                  },{
                    type: "warning",
                    timer: 4000,
                    placement: {
                        from: 'top',
                        align: 'center'
                    }
                  });
            }
            else{
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Error: Please Contact Administrator !!'
                });
            }

            setTimeout(()=>{
                $('.ld').hide();
                $('.wrapper').removeClass('ld-over-full-inverse running');
                $("#mainPanel").show();
            },1000);

        },function (error) {
            
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }

    // $scope.$watch('feedbackWithQues', function (newV, oldV) {
    //     if (newV != oldV) {
    //         if (newV != '') {
    //            $scope.feedbackWithQues=newV;
    //         }
    //     }
    // }, true);

     //-----------------------update beta version----------------------------------------
     $scope.changeFeedbackStatus = function(status,docId,feedIndex,author,ques,index,feedmsgObj){
        // alert(status+"===="+docId+"===="+feedIndex+"===="+ques+"===="+index);
        $http.post("/author_changeBetaFeedbackStatus", { 'status': status ,'author':author,'docId':docId,'feedIndex':feedIndex}).then(function (callback) {
            if (callback.data.status === "success") {
                swal({
                    type: 'success',
                    title: 'Success',
                    html: callback.data.msg
                }).then(function () {
                    // location.reload();
                    // $scope.wb._rev = callback.data.rev;
                    $scope.feedbackWithQues._rev = callback.data.rev;    
                    $scope.feedbackWithQues[ques][index].status =status;   
                    // console.log($scope.feedbackWithQues[ques][index].status );
                    $scope.$digest();      
                    // $scope.$apply(function(){

                    // })
                });
            } else if (callback.data.status === "Unauthorized") {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'You are authorized to update workbook that is authored by you.'
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

   

});
