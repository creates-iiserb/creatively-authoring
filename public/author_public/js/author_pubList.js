function openTopic(id) {
	document.getElementById(id).style.display = "block";
}

function closeNav(id) {
	document.getElementById(id).style.display = "none";
	$('#publistQues').bootstrapTable('destroy');
}


function fetchFrmBasket(author)
{
	var pubId = document.getElementById("pubListId").value;
	var basketItm = document.getElementById("basketItm").value;

	event.preventDefault();
	swal({
		title: 'Are you sure?',
		text: "You Want To Fetch Basket Items In This Public List",
		type: 'warning',
		showCancelButton: true,
		confirmButtonClass: 'btn btn-success btn-fill',
		cancelButtonClass: 'btn btn-danger btn-fill',
		confirmButtonText: 'Yes, add it!',
		buttonsStyling: false
	}).then(function () {
		$.ajax({
			type: "POST",
			data: {
				'quesId': basketItm,
				'pubListTopic': pubId						
			},
			url: '/author_addBasketItmToPublicList',
			success: function (data) {
				// console.log(data);
				if(data.status=="success"){
					swal({
						title: 'Success',
						text: "Items added to Public List",
						type: 'success',
						//confirmButtonClass: "btn btn-info btn-fill",
						//buttonsStyling: false
					}).then(function() {
						closeNav('quesOverlay')
					}).catch(function(){
						console.log("Aborted clone req");
					});							
					
				} else {
					if (data.status === "unauthorized") {
						swal({
							title: 'Unauthorized',
							text: data.msg,
							type: 'error',
							//confirmButtonClass: "btn btn-info btn-fill",
							//buttonsStyling: false
						});
					} else {
						swal({
							title: 'Error',
							text: 'Something Went Wrong. Please Contact Administrator !!',
							type: 'error',
							//confirmButtonClass: "btn btn-info btn-fill",
							//buttonsStyling: false
						});
					}
					// $scope.reset();
					return false;
				}
			},
			error: function (data) {
					swal({
						type:"error",
						title:"Error",
						text: "Please Contact Administrator",
						buttonsStyling: false,
						confirmButtonClass: "btn btn-danger btn-fill"				
											
					});
			}
		});
	}).catch(function () {
		console.log("Aborted clone req");
	});

	

}

$(function () {
	$("body").on('click', '.getTopic', function () {
		let list = JSON.parse($(this).attr("data-sub"));
		console.log(typeof list.data);
		console.log(list.data);

		let htm = "<h3 class=" + list.color + ">" + list.subject + "</h3> <div class='topicGrid'>";
		let arr = list.data;
		arr.forEach(function (item) {
			//htm+="<div class='row'><div class='çol-md-3'></div></div>"
			htm += "<h5 id=" + item.id + " class='getQues' data-ques='{\"topic\":\"" + item.name + "\",\"color\":\"" + list.color + "\"}'>" + item.name + "</h5>"
		})
		htm += "</div>";
		$("#topicOverlayList").html(htm);

		$('.overlay h5').hover(
			function () { $(this).addClass(list.color) },
			function () { $(this).removeClass(list.color) }
		)
		openTopic("topicOverlay");
	})
});

// ------------------------------------------ get question list a/c to public list -----------------------------------------------------------
function operateFormatter(value, row, index) {
	
	//id="sample" replace with new id

	var cls = 'ticketRaise';	
	if(!row.resolved)
	{
        cls = 'ticketIssue';
	}

	return [
		'<a id="vw'+row.id+'" rel="tooltip" title="View Sample" class="btn btn-simple btn-success btn-icon table-action btninfo view" href="javascript:void(0)" data-vid="vw'+row.id+'" onclick="viewquestion(\''+row.id+'\',\'recentView\')"  style="font-size:1.1em;display:table-cell !important;">',
		'<i class="fa fa-info-circle"></i>',
		 '</a>',
		'<a  rel="tooltip" title="Add to basket" class="btn btn-simple btn-info btn-icon table-action btnbasket " href="javascript:void(0)" style="font-size:1.1em;display:table-cell!important;" id="ad'+row.id+'" onclick="AddtoBasket(\'ad'+row.id+'\',\''+row.id+'\',\'table\')" >',
		'<i class="fa fa-shopping-basket"></i>',
		'</a>',
		'<a id="'+row.issueId+'" data-val="ticR-'+row.id+'"  rel="tooltip" title="Raise Ticket" class="btn btn-simple '+cls+' btn-icon table-action quesTicket" href="javascript:void(0)" style="font-size:1.1em;display:table-cell!important;" >',
		'<i class="fa fa-ticket"></i>',
		'</a>'
	].join('');
};

$(document).ready(function () {
	window.operateEvents = {
		'click .view': function (e, value, row, index) {
			let questionId = row.id;
			$.ajax({
				type: 'get',
				url: '/author_getCommittedSampleQue?id=' + questionId,
				cache: false,
				success: function (returndata) {
					if (returndata) {
						// $('#bsModal3 .modal-body p').modal('show');  // Please right this in your Code
						// console.log(returndata);
						// var htm = "<div class='text-right'><button type='button' id='addToPlaylistBtn' data-qid='" + questionId + "' class='btn btn-success btn-fill'>Add To Playlist</button></div>";
						var htm = "<div class='text-right'><button type='button' id='addToBasketBtn'  data-toggle=\"modal\" data-target=\"#addtoplaylistMdl\" data-qid='" + questionId + "' class='btn btn-success btn-fill' >Add To Basket</button></div>";
						// htm +="<div><form></form></div>";
                        
						$('#mdlViewSample .modal-body p').html(htm + returndata);
						// $('#mdlViewSample .modal-body p').html(htm + returndata);
						MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
						$('#mdlViewSample').modal('show');
					} else {
						// other code
					}
				},
				error: function () {
					console.error('Failed to process ajax !');
				}
			});
		},
        'click .quesTicket': function (e, value, row, index) {	
			var author = $('#author').val();
			var flag = $(this).hasClass('ticketIssue');
			if(flag)
			{
				var ticketid = $(this).attr('id');
				//////////////
				$.ajax({
					type: "POST",
					data: {
						'id': ticketid						
					},
					url: '/author_getTicketDetail',
					success: function (data) {
						console.log(data);
						if(data.status=="success"){
							var result = data.data;							
                            var raiseAt = UTCtoLocalDate(result.raisedAt,null);
							$('#issueContent').html(result.issue);
							$('#issueRaiseBy').html(result.raiseByfullName);
							$('#issueRaiseAt').html(raiseAt);
							$('#mdlAlreadyTicekt').modal('show');							
							
						}else if(data.status=="error"){
							swal({
								type:"error",
								title:"Error",
								text: " Please Contact Administrator",
								buttonsStyling: false,
								confirmButtonClass: "btn btn-danger btn-fill"				
													
							});	 
						}
						
					},
					error: function (data) {
							swal({
								type:"error",
								title:"Error",
								text: "Please Contact Administrator",
								buttonsStyling: false,
								confirmButtonClass: "btn btn-danger btn-fill"				
													
							});
					}
				});

				//////////////
				

			}else{

				if(author==row.author)
				{
					swal({
						title: "Warning",
						type:"warning",
						text: "Since you are the author of this question,you can not raise a ticket",
						buttonsStyling: false,
						confirmButtonClass: "btn btn-warning btn-fill",
						
					});
				}else {
				$('#mdlQuesLbl').html(row.id);	
				$('#rt_quesId').val(row.id);
				$('#rt_authorId').val(row.author);
				$('#rt_ticketDescription').val('');
				$("#saveRaiseTicket").text('Raise Ticket');
		        $("#saveRaiseTicket").prop('disabled',true);
				$('#mdlTicketRaise').modal('show');
				}
			}
			
		}
	};

	$("body").on('click', '.getQues', function () {
		let pubListId = $(this).attr("id");
		let list = JSON.parse($(this).attr("data-ques"));

		$("#pubListId").val(pubListId); //
		$("#list").val($(this).attr("data-ques")); //

		htm = "<h3 class=" + list.color + ">" + list.topic + "<button id=\"fetchBtn\" rel=\"tooltip\" title=\"Fetch From Basket\" onclick=\"fetchFrmBasket('<%-short%>')\" type=\"button\" class=\"btn btn-default btn-simple btn-lg \"><i class=\"fa fa-arrow-circle-down\"></i></button></h3>";
    $("#tblquesHead").html(htm);

		$.ajax({
			type: 'get',
			url: '/author_getpubListQuestion?id=' + pubListId,
			cache: false,
			success: function (returndata) {
				if (returndata) {
					if (returndata.status == 'success') {
						var fdata = JSON.parse(returndata.data);
						var basketItm = returndata.basketItm;	
						// var pubId = pubListId;				
						// console.log("tty=="+basketItm)
						// var htmTbl ="";
						// fdata.forEach(function(item){
						// 	  item.tags = 
						// 	 htmTbl +="<tr>\
						// 	<td>"+item.id+"</td>\
						// 	<td>"+item.tags+"</td>\
						// 	<td>"+item.comments+"</td>\
						// 	<td><div class='table-icons'><a id='sample' data-qid='"+item.id+"' rel='tooltip' title='View Sample' class='btn btn-simple btn-success btn-icon table-action edit' data-original-title='View Sample'><i class='ti-angle-right'></i></a>\
						// 	</div></td>\
						// 	</tr>";
						// });
						// $('#abc').html(htmTbl);  // Please right this in your Code

						$("#basketItm").val(basketItm);

						$('#publistQues').bootstrapTable({
							toolbar: ".toolbar",
							data: fdata,
							clickToSelect: true,
							showRefresh: false,
							search: true,
							showToggle: true,
							showColumns: true,
							pagination: true,
							searchAlign: 'right',
							strictSearch: false,
							pageSize: 10,
							clickToSelect: false,
							pageList: [5, 10, 25, 50, 100],

							formatShowingRows: function (pageFrom, pageTo, totalRows) {
								//do nothing here, we don't want to show the text "showing x of y from..."
								return "showing " + pageFrom + " to " + pageTo + " of " + totalRows + " entries <br/>";
							},
							formatRecordsPerPage: function (pageNumber) {
								return "  " + pageNumber + " rows visible";
							},
							icons: {
								refresh: 'fa fa-refresh',
								toggle: 'fa fa-th-list',
								columns: 'fa fa-columns',
								detailOpen: 'fa fa-plus-circle',
								detailClose: 'ti-close'
							}
						});
						//activate the tooltips after the data table is initialized
						$('[rel="tooltip"]').tooltip();
						$("[rel='tooltip'][data-vid]").on('show.bs.tooltip', function(){
							var data = $(this).attr('data-vid');
							var qid = data.substring(2);
							updateLastViewTime(qid,'recentView');
						});

						$('#publistQues').on('post-body.bs.table', function () {
							$('[rel="tooltip"]').tooltip();
							$("[rel='tooltip'][data-vid]").on('show.bs.tooltip', function(){
								var data = $(this).attr('data-vid');
								var qid = data.substring(2);
								updateLastViewTime(qid,'recentView');
							});
							
							changecolor('#publistQues','recentView','table');//

						});
						  
												
						changecolor('#publistQues','recentView','table');//
						openTopic("quesOverlay");


					} else if(returndata.status == 'noData'){

						var basketItm = returndata.basketItm;	
						$("#basketItm").val(basketItm);

						$('#publistQues').bootstrapTable({
							toolbar: ".toolbar",
							clickToSelect: true,
							showRefresh: false,
							search: true,
							showToggle: true,
							showColumns: true,
							pagination: true,
							searchAlign: 'right',
							strictSearch: false,
							pageSize: 10,
							clickToSelect: false,
							pageList: [5, 10, 25, 50, 100],

							formatShowingRows: function (pageFrom, pageTo, totalRows) {
								//do nothing here, we don't want to show the text "showing x of y from..."
								return "showing " + pageFrom + " to " + pageTo + " of " + totalRows + " entries <br/>";
							},
							formatRecordsPerPage: function (pageNumber) {
								return "  " + pageNumber + " rows visible";
							},
							icons: {
								refresh: 'fa fa-refresh',
								toggle: 'fa fa-th-list',
								columns: 'fa fa-columns',
								detailOpen: 'fa fa-plus-circle',
								detailClose: 'ti-close'
							}
						});
						//activate the tooltips after the data table is initialized
						$('[rel="tooltip"]').tooltip();
						$("[rel='tooltip'][data-vid]").on('show.bs.tooltip', function(){
							var data = $(this).attr('data-vid');
							var qid = data.substring(2);
							updateLastViewTime(qid,'recentView');
						});

						$('#publistQues').on('post-body.bs.table', function () {
							$('[rel="tooltip"]').tooltip();
							$("[rel='tooltip'][data-vid]").on('show.bs.tooltip', function(){
								var data = $(this).attr('data-vid');
								var qid = data.substring(2);
								updateLastViewTime(qid,'recentView');
							});
							
							changecolor('#publistQues','recentView','table');//

						});
						  
												
						changecolor('#publistQues','recentView','table');//
						openTopic("quesOverlay");

					}else if (returndata.status == 'error') {
						$.notify({
							icon: "",
							message: "Error: Please contact administrator !!!"
						}, {
								type: "danger",
								timer: 1000,
								delay: 700,
								placement: {
									from: 'top',
									align: 'center'
								}
							});
					} else { }


				} else {
					// other code
				}
			},
			error: function () {
				console.error('Failed to process ajax !');
			}
		})
	});

});

// // ------------------------------------------ view sample modal -----------------------------------------------------------
// $(document).ready(function() {
// $("body").on('click','#sample',function() {
// 	let questionId = $(this).attr("data-qid");
// 	let playlistdata = document.getElementById("playlistData").value;
// 	  $.ajax({
// 	      type: 'get',
// 	      url: '/author_getCommittedSampleQue?id='+questionId,
// 	      cache: false,
// 	      success: function (returndata) {
// 	          if (returndata) {
// 	            // $('#bsModal3 .modal-body p').modal('show');  // Please right this in your Code
// 	            // console.log(returndata);
// 	            var htm = "<div class='text-right'><button type='button' id='addToPlaylistBtn' data-qid='"+questionId+"' class='btn btn-success btn-fill'>Add To Playlist</button></div>";
// 	            // htm +="<div><form></form></div>";
// 	            $('#mdlViewSample .modal-body p').html(htm+returndata);
// 	            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
// 	            $('#mdlViewSample').modal('show');
// 	          } else {
// 	              // other code
// 	          }
// 	      },
// 	      error: function () {
// 	          console.error('Failed to process ajax !');
// 	      }
// 	  });
// 	});

// });

$(function () {
	$('#mdlViewSample').on('hidden.bs.modal', function () { // do something… })
		$("#viewModalContent").html(" <p></p>");
	})
});

// ------------------------------------------ view sample modal -----------------------------------------------------------
$(document).ready(function () {
	$("body").on('click', '#addToPlaylistBtn', function () {
		let questionId = $(this).attr("data-qid");
		let playlistdata = JSON.parse(document.getElementById("playlistData").value);
		let author = document.getElementById("author").value;
		//console.log(playlistdata.length);
		var htm = "";
		var playId = {};
		htm += "<select class='form-control valid newDropCss' data-style='btn-default' id='playlist_name' name='playlist_name' required>\
		<option value=''>--select--</option>";


		for (var i = 0; i < playlistdata.length; i++) {
			var playlist1 = playlistdata[i];
			// 	htm+='<option value="'+playlist1[2]+'">'+playlist1[1]+'</option>';  
			htm += "'<option value='" + playlist1[2] + "'>" + playlist1[1] + "</option>";
			playId[playlist1[2]] = playlist1[1];
		}
		// console.log("090900====" + JSON.stringify(playId));
		var qdata = questionId;
		htm += "</select>";

		

		swal({
			title: 'Add to playlist',
			input: 'select',
			inputOptions: playId,
			inputPlaceholder: 'Select',
			showCancelButton: true,
			confirmButtonText: 'Add',
			confirmButtonClass: "btn btn-success btn-fill",
			cancelButtonClass: "btn btn-danger btn-fill",
			buttonsStyling: false,
			showLoaderOnConfirm: true,
			inputValidator: function (value) {
				return new Promise(function (resolve, reject) {
					if (value !== '') {
						resolve();
					} else {
						reject('You need to select a Playlist');
					}
				});
			},
			allowOutsideClick: () => !swal.isLoading()
		}).then(function (result) {
			$.ajax({
				type: "POST",
				data: {
					'author': author,
					'ques_ids': qdata,
					'playlist_name': result
				},
				url: '/author_addQuesToPlaylist',
				success: function (data) {
					if(data.status=="success"){
						swal({
							type: 'success',
							title: 'Question added to playlist!'
						})
					}else if(data.status=="duplicate"){
						swal({
							type: 'warning',
							title: "This item already exists in your playlist."
						})
					}else if(data.dataLen==="max"){
						// console.log("1");
						// swal("Error", "Maximum number of items allowed in a playlist is 50  ", " error ");
						swal({
							type: 'error',
							title: "Maximum number of items allowed in a playlist is 500."
						})
					}else{
						swal({
							type: 'error',
							title: "Error: Please Contact Administrator"
						})
					}
					//.then(function () {
					//     window.location.href='/author_playlist_dash';
					// });
				},
				error: function (data) {
					if(data.dataLen==="max"){
						// console.log("1");
						// swal("Error", "Maximum number of items allowed in a playlist is 50  ", " error ");
						swal({
							type: 'error',
							title: "Maximum number of items allowed in a playlist is 500."
						})
					}else{
						// console.log("2");
						swal("Cancelled", "Error: Please Contact Administrator ", " error ");
					}
					
				}
			});
		}).catch(function () {
			console.log("Aborted clone req");
		});


		// $('#playlistDrop').html(htm);
		//    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
		//    $('#addtoplaylist').modal('show');

		//     swal({
		//         title: 'Add to playlist',
		//         html: htm,
		//         showCancelButton: true,
		//         confirmButtonClass: 'btn btn-success btn-fill',
		//         cancelButtonClass: 'btn btn-danger btn-fill',
		//         buttonsStyling: false
		//     }).then(function(result) {
		//         swal({
		//             type: 'success',
		//             html: 'Question added to playlist',
		//             confirmButtonClass: 'btn btn-success btn-fill',
		//             buttonsStyling: false

		//         })
		//     }).catch(swal.noop)
	});

	$("body").on('click', '#addToBasketBtn', function () {
		let questionId = $(this).attr("data-qid");
		
		$.ajax({
			type    : "post",
			data    : {"question":questionId},
			url     : "/author_addToBaseketQuestion",
			dataType: "json",
			success : function(data){
			   if(data.status=="ok")
			   {
					$('#basketquestionCounter').html(data.numberofquestions);
					$('#basketquestionCounter').show();
					//var tr = $("#"+ele).closest('tr').addClass('active');
	
				  //it will be remove after confirmation
					//   if(elementType=='table')
					//   {              
					//     var text = $("#"+ele).closest('tr').children(":first").text();
					//     var icons = '<i class="fa fa-shopping-basket text-info" style="padding-left:3px;" ></i>';
					//     $("#"+ele).closest('tr').children(":first").html(text+icons);
					//   }
				  //end it will be remove after confirmation
				  
				  $('#addToBasketBtn').attr("disabled", true);
				 
				  sessionStorage['basketitems'] = JSON.stringify(data.bquestions);
				  if(data.questionstatus == 'New')
				  {                  
					$.notify({          
						message: "Question <b>"+qid+"</b>  has been added to basket."
					},{
						type: 'success',
						delay:1000,
						placement: {
						from: 'top',
						align: 'center'
						}
					});
	
				  }else{
	
					$.notify({          
						message: "Question <b>"+qid+"</b>  already exist in the basket."
					},{
						type: 'info',
						delay:1000,
						placement: {
						from: 'top',
						align: 'center'
						}
					});
	
				  }  
				  
		
			   }else
			   if(data.status=="maxlimit"){
					$('#basketquestionCounter').html(data.numberofquestions);
					$('#basketquestionCounter').show();
					$('#addToBasketBtn').attr("disabled", false);
					swal({
						title: 'Basket Limit',
						text: 'You can add only 20 questions in the basket',
						type: 'warning',
						confirmButtonClass: "btn btn-info btn-fill",
						buttonsStyling: false
					});
			   }
			}
		});
		
		
	});
});


//----------------save raise ticket
$(document).ready(function () {
	$("body").on('click', '#saveRaiseTicket', function () {
	
		var rt_quesId = $("#rt_quesId").val();
		var rt_authorId = $("#rt_authorId").val();
		var rt_rt_ticketDescriptionquesId = $("#rt_ticketDescription").val();
		
		if(rt_quesId.trim() =='' ||  rt_authorId.trim() =='' || rt_rt_ticketDescriptionquesId.trim() =='')
		{
			if(rt_rt_ticketDescriptionquesId.trim() =='')
			{
				swal({
					type:"error",
					title:"Error",
					text: "Please describe question issue",
					buttonsStyling: false,
                    confirmButtonClass: "btn btn-danger btn-fill"
									
				});
			}		

			if(rt_quesId.trim() =='' ||  rt_authorId.trim() =='')
			{
				swal({
					type:"error",
					title:"Error",
					text: "Something Goes Wrong",
					buttonsStyling: false,
                    confirmButtonClass: "btn btn-danger btn-fill"
                    	
										
				});
			}
			return;
		}


		$("#saveRaiseTicket").text('Wait..');
		$("#saveRaiseTicket").attr('disabled',true);
		
		
		$.ajax({
			type: "POST",
			data: {
				'author': rt_authorId,
				'quesId': rt_quesId,
				'description': rt_rt_ticketDescriptionquesId
			},
			url: '/author_addTicket',
			success: function (data) {
				console.log(data);
				if(data.status=="success"){

					swal({
						type:"success",
						title:"Success",
						text: "Ticket raised successfully",
						buttonsStyling: false,
						confirmButtonClass: "btn btn-success btn-fill"				
											
					});

					//
					var ticketAnchor = 'ticR-'+rt_quesId;
					$('a[data-val='+ticketAnchor+']').removeClass('ticketRaise').addClass('ticketIssue');
					$('a[data-val='+ticketAnchor+']').attr('id',data.lastTickId);
					$('#mdlTicketRaise').modal('hide');
					
				}else if(data.status=="error"){
					swal({
						type:"error",
						title:"Error",
						text: " Please Contact Administrator",
						buttonsStyling: false,
						confirmButtonClass: "btn btn-danger btn-fill"				
											
					});	 
				}
				
			},
			error: function (data) {					
					
					swal({
						type:"error",
						title:"Error",
						text: "Please Contact Administrator",
						buttonsStyling: false,
						confirmButtonClass: "btn btn-danger btn-fill"				
											
					});			
				
			}
		});
		////////////////////
		

		
	});

    $('#rt_ticketDescription').keyup(function() {
		if($(this).val().trim() != '') {
		   $('#saveRaiseTicket').prop('disabled', false);
		}else{
			$('#saveRaiseTicket').prop('disabled', true);
		}
	});

});


