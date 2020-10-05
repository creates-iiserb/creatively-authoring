var app = angular.module('workbookManageApp', ['ngTagsInput','frapontillo.bootstrap-switch','ngValidate']);

app.controller('workbookManageController', function ($scope, $http, $timeout) {
    $('.ld').show();
    $('.wrapper').addClass('ld-over-full-inverse running');

    // angular.element(document).ready(function () {
     
    // });

    setTimeout(() => {

        var $table1 = $('#example2');

        $table1.DataTable({
            "order": [[3, "desc"]]
        });
        //activate the tooltips after the data table is initialized
        $('[rel="tooltip"]').tooltip();

        $('#example2').on('post-body.bs.table', function () {
            $('[rel="tooltip"]').tooltip();
        });


        var $table2 = $('#pubListTbl');

        $table2.DataTable({
            "order": [[3, "desc"]]
        });
        //activate the tooltips after the data table is initialized
        $('[rel="tooltip"]').tooltip();


        $('#pubListTbl').on('post-body.bs.table', function () {
            $('[rel="tooltip"]').tooltip();
        });
    }, 1000)   
       
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
    
    $scope.initData = function(id,author){
        $http.post("/author_getWorkbookVersionManageData", { 'id': id ,'author':author}).then(function (callback) {
            if (callback.data.status==="success") {
                var data1 = callback.data;
                var versionDocMeta1 = data1.versionDocMeta;
                var betaLatestVer = data1.betaLatestVer;
                var betaLatestVerId= betaLatestVer.pubId;
        // console.log(versionDocMeta1)
                var betaArry= [];
                var publishArry=[];
            
                versionDocMeta1.forEach(function (doc) {
                    if(doc.beta || doc.beta==false){
                        betaArry.push(doc);
                    }else if(doc.published || doc.published==false){
                        publishArry.push(doc);
                    }else{}
                });
        
                $scope.betaData=betaArry;
                $scope.publishData=publishArry;
                $scope.betaLatestVerId=betaLatestVerId;
                // console.log(betaArry);
                
        
                var basketCount = data1.basketCount;
                $scope.basket = basketCount;
        
                setTimeout(function(){$scope.pageLoadStatus=true;$scope.$digest()},1000)
            } else if (callback.data.status === "authorError") {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Workbook not found'
                }).then(function () {
                    window.location = "/author_workbook_dash";
                });
            }else if (callback.data.status === "nodata") {
                $.notify({
                    icon: "",
                    message: "Their are no beta version published for this workbook"
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

    $scope.editVersionModal = function(data,author,flag){
        
        $("#versionEditMdl").modal('show');//
        $scope.mdlData = data;
        // $scope.mdlData.meta.updateMsg = data;
        // console.log($scope.mdlData.meta.updateMsg)
        CKEDITOR.instances['updateMsg'].setData($scope.mdlData.meta.updateMsg);
        $scope.mdlData.author=author;
        $scope.mdlData.flag=flag;
        console.log($scope.mdlData.meta)
    }

     //-----------------------update beta version----------------------------------------
     $scope.updateVersDetails = function(){
        CKEDITOR.instances.updateMsg.updateElement();
        // var betaUsers = $scope.mdlData.betaUsers;
        if($scope.mdlData.betaUsers){
            var betaUsers = $scope.mdlData.betaUsers.map(function (val) {
                return val.text;
            });
        }

        var updateMsg = CKEDITOR.instances['updateMsg'].getData();

        updateMsg = updateMsg.replace(/\n/g, '');
        // description = description.replace(/\t/g,'');
        updateMsg = updateMsg;

        

        // var updateMsg = $scope.mdlData.meta.updateMsg;
        var updateRequired = $scope.mdlData.meta.updateRequired;
        var flag = $scope.mdlData.flag;
        if(flag=='beta'){
            var statusFlag = $scope.mdlData.beta;
        }else if(flag=='published'){
            var statusFlag = $scope.mdlData.published;
        }
        
        var author = $scope.mdlData.author;
        var pubId = $scope.mdlData.pubId;

        $scope.mdlData.meta.updateRequired=updateRequired;
        $scope.mdlData.meta.updateMsg=updateMsg;
        var meta = $scope.mdlData.meta;

        // var meta = {};
        // meta['updateRequired']=updateRequired;
        // meta['updateMsg']=updateMsg;
        console.log(meta)
        
        $http.post("/author_updateVersionDetails", { 'betaUsers': betaUsers, 'flag': flag,'statusFlag':statusFlag,'meta':meta, 'author': author,'pubId':pubId}).then(function (callback) {
            if (callback.data.status === "success") {
                swal({
                    type: 'success',
                    title: 'Success',
                    html: 'Published Version updated Successfully'
                }).then(function () {
                    location.reload();
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

    //delete beta versions

    $scope.deleteBetaVersions = function(pubId,author){
        var pubId = pubId;
        var author = author;

        swal({
            title: 'Are you sure?',
            text: "This will delete the beta version of this workbook",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            confirmButtonText: 'Yes, delete it!',
            buttonsStyling: false
        }).then(function() {
            // console.log('orgid='+orgid+' and pie = '+pipe);
            // window.location.href='/deleteWbBetaVersion?pubId='+pubId;
            $http.post("/author_deleteWbBetaVersion", { 'pubId': pubId, 'author': author}).then(function (callback) {
                if (callback.data.status === "success") {
                    swal({
                        type: 'success',
                        title: 'Success',
                        html:  callback.data.msg
                    }).then(function () {
                        location.reload();
                    });
                } else if (callback.data.status === "Unauthorized") {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'You are authorized to delete workbook that is authored by you.'
                    });
                }else if (callback.data.status === "notBeta") {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'This version cannot be deleted since, it is not a beta version.'
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
        }).catch(function(){
            console.log("Aborted clone req");
        });
    }

    $scope.editPublishVersionModal = function(data,author,wbId){
  
        // console.log("data====="+JSON.stringify(data))
        $scope.pubData =data;
        $scope.pubData.author=author;
        $scope.pubData.wbId=wbId;
        $scope.pubData.betaVersion=data.ver;
       
        // $("#publishVerMdl").modal('show');
        // data.publishedOn
        // console.log($scope.pubData)
        $scope.pubDate = new Date(new Date(data.publishedOn).getTime() + 60 * 60 * 24 * 1000);
// console.log($scope.pubDate)
// console.log(new Date())



            var countDownDate = new Date($scope.pubDate).getTime();

            // Update the count down every 1 second
            var x = setInterval(function() {

            // Get today's date and time
            var now = new Date().getTime();
                
            // Find the distance between now and the count down date
            var distance = countDownDate - now;
                
            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
            // Output the result in an element with id="demo"
            // document.getElementById("demo").innerHTML = days + "d " + hours + "h "+ minutes + "m " + seconds + "s ";
            document.getElementById("hours").innerHTML =hours;
            document.getElementById("minutes").innerHTML =minutes;
            document.getElementById("seconds").innerHTML =seconds;

            // If the count down is over, write some text 
            if (distance < 0) {
                clearInterval(x);
                document.getElementById("demo").innerHTML = "EXPIRED";
            }
            }, 1000);





         if($scope.pubDate < new Date()){
            $("#publishVerMdl").modal('show');
        }else{
            swal({
                type: 'warning',
                title: '',
                html: 'You can publish your beta version after 24 hrs of beta publish date.<br><br><p id="demo"></p><div id="counterBeta">\
                <p>Time Left: </p>\
                <div id="timer">\
                    <span id="hours"></span>hours\
                    <span id="minutes"></span>minutes\
                    <span id="seconds"></span>seconds\
                </div>\
            </div> '
            });
        }

        
        // console.log($scope.pubData.pubId)
    }

       //-----------------------publish version for workbook----------------------------------------
       $scope.wbPublishVersion = function () {
        //    alert(1)
        CKEDITOR.instances.id_commentsSt.updateElement();
                // $scope.wb.dev.description = $scope.wb.dev.description.replace(/\t/g, '');
                var updateRequired =  $scope.pubData.updateRequired;
                // var whatsNew =  $scope.pubData.whatsNew;
                var author =  $scope.pubData.author;
                var wbId =  $scope.pubData.wbId;
                var pubId =  $scope.pubData.pubId;
                var betaVersion =  $scope.pubData.betaVersion;

                var id_commentsSt = CKEDITOR.instances['id_commentsSt'].getData();
                id_commentsSt = id_commentsSt.replace(/\n/g, '');
                whatsNew = id_commentsSt;

            //    console.log(updateRequired)
            //    console.log(whatsNew)
                $("#pubBtn").attr("disabled", true);
                $http.post("/author_publishVersionWorkbookData", { 'whatsNew': whatsNew,'updateRequired':updateRequired, 'pubId':pubId,'author':author,'wbId':wbId,'betaVersion':betaVersion }).then(function (callback) {
                    if (callback.data.status === "success") {
                        swal({
                            type: 'success',
                            title: 'Success',
                            html: callback.data.msg
                        }).then(function () {
                            location.reload();
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

//-----------------------redirect to feedback page----------------------------------------
    $scope.betafeedback = function(wbId){
        // console.log(wbId)
       window.location.href='/author_getBetaFeedbackPage?wbId='+wbId;
   } 
});
