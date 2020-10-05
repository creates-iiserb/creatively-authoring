/*------add to playlist scripts or functions starts------*/
function checkAll(ele) {
    console.log("author.js====");
    var checkboxes = document.getElementsByTagName('input');
    if (ele.checked) {
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
            checkboxes[i].checked = true;
        }
      }
    } else {
      for (var i = 0; i < checkboxes.length; i++) {
        
        if (checkboxes[i].type == 'checkbox') {
            checkboxes[i].checked = false;
            var name = checkboxes[i].getAttribute('name');
           
        }

        
      }
    }
  }
//author_dashboard_prog
// $(document).ready(function(){
  // to display tooltip 
    // $('[data-toggle="tooltip"]').tooltip();

function addquescheck(){
$(':checkbox[id=chkall]').on('change', function() {
          var res ="";
          var fdata = {};
          var assignedTo = $(':checkbox[name=chkbox_ids]:checked').map(function() {
            // return this.value;
            // res += JSON.stringify(this.value)+":"+5+",";
            // fdata[this.value]=5;
            res += this.value+",";
          })
          .get();     
             //Out for DEMO purposes only 
             // $('pre.out').text( JSON.stringify( assignedTo ) );
          var textbox3 = document.getElementById('ques_ids1');
          // textbox3.value=JSON.stringify(fdata);
          textbox3.value = res.slice(0, -1);
          console.log("textbox3.value--=="+res.slice(0, -1));
          if(textbox3.value.length > 2 ){
            document.getElementById('add_to_playlist').disabled = false; //remove disabled attribute from button
          }
          else if(textbox3.value == ""){
              document.getElementById('add_to_playlist').disabled = true; //remove disabled attribute from button
          }else{
            document.getElementById('add_to_playlist').disabled = true; //remove disabled attribute from button
          }
      });

    $(':checkbox[name=chkbox_ids]').on('change', function() {
          var res ="";
          var fdata = {};
          var assignedTo = $(':checkbox[name=chkbox_ids]:checked').map(function() {
            // return this.value;
            // res += JSON.stringify(this.value)+":"+5+",";
            // fdata[this.value]=5;
            res += this.value+",";
             // res += "{\"item\":"+JSON.stringify(this.value)+",\"weight\":5,\"weight\":5,\"property\":\"none\"},"
            // return res;
          })
          .get();     
          var textbox3 = document.getElementById('ques_ids1');
          // textbox3.value=JSON.stringify(fdata);
          textbox3.value=res.slice(0, -1);
          console.log("textbox3.value--=="+res.slice(0, -1));
          if(textbox3.value.length > 2 ){
            document.getElementById('add_to_playlist').disabled = false; //remove disabled attribute from button
          }
          else if(textbox3.value == "" ){
              document.getElementById('add_to_playlist').disabled = true; //remove disabled attribute from button
          }else{
            document.getElementById('add_to_playlist').disabled = true; //remove disabled attribute from button
          }
      });
  
}


// add single question to playlist 
function addToPlaylistSingle(qid)
{  
  var textbox3 = document.getElementById('ques_ids1');
  if(textbox3.value.trim()=="")
  {
    var playlistArray = [];
  }else 
  {
    var playlistArray = textbox3.value.split(',');
  }
    
  if(playlistArray.indexOf(qid)==-1)
  {
    playlistArray.push(qid);
  }

  textbox3.value = playlistArray.join(',');
  //alert(textbox3.value);
  console.log(textbox3.value);
  $('#addtoplaylist').modal('show');
  
}
    
/*------add to playlist scripts or functions ends------*/
$(document).ready(function(){
/*------playlist name script or functions starts------*/
    // $('#playlist_name').keypress(function (e) {
    // var regex = /^[a-zA-Z0-9_.\s]*$/;
    // var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    // if (regex.test(str)) {
    //     return true;
    // }
    // // e.preventDefault();
    // return false;
    // });

    $('#section_name1').on('change', function() {
      var textbox3 = document.getElementById("section_name1").value;
      if($('#add_playlist').length>0)
      {
        if(textbox3 != ""){
          document.getElementById("add_playlist").disabled=false; //remove disabled attribute from button
        }
        else if(textbox3 == ""){
          document.getElementById("add_playlist").disabled=true; //remove disabled attribute from button
        }

      }
      
    });

    $('#playlist_name').on('keyup', function() {
      var textbox3 = document.getElementById("playlist_name").value;

      if($('#add_playlist1').length>0)
      {
      if(textbox3 != ""){
        document.getElementById("add_playlist1").disabled=false; //remove disabled attribute from button
      }
      else if(textbox3 == ""){
        document.getElementById("add_playlist1").disabled=true; //remove disabled attribute from button
      }
     }
    });

    $(document).ready(function(){
    	$('#add_playlist1').on('click', function() {
            var str = $('#playlist_name').val();
    	      if(str != ""){
    	      }
    	      else {
    	        swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Field cannot be empty !!'
                });
    	      }
    	});
    });
/*-------playlist scripts or functions ends------*/

// dashboard_prog -  list of questions under development
    // $('#underDev').DataTable( {
    //     "order": [[ 0, "desc" ]]
    //     } );
/*//  dashboard_comm - list of comitted content
     $('#commQue').DataTable( {
        "order": [[ 0, "desc" ]]
        } );

     $('#examplecollb1').DataTable( {
        "order": [[ 0, "desc" ]]
        } );

     $('#examplecollb2').DataTable( {
        "order": [[ 0, "desc" ]]
        } );
    // quizdash - list of quizzes
    $('#quizList').DataTable( {
      "order": [[ 0, "desc" ]]
    } );*/
});



$(function () {
  $('[data-toggle="popover"]').popover({
    template:'<div class="popover popStyle" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
    html: true,
    trigger: 'click',
    placement:'top',
  });

    $('[rel="tooltip"]').tooltip({
        template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        placement:'top',
        trigger:'click'
    });
});


//  clear all last view logout;
$(function(){

  $('a[href="/author_logout"]').on('click',function(){
     sessionStorage.clear();
  });

});



//utc to local date conversation

function UTCtoLocalDate(d,t){
 
	var date= new Date(d);
	var localFormat = date.toString();
	var localDate = new Date(localFormat);
	let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	
    var dd = localDate.getDate();//dat
    // Oct 11, 2018
    if (dd < 10) { dd = '0' + dd }//    
	let ldate = month[localDate.getMonth()] + " " + dd + ", " + localDate.getFullYear();
	
  if(t!==null)
  {
    var hours = localDate.getHours();
    hours = hours<10?'0'+hours:hours;
    var minutes = localDate.getMinutes();
    minutes = minutes<10?'0'+minutes:minutes;
    var seconds = localDate.getSeconds();
    seconds = seconds<10?'0'+seconds:seconds;
    ldate = ldate + " "+hours+":"+minutes+":"+seconds;
  }
	  
	 
    return ldate;

}

// ticket counter
// function LoadTicketCounter()
// {
//     $.ajax({
//         type    : "post",        
//         url     :  "/author_counterTickets",
//         dataType: "json",
//         success : function(data){
           
//            if(data.status=="success")
//            {
//                 var bqNumber = (data.ticektNotResolve.length)?data.ticektNotResolve.length:'';
//                 $('#questTicektCounter').html(bqNumber);
//                 if(bqNumber!='') 
//                 $('#questTicektCounter').show();                            
                
//            }

           
//         }
//     });
// }


//load 
// function LoadBasketData()
// {   
    
//     $.ajax({
//         type    : "post",        
//         url     :  "/author_getBaseketQuestions",
//         dataType: "json",
//         success : function(data){
           
//            if(data.status=="ok")
//            {
//                 var bqNumber = (data.bquestions.length)?data.bquestions.length:'';
//                 $('#basketquestionCounter').html(bqNumber);
//                 if(bqNumber!='')
//                 $('#basketquestionCounter').show();
//                 //new 13sept18               
//                 sessionStorage['basketitems'] = JSON.stringify(data.bquestions);
               
                
//            }else
//            if(data.status=="fail")
//            {
//             sessionStorage['basketitems'] = JSON.stringify(data.bquestions);   
//            }
//         }
//     });
// }



// $(document).ready(function(){
//   LoadTicketCounter();
//  });





function flyToElement(flyer, flyingTo) {
    var $func = $(this);
    var divider = 3;
    var flyerClone = $(flyer).clone();
    $(flyerClone).css({position: 'absolute', top: $(flyer).offset().top + "px", left: $(flyer).offset().left + "px", opacity: 1, 'z-index': 1000});
    $('body').append($(flyerClone));
    var gotoX = $(flyingTo).offset().left + ($(flyingTo).width() / 2) - ($(flyer).width()/divider)/2;
    var gotoY = $(flyingTo).offset().top + ($(flyingTo).height() / 2) - ($(flyer).height()/divider)/2;
     
    $(flyerClone).animate({
        opacity: 0.4,
        left: gotoX,
        top: gotoY,
        width: $(flyer).width()/divider,
        height: $(flyer).height()/divider
    }, 1000,
    function () {
        $(flyingTo).fadeOut('fast', function () {
            $(flyingTo).fadeIn('fast', function () {
                $(flyerClone).fadeOut('fast', function () {
                    $(flyerClone).remove();
                });
            });
        });
    });
}


      // function fly(ele){
       
      //  //Select item image and pass to the function
      //   var itemImg =  $(ele).find('img').eq(0).show();;
      //   flyToElement($(itemImg), $('.flyBasket'));
      //   $(ele).find('img').eq(0).hide();
      // }

      // Restricts input for the given textbox to the given inputFilter.
function customInputFilter(elementID, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    elementID.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
    });
  });
}


//show last open worksheet after refresh
if(window.location.pathname!="/author_getWorkSheets"){
  try{
    sessionStorage.removeItem("EworksheetID");
  }catch(err){

  }
}