
//, 'angular.filter'
var app = angular.module('manageLiveQuizApp', ['ui.bootstrap', 'ui.utils', 'angular.filter','angularUtils.directives.dirPagination','ngSanitize']);

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



app.directive('compile', function ($compile) {
    // directive factory creates a link function
    return function (scope, element, attrs) {
        scope.$watch(
            function (scope) {
                // watch the 'compile' expression for changes
                // console.log(attrs.compile);
                if (attrs.compile.substr(0, 1) == "'") {
                    //console.log('yes')
                    return scope.$eval(attrs.compile);
                } else {
                    // return scope.$eval(attrs.compile);
                    return attrs.compile;
                    //return scope.$eval("'"+attrs.compile+"'");
                }

            },
            function (value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                //console.log(attrs.compile.substr(1).slice(0,-1));
                if (attrs.compile.substr(0, 1) == "'") {
                    //console.log('yes2')
                    element.html(attrs.compile.substr(1).slice(0, -1));
                } else {
                    element.html(attrs.compile);
                }


                setTimeout(function () {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                }, 0);
                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
});

app.filter('lineBreak', function () {
    return function (text) {
        if (text.includes('@')) {
            return text.replace(/@/g, '@');
        } else {
            return text;
        }
    }
})

app.filter('timeDMY', function () {
    return function (text) {
        var d1 = new Date(text);
        var ld = new Date(d1.toString());
        var hours = ld.getHours();
        var minutes = ld.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var exactTime = hours + ':' + minutes + ' ' + ampm;
        let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let cdate = month[ld.getMonth()] + " " + ld.getDate() + " " + ld.getFullYear()+" "+exactTime;
        return cdate;
    }
});

app.filter('dateHtml', function ($sce) {
    return function (text) {

        var d1 = new Date(text);
        var ld = new Date(d1.toString());
        var hours = ld.getHours();
        var minutes = ld.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var exactTime = hours + ':' + minutes + ' ' + ampm;
        let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let cdate = month[ld.getMonth()] + " " + ld.getDate() + " " + ld.getFullYear();
        return $sce.trustAsHtml("<strong>" + exactTime + "</strong> <br><small>"+cdate+"</small>");
        
    }
});




app.controller('manageLiveQuizController', function ($scope, $http, $timeout, $interval) {

    $('.ld').show();
    $('.wrapper').addClass('ld-over-full-inverse running');

    

    var defaultTime = 60;
    var infiniteTime = 900;
    var clockinterval;
    var w;
    var socket;
    let newChatWindow = null;
    let newwbBoardWindow = null;
    $scope.showStatstics = false;
    $scope.playPauseBtn = false;
    $scope.plyBtnDiv = true;
    $scope.isDisGradeDiv = false;
    $scope.isQuesComplete = false;
    $scope.isSubDiv = false;
    $scope.ansStatsDiv = false;
    $scope.isPlay = false;
    $scope.lastPlayTime = 0;
    $scope.queQuest = [];
    $scope.liveQuiz = {
        playedQuest: []
    };
    
    $scope.allStds = [];

    $scope.flashCards = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]];

    $scope.quizStatus = 'OFF';
    

    let socketURL = $("#socketURL").val();
    socket = io.connect(socketURL,{
        reconnectionDelay:5000
    });

    let connStatus = 'disconnect';

    // $scope.resetPlq = function () {
    //     $scope.selectPlq = false;
    // }


    // $scope.filterHistoryContent = function (item) { 
    //     console.log(item);
    //     if($scope.filterHis == 'all'){
    //         return true;
    //     }else
    //     if($scope.filterHis == 'graded'){
    //        return ('grade' in item);
    //     }else
    //     if($scope.filterHis == 'ungraded'){
    //       return !('grade' in item);
    //     }
    // };


    $scope.isPlayedQuest = function (sec, ques) {
        //  console.log(sec+'-'+ques);
        if ($scope.liveQuiz.hasOwnProperty('playedQuest')) {
            let index = $scope.liveQuiz.playedQuest.findIndex(x =>
                x.secIndex == sec && x.questIndex == ques);
            if (index > -1) {
                return true;
            }
        }
        return false;
    }

    $scope.getHelpAllowed = function (secIndex) {
        return $scope.examMetaData.sections[secIndex].helpAllowed;
    }

    $scope.loadData = function (id, author) {
        $http.post("/author_getLiveQuizData", { 'quiz_id': id, 'author': author }).then(function (callback) {
             console.log(JSON.stringify(callback,null,2))
             console.log(typeof callback.data.quesdata)            
             console.log(JSON.stringify(callback));

            if (callback.data.status) {
                var data1 = callback.data;
                // console.log(data1.data);
                $scope.examData = data1.data.quizData.rows;
                $scope.basket = data1.data.basket;
                socketURL = data1.data.socketUrl;
                $scope.lqWbSenderUrl = data1.data.lqWbSenderUrl;
                $scope.examMetaData = data1.exMeta.rows[0].value;
                // console.log(JSON.stringify($scope.examMetaData,null,2));
                $scope.chart_url = data1.chart_url;
                $scope.ytvideo_url = data1.ytvideo_url;
                $scope.graphics_url = data1.graphics_url;
                $scope.plotIframeLink = data1.plotIframeLink;
                $scope.pdfDocUrl = data1.pdfDocUrl;
                $scope.socketToken = data1.socketToken;
                $scope.authorUrl = data1.authorUrl;
                $scope.allStds = $scope.examMetaData.students.map(x => {
                    let obj = {};
                    obj.user = x;
                    //obj.online = false;
                    obj.online = 0;
                    obj.correct = -1;
                    return obj;
                });
                //console.log("All Students");
                //console.log(JSON.stringify($scope.allStds, null, 2));

                $scope.liveQuiz = data1.liveQuiz;
                $scope.queQuest = $scope.liveQuiz.questQueue;
                $scope.quizId = $scope.examMetaData.quizId;
                $scope.examMetaData.beginTime = new Date($scope.examMetaData.beginTime);
                $scope.examMetaData.beginTime = $scope.examMetaData.beginTime.toString();
                $scope.quizNotFinalize = true;
                let endDate = new Date($scope.examMetaData.endTime);
                if (endDate <= new Date()) {
                    $scope.quizNotFinalize = false;
                }

                if('finalize' in $scope.examMetaData){
                    $scope.quizNotFinalize = false;
                }


            } else {
                console.log("111");
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!',
                    allowOutsideClick: false
                }).then(function() {
                    location.reload();
                });
            }
            setTimeout(() => {
                $('.ld').hide();
                $('.wrapper').removeClass('ld-over-full-inverse running');
                $("#mainPanelDiv").show();
            }, 1500);
           
        }, function (error) {
            console.log(error);
            $('.ld').hide();
            $('.wrapper').removeClass('ld-over-full-inverse running');
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!',
                allowOutsideClick: false
            }).then(function() {
                location.reload();
            });
        });
    }

    var HisChart1 = null;
    var HisChart2 = null;
    $scope.showHisGrade = function (sd) {
        $scope.plq = sd
        $scope.selectPlq = true;
        console.log(sd);


        $timeout(() => {

            if ($scope.plq.hasOwnProperty('grade')) {

                if (HisChart1) {
                    HisChart1.destroy();
                }

                if (HisChart2) {
                    HisChart2.destroy();
                }

                if('qtype' in sd){
                    if(sd.qtype == 'sub'){
                        const graphData = [$scope.plq.grade[0][3],$scope.plq.grade[1][3] ];
                        const graphLabels = ['Attempted', 'Skipped'];
                        const graphTitle =  'Question';
                        const graphEle = 'hisStatsChart';
                        $scope.drawGrapAnsQuest(graphEle,graphTitle,graphLabels,graphData);
                        const graphHE_Data1 = [ $scope.plq.grade[2][0],$scope.plq.grade[2][1],$scope.plq.grade[2][2] ];
                        const graphHE_Data2 = [ $scope.plq.grade[2][0],$scope.plq.grade[2][1] ];
                        const graphHE_Ele = 'hisAnswerChart';
                        $scope.drawGraphHintExpl(graphHE_Ele,graphHE_Data1,graphHE_Data2);

                    }else{
                        $scope.drawHistyGraphDefault();
                    }

                }else{
                    $scope.drawHistyGraphDefault();
                }

                

            }
        }, 200);

    }

    $scope.drawHistyGraphDefault = function(){
         //// graphData = totalCorrect,totalIncorrect,totalSkipped   ////          
         const graphData = [$scope.plq.grade[0][3],$scope.plq.grade[2][3],$scope.plq.grade[1][3] ];
         const graphLabels = ['Correct', 'Incorrrect', 'Skipped'];
         const graphTitle =  'Answers';
         const graphEle = 'hisStatsChart';
         $scope.drawGrapAnsQuest(graphEle,graphTitle,graphLabels,graphData);
         const graphHE_Data1 = [$scope.plq.grade[3][0],$scope.plq.grade[3][1],$scope.plq.grade[3][2] ];
         const graphHE_Data2 = [$scope.plq.grade[3][0],$scope.plq.grade[3][1] ];
         const graphHE_Ele = 'hisAnswerChart';
         $scope.drawGraphHintExpl(graphHE_Ele,graphHE_Data1,graphHE_Data2);

    }

    $scope.drawGrapAnsQuest = function(graphEle,graphTitle,graphLabels,graphData){
        let statsChart = document.getElementById(graphEle).getContext('2d');
        HisChart1 = new Chart(statsChart, {
            type: 'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
            data: {
                labels: graphLabels,
                datasets: [{
                    data: graphData,
                    //backgroundColor:'green',
                    backgroundColor: [
                        '#7AC29A',
                        '#EB5E28',
                        '#68B3C8',
                    ],
                    borderWidth: 1,
                    borderColor: '#777',
                    hoverBorderWidth: 1,
                    hoverBorderColor: '#000'
                }]
            },
            options: {
                title: {
                    display: true,
                    text: graphTitle,
                    fontSize: 15
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        fontColor: '#000',
                        boxWidth: 15,
                        fontSize: 10,
                        padding: 5
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                tooltips: {
                    enabled: true
                },
                responsive: true
            }
        });

    }

    $scope.drawGraphHintExpl = function(graphHE_Ele,graphHE_Data1,graphHE_Data2){
        let helpAllowed = $scope.getHelpAllowed($scope.plq.secIndex);
        if (helpAllowed > 0 && helpAllowed <= 2) {
            let chartLable = 'Hint and explanation';
            let answerChart = document.getElementById(graphHE_Ele).getContext('2d');
            let labels = ['No help used', 'Hint used', 'Hint and explanation used'];
            let backgroundColor = [
                '#7AC29A',
                '#eac87d',
                '#68B3C8',
            ];
            let data = graphHE_Data1;
            if (helpAllowed == 1) {
                chartLable = 'Hint used';
                labels = ['No help used', 'Hint used'];
                data = graphHE_Data2

                backgroundColor = [
                    '#7AC29A',
                    '#eac87d'
                ];
            }

            HisChart2 = new Chart(answerChart, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        //backgroundColor:'green',
                        backgroundColor: backgroundColor,
                        borderWidth: 1,
                        borderColor: '#777',
                        hoverBorderWidth: 1,
                        hoverBorderColor: '#000'
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: chartLable,
                        fontSize: 15
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            fontColor: '#000',
                            boxWidth: 15,
                            fontSize: 10,
                            padding: 5
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    tooltips: {
                        enabled: true
                    },
                    responsive: true
                }
            });

        }
    }


    $scope.sectionPlayedQuest = function (section) {
        if ($scope.liveQuiz.playedQuest) {
            return $scope.liveQuiz.playedQuest.filter(x => x.secIndex == section);
        }

    }

    
    $scope.playHistory = function () {

        // $scope.playHis = []
        // $scope.liveQuiz.playedQuest.forEach(x=>{
        //     let index = $scope.playHis.findIndex(y => y == x.section);
        //     if(index>-1){
        //          $scope.playHis[index] = {

        //          }
        //     }else{

        //     }
        // }) 
        //$scope.playHisSec = $scope.liveQuiz.playedQuest.map(x=>x.section);
        $scope.selectPlq = false;
        $scope.currentPage = 1;
        //$scope.filterHis = 'all';
        $scope.playedReverse = $scope.liveQuiz.playedQuest.slice().reverse();
        $("#playHistoryMdl").modal();
    }


    $scope.countStdSt = function (st) {
        let stds = $scope.allStds.filter(x => {
            if (x.online == st) {
                return x;
            }
        })
        return stds.length;
    }

    $scope.countAnswerGiven = function () {
        let stds = $scope.allStds.filter(x => {
            if (x.hasOwnProperty('hasAns')) {
                if (x.hasAns)
                    return x;
            }
        })
        return stds.length;
    }


    $scope.addToQues = function () {

        if ($scope.showDiv == "") {
            swal({
                type: 'warning',
                text: 'Please select the question',
                buttonsStyling: false,
                confirmButtonClass: "btn btn-warning btn-fill"

            });
            return;
        }

        if ($scope.showDiv != "question") {
            swal({
                type: 'warning',
                text: 'Only question will be added in the queue',
                buttonsStyling: false,
                confirmButtonClass: "btn btn-warning btn-fill"
            });
            return;
        }

        let payload = {
            quizId: $scope.quizId,
            secIndex: $scope.secIndex,
            questIndex: $scope.quesNum
        }

        $http.post("/author_liveQuizAddToQuea", payload).then(function (callback) {
            //   console.log(callback);
            let data = callback.data;
            if (data.status) {
                $scope.queQuest.push({
                    secIndex: payload.secIndex,
                    questIndex: payload.questIndex
                })
            }

            $.notify({
                message: data.msg
            }, {
                type: data.type,
                delay: 1000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });

        }, function (error) {
            $.notify({
                message: "Something goes wrong. Please try after sometime !!"
            }, {
                type: 'danger',
                delay: 1000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });
        });
    }

    $scope.deleteQueQuest = function ($event, sec, ques) {
        $event.stopPropagation();

        let data = {
            quizId: $scope.quizId,
            secIndex: sec,
            questIndex: ques
        }
        $http.post("/author_liveQuizRemoveFromQuea", data).then(function (callback) {
            //   console.log(callback);
            let data = callback.data;
            if (data.status) {
                let index = $scope.queQuest.findIndex(x =>
                    x.secIndex == sec && x.questIndex == ques);
                $scope.queQuest.splice(index, 1);
            }

            $.notify({
                message: data.msg
            }, {
                type: data.type,
                delay: 1000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });

        }, function (error) {
            $.notify({
                message: "Something goes wrong. Please try after sometime !!"
            }, {
                type: 'danger',
                delay: 1000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });
        });
    }



    $scope.restart_NewQuest = function () {

        var buttons = $('<div>')
            .append($('<p><b>You can clear or restart the same question again</b></p>'))
            .append(createButton('Clear', 'btn btn-danger btn-fill', 'clearId'))
            .append(createButton('Restart', 'btn btn-success btn-fill', 'restart1Id'))
            .append(createButton('Cancel', 'btn btn-default btn-fill', 'cancel1Id'));

        swal({
            title: "Are you sure?",
            html: buttons,
            type: "info",
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false
        });

        document.getElementById("restart1Id").addEventListener("click", function () {

            // if ($('#showAnschk').prop('checked')) {
            //     $("#shwAnsBt").click();
            // }

            // if ($('#showStatchk').prop('checked')) {
            //     $("#shwStatBt").click();
            // }

            $scope.showScore = false;
            $scope.showAns = false;
            $scope.showStat = false;

            $timeout(() => {
                $scope.restartQuestion();
            }, 200);

            swal.close();
            $scope.$digest();

        });

        document.getElementById("clearId").addEventListener("click", function () {
            // if ($('#showAnschk').prop('checked')) {
            //     $("#shwAnsBt").click();
            // }
            // if ($('#showStatchk').prop('checked')) {
            //     $("#shwStatBt").click();
            // }

            $scope.showScore = false;
            $scope.showAns = false;
            $scope.showStat = false;

            $scope.pauseQuiz();
            $scope.plyBtnDiv = true;

            $("#slider").slider("value", defaultTime); //
            $("#sv").show();
            $scope.noLimit = false;

            swal.close();
            $scope.$digest();

        });

        document.getElementById("cancel1Id").addEventListener("click", function () {
            // console.log('cancel1Id');
            swal.close();
        })

    }


    $scope.stopPlay = function () {

        if ($scope.plyType == 'question') {

            swal({
                title: 'Are you sure?',
                text: "You want to stop this question.",
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                buttonsStyling: false
            }).then(function () {
                $scope.$apply(function () {
                    $scope.cancelPlay();

                })
            }, function () {

            });

        } else {
            $scope.cancelPlay();
        }


    }

    $scope.setUpGrap = function(res){
        ///////////
        $scope.gradeStats = res.gradeStats;
        $scope.gradeHelpAllowed = $scope.getSection(res.playData.secId - 1).helpAllowed;

        let totalAttempt = $scope.gradeStats[0][3];
        let totalSkipped = $scope.gradeStats[1][3]

        let statsChart = document.getElementById('subStatsChart').getContext('2d');

        if (Chart1) {
            Chart1.destroy();
        }

        if (Chart2) {
            Chart2.destroy();
        }

        Chart1 = new Chart(statsChart, {
            type: 'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
            data: {
                labels: ['Attempted', 'Skipped'],
                datasets: [{

                    data: [
                        totalAttempt,
                        totalSkipped
                    ],
                    //backgroundColor:'green',
                    backgroundColor: [
                        '#7AC29A',
                        '#EB5E28',
                    ],
                    borderWidth: 1,
                    borderColor: '#777',
                    hoverBorderWidth: 1,
                    hoverBorderColor: '#000'
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Question',
                    fontSize: 15
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        fontColor: '#000',
                        fontSize: 12,
                        boxWidth: 15,
                        padding: 5
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                tooltips: {
                    enabled: true
                },
                responsive: true
            }
        });

        if ($scope.gradeHelpAllowed > 0 && $scope.gradeHelpAllowed <= 2) {

            let answerChart = document.getElementById('subAnswerChart').getContext('2d');
            let labels = ['No help used', 'Hint used', 'Hint and explanation used'];
            let backgroundColor = [
                '#7AC29A',
                '#eac87d',
                '#68B3C8',
            ];
            let data = [
                $scope.gradeStats[2][0],
                $scope.gradeStats[2][1],
                $scope.gradeStats[2][2]
            ]



            if ($scope.gradeHelpAllowed == 1) {
                labels = ['No help used', 'Hint used'];
                data = [
                    $scope.gradeStats[2][0],
                    $scope.gradeStats[2][1]
                ];

                backgroundColor = [
                    '#7AC29A',
                    '#eac87d'
                ];
            }

            Chart2 = new Chart(answerChart, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{

                        data: data,
                        //backgroundColor:'green',
                        backgroundColor: backgroundColor,
                        borderWidth: 1,
                        borderColor: '#777',
                        hoverBorderWidth: 1,
                        hoverBorderColor: '#000'
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Hint and Explanation',
                        fontSize: 15
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            fontColor: '#000',
                            boxWidth: 15,
                            fontSize: 12,
                            padding: 5
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    tooltips: {
                        enabled: true
                    },
                    responsive: true
                }
            });

        }
        ////////

        if (!$scope.liveQuiz.hasOwnProperty('playedQuest')) {
            $scope.liveQuiz.playedQuest = [];
        }

        let forwardIndex = $scope.liveQuiz.playedQuest.slice().reverse().findIndex(x => x.section === $scope.plySecNum  && x.quesId ===$scope.plyQuesId && x.secIndex == $scope.plySecNum - 1 );
        let totalPlayed = $scope.liveQuiz.playedQuest.length - 1
        let index = forwardIndex >= 0 ? totalPlayed - forwardIndex : forwardIndex;
        if(index>-1){
            $scope.liveQuiz.playedQuest[index].grade = $scope.gradeStats;
        }

        $scope.allStds = $scope.allStds.map(x => {
            // console.log(res.ansData.hasOwnProperty(x.user));
            if (res.ansData.hasOwnProperty(x.user)) {
                
                let ref = res.ansData[x.user]['ref'];
                let answerId = res.ansData[x.user]['answerId'];
                let timeTaken =  res.ansData[x.user]['timeTaken'];
                if ($scope.plyQuesId == ref && answerId != -1) {
                    x.hasAns = true;
                    x.timeTaken = timeTaken;
                } else {
                    x.hasAns = false;
                }

            } else {
                x.correct = -1;
            }
            return x;
        });

    }

    $scope.saveSubjective = function(){
        $scope.disablePlayBtn = true;
        var data = {
            section: $scope.plySecNum,
            quesid:  $scope.plyQuesId,
            quizid: $scope.quizId,
            qtype: $scope.plyQuesType
            
        }
        $timeout(()=>{
            socket.emit('ath_lqSaveSubResponse', data,function(res){
                $scope.$apply(function(){
                    console.log("ath_lqSaveSubResponse");
                    if(res.status){
                        console.log(JSON.stringify(res,null,2));
                        $scope.disablePlayBtn = false;
                        $scope.isQuesComplete = true;
                        $scope.isSubDiv = true;
                        $scope.plyBtnDiv = false;
                        $scope.setUpGrap(res);
                    }else{
                        console.log(res.error);
                        $scope.disablePlayBtn = false;
                    }
                    
                })
                
            });
        },3000);
    }

    $scope.saveInfoTimeTaken = function(){
        var data = {
            section: $scope.plySecNum,
            quesid:  $scope.plyQuesId,
            quizid: $scope.quizId,
            qtype: $scope.plyQuesType,
            gradingMatrix: $scope.plygradingMatrix
        }

       
        $scope.disablePlayBtn = true;
        $timeout(()=>{
            socket.emit('ath_lqSaveInfoTimeTaken', data,function(res){
                $scope.$apply(function(){
                    console.log("ath_lqSaveInfoTimeTaken");
                    console.log(res);
                    $scope.disablePlayBtn = false;
                    $scope.isQuesComplete = true;
                })
                
            });
        },3000);
    }

   /* ath_lqStopPlay fired first to change state of quiz to wait then other event will fire like saveSubjective,saveInfoTimeTaken because grading is not possible */

    $scope.cancelPlay = function () {
        $scope.cancelTimerData();

        $scope.playPauseBtn = false;
        if ($scope.plyType == 'question') {
            // console.log('show grade and cancel btn')            
            if ($scope.plyQuesType != 'info') {
                 // 2) saveSubjective
                if($scope.plyQuesType == 'sub'){
                    $scope.saveSubjective()
                }else{
                    $scope.isDisGradeDiv = true;
                    $scope.isQuesComplete = true;
                    $scope.plyBtnDiv = false;
                }
                
            }

            // 2) saveInfoTimeTaken
            if($scope.plyQuesType == 'info'){
                $scope.saveInfoTimeTaken();
            }

            
        }

        // 1) wait
        var data = {
            quizId: $scope.quizId
        }
        socket.emit('ath_lqStopPlay', data);
        $("#slider").slider("value", defaultTime); //
        $scope.noLimit = false;
        $("#sv").show();
    }


    $scope.showStat = false;
    $scope.showAns = false;
    $scope.showScore = false;

    $scope.staAnsScoreStatus = {
        stat : false,
        ans : false,
        score: false
    };

    $scope.showAnwerStat = function () {
        $timeout(() => {

            let data = {
                quizId: $scope.quizId,
                stat: $scope.showStat,
                ans: $scope.showAns,
                score: $scope.showScore
            }

            $scope.staAnsScoreStatus = {...data};
            if(!$scope.showStat && !$scope.showAns && !$scope.showScore){
                socket.emit('ath_lqWait', data);
            }else{

                socket.emit('ath_lqShowDataStds', data, function (res) {
                    console.log(res);
                    if (!res) {
                        alert('Something goes wrong');
                        console.log(res);
                    }
                    $scope.$digest();
                });

            }

        }, 100);
    }

    $scope.isSubStatsShow = false;
    $scope.showStatOnly = function () {
        $timeout(() => {
            let data = {
                quizId: $scope.quizId
            }
            $scope.isSubStatsShow = true;
            socket.emit('ath_lqShowStatOnly', data, function (res) {
                console.log(res);
                if (!res) {
                    alert('Something goes wrong');
                    console.log(res);
                }
                $scope.$digest();
            });
        }, 100)

    }


    var Chart1 = null;
    var Chart2 = null;

    //
    $scope.isGrading = false;
    $scope.grade = function () {

        let data = {
            "quizid": $scope.quizId,
            "section": $scope.plySecNum,
            "quesid": $scope.plyQuesId,
            "qtype": $scope.plyQuesType,
            "gradingMatrix": $scope.plygradingMatrix
        }

        $scope.isGrading = true;

        socket.emit('ath_lqGrade', data, function (res) {
            $scope.$apply(function () {
                console.log('ath_lqGrade');
                console.log(JSON.stringify(res, null, 2));
                if (res.status) {
                    $scope.gradeStats = res.data;
                    $scope.isDisGradeDiv = false;
                    $scope.ansStatsDiv = true;
                    $scope.showStatstics = true;

                    $scope.gradeHelpAllowed = $scope.getSection(res.playData.secId - 1).helpAllowed;

                    //////////////////

                    let totalCorrect = $scope.gradeStats[0][3];
                    let totalIncorrect = $scope.gradeStats[2][3];
                    let totalSkipped = $scope.gradeStats[1][3]
                    let statsChart = document.getElementById('statsChart').getContext('2d');

                    if (Chart1) {
                        Chart1.destroy();
                    }

                    if (Chart2) {
                        Chart2.destroy();
                    }

                    Chart1 = new Chart(statsChart, {
                        type: 'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
                        data: {
                            labels: ['Correct', 'Incorrrect', 'Skipped'],
                            datasets: [{

                                data: [
                                    totalCorrect,
                                    totalIncorrect,
                                    totalSkipped
                                ],
                                //backgroundColor:'green',
                                backgroundColor: [
                                    '#7AC29A',
                                    '#EB5E28',
                                    '#68B3C8',
                                ],
                                borderWidth: 1,
                                borderColor: '#777',
                                hoverBorderWidth: 1,
                                hoverBorderColor: '#000'
                            }]
                        },
                        options: {
                            title: {
                                display: true,
                                text: 'Answers',
                                fontSize: 15
                            },
                            legend: {
                                display: true,
                                position: 'bottom',
                                align: 'center',
                                labels: {
                                    fontColor: '#000',
                                    fontSize: 12,
                                    boxWidth: 15,
                                    padding: 5
                                }
                            },
                            animation: {
                                animateScale: true,
                                animateRotate: true
                            },
                            tooltips: {
                                enabled: true
                            },
                            responsive: true
                        }
                    });


                    if ($scope.gradeHelpAllowed > 0 && $scope.gradeHelpAllowed <= 2) {

                        let answerChart = document.getElementById('answerChart').getContext('2d');
                        let labels = ['No help used', 'Hint used', 'Hint and explanation used'];
                        let backgroundColor = [
                            '#7AC29A',
                            '#eac87d',
                            '#68B3C8',
                        ];
                        let data = [
                            $scope.gradeStats[3][0],
                            $scope.gradeStats[3][1],
                            $scope.gradeStats[3][2]
                        ]



                        if ($scope.gradeHelpAllowed == 1) {
                            labels = ['No help used', 'Hint used'];
                            data = [
                                $scope.gradeStats[3][0],
                                $scope.gradeStats[3][1]
                            ];

                            backgroundColor = [
                                '#7AC29A',
                                '#eac87d'
                            ];
                        }

                        Chart2 = new Chart(answerChart, {
                            type: 'pie',
                            data: {
                                labels: labels,
                                datasets: [{

                                    data: data,
                                    //backgroundColor:'green',
                                    backgroundColor: backgroundColor,
                                    borderWidth: 1,
                                    borderColor: '#777',
                                    hoverBorderWidth: 1,
                                    hoverBorderColor: '#000'
                                }]
                            },
                            options: {
                                title: {
                                    display: true,
                                    text: 'Hint and Explanation',
                                    fontSize: 15
                                },
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                    align: 'center',
                                    labels: {
                                        fontColor: '#000',
                                        boxWidth: 15,
                                        fontSize: 12,
                                        padding: 5
                                    }
                                },
                                animation: {
                                    animateScale: true,
                                    animateRotate: true
                                },
                                tooltips: {
                                    enabled: true
                                },
                                responsive: true
                            }
                        });

                    }

                    //////////////

                    //set grade inside playedQuest
                    if (!$scope.liveQuiz.hasOwnProperty('playedQuest')) {
                        $scope.liveQuiz.playedQuest = [];
                    }

                   
                    let forwardIndex = $scope.liveQuiz.playedQuest.slice().reverse().findIndex(x => x.section === $scope.plySecNum  && x.quesId ===$scope.plyQuesId && x.secIndex == $scope.plySecNum - 1 );
                    let totalPlayed = $scope.liveQuiz.playedQuest.length - 1
                    let index = forwardIndex >= 0 ? totalPlayed - forwardIndex : forwardIndex;
                    if(index>-1){
                        $scope.liveQuiz.playedQuest[index].grade = $scope.gradeStats;
                    }

                    /////////////////

                    $scope.allStds = $scope.allStds.map(x => {
                        // console.log(res.ansData.hasOwnProperty(x.user));
                        if (res.ansData.hasOwnProperty(x.user)) {
                            let grade = res.ansData[x.user]['gradingIndex'];
                            let ref = res.ansData[x.user]['ref'];
                            let answerId = res.ansData[x.user]['answerId'];
                            let timeTaken =  res.ansData[x.user]['timeTaken'];

                            if (grade[0] === 0 && (grade[1] === 0 || grade[1] === 1 || grade[1] === 2)) {
                                x.correct = 1;
                            }else
                            if (grade[0] === 1 && (grade[1] === 0 || grade[1] === 1 || grade[1] === 2)) {
                                x.correct = -1;
                            }else
                            if (grade[0] === 2 && (grade[1] === 0 || grade[1] === 1 || grade[1] === 2)) {
                                x.correct = 0;
                            }

                            if ($scope.plyQuesId == ref && answerId != -1) {
                                x.hasAns = true;
                                x.timeTaken = timeTaken;
                            } else {
                                x.hasAns = false;
                            }


                        } else {
                            x.correct = -1;
                        }
                        return x;
                    });

                    console.log("After Grade");
                    console.log(JSON.stringify($scope.allStds, null, 2));
                    //////////////////

                    $scope.isGrading = false;

                } else {
                    //alert(res.error);
                    console.log(res.error)
                    $scope.isGrading = false;
                }

            })
        });
    }


    function createButton(text, cls, id) {
        return $('<button class="' + cls + '"  id="' + id + '" type="button">' + text + '</button>');
    }




    $scope.restartQuestion = function () {
        console.log('restartId');
        var timer = parseInt($("#slider").slider("value"));
        if (timer <= 0) {

            swal({
                type: "warning",
                html: "<b>Please set the timer</b>",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-warning btn-fill"
            });
            return;

        }
        $scope.playPauseBtn = true;
        //$scope.lastPlayTime = timer;
        var data = {
            type: $scope.plyType,
            secId: $scope.plySecNum,
            quesId: $scope.plyQuesId,
            quizId: $scope.quizId,
            qtype: $scope.plyQuesType,
            time: timer * 1000
        }

        $scope.cancelTimerData();


        $scope.resetData();
        //console.log("ath_lqPlayQuiz")
        socket.emit('ath_lqPlayQuiz', data);
        $scope.plyBtnDiv = true;

    }

    //title : New Question | Discard
    $scope.discard = function () {

        // var buttons = $('<div>')
        //     .append($('<p><b>You want to discard or restart the same question again</b></p>'))
        //     .append(createButton('Discard', 'btn btn-danger btn-fill', 'dicardId'))
        //     .append(createButton('Restart', 'btn btn-success btn-fill', 'restartId'))
        //     .append(createButton('Cancel', 'btn btn-default btn-fill', 'cancelId'));

        // swal({
        //     title: "Are you sure?",
        //     html: buttons,
        //     type: "info",
        //     showConfirmButton: false,
        //     showCancelButton: false,
        //     allowOutsideClick: false
        // });

        // document.getElementById("restartId").addEventListener("click", function () {
        //     $scope.$apply(function () {
        //         console.log('restartId');
        //         $scope.playQuiz();
        //         $scope.plyBtnDiv = true;
        //         swal.close();
        //     })

        // });

        // document.getElementById("dicardId").addEventListener("click", function () {
        //     $scope.$apply(function () {
        //         console.log('dicardId');
        //         $scope.resetData();
        //         $scope.plyBtnDiv = true;
        //         $("#slider").slider("value", defaultTime); //test       
        //         swal.close();
        //     })
        // });

        // document.getElementById("cancelId").addEventListener("click", function () {
        //     console.log('cancelId');
        //     swal.close();
        // });

        $scope.resetData();
        $scope.plyBtnDiv = true;
        $("#slider").slider("value", defaultTime); //test  

    }


    $scope.isStartQuiz = false;
    $scope.startLiveQuiz = function () {
        if(typeof(Worker) === "undefined") {
            alert("Please operate live quiz only on chrome browser");
            return;
        }

        $scope.isStartQuiz = true;
        socket.emit('ath_lqStartQuiz', { quizId: $scope.quizId,socketTokenId:$scope.socketToken }, function (res) {
            console.log(JSON.stringify(res));
            if(!$scope.quizNotFinalize){
               
                $.notify({
                    message: 'Quiz can not be start because it is already finalized.'
                }, {
                    type: 'warning',
                    delay: 2000,
                    placement: {
                        from: 'top',
                        align: 'center'
                    }
                });
                return;
            }

            if (res.status) {
                //$scope.sockId = res.id;
                $scope.quizStatus = 'ON';
                $scope.wbToken = res.wbToken;
                
            } else {

                let message = 'Please check your Internet connection.';
                let type = res.error.type || 'danger';

                if (res.error) {
                    if (res.error.code == 'alert_beforeQuizStart') {
                        message = `Quiz can not be started before the start time`;
                    }

                    if (res.error.code == 'msg_notLiveQuiz') {
                        message = 'This is not a live quiz';
                    }

                    if (res.error.code == 'msg_quizNotActive') {
                        message = 'Quiz is not active'
                    }

                    if (res.error.code == 'alert_afterQuizEnd') {
                        message = 'Quiz deadline is over'
                    }
                }

                $.notify({
                    message: message
                }, {
                    type: type,
                    delay: 2000,
                    placement: {
                        from: 'top',
                        align: 'center'
                    }
                });



            }
            $scope.isStartQuiz = false;
            $scope.resetData();
            $scope.$digest();
        });
    }


    $scope.isStopQuiz = false;
    $scope.stopLiveQuiz = function () {
        $scope.isStopQuiz = true;
        socket.emit('ath_lqStopQuiz', {}, function (res) {
            // console.log("ath_lqStopQuiz "+res);
            if (res) {
                $scope.quizStatus = 'OFF';
                $scope.playPauseBtn = false;
                $scope.isDisGradeDiv = false;
                $scope.isQuesComplete = false;
                $scope.isSubDiv = false;
                $scope.cancelTimerData();

                $scope.plyBtnDiv = true;
            } else {
                alert('Something Goes Wrong');
                console.log(res);
            }
            // youtube chatbox
            $scope.showVideo = false;
            $scope.showChatbox = false;
            $("#chatboxBtn").hide();
            if(newChatWindow){
                newChatWindow.close();
                newChatWindow = null;
            }
            //end of youtube chatbox
            
            $scope.showWhiteBoard = false;
            if(newwbBoardWindow){
                newwbBoardWindow.close();
                newwbBoardWindow = null;
            }


            $scope.isStopQuiz = false;
            $scope.resetData();
            $scope.$digest();
        });
    }


    $scope.resetData = function () {
        //console.log("ResetData");
        $scope.allStds = $scope.allStds.map(x => {
            x.hasAns = false;
            x.correct = -1;
            x.timeTaken = infiniteTime;
            return x;
        });

        $scope.showStatstics = false;
        $scope.gradeStats = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];

        $scope.isDisGradeDiv = false;
        $scope.isQuesComplete = false;
        $scope.isSubDiv = false;
        $scope.ansStatsDiv = false;
        $scope.isPlay = false;
        $scope.showStat = false;
        $scope.showAns = false;
        $scope.showScore = false;
        //console.log(JSON.stringify($scope.allStds, null, 2));

        $scope.staAnsScoreStatus = {
            stat : false,
            ans : false,
            score: false
        };

        $scope.isSubStatsShow = false;

    }


    $scope.noLimit = false;
    $scope.changeTime = function (value) {
        console.log("F-changeTime");
        $scope.cancelTimerData();


        var timer = parseInt(value);

        $("#slider").slider("value", timer);
        $scope.noLimit = false;
        $("#sv").show();
        if (timer == infiniteTime) {
            $scope.noLimit = true;
            $("#sv").hide();
        }

        if ($scope.playPauseBtn && $scope.quizStatus == 'ON') {
            socket.emit('ath_lqChangeTime', { quizId: $scope.quizId, newTime: timer * 1000 })
        }
        $scope.$digest();


    }

    function slideValue(event, ui) {
        $scope.cancelTimerData();


        let time = new Date(ui.value * 1000).toISOString().substr(14, 5);
        $("#sv").html(time);
    }

    function changeValue(event, ui) {
        //console.log("E-changeValue");  
        let time = new Date(ui.value * 1000).toISOString().substr(14, 5);
        $("#sv").html(time);
    }


    $("#slider").slider({
        orientation: "horizontal",
        range: "min",
        max: 900,
        value: 60,
        slide: slideValue,
        change: changeValue,
        stop: function (event, ui) {
            let val = $("#slider").slider("value");
            //$scope.startTime();
            $scope.changeTime(val);
        }
    });

    ////////////////////////////////  

    $scope.playQuiz = function () {
        console.log("playQuiz");
        var timer = parseInt($("#slider").slider("value"));

        if ($scope.showDiv == '') {
            swal({
                type: "warning",
                html: "Please select playable item like <b>question</b>,<b>quiz instruction</b> and <b>section instruction</b>",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-warning btn-fill"
            });
            return;
        }

        if (timer <= 0) {

            swal({
                type: "warning",
                html: "<b>Please set the timer</b>",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-warning btn-fill"
            });
            return;

        }


        $scope.playPauseBtn = true;
        //$scope.lastPlayTime = timer;
        var data = {
            type: $scope.showDiv,
            secId: $scope.sectionNum,
            quesId: $scope.quesIdPre,
            quizId: $scope.quizId,
            qtype:$scope.qtype,
            time: timer * 1000
        }

        // console.log(data);
        $scope.plyType = $scope.showDiv;
        $scope.plyQuesNum = $scope.quesNum;
        $scope.plySecNum = $scope.sectionNum;
        $scope.plyQuesId = $scope.quesIdPre;
        $scope.plyQuesType = $scope.qtype;
        $scope.plygradingMatrix = $scope.gradingMatrix;

        $scope.cancelTimerData();


        $scope.resetData();
        //console.log("ath_lqPlayQuiz")
        socket.emit('ath_lqPlayQuiz', data);
    }

    $scope.pauseQuiz = function () {
        $scope.playPauseBtn = false;
        $scope.cancelTimerData();
        var data = {
            quizId: $scope.quizId
        }
        $scope.resetData();
        socket.emit('ath_lqPauseQuiz', data);
    }


    $scope.cancelTimerData = function(){
        //
        // if (clockinterval){
        //     $interval.cancel(clockinterval);
        // }
        if(typeof(w) != "undefined") {
            w.terminate();
            w = undefined;
        }
    }

   

    $scope.startTime = function() {
        $scope.cancelTimerData();
            var timer = parseInt($("#slider").slider("value"));
            if (timer != infiniteTime) {
                w = new Worker("author_public/angularControllers/timeInterval_sw.min.js");
                w.onmessage = function(event) {
                        //console.log(event.data);
                        $scope.$apply(function () {
                            timer = timer - 1;
                            $("#slider").slider("value", timer);
                            if (timer <= 0) {
                                $scope.cancelTimerData();
                                $("#slider").slider("value", defaultTime);
                                $scope.playPauseBtn = false;
                                if ($scope.plyType == 'question' && $scope.plyQuesType !='info') {
                                    if($scope.plyQuesType =='sub'){
                                        $scope.saveSubjective()
                                    }else{
                                        $scope.isDisGradeDiv = true;
                                        $scope.plyBtnDiv = false;
                                        $scope.isQuesComplete = true;
                                        
                                    }
                                    
                                    
                                }

                                if ($scope.plyType == 'question' && $scope.plyQuesType =='info') {
                                    $scope.saveInfoTimeTaken();
                                }


                            }

                        });
                       
                       
                };
                w.onerror = function() {
                    console.log('There is an error with your worker!');
                    $scope.$digest();
                }

            }
        
    }
    
    // $scope.startTime = function () {
    //     console.log("F-startTime");
    //     if (clockinterval) {
    //         $interval.cancel(clockinterval);
    //     }

    //     var timer = parseInt($("#slider").slider("value"));
    //     if (timer != infiniteTime) {
    //         clockinterval = $interval(function () {
    //             // console.log('dd');
    //             timer = timer - 1;
    //             $("#slider").slider("value", timer);

    //             if (timer <= 0) {
    //                 $interval.cancel(clockinterval);
    //                 $("#slider").slider("value", defaultTime);

    //                 $scope.playPauseBtn = false;
    //                 //$scope.isPlay = false;
    //                 if ($scope.plyType == 'question' && $scope.plyQuesType !='info') {
    //                     // console.log('show grade and cancel btn')
    //                     $scope.isDisGradeDiv = true;
    //                     $scope.plyBtnDiv = false;
    //                 }

    //             }
    //         }, 1000);
    //     }
    // }



    $scope.showDiv = "";
    $scope.loadQuestion = false;
    $scope.getTemplate = function () {
        var question = $scope.loadQuestion;
        // $('#instPreviewDiv ').hide();
        // // $('#quesPreview ').show();
        // console.log('dddd');
        
        if (question) {
            //.html?v="+verTemplate
            if (question.type == 'mcq') {
                return "author_public/quesTypeTemplates/mcq.html?v="+verTemplate
            } else if (question.type == 'fillIn') {
                return "author_public/quesTypeTemplates/fillIn.html?v="+verTemplate
            } else if (question.type == 'arrange') {
                return "author_public/quesTypeTemplates/arrange.html?v="+verTemplate
            } else if (question.type == 'info') {
                return "author_public/quesTypeTemplates/info.html?v="+verTemplate
            } else if (question.type == 'sub') {
                return "author_public/quesTypeTemplates/subjective.html?v="+verTemplate
            }

        }
    }

    $scope.getSection = function (secIndex) {
        return $scope.examMetaData.sections[secIndex];
    }

    $scope.setActiveQuestion = function (secIndex, quesNum) {
        $scope.examData.forEach((s, si) => {
            s.value.livedata.forEach((q, qi) => {
                $("#ques-" + si + qi).removeClass('activeQuesBtn');
                $("#ques-" + si + qi).removeClass('btn-fill');
                //angular.element( document.querySelector("#ques-"+si+qi )).removeClass('activeQuesBtn');;
            })
        });
        $("#ques-" + secIndex + quesNum).addClass('activeQuesBtn');
        $("#ques-" + secIndex + quesNum).addClass('btn-fill');

        $scope.activeSecTab = secIndex;
    }

    let verTemplate = Math.random();
    $scope.showQuesSample = function (secIndex, quesNum) {
        //$("#quesLoader").show();
        verTemplate = Math.random();
        $scope.setActiveQuestion(secIndex, quesNum);
        $scope.quesNum = quesNum;
        $scope.secIndex = secIndex;
        $scope.loadQuestion = $scope.examData[secIndex].value.livedata[quesNum];
        $scope.sectionNum = secIndex + 1;
        $scope.quesIdPre = $scope.loadQuestion.ref;
        $scope.qtype = $scope.loadQuestion.type;
        $scope.gradingMatrix = $scope.examMetaData.sections[secIndex].gradingMatrix;
        $scope.statsHelpAllowed = $scope.examMetaData.sections[secIndex].helpAllowed;
        $scope.fillInPartialGrading = false;
        if('partialGrading' in $scope.examMetaData.sections[secIndex]){
            $scope.fillInPartialGrading = $scope.examMetaData.sections[secIndex].partialGrading;
        }
        $scope.numFillIns = 0;
        $scope.showDiv = "question";
        
    }

    $scope.showSecInst = function (sectionId) {
        
        $scope.sectionNum = sectionId + 1;
        $scope.loadInst = $scope.examMetaData.sections[sectionId];
        $scope.showDiv = "secInst";
        $scope.loadOtherMedia(); 
    }

    $scope.showQuizInst = function (quizId) {
        $scope.loadQuizInst = $scope.examMetaData.quizInst;
        $scope.showDiv = "quizInst";
        $scope.loadOtherMedia();
    }

    $scope.$on('$includeContentLoaded', function(event, target){
        $scope.loadOtherMedia(); 
    });

    $scope.loadOtherMedia = function(){
        $timeout(function () { $scope.getYtVideo(); }, 1000);
        $timeout(function () { $scope.getPlotChart(); }, 1000);
        $timeout(function () { $scope.getPdfDoc(); }, 1000);

        if($scope.showDiv == "question" && $scope.qtype=="fillIn"){
            $timeout(function () { 
                let eleInps = document.getElementById('divFillInBlank');
                if(eleInps){
                    let fillInputs = eleInps.getElementsByTagName('input');
                    if(fillInputs){
                        $scope.numFillIns = fillInputs.length;
                    }
                    
                }
            }, 1000);
        }
        

        $timeout(() => {
            if ($('.flipbtn').length > 0) {
                $('.flipper').removeClass('active');
                $(".flipbtn").unbind().click(function () {
                    $(this).parents(".flipper").toggleClass("active");
                });
                document.getElementById('flipElement').style.visibility = 'visible';
            }
            
        }, 1000);

        //$timeout(function(){ $(".mathGif").hide(); },2500)
        
    }


    // to load youtube videos and plot chart in instructions
    $scope.getYtVideo = function () {
        $(".loadVideo").each(function (index) {
            let dataUrl = $(this).attr("data-url");
            let datasrc = $(this).attr("data-vsource");
            let chartCaption = $(this).attr("data-caption");
            let obj = $(this);
            //Add caption and class
            obj.addClass("embed-responsive embed-responsive-16by9");
            obj.append("<p class='media-caption'>" + chartCaption + "</p>");

            if (dataUrl) {

                // data url exists
                $http.get($scope.ytvideo_url + "/" + dataUrl).then(function (response) {
                    let url;
                    if (datasrc == 'youtube') {
                        url = "https://www.youtube.com/embed/" + response.data.ytvid + "?autoplay=0&rel=0&iv_load_policy=3&showinfo=1&modestbranding=1";
                    }
                    let temp = `<iframe src='${url}'  width=\"100%\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\"> </iframe>`;
                    obj.html(temp);
                });
            } else {
                let dataid = $(this).attr("data-vid");
                let url;
                if (datasrc == 'youtube') {
                    url = "https://www.youtube.com/embed/" + dataid + "?autoplay=0&rel=0&iv_load_policy=3&showinfo=1&modestbranding=1";
                }
                let temp = `<iframe src='${url}'  width=\"100%\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\"> </iframe>`;
                obj.html(temp);
            }

        });
    }

    //Get Plotchart data
    $scope.getPlotChart = function () {
        $(".loadPlot").each(function (index) {
            let plotData, plotLayout;
            let chartUrl = $(this).attr("data-url");
            let chartCaption = $(this).attr("data-caption");
            let obj = $(this);
            let divId = obj.attr("id");
            // obj.addClass("embed-responsive embed-responsive-4by3");
            //plotIframeLink
            //alert($scope.plotIframeLink + chartUrl);

            let htmltpm = `
            <div class=''>
             <div class='embed-responsive embed-responsive-4by3'>
                <iframe src="${$scope.plotIframeLink + chartUrl}"></iframe></div>
             </div>
             <p class='media-caption'>${chartCaption}</p>
            </div>
            `;;
            obj.html(htmltpm);
        });
    }

    //////load pdf doc ///////
    $scope.getPdfDoc = function(){
        $(".loadPDF").each(function (index) {
            let dataUrl = $(this).attr("data-url");
            let chartCaption = $(this).attr("data-caption");
            let obj = $(this);
            //Add caption and class
            obj.addClass("embed-responsive embed-responsive-16by9");
            obj.append("<p class='media-caption'>" + chartCaption + "</p>");
            if (dataUrl) {
                let url = $scope.pdfDocUrl+'/'+dataUrl;
                let temp = `<iframe src='${url}'  width=\"100%\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\"> </iframe>`;
                obj.html(temp);
            } 

        });
    }



    // finalize quiz
    $scope.scoreReview = "allowed,deadline";
    $scope.openFinalizeModal = function () {

        if ($scope.liveQuiz.playedQuest !== undefined && $scope.liveQuiz.playedQuest.length > 0) {
            if ($scope.quizStatus == 'ON') {
                swal({
                    type: 'warning',
                    text: "Please stop the quiz",
                    buttonsStyling: false,
                    confirmButtonClass: "btn btn-warning btn-fill"
                });
                return;
            }
            $scope.dropUnused = false;
            $("#finalizeMdl").modal();
        } else {

            swal({
                title: "Not finalize",
                type: 'warning',
                text: "You did not play any question",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-warning btn-fill"
            });
        }
    }

    $scope.finalizeQuiz = function () {
        $("#finalizeMdl").modal("hide");
        swal({
            title: 'Are you sure?',
            text: "Once the quiz is finalized you will not be able to make it live.",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            buttonsStyling: false
        }).then(function () {
            let scoreReview = $scope.scoreReview.split(',');
            let data = {
                quizid: $scope.quizId,
                review: scoreReview[0],
                score: scoreReview[1],
                dropUnused : $scope.dropUnused
            }

            console.log(data);
            $('.ld').show();
            $('.wrapper').addClass('ld-over-full-inverse running');
            let finalData = JSON.stringify(data);
            $("#finalizeData").val(finalData);
            $("#frmFinalize").submit();

        }, function () {
            // console.log("cancel");
        });

    }


    /**** Youtube *****/
    $scope.showVideo = false;
    $scope.showChatbox = false;

    $scope.openYoutubeSetting = function(){
      $scope.inpYtId = $scope.liveQuiz.ytId;
      if($scope.inpYtId.trim()!=''){
          document.getElementById('ytdIframPreview').src = `https://www.youtube.com/embed/${$scope.inpYtId}`;
      }
      $scope.isSaveYt = false;
      $("#youtubeMdl").modal();
    }

    
    $scope.saveYoutubeSetting = function(){
        let ytId = $scope.inpYtId.trim();
        if(ytId == ''){
            swal({
                text: "Please enter youtube id",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-danger btn-fill"
            });
            return;
        }
        let data = {
            ytId: ytId,
            quizId: $scope.quizId
        } 
        $scope.isSaveYt = true;
        $http.post("/author_liveQuizSaveYoutubeId", data).then(function (callback) {
            console.log(callback);
            let data = callback.data;
            if (data.status) {
                $scope.liveQuiz.ytId = ytId;
            }

            $scope.showVideo = false;
            $scope.showChatbox = false;
            $("#chatboxBtn").hide();
            
            if(newChatWindow){
                newChatWindow.close();
                newChatWindow = null;
            }

            $("#youtubeMdl").modal("hide");
            $.notify({
                message: data.msg
            }, {
                type: data.type,
                delay: 1000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });

            $scope.showChatbox = false;
            $scope.showVideo = false;

            if($scope.quizStatus == 'ON'){
                $scope.toggleVideoChatboxNew();
            }

        }, function (error) {
            $.notify({
                message: "Something went wrong. Please try after sometime !!"
            }, {
                type: 'danger',
                delay: 1000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });
        });
       
    }


    $scope.toggleVideoChatboxNew = function(vc = '') {
        if($scope.liveQuiz.ytId.trim() !==""){
            if(vc == "chat"){
                $scope.showChatbox = !$scope.showChatbox;
            }
            
            if(vc == "video"){
                $scope.showVideo = !$scope.showVideo;
            }

            console.log(`videobox - ${$scope.showVideo}`);
            console.log(`chatbox- ${$scope.showChatbox}`);


            let data = {
                video : $scope.showVideo,
                chat  : $scope.showChatbox,
                youtubeId : $scope.liveQuiz.ytId,
                quizId: $scope.quizId
            }

            socket.emit('ath_lqToggleVideoChat', data, function (res) {
                if (!res) {
                    alert('Something went wrong');
                    console.log(res);
                }else{
                    if($scope.showChatbox){
                        $("#chatboxBtn").show();
                    }else{
                        $("#chatboxBtn").hide();
                    }
                }
                $scope.$digest();
            });

          
        }else{
            $scope.openYoutubeSetting();
        }
        
    }

    $scope.$watch('inpYtId', function(newValue, oldValue) {
       if(newValue !== oldValue){
           document.getElementById('ytdIframPreview').src = `https://www.youtube.com/embed/${newValue}`;
           console.log("change");
       }
    });
   
 
    $scope.chatPopup = function(){
        let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=300,height=400,left=60,top=300`;
        let cUrl = `https://www.youtube.com/live_chat?v=${$scope.liveQuiz.ytId}&embed_domain=${$scope.authorUrl}`;

        newChatWindow=window.open(cUrl,'livechatboxwind',params);
        if (window.focus) {newChatWindow.focus()}

        // //check browser is chrome
        // let isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
        // if(isChrome){
        //     newChatWindow=window.open(cUrl,'livechatboxwind',params);
        //     if (window.focus) {newChatWindow.focus()}
        // }else{
        //     newChatWindow = window.open("", "livechatboxwind", params);
        //     newChatWindow.document.body.innerHTML = `<p style='display:flex;align-items: center;justify-content: center;font-size:20px;font-weight:bold;'>This feature works best in chrome browser.</p>`;
        // }
        return false;
    }

    /******End of Youtube****/

    /*****WhiteBoard*****/
    $scope.showWhiteBoard = false;
    $scope.toggleWhiteBoard = function(){
        $scope.showWhiteBoard = !$scope.showWhiteBoard;

        let data = {
            isShow:$scope.showWhiteBoard,
            quizId: $scope.quizId
        }

        socket.emit('ath_lqToggleWhiteBoard', data, function (res) {
            if (!res) {
                alert('Something went wrong');
                console.log(res);
            }else{
                if(!$scope.showWhiteBoard){
                    if(newChatWindow){
                        newChatWindow.close();
                        newChatWindow = null;
                    }
                }
            }
            $scope.$digest();
        });
        
    }

    $scope.whitboardPopup = function(){

        if(!$scope.showWhiteBoard){
            swal({
                type: 'warning',
                text: "Please enable whiteboard option first",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-warning btn-fill"
            });
            return;
        }

       
        $("#wbQuizId").val($scope.quizId);
        $("#wbFrm").unbind().submit(function(){
            
            var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
            var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
            width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
            var left = ((width / 2) - (600 / 2)) + dualScreenLeft;
            var top = ((height / 2) - (300 / 2)) + dualScreenTop;

            newChatWindow = window.open('', 'formpopup', 'scrollbars=yes, width=600, height=300, top=' + top + ', left=' + left);
            this.target = 'formpopup';			
            // var timer = setInterval(function() {
            //     if(reviewWindow.closed) {
            //         clearInterval(timer);
            //     }
            // }, 1000);
                
        });
        $("#wbFrm").submit();
        
    }

    /******End of WhiteBoard****/

    $scope.copyToClipBoard = function(){
       let value =  $scope.lqWbSenderUrl+$scope.quizId+"/"+$scope.wbToken;
       var $temp = $("<input>");
       $("body").append($temp);
       $temp.val(value).select();
       document.execCommand("copy");
       $temp.remove();

       $.notify({
        icon: "ti-info",
        message: "Whiteboard link copy to clipboard"
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

    //socket
    socket.on('ath_lqStudentList', function (data) {
        console.log("ath_lqStudentList");
        console.log(JSON.stringify(data,null,2));

        $scope.$apply(function () {

            $scope.allStds = $scope.allStds.map(x => {
                let stdIndex = data.students.findIndex(std => std.studentId == x.user);
                if (stdIndex > -1) {
                    //x.online = true;
                    x.online = 1;
                } else {
                    //x.online = false;
                    x.online = 0;
                }

                if (data.answers.hasOwnProperty(x.user)) {
                    if ($scope.plyQuesId == data.answers[x.user].ref && data.answers[x.user].lock) {
                        x.hasAns = true;
                        x.timeTaken = data.answers[x.user].timeTaken;
                    } else {
                        x.hasAns = false;
                    }
                } else {
                    x.hasAns = false;
                }
                return x;

            });

            //console.log(JSON.stringify($scope.allStds, null, 2));

        })
    })

    socket.on('ath_lqNewLogin', function (res) {
        connStatus = 'authFailed';
        socket.disconnect();
        //location.reload();
        window.location.replace("/author_dashboard");
    })

    socket.on('lq_startTimer', function () {
        console.log('start timer');
        $scope.$apply(function () {
            $scope.startTime();
            $scope.isPlay = true;
            //////////////////

            if ($scope.plyType != "question") {
                return;
            }

            var data = {
                secIndex: $scope.plySecNum-1,
                section: $scope.plySecNum,
                questIndex: $scope.plyQuesNum,
                quesId: $scope.plyQuesId,
                quizId: $scope.quizId,
                qtype: $scope.plyQuesType
            }

            console.log(data);
            $http.post("/author_liveQuizPlayedItem", data).then(function (callback) {
                if (callback.data.status) {

                    if (!$scope.liveQuiz.hasOwnProperty('playedQuest')) {
                        $scope.liveQuiz['playedQuest'] = [];
                    }
                    $scope.liveQuiz.playedQuest.push(callback.data.insertData);
                }


            }, function (error) {
                console.log(error);
            });


            ///////////////////
        })
    });

    socket.on('lq_updateTime', function (data) {
        $scope.$apply(function () {
            console.log("S-lq_updateTime");
            $scope.startTime();
        })
    });

    socket.on('lq_showAns', (data) => {
        // console.log(data);
    });

    socket.on('lq_showAnsStats', (data) => {
        console.log(data);
    });

    $scope.disconnectQuiz = function(){
        $scope.quizStatus = 'OFF';
        $scope.playPauseBtn = false;
        $scope.isDisGradeDiv = false;
        $scope.isQuesComplete  = false;
        $scope.isSubDiv = false;
        $scope.cancelTimerData();

        $scope.plyBtnDiv = true;
        // youtube chatbox
        $scope.showVideo = false;
        $scope.showChatbox = false;
        $("#chatboxBtn").hide();
        if(newChatWindow){
            newChatWindow.close();
            newChatWindow = null;
        }
        //end of youtube chatbox
        
        $scope.showWhiteBoard = false;
        if(newwbBoardWindow){
            newwbBoardWindow.close();
            newwbBoardWindow = null;
        }
        $scope.isStopQuiz = false;
        $scope.isStartQuiz = true;
        $scope.resetData();
    }

    socket.on('disconnect', function () {
        $scope.$apply(function () {
            console.log("disconnect");
            if(connStatus !="authFailed"){
                $scope.disconnectQuiz();
                if(connStatus == 'disconnect'){
                    $.notify({
                        icon: "ti-info",
                        message: "You are diconnected with live quiz.You will be reconnect automatically or you can reload the page. Please check your internet connection."
                    },{
                        type: "warning",
                        timer: 5000,
                        delay: 700,
                        placement: {
                            from: 'top',
                            align: 'center'
                        }
                    });
                    connStatus = 'connect';
                }

            }
        })
    })


    socket.on('connect_timeout', (timeout) => {
        console.log("connect_timeout");
        //alert(timeout);
    });

    
    socket.on('connect_error', function (err) {
        $scope.$apply(function () {
            console.log('connect_error');
            console.log(err);

        });
        //alert('Unable to connect to the live quiz.Please check your Internet connection or refresh this page !!');
        //location.reload();
        //window.location.replace("/author_dashboard");
    });

    socket.on('connect',function(){
        //console.log("Connect successfully");
        $scope.$apply(function(){
           if(connStatus == 'connect'){
            $.notify({
                icon: "ti-info",
                message: "Now you are connect with live quiz. Click go live button to restart your quiz."
            },{
                type: "success",
                timer: 4000,
                delay: 700,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });

           }
            $scope.isStartQuiz = false;
            connStatus = 'disconnect';
            $scope.checkInternetConnection();
        });
    });


    var internetCheck = null;
    $scope.checkInternetConnection = function(){
        if(internetCheck){
            clearInterval(internetCheck);
            internetCheck = null;
        }
        if(
            navigator.userAgent.indexOf("Chrome") != -1 || 
            navigator.userAgent.indexOf("Firefox") != -1 || 
            navigator.userAgent.indexOf("Safari") != -1){            
                internetCheck = setInterval(function(){
                    //console.log("check internet");
                    if(!navigator.onLine){
                        $scope.disconnectQuiz();
                        $scope.$digest();
                        $.notify({
                            icon: "ti-info",
                            message: "Check your Internet connection.You are disconnected with live quiz."
                        },{
                            type: "danger",
                            timer: 5000,
                            placement: {
                                from: 'top',
                                align: 'center'
                            }
                        });
            
                        clearInterval(internetCheck);
                        setTimeout(()=>{
                            location.reload();
                        },7000)
                        
                        connStatus = 'disconnect';
                    }
            },2000);
        }
    }

    $scope.checkInternetConnection();

   

});

// if(navigator.userAgent.indexOf("Chrome") != -1 || navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Safari") != -1){            
//     var internetCheck = setInterval(function(){
//         if(!navigator.onLine){
//             alert("Internet Disconnected");   
//             clearInterval(internetCheck);
//             window.location.replace("/author_dashboard");            
//         }
//     },1000);
// }

//load on image error
function onImgError(ele) {
    ele.setAttribute('src', 'author_public/images/defaultuser.png');
}








