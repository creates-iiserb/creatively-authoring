var app = angular.module('subGradingApp', ['ui.bootstrap', 'ui.utils','frapontillo.bootstrap-switch']);

app.controller('subGradingContoller', function ($scope, $http, $timeout, $compile,$interval) {
    $('.ld').show();
    $('.wrapper').addClass('ld-over-full-inverse running');
    var submitInterval;
    let counter = 0;

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

    $scope.initData = function (quizId) {
        // console.log(quizid)
        $http.post("/author_subGradingPageData", { 'quizid': quizId }).then(function (callback) {
            // console.log(4)
            if (callback.data.status==="success") {
                var subData = callback.data.subData
                $scope.subData = subData;
                // console.log($quizIdcope.subData)
                var graders11 = callback.data.graders;
                $scope.gradersDta=graders11;
                $scope.exMetaData = callback.data.exMetaData;
                $scope.refWithSec = callback.data.refWithSec;
                $scope.showWarnDiv = false;
                if(new Date($scope.exMetaData.endTime) > new Date()){
                    $scope.showWarnDiv = true;
                }
                // console.log($scope.showWarnDiv)
                $scope.graders = graders11.map(function (val) {
                    var obj = new Object;
                    obj.id = val.nickname;
                    obj.val = val.nickname;
                    return obj;
                });
                // console.log(graders11)
        
                var gmap = $scope.subData.gradingMap;
                var subItms = $scope.subData.subGrading.items;
                // console.log("wewewe---"+$scope.subData.finalized)
                var opt = subItms.map(function (itm) {
                    // console.log(itm)
                    var arry=[];
                    var obj= new Object;
                    var gradeArry=[];
                    gmap.forEach(function (val) {
                        if (val.ref == itm){
                          arry.push(val)
                        }
                   });
        
                    arry.forEach(function (val2) {
                        if(val2.enabled==true){
                            gradeArry.push(val2.grader);
                        }
                    });
                    obj["ref"]=itm;
                    obj["gradingMap"]=arry;
                    obj["gradersSel"]=gradeArry;
                    obj["rubric"]=[];
                //    console.log(arry)
                //    console.log(obj)
                   return obj
                });
        
                $scope.output= opt;
                // $scope.stats=callback.data.stats;
                // console.log(output)
                $scope.counterReload=true;
                // $scope.getGraderProgress(quizId);
                submitInterval = $interval(function(){ 
                    if(counter%60==0){
                        // console.log(1)
                        $scope.getGraderProgress(quizId,$scope.subData._id,$scope.showWarnDiv);
                    }
                    if(counter%3600 ==0 && counter!=0){
                        $interval.cancel(submitInterval);
                        $scope.counterReload=false;
                    }
                    counter++;
                },1000);
            }else{
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Error: Please Contact Administrator !!'
                });
            }
            
        },function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }


    $scope.getGraderProgress = function(quizId,docId,showWarnDiv){
        // console.log(2)
            $http.post("/author_getGradingProgress", { 'quizId':quizId,'docId':docId}).then(function (callback) {
                
                if (callback.data.status === "success") {
                    $scope.stats=callback.data.stats;
                    $scope.disableFinalize=false;
                    $scope.subCount=callback.data.subCount;
                    // console.log(showWarnDiv)
                    if(showWarnDiv==true){
                        $scope.disableFinalize=true;
                    }else{
                        console.log($scope.stats.totalSubQues)
                        if($scope.stats.totalSubQues!=$scope.stats.totalGradedQues || $scope.stats.totalSubQues==0){
                            $scope.disableFinalize=true;
                        }
                    }
                    // console.log("-----"+$scope.disableFinalize)
                    $scope.disableUpdate=true;
                   
                }else if(callback.data.status === "finalize"){
                    $interval.cancel(submitInterval);
                    $scope.subData.finalized=true;
                    // location.reload();
                }  else {
                    swal({
                      type: 'error',
                        title: 'Error',
                        html: callback.data.msg
                    });
                }
                $('.ld').hide();
                $('.wrapper').removeClass('ld-over-full-inverse running');
                $("#mainPanelDiv").show();
            }, function (error) {
                $('.ld').hide();
                $('.wrapper').removeClass('ld-over-full-inverse running');
                $("#mainPanelDiv").show();
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!'
                });
            });
        
       

    }

    $scope.randomLink = function(ind,g){
        var len=25;
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < len; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        g.token = result;	
        $scope.disableUpdate=false;
        $.notify({
            icon: "ti-info",
            message: " Marked for email link change, click on update to save changes"
          },{
            type: "warning",
            timer: 1500,
            delay: 700,
            placement: {
                from: 'top',
                align: 'center'
            }
          });
    }

    $scope.generateToken = function(ind,g){
        var len=25;
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < len; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    $scope.getCurrentUTCDate = function () {
        let dt = new Date();
        let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let cdate = month[dt.getUTCMonth()] + " " + dt.getUTCDate() + " " + dt.getUTCFullYear() + " " + dt.getUTCHours() + ":" + dt.getUTCMinutes() + ":" + dt.getUTCSeconds() + " UTC"
        return cdate;
      }
    
    $scope.disableGrader = function(indx,flag,itm){

        // console.log(itm)
        flag.enabled = false;
        flag.updatedOn = $scope.getCurrentUTCDate();		
        $.notify({
            icon: "ti-info",
            message: " Marked to disable grader, click on update to save changes"
          },{
            type: "warning",
            timer: 1500,
            delay: 700,
            placement: {
                from: 'top',
                align: 'center'
            }
          });
    }
    
    $scope.changeGraders = function (index,grader,dta,refSec) {
        // console.log(grader);
        if(grader==undefined){
            grader=[]
        }

        let unSelGrader=[];
        
            dta.gradingMap.map(val =>{
                if(grader.indexOf(val.grader)==-1){
                    unSelGrader.push(val.grader);
                }
            })
        

        unSelGrader.forEach(function (itm) { 
            let found=dta.gradingMap.find(a => {return a.grader==itm})
            if(found){
                found.enabled=false;
                found.updatedOn=$scope.getCurrentUTCDate();	
                // gradeTbl.enabled=false;
            }
        })


        grader.forEach(function (itm) {
            let found=dta.gradingMap.find(a => {return a.grader==itm})
            if(found){
                found.enabled=true;
                found.updatedOn=$scope.getCurrentUTCDate();	
            }else{
                var obj={};
                obj["ref"]=dta.ref;
                obj["token"]=$scope.generateToken();
                obj["updatedOn"]=$scope.getCurrentUTCDate();
                obj["grader"]=itm;
                obj["enabled"]=true;

                dta.gradingMap.push(obj);
            }
        })
    //    console.log(dta.gradingMap)
    $scope.disableUpdate=false;

    }

    $scope.getrubricData = function (ref,author,docId) {
            $http.post("/author_getLatestrubric", { 'docid': docId}).then(function (callback) {
                // console.log(callback.data.status)
                if (callback.data.status === "success") {
                    $scope.subData._rev=callback.data.revNo;
                    $scope.rubrics=callback.data.rubrics[ref];
                    $scope.queRef=ref;
                    $scope.author=author;
                    $scope.disablesaveRub=true;
                    $scope.rubrics.rules.sort((a,b)=>b.value-a.value);
                    $("#rubricMdl").modal({
                        backdrop: "static",
                        show: true
                    });
                    
                }  else {
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

	$scope.enabledEdit =[];

    $scope.addRubricRules = function(){
         if($scope.rubrics.rules.length<20){
            //Add the new item to the Array.
            var rdta = {
                id: $scope.rubrics.rules.length+1,
                text : "",
                value : "",
                deleted : false,
                added:{"on":$scope.getCurrentUTCDate(),"by":$scope.author},
                update:{"on":$scope.getCurrentUTCDate(),"by":$scope.author}
                // disableEdit:false
            };
            $scope.rubrics.rules.push(rdta);
            $scope.enabledEdit[$scope.rubrics.rules.length-1]=true;
            
            // console.log(JSON.stringify($scope.rubrics))
        }else{
            swal({
                type: 'error',
                html: 'Maximum 20 Rules are allowed'
            })
        }
    }
    
    
    $scope.getEditText = function(index){
        var editDta=$scope.rubrics.rules[index];
        editDta.update.on=$scope.getCurrentUTCDate();
        editDta.update.by=$scope.author;
        $scope.disablesaveRub=false;
        if(editDta.value==""){
            $scope.disablesaveRub=true;
        }
    }

    $scope.getEditVal = function(index){
        var editDta=$scope.rubrics.rules[index];
        var a = editDta.value;
        var b =+a;
        if(isNaN(b) || b==0){
            // console.log("not a number");
            $("#valErr"+index).show();
            $scope.disablesaveRub=true;
        }else{
            
            // var c = parseFloat(b.toFixed(2))
            // console.log(c)
            // console.log(parseInt(editDta.value))
            // editDta.value=c;
            editDta.update.on=$scope.getCurrentUTCDate();
            editDta.update.by=$scope.author;
            $scope.disablesaveRub=false;
            $("#valErr"+index).hide();
        }
    }

	$scope.editRubricRules = function(index){
		// console.log("edit index"+index);
        $scope.enabledEdit[index] = true;
    }
    
	$scope.removeRubricRules = function(index) {
        // console.log()

        if($scope.rubrics.rules[index].text=="" || $scope.rubrics.rules[index].value==""){
            swal({
                type: 'error',
                title: 'Error',
                html: 'You cannot delete empty rule'
            });
        }else{
            swal({
                title: 'Are you sure?',
                text: 'You want to delete this rule',
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: 'Yes, delete it!',
                buttonsStyling: false
            }).then(function() {
                var delDta=$scope.rubrics.rules[index];
                delDta.deleted=true;
                delDta.update.on=$scope.getCurrentUTCDate();
                delDta.update.by=$scope.author;
                $scope.disablesaveRub=false;
            }).catch(function(){
                console.log("Aborted clone req");
            });
        }
        
	}
	
	$scope.saveRubric = function(rubrics,ref){
        $scope.subData.rubrics[ref]=rubrics; 
        var sameTextrule=false;

        var ruleArryDelFalse=rubrics.rules.filter((item) => item.deleted !== true);
        // console.log(ruleArryDelFalse)
        var  uniqueValues = new Set(ruleArryDelFalse.map(v => v.text));
        // console.log(uniqueValues)
       
        if (uniqueValues.size < ruleArryDelFalse.length) {
            console.log('duplicates found')
            sameTextrule=true;
        }

        if(sameTextrule==true){
            $("#textErr").show();
            $scope.disablesaveRub=true;
        }else{
           var aa = ruleArryDelFalse.map(v => v.text=="" || v.value=="" )
                //    console.log(aa)
                // console.log(aa.indexOf(true));
            if(aa.indexOf(true)>0){
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Some textbox(s) are blank'
                });
            }else{
                $("#textErr").hide();
                $scope.disablesaveRub=false;
                // console.log($scope.subData);
                $http.post("/author_updaterubric", { 'data': $scope.subData}).then(function (callback) {
                    if (callback.data.status === "success") {
                            swal({
                                type: 'success',
                                title: 'Success',
                                html: 'Updated successfully'
                            }).then(function () {
                                $scope.enabledEdit =[];

                                $('#rubricMdl').modal('hide');
                            });
                    }  else {
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
        }
	}


    $scope.changeEnableSub = function () {
        $scope.disableUpdate=false;
    }

    $scope.changeEnableadj = function () {
        $scope.disablesaveRub=false;
    }

    $scope.changeEnableEdit = function () {
        $scope.disablesaveRub=false;
    }
    

    $scope.updateGrade = function (frmgrade,flag) {
        var gradeMap=[];

        $scope.output.forEach(function (itm) {
            itm.gradingMap.forEach(function (val) {
                gradeMap.push(val);
            })
        });

        $scope.subData.gradingMap=gradeMap;
        $scope.disableUpdate=true;

        $http.post("/author_updateSubGrading", { 'data': $scope.subData}).then(function (callback) {
            if (callback.data.status === "success") {
                    swal({
                        type: 'success',
                        title: 'Success',
                        html: 'Updated successfully'
                    }).then(function () {

                    });
                
                
            }  else {
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

    $scope.removeDuplicates = function (data) {
        return data.filter((value,index)=> data.indexOf(value)===index);
    }

    

    $scope.sendLinkEmail = function (quizId,linkUrl,graders,authorName,authorEmail,finalize) {

        if($scope.disableUpdate==false){
         swal({
             type: 'warning',
             title: 'Cannot sent emails',
             html: 'You have made some changes, first update them and then try again. '
         });
        } else{
            if($scope.subData.gradingMap.length<=0){
                swal({
                    type: 'warning',
                    title: 'Cannot sent emails',
                    html: 'You have not assigned any grader. '
                });
            }else{
             var emails=[];
             // var dupChars =
             var graderArry=[];
     
             $scope.subData.gradingMap.forEach(function (itm) {
                 graderArry.push(itm.grader)
             })
             
             var gradersArry=graders;
             // console.log(gradersArry)
     
             var grader = $scope.removeDuplicates(graderArry);
     
             grader.forEach(function (val) {
                 var linkArry=[];
                 $scope.subData.gradingMap.forEach(function (itm) {
                     if(val==itm.grader){
                         var dta={};
                         dta["ref"]=itm.ref;
                         dta["token"]=itm.token;
                         dta["link"]=linkUrl+"token="+itm.token;
                         linkArry.push(dta);
                     }
                 })
                 let found=gradersArry.find(a => {
                     if(a.nickname==val){
                         return a.email
                     }
                     
                 })
     
                 if(found!=undefined){
                     obj={};
                     obj["grader"]=val;
                     obj["links"]=linkArry;
                     obj["quizId"]=quizId;
                     obj["authorName"]=authorName;
                     obj["authorEmail"]=authorEmail;
                     obj["email"]=found.email;
     
                     emails.push(obj);
                 }
     
                 
             })
     
             console.log(emails);
             var fmsg="";
             if(finalize==true){
                 fmsg="Since, grading is already finalized these links cannot be changed. Sharing these links will provide permanent access of grading information to the graders or whosoever has the links. Are you sure to share the links with respective graders?";
             }else{
                 fmsg="Are you sure, You want to send links to graders?";
             }
     
             swal({
                 // title: 'Are you sure?',
                 text: fmsg,
                 type: 'warning',
                 showCancelButton: true,
                 confirmButtonClass: 'btn btn-success btn-fill',
                 cancelButtonClass: 'btn btn-danger btn-fill',
                 confirmButtonText: 'Yes, send it!',
                 buttonsStyling: false
             }).then(function() {
                 $http.post("/author_sendEmailSubGrading", { 'emailsDta':emails}).then(function (callback) {
                     if (callback.data.status === "success") {
                         swal({
                             type: 'success',
                             title: 'Success',
                             html: 'Mail Sent successfully'
                         }).then(function () {
                             $scope.subData._rev = callback.data.rev;
                             
                         });
                     }  else {
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
        
        }
 
        
     }
    

    let resetSubGrades = async (quiz, grader,ref) => {
        let allQuizzes = await respdb.view("byQuizId", "graderProgess", { key: quiz })
        let refs = []
        allQuizzes.rows.map(itm => {
            if (itm.value.grader == grader && itm.value.ref==ref) {
                if(refs.indexOf(itm.id) == -1){refs.push(itm.id)}
            }
        })
        // console.log(refs)
        for (let index = 0; index < refs.length; index++) {
            const element = refs[index];
            let respDoc = await respdb.get(element);
            if (respDoc["subScores"]) {
                let fI = respDoc["subScores"].findIndex(scr => { return scr["grader"] == grader && scr["ref"]==ref })
                console.log(fI)
                if (fI > -1) {respDoc["subScores"].splice(fI, 1);}
               //  console.log(JSON.stringify(respDoc))
                await respdb.insert(respDoc)
                console.log("updated doc "+respDoc["_id"])
            }
        }
    }
    
    $scope.discardGrading = function (index,quizId,grader,ref) {
        // resetSubGrades(quizId,grader,ref).then(d=>{console.log(d)})

    }



    $scope.finalized = function (quizId,totalGradedQues,totalSubQues) {

        $scope.subData.gradingMap.forEach(function (itm) {
            // console.log("1--"+JSON.stringify(itm));
            itm.token=$scope.generateToken();
            itm.updatedOn=$scope.getCurrentUTCDate();
            itm.enabled=true;
        })
        // console.log(JSON.stringify($scope.subData));

        // console.log(totalSubQues+"--"+totalGradedQues)
        if(totalSubQues==totalGradedQues){
            swal({
                title: 'Are you sure?',
                text: "",
                type: 'warning',
                html: "<ul class='text-left'><li>Finalization will merge scores of subjective questions into Performance Summary and make the scores available to the participants.</li><li>Deadline extension and editing of quiz properties are not possible after finalization.</li><li>All the links will change, and the graders cannot access older links.</li><ul>",
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: 'Yes, finalize it',
                buttonsStyling: false
            }).then(function() {
                // console.log(JSON.stringify($scope.subData.gradingMap))
                $http.post("/author_finalizedSubGrading", { 'quizId':quizId,'data':$scope.subData}).then(function (callback) {
                    if (callback.data.status === "success") {
                        swal({
                            type: 'success',
                            title: 'Success',
                            html: 'Finalized successfully'
                        }).then(function () {
                            location.reload();
                            
                        });
                    }  else {
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

        }else{
            $.notify({
                icon: "ti-info",
                message: "You cannot finalize quiz now since all question are not graded."
              },{
                type: "info",
                timer: 4000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
              });

        }
       
    }

});

//directive
app.directive('subjectmath', function () {
    return {
        restrict: 'EA',
        scope: {
            subjectmath: '@'
        },
        link: function (scope, elem, attrs) {
            scope.$watch('subjectmath', function (value) {
                elem.html('');
                if (!value) return;
                elem.addClass('loadMathData');
                elem.html(value);
                setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                        MathJax.Hub.Register.StartupHook("End",function () {
                            setTimeout(()=>{
                                elem.removeClass('loadMathData');
                            },300)
                        });
                 }, 0);
            });
        }
    };
});