
var allIssuedTickets; 
var raiseByMeTickets;

function replytoTicketUser(id){   
    // if ($('[name="isIssue"]').is(':checked')){ 
    //   $('[name="isIssue"]').trigger('click');
    // }

    if ($('[name="isResolved"]').is(':checked')){ 
      $('[name="isResolved"]').trigger('click');
    }

    $("#saveRaiseTicket").text('Resolve Ticket');
    $("#saveRaiseTicket").prop('disabled',true);
    //$("#saveIsIssue").prop('disabled',true);
  
    $.ajax({
      type: 'post',
      url: '/author_getTicketDetail',
      data:{id:id},      
      success: function (returndata) {
       
      if (returndata.status=="success") {
          var data =  returndata.data;
         
          $('#mdlQuesLbl').html(data.contentId);
          $("#rt_quesId").val(data.contentId);
          $("#rt_id").val(data._id);
          $("#rt_description").html(data.issue);
          $("#rt_raiseBy").val(data.raiseByfullName);
          $("#rt_message").val(data.explaination);
          if(data.isIssue===true || data.isIssue ==='' ){
            if (!$('[name="isIssue"]').is(':checked')){ 
                $('[name="isIssue"]').trigger('click');
            }
          }else{
            if ($('[name="isIssue"]').is(':checked')){ 
              $('[name="isIssue"]').trigger('click');
            }
          }
          $('#mdlTicketRaise').modal('show');
      } else {
      // other code
      }
      },
      error: function () {
      console.error('Failed to process ajax !');
      }
      });
   
}


function saveTicketReply(){
  // var ticketFlag = false;
  // var Flag = $('#rt_ticektresolve').is(":checked") ;
  // if(Flag)
  // ticketFlag =true;
  // return; //
  resolved= true;
  var id = $("#rt_id").val();
  var isIssue = false;
  if ($('[name="isIssue"]').is(':checked')){ 
    isIssue = true;
  } 
  data = {};
  data.ticketid = $("#rt_id").val();
  data.message = $("#rt_message").val().trim();
  data.resolved = resolved;
  data.isIssue = isIssue;

  if(data.message==''){
    swal({
					type:"error",
					title:"Error",
					text: "Please enter explanation",
					buttonsStyling: false,
                    confirmButtonClass: "btn btn-danger btn-fill"
									
        });
    return;        
  }

  ////////////

  swal({
    title: 'Are you sure',
    text: "have you resolve this issue ?",
    type: 'warning',
    showCancelButton: true,
    confirmButtonClass: 'btn btn-success btn-fill',
    cancelButtonClass: 'btn btn-danger btn-fill',
    confirmButtonText: 'Yes',
    buttonsStyling: false
  }).then(function () {
    
    $("#saveRaiseTicket").text('Wait..');
    $("#saveRaiseTicket").attr('disabled',true);
    
    $.ajax({
      type: 'post',
      url: '/author_replyToTicket',
      data:data,      
      success: function (returndata) {        
        
      if (returndata.status=="success") { 
       
          // $table1.bootstrapTable('remove', {
          //       field: 'id',
          //       values: [id]
          // });

          

          swal({
						type:"success",
						title:"Success",
						text: "Ticket Resolve Successfully",
						buttonsStyling: false,
						confirmButtonClass: "btn btn-success btn-fill"			
											
          }).then(function() {
            location.reload(true);
          });          
          
          LoadTicketCounter();
          $('#mdlTicketRaise').modal('hide');         
      } else {
        swal({
					type:"error",
					title:"Error",
					text: "Please Contact Administrator",
					buttonsStyling: false,
                    confirmButtonClass: "btn btn-danger btn-fill"
									
        });
      }
      },
      error: function () {
      console.error('Failed to process ajax !');
      }
 });
  
  },function(){});


}


function saveTicketIssue(){
  var data = {};
  data.id = $("#rt_id").val();
  if ($('[name="isIssue"]').is(':checked')){
    data.isIssue = true;
  }
  else{
    data.isIssue =false;
  }

  data.explaination = $("#rt_message").val();

  // console.log(data);
  // return;

   $.ajax({
    type: 'post',
    url: '/author_isIssueTicket',
    data:data,      
    success: function (returndata) {
    
    if (returndata.status=="success") {
       var  isIssue = '<span class="label label-danger">No</span>';
       if(data.isIssue)
       {
           isIssue = '<span class="label label-success">Yes</span>';
       }
       
       $("#isIssue"+data.id).html(isIssue);
       var tabledata = $("#commQue1").bootstrapTable('getData');
       $.each(tabledata, function(key,value) {
        if(value.id == data.id)
        {
          value.isIssue = isIssue;
        }
       });
            
       $('#mdlTicketRaise').modal('hide');
       swal({
        type:"success",
        title:"Success",
        text: "Save successfully",
        buttonsStyling: false,
        confirmButtonClass: "btn btn-success btn-fill"
       }).then(function(){
        var index = allIssuedTickets.findIndex(obj=>obj.id== data.id);
        allIssuedTickets[index].isIssue = data.isIssue;  
        
        location.reload();
      });

        
    } else {
    // other code       
      swal({
        type:"error",
        title:"Error",
        text: "Please Contact Administrator",
        buttonsStyling: false,
        confirmButtonClass: "btn btn-danger btn-fill"				
                  
      }).then(function(){
        location.reload();
      });

    }
       
    },
    error: function () {
    console.error('Failed to process ajax !');
    }
    });

  
}


function closeticketDetail(id){

  $("#resolvedRow").hide();
  $("#notResolvedRow").hide();
  $("#authorResponse").hide();

  $.ajax({
    type: 'post',
    url: '/author_getTicketDetail',
    data:{id:id},      
    success: function (returndata) {
     
    if (returndata.status=="success") {
        $('#mdlQuesLblTD').html(returndata.data.contentId);      
        $("#td_description").html(returndata.data.issue);
        $("#tdr_description").html(returndata.data.explaination);
        var raisedAt = UTCtoLocalDate(returndata.data.raisedAt,true);
        
        if(returndata.data.resolved==true)
        {
          var resolvedAt = UTCtoLocalDate(returndata.data.resolvedAt,true);
          $("#tdResolveAt").html(resolvedAt);
          $("#tdRaiseAt").html(raisedAt); 
          $("#resolvedRow").show();
          $("#authorResponse").show();
        }else{          
          $("#tdNotRaiseAt").html(raisedAt); 
          $("#notResolvedRow").show();
        }
        
        $('#mdlTicketDetail').modal('show');
    } else {
    // other code
    }
    },
    error: function () {
    console.error('Failed to process ajax !');
    }
    });

}


$(function(){

  $('#rt_message').keyup(function() {
		if($(this).val().trim() != '' && $(this).val().trim().length>=10 && $('[name="isResolved"]').is(':checked') &&  $('[name="isIssue"]').is(':checked') ) {
		   $('#saveRaiseTicket').prop('disabled', false);
    }
    else
    if($(this).val().trim() != '' && $(this).val().trim().length>=10 && !($('[name="isResolved"]').is(':checked')) &&  !($('[name="isIssue"]').is(':checked')) ) {
      $('#saveRaiseTicket').prop('disabled', false);
      $("#saveIsIssue").prop('disabled',false);
    }

    else
    if($(this).val().trim() != '' && $(this).val().trim().length>=10 && $('[name="isResolved"]').is(':checked') ) {
      $('#saveRaiseTicket').prop('disabled', false);
      $("#saveIsIssue").prop('disabled',true);
    } 
    else{
			$('#saveRaiseTicket').prop('disabled', true);
		}
	});

});





function filterByAgreeTicketIssue(flag){
  
  var flag = flag=='yes'?true:false;
  var ides = allIssuedTickets.filter(function(obj){
    if(obj.isIssue===flag)
    return obj.id;
  }).map(function(obj){ return obj.id})

  $("#commQue1").bootstrapTable('filterBy', {
    id: ides
  });

}




function showAllIssueTickets()
{

  $('#commQue1').bootstrapTable('destroy');
  $('#commQue1').bootstrapTable({
    toolbar: ".toolbar1",
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
    sortName:"updatedat",
    sortOrder :"desc",

    formatShowingRows: function(pageFrom, pageTo, totalRows){
        //do nothing here, we don't want to show the text "showing x of y from..."
        return "showing "+pageFrom+" to "+pageTo+" of " + totalRows +" entries <br/>";
    },
    formatRecordsPerPage: function(pageNumber){
        return "  "+pageNumber + " rows visible";
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

    $('#commQue1').bootstrapTable('hideColumn','id');
    $('#commQue1').on('post-body.bs.table', function () {
        $('[rel="tooltip"]').tooltip({trigger: "hover"});
     });

     $(".commQueTab input[data-field='id'][type='checkbox']").parents('li').css('display','none');
  
}




function filterByResolvedTicket(flag){
  console.log(raiseByMeTickets);
  var flag = flag=='yes'?true:false;
  var ides = raiseByMeTickets.filter(function(obj){
    if(obj.resolved===flag)
    return obj.id;
  }).map(function(obj){ return obj.id})

  console.log(ides);

  $("#commQue3").bootstrapTable('filterBy', {
    id: ides
  });

}




function showAllRaisedByMeTickets()
{

  $('#commQue3').bootstrapTable('destroy');
  $('#commQue3').bootstrapTable({
    toolbar: ".toolbar3",
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
    sortName:"updatedat",
    sortOrder :"desc",

    formatShowingRows: function(pageFrom, pageTo, totalRows){
        //do nothing here, we don't want to show the text "showing x of y from..."
        return "showing "+pageFrom+" to "+pageTo+" of " + totalRows +" entries <br/>";
    },
    formatRecordsPerPage: function(pageNumber){
        return "  "+pageNumber + " rows visible";
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

    $('#commQue3').bootstrapTable('hideColumn','id');
    $('#commQue3').on('post-body.bs.table', function () {
        $('[rel="tooltip"]').tooltip({trigger: "hover"});
     });

     $(".commQueTab input[data-field='id'][type='checkbox']").parents('li').css('display','none');
  
}

function saveTicketDataToLocaL(notresolved,raisedbyme)
{
  // preserve newlines, etc - use valid JSON
  notresolved = notresolved.replace(/\\n/g, "\\n")  
  .replace(/\\'/g, "\\'")
  .replace(/\\"/g, '\\"')
  .replace(/\\&/g, "\\&")
  .replace(/\\r/g, "\\r")
  .replace(/\\t/g, "\\t")
  .replace(/\\b/g, "\\b")
  .replace(/\\f/g, "\\f");
  // remove non-printable and other non-valid JSON chars
  notresolved = notresolved.replace(/[\u0000-\u0019]+/g,""); 

  // preserve newlines, etc - use valid JSON
  raisedbyme = raisedbyme.replace(/\\n/g, "\\n")  
  .replace(/\\'/g, "\\'")
  .replace(/\\"/g, '\\"')
  .replace(/\\&/g, "\\&")
  .replace(/\\r/g, "\\r")
  .replace(/\\t/g, "\\t")
  .replace(/\\b/g, "\\b")
  .replace(/\\f/g, "\\f");
  // remove non-printable and other non-valid JSON chars
  raisedbyme = raisedbyme.replace(/[\u0000-\u0019]+/g,""); 
  var nresolve = JSON.parse(notresolved);
  var rbyme = JSON.parse(raisedbyme);

   allIssuedTickets = nresolve.map(function(obj){
    return {id:obj._id,isIssue:obj.isIssue}
  });
   raiseByMeTickets = rbyme.map(function(obj){
    return {id:obj._id,resolved:obj.resolved}
  });
  

}








