

//sessionStorage.removeItem('basketitems');

var app = angular.module('basketquestionApp', ['ui.bootstrap', 'ngTagsInput', 'angularUtils.directives.dirPagination']);

app.controller('basketquestionController', function ($scope, $http, $timeout) {

	var bqdata = document.getElementById('bqdata');
	bqdataHtml = bqdata.innerHTML.trim();

	var Alldata = JSON.parse(bqdataHtml);
	$scope.basket = Alldata.qdata;
	$scope.unauthData = Alldata.unauthData;
	$scope.author = Alldata.author;

	$("#LiBasket").show();
	
	
	$scope.NotAutorQids = $scope.basket.reduce(function(result, obj) {
		if(obj.author != $scope.author)
		{ 
		  result.push(obj.id);
		}
		return result;
	  }, []);

	 

	$scope.showNotAuthorQuestionsMsg = function(){
        var strQuest ='';
		var questLength = $scope.NotAutorQids.length; 
		if(questLength>1)
		{
			for(let i=0;i<questLength-1;i++)
			{
                strQuest += $scope.NotAutorQids[i]+",";
			}
			strQuest = strQuest.slice(0, strQuest.length-1);
			strQuest = "You are not the author of these questions  "+strQuest+" and "+ $scope.NotAutorQids[questLength-1] +" so, you can't edit these questions.";
            
		}
		else
		if(questLength==1) 
		{
			strQuest = "You are not the author of this question "+ $scope.NotAutorQids[0] + " so,you can't edit this question";
		}
		return strQuest;
        
	} 
	

	$scope.subjectPubList = [];
	$scope.topicPubList = [];
	

	$scope.removefrombasket = function (qid) {
		var removeindex = $scope.basket.findIndex(x => x.id == qid);
		//var removeindex	= $scope.basket.indexOf(qid); 

		$scope.basket.splice(removeindex, 1);
		var ques_ids1 = document.getElementById('ques_ids1');

		if (sessionStorage['basketitems'] != undefined) {
			var BasketArr = JSON.parse(sessionStorage['basketitems']);
			var BasketArrIndex = BasketArr.findIndex(x => x == qid);
			BasketArr.splice(BasketArrIndex, 1);
			sessionStorage['basketitems'] = JSON.stringify(BasketArr);
		}

		if (ques_ids1.value.trim() == "") {
			var playlistArray = [];
		} else {
			var playlistArray = ques_ids1.value.split(',');
		}

		if (playlistArray.indexOf(qid) > -1) {
			var indexnumber = playlistArray.indexOf(qid);
			playlistArray.splice(indexnumber, 1);
		}
		ques_ids1.value = playlistArray.join(',');

		$http.post("/author_removequestionfrombasket", { 'question': qid }).then(function (callback) {
			if (callback.data.status === "ok") {
				$.notify({
					message: "<b>Basket Question</b> deleted successfully !!"
				}, {
						type: 'success',
						delay: 1000,
						placement: {
							from: 'top',
							align: 'center'
						}
					});
					// location.reload();
				    var unauthDataIndex = $scope.unauthData.findIndex(x => x == qid);
					$scope.unauthData.splice(unauthDataIndex, 1);

					var notAutorQidsIndex = $scope.NotAutorQids.findIndex(x => x == qid);
					$scope.NotAutorQids.splice(notAutorQidsIndex, 1);

					


			} else {
				$.notify({
					message: "Something Went Wrong. Please Contact Administrator !!"
				}, {
						type: 'danger',
						delay: 1000,
						placement: {
							from: 'top',
							align: 'center'
						}
					});
			}
		},
			function (error) {
				$.notify({
					message: "Something Went Wrong. Please Contact Administrator !!"
				}, {
						type: 'danger',
						delay: 1000,
						placement: {
							from: 'top',
							align: 'center'
						}
					});
			});
		// end of http
	}


	$scope.filterByUser = function(basketquestion){
		 
		  if(basketquestion.author !== $scope.author){
	  		return false;
		  }		  
		  return true;		   
	}


	$scope.editMetaData = function(){
		$('#editMetaModal').modal('show');
	}

	$scope.addtoplaylist = function () {
		$('#addtoplaylist').modal('show');
	}

	$scope.addtopubliclist = function () {
		$http.post("/author_getPubListSub").then(function (result) {
			if (result.data.status == 'success') {
				var subject = result.data.subject;
				$scope.subjectPubList = subject;
				$('#addtopublist').modal('show');

			} else {
				swal({
					type: 'error',
					title: 'Error',
					html: result.msg
				});
			}
		});
		
	}

	$scope.gettopics = function () {
		var subjectpublist = $scope.subjectpublist1;
		$("#add_publist").attr("disabled", "true");
		if (subjectpublist != '') {
			$scope.hideTopic();
			$http.post("/author_getSubCategory", { subject: subjectpublist }).then(function (result) {
				//console.log(result);
				if (result.data.status == 'success') {
					$scope.showTopic(result.data.data);
				} else {
					swal({
						type: 'error',
						title: 'Error',
						html: result.msg
					});
				}
			});
		} else {
			$scope.hideTopic();
		}
	}

	$scope.topiclistchange = function () {

		$("#add_publist").removeAttr("disabled");
		var topicpublist1 = $scope.topicpublist1;
		if (topicpublist1 == '') {
			$("#add_publist").attr("disabled", "true");
		}
	}

	$scope.showTopic = function (result) {
		// console.log(result);
		var cat = JSON.parse(result);
		// console.log(cat[0]);
		$scope.topicPubList = cat;
		// $("#topicPubList").removeAttr("hidden");
		$("#topicPubList").css("display", "block");
	}

	$scope.hideTopic = function () {
		// $("#topicPubList").attr("hidden", "true");
		$("#topicPubList").css("display", "none");
		$("#add_publist").attr("disabled", "true");
	}


	$scope.clearall = function () {
		if ($scope.basket.length > 0) {
			swal({
				title: 'Are you sure?',
				text: "You want to remove all questions from Basket !",
				type: 'warning',
				showCancelButton: true,
				confirmButtonClass: 'btn btn-success btn-fill',
				cancelButtonClass: 'btn btn-danger btn-fill',
				confirmButtonText: 'Yes, remove it !',
				buttonsStyling: false
			}).then(function () {
				$scope.basket = [];
				$http.post("/author_clearallbasketquestions", { 'questions': $scope.basket }).then(function (callback) {
					if (callback.data.status === "ok") {
						swal({
							title: 'Basket Cleared!',
							//text: 'Basket Questions Removed Successfully.',
							type: 'success',
							confirmButtonClass: "btn btn-success btn-fill",
							buttonsStyling: false
						});
						if (sessionStorage['basketitems'] != undefined) {
							sessionStorage.removeItem('basketitems');
						}
						location.reload();
					} else {
						$.notify({
							message: "Something Went Wrong. Please Contact Administrator !!"
						}, {
								type: 'danger',
								delay: 1000,
								placement: {
									from: 'top',
									align: 'center'
								}
							});
					}
				},
					function (error) {
						$.notify({
							message: "Something Went Wrong. Please Contact Administrator !!"
						}, {
								type: 'danger',
								delay: 1000,
								placement: {
									from: 'top',
									align: 'center'
								}
							});
					});
			});
		}
	}

	/////////public list////////////
	$scope.editQuesMeta = function (contact, event) {
		// Nothing first time, but will have an element second time
		$timeout(function () {
			// Click the element and remove the class since it is not in edit mode anymore
			angular.element('.row-edit-mode').triggerHandler('click');
			angular.element('.row-edit-mode').removeClass('row-edit-mode');

			// If it is not a button, then it is the fa-icon, so get its parent, which is a button
			var eventElement = angular.element(event.target).is('button') ? event.target : event.target.parentNode;
			// Find it's sibling with given id, and add a class to it
			angular.element(eventElement).siblings("#table-cancel").addClass('row-edit-mode')

			$scope.selected = angular.copy(contact);
		});
	};


	//saveQuesMeta
	$scope.saveQuesMeta = function (qid) {
		var tags = $scope.selected.tags.map(function (val) {
			return val.text;
		});

		//console.log(qid);
		

		var idx = $scope.basket.findIndex(function(obj){
             return obj.id == qid; 
		});

		//console.log(idx);


		if (tags.length < 3) {
			swal({
				title: 'Minimum 3 tags',
				text: 'Please Enter atleast three tags',
				type: 'error',
				confirmButtonClass: "btn btn-info btn-fill",
				buttonsStyling: false
			});
			$scope.selected.tags = $scope.basket[idx].tags;
			$scope.basket[idx] = angular.copy($scope.selected);
			// $scope.editsinglesave($scope.basket[idx]);
			$scope.reset();
			return false;
		}

		var dataobj = {
			'quesId': $scope.basket[idx].id,
			'quesAuthor': $scope.basket[idx].author,
			'tags': tags,
			'comment': $scope.selected.comments
		};


       

		// console.log(dataobj);

		$http.post("/author_updateTagsComments", dataobj).then(function (callback) {
			// console.log(callback.data);
			if (callback.data.status === "success") {
				$scope.selected.tags = tags;
				$scope.basket[idx] = angular.copy($scope.selected);
				$scope.reset();
			} else {
				$scope.selected.comments = $scope.basket[idx].comments;
				$scope.selected.tags = $scope.basket[idx].tags;
				$scope.basket[idx] = angular.copy($scope.selected);
				if (callback.data.status === "unauthorized") {
					swal({
						title: 'Unauthorized',
						text: callback.data.msg,
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
				$scope.reset();
				return false;
			}
		},
			function (error) {
				$scope.selected.comments = $scope.basket[idx].comments;
				$scope.selected.tags = $scope.basket[idx].tags;
				$scope.basket[idx] = angular.copy($scope.selected);
				swal({
					title: 'Error',
					text: 'Something Went Wrong. Please Contact Administrator !!',
					type: 'error',
					confirmButtonClass: "btn btn-info btn-fill",
					buttonsStyling: false
				});
				$scope.reset();
				return false;
			});
	};

	// $scope.editsinglesave = function(data){
	// console.log(data);
	// }

	$scope.reset = function () {
		// console.log($scope.selected);
		angular.element('.row-edit-mode').removeClass('row-edit-mode');
		$scope.selected = {};
	};

	$scope.savetopubliclist = function () {
		var data = new Object;
		var questionsid = $scope.basket.map(function (question) {
			return question.id;
		});
		data.quesId = questionsid;
		// data.subject =  $scope.subjectpublist1;
		// {quesId: ["00056", "000b5", "0007j"], pubListTopic: "pub0035"}
		data.pubListTopic = $scope.topicpublist1;
		// console.log(data);
		$http.post("/author_addBasketToPublicList", data).then(function (callback) {
			// console.log(callback.data);
			if (callback.data.status === "success") {
				$scope.basket = [];
				swal({
					title: 'Success',
					text: "Items added to Public List",
					type: 'success',
					confirmButtonClass: "btn btn-info btn-fill",
					buttonsStyling: false
				}).then(function() {
					location.reload();
				}).catch(function(){
					console.log("Aborted clone req");
				});
				
			} else {
				if (callback.data.status === "unauthorized") {
					swal({
						title: 'Unauthorized',
						text: callback.data.msg,
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
				$scope.selected.comments = $scope.basket[idx].comments;
				$scope.selected.tags = $scope.basket[idx].tags;
				$scope.basket[idx] = angular.copy($scope.selected);
				swal({
					title: 'Error',
					text: 'Something Went Wrong. Please Contact Administrator !!',
					type: 'error',
					confirmButtonClass: "btn btn-info btn-fill",
					buttonsStyling: false
				});
				$scope.reset();
				return false;
			});
	}
	///////end of public list///////
});


app.filter('basketFilter', function() {
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


app.filter('otherFilter', function() {
    return function(input, searchText) {
        if(angular.isArray(input)) {
          if(searchText != null && searchText != ""){
            var filteredList = [];

        angular.forEach(input, function (val) {
            //Not Match exact comments
            if (val.comments.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || val.id.toLowerCase().indexOf(searchText.toLowerCase()) >= 0  ) {
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



$(document).ready(function () {
	if (window.location.search.indexOf('msg=itemAdded') > -1) {
		$.notify({
			icon: "",
			message: "All items added successfully to playlist"
		}, {
				type: "success",
				timer: 4000,
				placement: {
					from: 'top',
					align: 'center'
				}
			});
	} 

	else if (window.location.search.indexOf('msg=dberror') > -1) {
		$.notify({
			icon: "",
			message: "<b> Error - </b>Error occurs during fetching your data, Please Contact Administrator !!"
		}, {
				type: "danger",
				timer: 4000,
				placement: {
					from: 'top',
					align: 'center'
				}
			});
	} 

	else if (window.location.search.indexOf('msg=maxlist') > -1) {
		$.notify({
			icon: "",
			message: "<b> Error - </b>Maximum number of items allowed in a playlist is 50  !!"
		}, {
				type: "danger",
				timer: 4000,
				placement: {
					from: 'top',
					align: 'center'
				}
			});
	} 

	else if (window.location.search.indexOf('msg=noPlaylist') > -1) {
		$.notify({
			icon: "",
			message: "<b> Error - </b>Please select playlist name !!"
		}, {
				type: "danger",
				timer: 4000,
				placement: {
					from: 'top',
					align: 'center'
				}
			});
	} 

	else if (window.location.search.indexOf('msg=noItem') > -1) {
		$.notify({
			icon: "",
			message: "<b> Error - </b>Please select atleast one question to add in playlist !!"
		}, {
				type: "danger",
				timer: 4000,
				placement: {
					from: 'top',
					align: 'center'
				}
			});
	} 
	else if (window.location.search.indexOf('msg=unauthData') > -1) {
		$.notify({
			icon: "",
			message: "<b> Error - </b>Their are some unauthorized items in this basket. You are authorized to keep content that is authored by you or if it is a public content."
		}, {
				type: "danger",
				timer: 4000,
				placement: {
					from: 'top',
					align: 'center'
				}
			});
	} else {
		// alert('track not here');
	}
});