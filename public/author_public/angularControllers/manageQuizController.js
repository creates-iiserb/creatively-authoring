var app=angular.module('manageQuizApp', ['ui.bootstrap','ui.utils','ngCookies','angularUtils.directives.dirPagination','ngAnimate']);

app.controller('manageQuizController',function($scope,$http,$timeout,$cookies,$interval){

	$('.ld').show();
	$('.wrapper').addClass('ld-over-full-inverse running');
	var data = document.getElementById('initData');
	dataHtml = data.innerHTML.trim();
	var allData = JSON.parse(dataHtml);
	console.log(JSON.stringify(allData,null,2));
	$scope.userData =  allData.userData;
	$scope.quizData = allData.quizData;
	$scope.secWiseWht = allData.secWiseWht;
	

	$scope.socketUrl = allData.socketUrl;	
	$scope.isUpdate=true;
	$scope.isSendMail = true;
	$scope.sectnData = allData.quizData.sections;
	$scope.examUsers = $scope.quizData.users.userData;
	$scope.colName = $scope.quizData.users.userCol;
	$scope.userIds = Object.keys($scope.examUsers);
	$scope.security_level = $scope.quizData.security;
	$scope.score = $scope.quizData.score;
	$scope.review = $scope.quizData.review;
	$scope.score_review = $scope.quizData.score+','+$scope.quizData.review;
	$scope.allowFocus = !$scope.quizData.allowFC;
	$scope.allowStats = $scope.quizData.allowStats;

	$scope.allowSendMail = $scope.quizData.users.sendEmail;
	$scope.notEmailUser = ['sample1','sample2','sample3'];
	$scope.progressType = 'content' //content | weightage
	//Check Stats Duration(to check quiz is submitted | login status)
	let stDuration = 1.5; //minute for sectioned
	if('quizType' in $scope.quizData){
		if($scope.quizData.quizType == 'live'){
			stDuration = 30 //minute for live Quiz
			let endTime = new Date($scope.quizData.endTime).getTime();
			let currTime = new Date().getTime();
			//if quiz is over then status with 1.5 minutes
			if(currTime>endTime){
				stDuration = 1.5;
			}
		}
	}

	console.log($scope.userData);
	//if column name A,B or C exist then show with A,B,C else Takers
	$scope.usernameTH = (($scope.examUsers[$scope.userIds[0]]['A'] || $scope.examUsers[$scope.userIds[0]]['B'] || $scope.examUsers[$scope.userIds[0]]['C'])?true:false);


	var socket = io.connect($scope.socketUrl);
	//var socket = io.connect('http://172.28.73.115:3060');

	function utcToLocal(input){		
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

	//0 = not login, 1 = login, 2 == block
	$scope.sendMailOption = false;
	$scope.colAExit = false;
	$scope.colBExit = false;
	$scope.colCExit = false;
    $scope.userData.map(user=>{
		// convert html entities to actual one
		var entities = [
			['amp', '&'],
			['apos', '\''],
			['#x27', '\''],
			['#x2F', '/'],
			['#39', '\''],
			['#47', '/'],
			['lt', '<'],
			['gt', '>'],
			['nbsp', ' '],
			['quot', '"']
		];

		var pass = user.password;
		for (var i = 0, max = entities.length; i < max; ++i) 
		 pass = pass.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
				
		user.password = pass;
		user.passwordOld = pass;
        // enable  send mail option
		
		// var userIndex = ["sample1","sample2","sample3"].indexOf(user.userid);

		// if(userIndex<0)
		// {
		// 	var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		// 	$scope.sendMailOption  = regex.test(String(user.userid).toLowerCase());
		// }

		if(user.hasOwnProperty('userInfo')){
			if(user.userInfo.hasOwnProperty('A'))
				$scope.colAExit = true;
			if(user.userInfo.hasOwnProperty('B'))
			   $scope.colBExit = true;
			if(user.userInfo.hasOwnProperty('C'))
			   $scope.colCExit = true;			
		}

		

	});

	$scope.allLogs = [];
	let submitInterval = null;
	$scope.passworTemplate = "changePasswordTemplate";
	
	$http.post('/author_allQuizLogs',{ quizId: $scope.quizData.quizid }).then(function(res){
	  var data = res.data;
	  if(data.status){
        data.logs.forEach((logdata)=>{
		    try{
				var index = $scope.userData.findIndex(x => x.userid ===logdata.user);
				$scope.userData[index].logStatus = 0;
				$scope.userData[index].lastLog = 0;
				$scope.userData[index].logs = [];

				//convert to number for proper sorting
				if($scope.userData[index].hasOwnProperty('stdScore')){
					$scope.userData[index].stdScore = parseFloat($scope.userData[index].stdScore);
				}
				
				if(logdata.log.length>0){
					//////////// last log data //////
					let lastindex = -1;  
					let logLength = logdata.log.length;
					for(lastindex=logLength-1;lastindex>=0;lastindex--){
						let reqByAuthor = 
								(logdata.log[lastindex].hasOwnProperty('authorLogin') &&
								logdata.log[lastindex].authorLogin)?true:false;
						if(!reqByAuthor)
							break;
					}

					//////////////// last logs////////////
					//let lastindex = logdata.log.length-1;
					let action = logdata.log[lastindex].action;
					if(
						action != "logged_out" &&
						action!="logged_in_blocked1" &&
						action!="logged_in_blocked2" &&
						action!="logged_in_blocked3" &&
						action!="logged_in_failure"){
						$scope.userData[index].logStatus = 1;
					}
					//logout user status whoes last log is greater than ${stDuration} min--  
					
					let logD1 = new Date(logdata.log[lastindex].timeStamp);
					if($scope.userData[index].status !== 'submitted'){
						if('lastSaveAt' in  $scope.userData[index]){
							logD1 = new Date($scope.userData[index].lastSaveAt);
						}
					}
                    
					
					let currD2 = new Date();
					$scope.userData[index].lastLog = logD1.getTime(); //last log timeStamp to sort data
					var diff =(currD2.getTime() - logD1.getTime()) / 1000;
					diff /= 60;
					let minDiff =  +Math.abs(Math.round(diff));
					if(minDiff>stDuration){
						if($scope.userData[index].logStatus==1){
							$scope.userData[index].logStatus = 0;
						}
					}
					//////////////////////////////////////////

					if(logdata.failedLogin>=10){
						$scope.userData[index].logStatus = 2;
					}

					//////////////////////////
					logdata.log.map((x)=>{
						x.utcTime = x.timeStamp;
						x.timeStamp = utcToLocal(x.timeStamp);
						if(x.useragent){				
							if(x.useragent.hasOwnProperty('examApp')){
								x.useragent.isExamApp = true;
							}else{
								x.useragent.isExamApp = false;
							}
						}
						x.student = $scope.userData[index].userid;
					});

					$scope.userData[index].logs = logdata.log;
					$scope.allLogs.push(logdata.log);
				}
		   } catch (error) {
			   
		   }
		});

		$scope.allLogs = $scope.allLogs.flat();
		$scope.fetchSubmittedData();
		$timeout(()=>{
			$('.ld').hide();
			$('.wrapper').removeClass('ld-over-full-inverse running');
			$("#mainPanelDiv").show();
		},1000)
		
	  }else{
		$scope.fetchSubmittedData();
		$timeout(()=>{
			$('.ld').hide();
			$('.wrapper').removeClass('ld-over-full-inverse running');
			$("#mainPanelDiv").show();
		},1000)
	  }
	},function(err){
	  console.log(err);
	    $('.ld').hide();
		$('.wrapper').removeClass('ld-over-full-inverse running');
		swal({
			title: 'Something went wrong !!',
			type: 'error',
			confirmButtonClass: 'btn btn-danger btn-fill',
			confirmButtonText: 'Ok',
			buttonsStyling: false,
			allowOutsideClick: false
		}).then(function() {
			location.reload();
		});

	});


	// $scope.updateLogStatus = function(logs,index){
	// 	if(logs.length>0){
	// 	  console.log(logs);
	// 	}
	// }

	let sc = 0;
	$scope.totalGDQsts = 100;
	$scope.progressColors = [
		'#7AC29A', //success
		'#F3BB45', //warning
		'#8d8a85', //default
		'#68B3C8', //info
		'#7A9E9F', //primary
	];

	$scope.fetchSubmittedData = function(){
		submitInterval = $interval(function(){
		   sc++;
		   if(sc%60 ==0){
				$http.post('/author_quizStdSubmitData',{ quizId: $scope.quizData.quizid }).then(function(res){
				  let data = res.data;
				  
				  if(data.status){
					
					$scope.userData.forEach((x,index)=>{

						//grading checker
                        let summ = data.summData.filter(y=>{
						    if(y.taker == x.userid){
							   return y;
						    }
						});
						let startedOn = [];
						let startedOnUtc = [];
						let quizSubmittedOn = null;
						let totalScore = 0;                                
						let totalMaxScore = 0;
						let allSec = 0;
						let date =  new Date(1970,0,1);
						let status = 'Not started';
						let isSummaryGenerate = false;
						summ.forEach(z=>{
							//started on
							 if('startedOn' in z){
								status = 'not submitted';
								startedOn.push(new Date(z.startedOn));
								startedOnUtc.push(z.startedOn);
							 }
							//submitted on
							if('submittedOn' in z){
								status = 'submitted';
								quizSubmittedOn = z.submittedOn;
							}

							//summary generated 
							if(z.hasOwnProperty('summary')){
								isSummaryGenerate = true;
								status = 'submitted';
								let section = $scope.sectnData[z.section-1];
								let secSumm = z.summary;
								let score = isNaN(secSumm.score)?0:secSumm.score;
								let max = isNaN(secSumm.max)?0:secSumm.max;
								let partialGrading = false;
								if('partialGrading' in section){
									partialGrading = section.partialGrading;
								}
								if(partialGrading){
									if('partialScores' in secSumm){
										totalScore = totalScore+ (+score) + secSumm.partialScores;
									}else{
										totalScore = totalScore+ (+score);  
									}
								}else{
									totalScore = totalScore+ (+score);  
								}                             
								totalMaxScore =totalMaxScore+  (+max);
								let dArr = secSumm.time.split(":");
								allSec = allSec+  (+dArr[0]) * 60 * 60 + (+dArr[1]) * 60 + (+dArr[2]);
							}
						});

						
						$scope.userData[index].status = status;
						//set startedon date
						if(startedOn.length>0){
							let minDate=new Date(Math.min.apply(null,startedOn));
							let idx = startedOn.map(Number).indexOf(+minDate);
							let quizStartedOn = startedOnUtc[idx];
							$scope.userData[index].startedOn =  quizStartedOn;
							$scope.userData[index].startedOnTS = new Date(quizStartedOn).getTime();
						}

						if(status == 'submitted'){
							$scope.userData[index].submittedOn =  quizSubmittedOn;
							$scope.userData[index].submittedOnTS = new Date(quizSubmittedOn).getTime();
						}

						if(isSummaryGenerate){
							date.setSeconds(allSec);
							$scope.userData[index].timeTakenTS = date.getTime();
							$scope.userData[index].timeTaken = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
							$scope.userData[index].score =  totalScore +' out of '+totalMaxScore;
							$scope.userData[index].stdScore = totalScore;
						}
						//end of grading checker
						

						//////log and progress status////////
						if($scope.userData[index].logs.length>0){
							let lastindex = -1;
							let logLength = $scope.userData[index].logs.length;
							let logs = $scope.userData[index].logs;
							for(lastindex=logLength-1;lastindex>=0;lastindex--){
								let reqByAuthor = 
										(logs[lastindex].hasOwnProperty('authorLogin') &&
										logs[lastindex].authorLogin)?true:false;
								if(!reqByAuthor)
									break;
							}

							let action = logs[lastindex].action;
							if(
								action != "logged_out" &&
								action!="logged_in_blocked1" &&
								action!="logged_in_blocked2" &&
								action!="logged_in_blocked3" &&
								action!="logged_in_failure"){
								$scope.userData[index].logStatus = 1;
							}

							
							let logD1 = new Date(logs[lastindex].utcTime);

							//last save at checker
							if($scope.userData[index].status !== 'submitted'){
								let stdLastSaveIndex = data.lastSave.findIndex(lsStd =>lsStd.userId == x.userid);
								let date1 = new Date(1970, 0, 1);
								if(stdLastSaveIndex !== -1){
									if('lastSaveAt' in data.lastSave[stdLastSaveIndex]){
										logD1 = new Date(data.lastSave[stdLastSaveIndex].lastSaveAt);
									}

									//progress checker
									if('secProgress' in data.lastSave[stdLastSaveIndex]){
										// let progress = data.lastSave[stdLastSaveIndex].progress;
										// let percent =  Math.ceil((progress.locked/progress.gradable)*100);
										// if(!isNaN(percent)){
										// 	$scope.userData[index].progress = percent;
										// }

										let stdSecSummary = [];
										let percent = 0;
										let weightage = 0;
										let wi =0;
										let secProgress = data.lastSave[stdLastSaveIndex].secProgress;
										$scope.userData[index]['totalWt'] = 0;
										for(const section in secProgress){
											stdSecSummary.push(secProgress[section]);
											percent += (secProgress[section].locked/secProgress[section].gradable);
											$scope.userData[index]['totalWt'] += secProgress[section].gradable*$scope.secWiseWht[wi];
											weightage += (secProgress[section].locked*$scope.secWiseWht[wi]);
											wi++;
										}
										$scope.userData[index]['stdSecSummary'] = stdSecSummary;
										$scope.userData[index]['totalGQuest'] = data.lastSave[stdLastSaveIndex].totalGQs;
										
										if(!isNaN(percent) && stdSecSummary.length>0){
											$scope.userData[index].progress = Math.round(percent*100/stdSecSummary.length);
											$scope.userData[index].weightage = Math.round(weightage*100/$scope.userData[index]['totalWt']);
										}

									}

									date1.setSeconds(data.lastSave[stdLastSaveIndex].timeTaken);
									$scope.userData[index].timeTakenTS = date1.getTime();
									$scope.userData[index].timeTaken = date1.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

								}
							}

							let currD2 = new Date();
							var diff =(currD2.getTime() - logD1.getTime()) / 1000;
							diff /= 60;
							let minDiff =  +Math.abs(Math.round(diff));
							//check last log is greater than ${stDuration} min than loggout the user
							if(minDiff>stDuration){
								if($scope.userData[index].logStatus==1 && $scope.userData[index].logStatus != 2){
									$scope.userData[index].logStatus = 0;
								}
							}
							
						}
						//////end log and progress status///////

						
					  
					});
					
				  }
				},function(error){
				  console.log(error);
				});
		   }
		   if(sc>=14400){ //stop after 4 hr
			 $interval.cancel(submitInterval);
			 sc =0;
		   }
		},1000);
	}

    $scope.toggleProgressType = function(type){
      $scope.progressType = type;
	}

	$scope.currPageData = 1;
	$scope.resetPage = function(){
		if($scope.currPageData>1){
			$scope.currPageData = 1;
		}
		
		if($scope.itemsPerPagesData < 10){
			$scope.showFilterStatus();
		}
		
	}


    $scope.onSearch = function(){
		$scope.resetPage();
	}

	$scope.filterKey = 'All'
	$scope.setFilter = function(){
		$scope.filterKey = $scope.selectType;
		$scope.resetPage();
	}

	$scope.sortByData = function(){
		$scope.resetPage();
		if($scope.sortBy == 'weightage' || $scope.sortBy == '-weightage' ){
			$scope.progressType = 'weightage'
		}else
		if($scope.sortBy == 'progress' || $scope.sortBy == '-progress' ){
			$scope.progressType = 'content'
		}
	}

	$scope.sortByArr = [
		{id:'userid',value:"Username [Asc]"},
		{id:'-userid',value:"Username [Desc]"},
		{id:'progress',value:"Content [Asc]"},
		{id:'-progress',value:"Content [Desc]"},
		{id:'weightage',value:"Weightage [Asc]"},
		{id:'-weightage',value:"Weightage [Desc]"},
		{id:'-lastLog',value:"Last Activity"},
		{id:'startedOnTS',value:"Started on"},
		// {id:'startedOnTS',value:"Started on"},
		{id:'submittedOnTS',value:"Submitted on"},
		// {id:'-submittedOnTS',value:"Submitted on Desc"},
		// {id:'+stdScore',value:"Score Asc"},
		{id:'-stdScore',value:"Score"},
		{id:'timeTakenTS',value:"Time Taken"}
		
	];
	$scope.sortBy = 'userid';

	$scope.customFilter = function(user){
		if($scope.filterKey == 'All'){
		  return true;
		}

		if($scope.filterKey == 'Not Login'){
          if(user.logStatus == 0){
			  return true;
		  } 
		}else 
		if($scope.filterKey == 'Logged In'){
			if(user.logStatus == 1){
				return true;
			} 
		}else 
		if($scope.filterKey == 'Blocked'){
			if(user.logStatus == 2){
				return true;
			} 
		}else 
		if($scope.filterKey == 'Submitted'){
			if(user.status == 'submitted'){
				return true;
			} 
		}else 
		if($scope.filterKey == 'Started'){
			if(user.status == 'not submitted'){
				return true;
			} 
		}else 
		if($scope.filterKey == 'Started+Submitted' ){
			if(user.status == 'not submitted' || user.status == 'submitted'){
				return true;
			} 
		}else 
		if($scope.filterKey == 'Not started'){
			if(user.status == 'Not started'){
				return true;
			} 
		}
		else {
		 return false; 
		}
	}


	$scope.changeSetting=false;
    $scope.$watch('security_level',
              function(newValue, oldValue) {
                 if(newValue!=oldValue){
					$scope.isUpdate = false;
					$scope.changeSetting=true;
				 }
	});
	
	$scope.$watch('score_review',
              function(newValue, oldValue) {
                 if(newValue!=oldValue){
					$scope.isUpdate = false;
					$scope.changeSetting=true;
				 }
	});
	
	$scope.$watch('allowFocus',
              function(newValue, oldValue) {
                 if(newValue!=oldValue){
					$scope.isUpdate = false;
					$scope.changeSetting=true;
				 }
	});

	$scope.$watch('allowStats',
              function(newValue, oldValue) {
                 if(newValue!=oldValue){
					$scope.isUpdate = false;
					$scope.changeSetting=true;
				 }
	});


	$scope.selectAll = function(){
		if($scope.chkAll){   
			// $scope.userData.map(obj=>{
			// 	obj.reset = true;				
			// });

			var chkboxes =  document.querySelectorAll(".chkbox_ids");
			for(var i =0 ; i<chkboxes.length;i++){
				var index = chkboxes[i].getAttribute('data-index');				
				$scope.userData[index].reset = true;				
			}
			

			$.notify({
			icon: "ti-info",
			message: "All Quiz mark for reset. \"Click Save/reset Quiz\" button to reset Quiz."
			},{
			type: 'info',
			timer: 4000,
			placement: {
			from: 'top',
			align: 'center'
			}
			});   
			
			$scope.isUpdate = false;
            $scope.isSendMail = false;
			
			

		}else{
			// $scope.userData.map(obj=>{
			//  obj.reset = false;			 
			// });


			var chkboxes =  document.querySelectorAll(".chkbox_ids");
			for(var i =0 ; i<chkboxes.length;i++)
			{   
				var index = chkboxes[i].getAttribute('data-index');				
				$scope.userData[index].reset = false;
				
			}
		}
	}


	$scope.showPass = function(ind,u){
		u.show = 1;
		//$("#password"+ind).attr('type','text');    
	}
	
	$scope.randomPass = function(ind,n){
	
		$('#errMess'+ind).hide();
		$('#succMess'+ind).hide();

		var text1 = "";
		var text2 = "";
		var text3 = "";
		var text4 = "";
		var length1 = 3;
		var length2 = 3;
		var length3 = 2;
		var length4 = 1;
		var possible1 = "ABCDEFGHJKLMNPQRSTUVWXYZ";
		var possible2 = "abcdefghijkmnpqrstuvwxyz";
		var possible3 = "23456789";
		var possible4 = "!@#$%&";
		for(var i = 0; i < length1; i++) {
		text1 += possible1.charAt(Math.floor(Math.random() * possible1.length));
		}
		for(var j = 0; j < length2; j++) {
		text2 += possible2.charAt(Math.floor(Math.random() * possible2.length));
		}
		for(var k = 0; k < length3; k++) {
		text3 += possible3.charAt(Math.floor(Math.random() * possible3.length));
		}
		for(var l = 0; l < length4; l++) {
		text4 += possible4.charAt(Math.floor(Math.random() * possible4.length));
		}
		var randompwd = "";
		var randomId = text1+text2+text3+text4;
		var shuffledWord = '';
		var charIndex = 0;
		word = randomId.split('');
		while (word.length > 0) {
		charIndex = word.length * Math.random() << 0;
		shuffledWord += word[charIndex];
		word.splice(charIndex, 1);
		}
		var finalstr = shuffledWord.substring(0, 3)+"-"+shuffledWord.substring(3, 6)+"-"+shuffledWord.substring(6, 9);
		n.password = finalstr;
		n.passChange = true;
  	    $scope.isUpdate = false;
	}
	
	$scope.enableUpdate = function(u){
			if(u.reset){				
				var user = u.userid;
					$.notify({
						icon: "ti-info",
						message: user+" mark for reset. \"Click Save/reset Quiz\" button to reset Quiz."
					},{
						type: "info",
						timer: 2000,
						placement: {
								from: 'top',
								align: 'center'
						}
					});
					$scope.isSendMail = false;
					$scope.isUpdate = false;
			}
	}
	  
	  
	
	$scope.passChange = function(ind,u){
		
		if(u.password.trim().length<6)
		{
		   $('#succMess'+ind).hide();		   	
           $('#errMess'+ind).show().addClass('passErr').text('minimum 6 chars required');  
		}else{
			$('#succMess'+ind).show().addClass('passOk').text('ok');
			$('#errMess'+ind).hide()
		}

		$scope.isUpdate = false;
		u.passChange = true;
	}

	$scope.getUserStatus = function(status){
		if(status=='all')
		return $scope.userData.length;
		else
		return $scope.userData.filter(obj=>obj.logStatus==status).length;
	}
	  
	  
	$scope.updateQuiz = function(){
		var userPassCheck = [];
		var resetids = [];
		var usrPassChanged = [];
		var res = ""; 
		$scope.userData.forEach(obj=>{
			 if(obj.password.trim().length<6 || obj.password.trim() ===""){
				userPassCheck.push(obj.userid);				
			 }
			 if(obj.reset){
				resetids.push(obj.userid);
			 }

            if(obj.passChange){        
				usrPassChanged.push(obj.passChange);
				pwd = obj.password;
				takr = ""+obj.userid+"";
				res += JSON.stringify(takr)+":"+JSON.stringify(pwd)+",";        
			 }  

		})

		
	  
		if(userPassCheck.length>0){
			$.notify({
				icon: "ti-warning",
				message: "Please enter minimum 6 characters password for [ "+userPassCheck+" ]"
			},{
				type: "warning",
				timer: 3000,
				placement: {
						from: 'top',
						align: 'center'
				}
			});
				return;
		}  

		
		var resetuser = '';
		var resetMsg = '.';
		if(resetids.length>5){
			resetuser = JSON.stringify(resetids.slice(0, 5)) + " and more";
			resetMsg = " and for "+resetuser+" ids quiz will be reset.";
		}else{
			if(resetids.length>0){
				resetuser = JSON.stringify(resetids);
				resetMsg = " and for "+resetuser+" ids quiz will be reset.";
			}
		}

		if($scope.changeSetting){
			resetMsg =  resetMsg+' Made changes in advance setting.';
		}
		

		swal({
			title: 'Are you sure?',
			text: "The password will changed for selected ids"+resetMsg,
			type: 'warning',
			showCancelButton: true,
			confirmButtonClass: 'btn btn-success btn-fill',
			cancelButtonClass: 'btn btn-danger btn-fill',
			confirmButtonText: 'Ok',
			buttonsStyling: false,
			allowOutsideClick: false
		}).then(function() {
			$('.ld').show();
			$('.wrapper').addClass('ld-over-full-inverse running');
			
		
			var takers_data = {};
			takers_data.quizid = $scope.quizData.quizid;
			takers_data.security = $scope.security_level;
			takers_data.allowFC = !$scope.allowFocus;
			takers_data.allowStats = $scope.allowStats;
			var score_review = $scope.score_review.split(',');
			takers_data.score = score_review[0];
			takers_data.review = score_review[1];
			takers_data.credentials = JSON.parse("{"+res.slice(0, -1)+"}");
			takers_data.reset = resetids;
			takers_data = JSON.stringify(takers_data);
			var author= document.getElementById('author').value;
			var type= document.getElementById('type').value;
			var quiz_id= document.getElementById('quiz_id').value;
			var log_Id= document.getElementById('log_Id').value;
			var log_Token= document.getElementById('log_Token').value;
			$http.post("/author_changePwdAndResetQuiz",
				{ 
					'author': author,
					'type': type,
					'takers_data': takers_data,						
					'quiz_id': quiz_id,
					'log_Id': log_Id,
					'log_Token': log_Token

				}).then(function (callback) {
				if (callback.data) {
					var returndata = callback.data;
					$('.ld').hide();
					$('.wrapper').removeClass('ld-over-full-inverse running');
					$('#bsModal3 .modal-body p').html(returndata);
					$('#bsModal3').modal({backdrop: "static"});



					$scope.userData.map(obj=>{
						if(obj.passChange){     
							obj.passwordOld = obj.password; 
							obj.passChange = false;  
						}
						if(obj.reset){
							obj.status = 'Not started';
							obj.reset = false;
							obj.logStatus = 0; //loggout users
                            obj.logs = []; 
							if(obj.hasOwnProperty('progress')===true){					
								 obj["progress"] = 0;								
							}
							if(obj.hasOwnProperty('timeTaken')){
								obj['timeTakenTS'] = 0;
								obj['timeTaken'] = '00:00:00';
							}
							if(obj.hasOwnProperty('stdScore')){
								obj['stdScore'] = 0;
							}
							if(obj.hasOwnProperty('weightage')){
								obj['weightage'] = 0;
								obj['totalWt'] = 0;
							}

							if(obj.hasOwnProperty('startedOn')===true){					
								delete obj["startedOn"];
								delete obj["startedOnTS"];								
							}

							if(obj.hasOwnProperty('submittedOn')===true){					
								delete obj["submittedOn"];	
								delete obj["submittedOnTS"];									
							}
							
							if(obj.hasOwnProperty('lastLog')){
								obj['lastLog'] = 0;
							}
							
						}
					});

					var allUpdateLog = []; 
					$scope.allLogs.forEach(obj=>{
						if(resetids.includes(obj.student)){
							return;
						}
						else{
							allUpdateLog.push(obj);
						}
					});
					$scope.allLogs = allUpdateLog;

				} else {
						$('.ld').hide();
						$('.wrapper').removeClass('ld-over-full-inverse running');
				}
			},function(err){
				$('.ld').hide();
				$('.wrapper').removeClass('ld-over-full-inverse running');
				console.error('Failed to process ajax !');
				$('#bsModal3 .modal-body p').html('<div class="error"><i class="fa fa-warning"></i> Server is not responding. Please try again after some time</div>');
				$('#bsModal3').modal({backdrop: "static"});

			});
		   },function(){

	    });

			
		
		
	}
		
	$scope.viewResponse = function(index){
		var frmid = "#frm"+index;
		var subid = "#sub"+index;		
		$(frmid).unbind().submit(function(){
			var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
			var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
			width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
			height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
			var left = ((width / 2) - (900 / 2)) + dualScreenLeft;
			var top = ((height / 2) - (900 / 2)) + dualScreenTop;

			let reviewWindow = window.open('', 'formpopup', 'scrollbars=yes, width=900, height=900, top=' + top + ', left=' + left);

			this.target = 'formpopup';			
			

			var timer = setInterval(function() {
				if(reviewWindow.closed) {
					clearInterval(timer);											
					//$scope.userData[index].logStatus = 0;
					$cookies.remove('reqByAuthor');
					$scope.$digest();
				}
			}, 1000);
				
		});

		$(frmid).submit();
	}

	$scope.openSendMail = function(){
		$scope.mails = [];
		$scope.userData.forEach(obj=>{
		var userIndex = ["sample1","sample2","sample3"].indexOf(obj.userid);
			if(obj.reset && userIndex<0)
			{  
				$scope.mails.push(obj.userid);
			}
			
		});

		if($scope.mails.length>0){
			$("#sendMailMdl").modal()
		}else{
			swal({
                title: "Info",
                text: "Please select users with valid email id",
                buttonsStyling: false,
				confirmButtonClass: "btn btn-warning btn-fill"
			});
		}
		
	}

	$scope.sendMail = function(){
		$('#sendMailMdl').modal('hide');
		// swal({
		// 	title: "Good job!",
		// 	text: "Mail Send Successfully",
		// 	buttonsStyling: false,
		// 	confirmButtonClass: "btn btn-success btn-fill",
		// 	type: "success"
		// });
	}


	$scope.viewLog = function(u){
	    $scope.viewLogId = u.userid;	
	    var data = {
		   userId:$scope.viewLogId,
		   quizId:$scope.quizData.quizid
	    }
   
       $http.post('/author_getUserLogs',data).then(function(res){
		var data = res.data;
		if(data.status=='ok'){
		  u.logs = data.logs.log;	
		  u.logs.map((x)=>{
			// we need to keep utc timestamp also to support multiple broswer
			x.utcTime = x.timeStamp;
			x.timeStamp = utcToLocal(x.timeStamp);
			if(x.useragent){				
				if(x.useragent.hasOwnProperty('examApp'))
					x.useragent.isExamApp = true;
				else
				   x.useragent.isExamApp = false;
			}
		  });
		  $scope.dataLogs = u.logs;
		  $("#viewLogMdl").modal();
		}else{
			$.notify({
				icon: "ti-info",
				message: "No logs have been generated yet"
				},{
				type: 'warning',
				timer: 1000,
				placement: {
				from: 'top',
				align: 'center'
				}
				});
		}
	   },function(err){

	   });
	   
	}

	$scope.expandSelected=function(x){
		x.expanded=true;
	}

    $scope.unlock = function(u){
		swal({
			html: "This will enable the student to login into the quiz.<br> <b>Quiz data will not be deleted</b>",
			type: 'warning',
			showCancelButton: true,
			confirmButtonClass: 'btn btn-success btn-fill',
			cancelButtonClass: 'btn btn-danger btn-fill',
			confirmButtonText: 'Ok',
			buttonsStyling: false,
			allowOutsideClick: false
		}).then(function() {
			$('.ld').show();
			$('.wrapper').addClass('ld-over-full-inverse running');
			
			var quizid = $scope.quizData.quizid;
			var userid = quizid+"-"+u.userid;
			var author= document.getElementById('author').value;
			$http.post("/author_resetLoginCounter",
			{ 		'author': author,										
					'quiz_id': quizid,
					'user_id': userid
			}).then(function (callback) {
				u.logStatus = 0;
				$('.ld').hide();
				$('.wrapper').removeClass('ld-over-full-inverse running');
				
			},function(err){
				$('.ld').hide();
				$('.wrapper').removeClass('ld-over-full-inverse running');
				console.log(err);
			});
		   },function(){

	    });

	}
	
	
    $scope.updateActiveView = function(index,log,user){
        if(log.useragent){				
			if(log.useragent.hasOwnProperty('examApp'))
			   log.useragent.isExamApp = true;
			else
			   log.useragent.isExamApp = false;
		}
		log.utcTime = log.timeStamp;
		log.timeStamp = utcToLocal(log.timeStamp);
		$scope.userData[index].logs.push(log);
		log.student = user;
		$scope.allLogs.push(log);
	}

	$scope.allStudentLog = function(){
		$("#quizAllLogMdl").modal();
	}

	/////////////////socekt handling///////////////

	socket.on('connect', () => {
		socket.emit('join', {quizid:$scope.quizData.quizid});
	});

	let socketError= false;
	function socketServerError(){
		if(!socketError){
			socketError = true;
			location.reload();
			// swal({
			// 	title: 'Connection to the server is lost.',
			// 	type: 'error',
			// 	confirmButtonClass: 'btn btn-danger btn-fill',
			// 	confirmButtonText: 'Ok',
			// 	buttonsStyling: false,
			// 	allowOutsideClick: false
			// }).then(function() {
			// 	location.reload();
			// });
		}
	}
	socket.on('error', (error) => {
		socketServerError();
	});

	socket.on('connect_error', (error) => {
		socketServerError();
	});
	
	
	socket.on('logged_in',function(data){
		$scope.$apply(function(){   		
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
					
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 1;
					let lastLog = new Date(res.log.timeStamp).getTime();
					$scope.userData[index].lastLog = lastLog;
				}
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});

	socket.on('logged_in_failure',function(data){
		$scope.$apply(function(){   			
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				let lastLog = new Date(res.log.timeStamp).getTime();
				$scope.userData[index].lastLog = lastLog;
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});


    //login after quiz deadline reached
	socket.on('logged_in_blocked3',function(data){
		$scope.$apply(function() 
		{   		
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				//$scope.userData[index].logStatus = 2;
				let lastLog = new Date(res.log.timeStamp).getTime();
				$scope.userData[index].lastLog = lastLog;
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});


	socket.on('logged_in_blocked2',function(data){
		$scope.$apply(function() 
		{   		
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 2;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});


	socket.on('logged_in_blocked1',function(data){
		$scope.$apply(function() 
		{   			
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 2;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}

				$.notify({
					icon: "ti-face-sad",
					message: res.userId+" has been blocked !!"
		
				},{
					type: 'danger',
					timer: 3000,
					placement: {
						from: 'top',
						align: 'center'
					}
				});
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});


	socket.on('entered',function(data){
		$scope.$apply(function() 
		{   			
			var res = data.res;
			
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 1;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}

				if($scope.userData[index].hasOwnProperty('startedOn')===false){					
				   $scope.userData[index].startedOn =  res.log.startedOn;	
				   $scope.userData[index].startedOnTS = new Date(res.log.startedOn).getTime();			   
				   $scope.userData[index].status = 'not submitted';
				}
			   
				$scope.updateActiveView(index,res.log,res.userId);

			}
		});

	});


	socket.on('exited',function(data){
		$scope.$apply(function(){  	
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 1;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});

	socket.on('submitted',function(data){
		$scope.$apply(function() 
		{   			
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 1;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}

				$scope.userData[index].status = 'submitted';
				$scope.updateActiveView(index,res.log,res.userId);

			}
		});

	});

	socket.on('logged_out',function(data){
		$scope.$apply(function() 
		{   
			console.log('logged_out')
			console.log(data);
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 0;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});

	socket.on('down_summ',function(data){
		$scope.$apply(function(){  
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 1;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});

	socket.on('email_summ',function(data){
		$scope.$apply(function(){
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 1;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});

	});
	
	socket.on('view_response',function(data){
		$scope.$apply(function(){
			var res = data.res;
			if(res.quizId===$scope.quizData.quizid){
				var index = $scope.userData.findIndex(x=> x.userid==res.userId);
				if(!res.log.hasOwnProperty('authorLogin')){
					$scope.userData[index].logStatus = 1;
					let lastLog = new Date(res.log.timeStamp).getTime();
				    $scope.userData[index].lastLog = lastLog;
				}
				$scope.updateActiveView(index,res.log,res.userId);
			}
		});
	})

	$scope.$on('LastElem', function(event,data){
		$scope.showFilterStatus();
	});
	
	$scope.showFilterStatus = function(){
		let filter_data =  $scope.filter_data.length;
		$scope.from  = ($scope.currPageData-1)*$scope.itemsPerPagesData+ 1;
		$scope.to = $scope.currPageData*$scope.itemsPerPagesData;
		if( filter_data<=$scope.itemsPerPagesData ||
		    $scope.to >= filter_data){
			  $scope.to = filter_data;
		}
    } 
	
});


app.filter("localDate",function(){
	return function(utcdate){
		if (typeof utcdate !== 'undefined'){
			var d1 = new Date(utcdate);
			var localdate = d1.toString().split(" ")[1] +" "+ d1.toString().split(" ")[2] +" "+ d1.toString().split(" ")[3] +" "+ d1.toString().split(" ")[4] +" "+ d1.toString().split(" ")[5];
			return localdate;
		}else{
			return 'Not Attempted';
		}
	}
});

app.filter("logMessage",function(){
	return function (log,limit) {
		if(log){
			var d1 = new Date(log.utcTime);
			var ld = new Date(d1.toString());
			var hours = ld.getHours();
			var minutes = ld.getMinutes();
			var ampm = hours >= 12 ? 'PM' : 'AM';
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? '0'+minutes : minutes;
			var exactTime = hours + ':' + minutes + ' ' + ampm;
			let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			let cdate = "at "+exactTime+" "+ld.getDate()+" "+month[ld.getMonth()];
			let message = `${log.message} ${cdate}`;
			if(message.length>limit){
				message = message.substr(0,limit)+'...';
			}
			return message;
		}
        
    }
});

app.directive('myRepeatDirective', function() {
    return  function (scope, element, attrs) {
		    console.log("Row")
		    if (scope.$last){
		      scope.$emit('LastElem');
		    }
        }
})






