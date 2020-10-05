//----------------- disable grading matrix, help_level_selector and duration_interpretation onces the quiz start-----------------------
$(document).ready(function(){
  var startDate2 = document.getElementById("begin_time").value;
  if(new Date(startDate2) < new Date()){
    var inputs = document.getElementsByName('duration_interpretation');
    for (var i = 0, len = inputs.length; i<len; i++){
        inputs[i].disabled = true;
    }
    var inputs = document.getElementsByName('calculator');
    for (var i = 0, len = inputs.length; i<len; i++){
        inputs[i].disabled = true;
    }
    var inputs =$("[name^=help_level_selector]");
    for (var i = 0, len = inputs.length; i<len; i++){
        inputs[i].disabled = true;
    }
    var text_ids = document.querySelectorAll('[id^="correctsc"],[id^="incorrectsc"],[id^="skipsc"]');
    for (i = 0; i < text_ids.length; i++){
      text_ids[i].disabled = true;
    }

    var inputs =$("[name^=partialGrade]");
    for (var i = 0, len = inputs.length; i<len; i++){
        inputs[i].disabled = true;
    }
  }else{}


});

//----------------------------------------------- disable opens at once the quiz starts -----------------------------------------------
$(function () {
  var pathArray = window.location.pathname.split( '/' );
  var secondLevelLocation = pathArray[1];
  if(secondLevelLocation == "author_editQuizControlBoard"){
    //Date range picker with time picker
    $('#end_time').daterangepicker({timePicker: true, timePickerIncrement: 05, singleDatePicker: true, format: 'DD MMM YYYY HH:mm'});

    var startDate = document.getElementById("begin_time").value;
    //alert(new Date(startDate));
    if (new Date(startDate) < new Date()) {
        // alert('Since quiz has been started  "Opens At" field cannot be changed !!!!');
        // return false;
       /* $('#quizStartWarning').slideUp();
        $('#quizStartWarning').slideDown();
        function success_2(){
            $('#quizStartWarning').slideUp();
        }
        setTimeout(success_2, 8000);*/

        $.notify({
          icon: "ti-info",
          message: "<b> Warning - </b> Since quiz has been started  \"Opens At\" field cannot be changed !!"
        },{
          type: "warning",
          timer: 4000,
          placement: {
              from: 'top',
              align: 'center'
          }
        });
        // $('#begin_time').daterangepicker({timePicker: true, timePickerIncrement: 05, singleDatePicker: true, format: 'DD MMM YYYY HH:mm'});
    }
    else{
      $('#begin_time').daterangepicker({timePicker: true, timePickerIncrement: 05, singleDatePicker: true, format: 'DD MMM YYYY HH:mm'});
      $('#begin_time').addClass('readOnlyCal');
    }
  }
});

//----------------------------------------------- alert on page load-----------------------------------------------
$(document).ready(function(){
  // alert('Changing the quiz metadata will cause logging out the currently logged in users !!!!');
  // return false;
    /*$('#quizWarning').slideUp();
    $('#quizWarning').slideDown();
    function success_2(){
      $('#quizWarning').slideUp();
    }
    setTimeout(success_2, 8000);*/
    var pathArray = window.location.pathname.split( '/' );
    var secondLevelLocation = pathArray[1];
    // console.log("pathArray===="+pathArray);
 if(secondLevelLocation == "author_editQuizControlBoard"){
    $.notify({
      icon: "ti-info",
      message: "<b> Warning - </b> Changing the quiz metadata will cause logging out the currently logged in users !!"
    },{
      type: "warning",
      timer: 4000,
      placement: {
          from: 'top',
          align: 'center'
      }
    });
  }  
});

//-- add codemirror
var secInstrArray = [];
if($('.secInsCls').length>0){
  var sec_count_old =0;    
  qsa(".secInsCls").forEach(function (editorEl) {      
    secInstrArray[sec_count_old] = CodeMirror.fromTextArea(editorEl, {
      mode: "demo",
      lineNumbers: false,
      lineWrapping: true,
      matchBrackets:true,
      autoCloseBrackets:true,
      autoRefresh:true,
      viewportMargin: 4
    });
    // options.push(aa.getValue());
    sec_count_old++;
  }); 
}
// end of codemirror

// get section data
function getSections() {
  var sectnArry = [];
 
  $("[id^=sectdiv_old]").each(function (index) {
      var SecData = {};
      // console.log(index)
      SecData["title"] = document.getElementById("secTitle"+index).value; 
     
      // SecData["instruction"] =  secInstr.getValue();/////////////////sec_inst.getValue()

      SecData["instruction"] = secInstrArray[index].getValue();   
      // document.getElementById("secInstr"+index).value; //
    //-----------------------------------Score Scheme-------------------------------------------    
      var jsonStringCorSc="";
      jsonObjCorSc = [];
      $("input[id=correctsc"+index+"]").each(function() {
          var value = $(this).val();
          if(value){
          jsonObjCorSc.push(value);
          }else{
          jsonObjCorSc.push("0");
          }
          // jsonObjCorSc.push(value);
      });
      jsonObjInCorSc = [];
      $("input[id=incorrectsc"+index+"]").each(function() {
          var value = $(this).val();
          if(value){
          jsonObjInCorSc.push(value);
          }else{
          jsonObjInCorSc.push("0");
          }
          // jsonObjInCorSc.push(value);
      });

      jsonObjSkCorSc = [];
      $("input[id=skipsc"+index+"]").each(function() {
          var value = $(this).val();
          if(value){
          jsonObjSkCorSc.push(value);
          }else{
          jsonObjSkCorSc.push("0");
          }
          // jsonObjSkCorSc.push(value);
      });

      //partial grading
      SecData["partialGrading"] =   $('#partialGrade'+index).prop('checked');

     

      var helpAllowed;
      $("input[name=help_level_selector"+index+"]:checked").each(function() {
          var value = $(this).val();
          helpAllowed = value;
      }); 
      SecData["helpAllowed"] = parseInt(helpAllowed);

      var helpAtReview;
      $("input[name=review_help_selector"+index+"]:checked").each(function() {
          var value = $(this).val();
          helpAtReview = value;
      }); 
      SecData["helpAtReview"] = parseInt(helpAtReview);

      ////////////start grid//////////////
        if(SecData["helpAllowed"]=='2'){
         jsonStringCorSc +="[ ["+ jsonObjCorSc+"],["+jsonObjSkCorSc+"],["+jsonObjInCorSc + "]]";
        }else
        if(SecData["helpAllowed"]=='1'){
         jsonStringCorSc +="[ ["+ jsonObjCorSc[0]+","+jsonObjCorSc[1]+","+'0'+"],["+jsonObjSkCorSc[0]+","+jsonObjSkCorSc[1]+","+'0'+"],["+jsonObjInCorSc[0]+","+jsonObjInCorSc[1]+","+'0' + "]]";
        }else
        if(SecData["helpAllowed"]=='0'){
         jsonStringCorSc +="[ ["+ jsonObjCorSc[0]+","+'0'+","+'0'+"],["+jsonObjSkCorSc[0]+","+'0'+","+'0'+"],["+jsonObjInCorSc[0]+","+'0'+","+'0' + "]]";
        }
        SecData["gradingMatrix"] =  JSON.parse(jsonStringCorSc);
      ////////////////end of grid//////////

      sectnArry.push(SecData);
  })
      return sectnArry;
}
//----------------------------------------------- verify quiz json-----------------------------------------------
$(document).ready(function() {
  function getFormDataEditQuiz(){
    fdata = {};

    fdata["quizid"] =  document.getElementById("quiz_id").value;

    var allTags = document.getElementById("tags").value;
    var tagArray = allTags.split(",");
    fdata["tags"]= tagArray;

    fdata["title"] = document.getElementById("title").value;
        
    fdata["description"] = document.getElementById("desc").value; 

    fdata["instruction"] =  quiz_intr.getValue();    

    var d = document.getElementById("duration").value;

    if(d != ""){
        fdata["duration"] = parseInt(document.getElementById("duration").value);
    }
  
   //----------------------beginTime Section-and endtime section-----------------------------------
    fdata["beginTime"] =  document.getElementById("begin_time").value;
    fdata["endTime"] =  document.getElementById("end_time").value;

    //if(document.getElementById("sectns").value != ''){
   fdata["sections"] = getSections();
    
     
   
    var loginTime;
    $("input[name=duration_interpretation]:checked").each(function() {
        var value = $(this).val();
        loginTime = value;
    });
    fdata["loginTime"] = loginTime;

    var calculator;
    $("input[name=calculator]:checked").each(function() {
        var value = $(this).val();  
        calculator = value;
    });
    fdata["calculator"] =  calculator;

    var d = new Date();
    var n = d.getTimezoneOffset();
    var timezone = n / -60;
    fdata["zone"] =  timezone;  
    return fdata; 
  }

  $("#btnGetEval").bind("click", function () {
    editqdata = getFormDataEditQuiz();
    console.log(JSON.stringify(editqdata,null,2));
    document.getElementById("data").value = JSON.stringify(editqdata);
  });
});

//----------------------------------------------- info alert on page submit -----------------------------------------------
$(function() {
   $('form#authfrm2').click(function(e) {
    e.preventDefault();
    //text: "Changing the quiz metadata will cause logging out the currently login users !!!",
    swal({
        
        text: "Are you certain about changing quiz properties?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Ok',
        buttonsStyling: false,
        allowOutsideClick: false
    }).then(function() {
      $('form#authfrm2').submit();
    },function(){

    });
    // var c = confirm("Changing the quiz metadata will cause logging out the currently login users !!!!");
    // if(c){
    //     $('form#authfrm2').submit();
    //   }
  });
});

//----------------------------------------------/////-MANAFGE QUIZ scripts-//////----------------------------------------------

//checkbox
function checkAll(ele) {
  var checkboxes = document.getElementsByTagName('input');
  if (ele.checked) {
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].type == 'checkbox') {
          checkboxes[i].checked = true;
          // $(".btnreset").css("background-color", "#68B3C8");
          // $(".btnreset").css("color","rgba(255, 255, 255, 0.85)");
          // $(".btnreset").css(" border-color", "#68B3C8");
          
           $('#btnUpdate').attr('disabled', false);
           // $(".btnreset").removeClass("fa fa-square-o");
           // $(".btnreset").addClass("fa fa-check-square-o");
      }
    }
  } else {
    for (var i = 0; i < checkboxes.length; i++) {
      // console.log(i)
      if (checkboxes[i].type == 'checkbox') {
          checkboxes[i].checked = false;
          $('#btnUpdate').attr('disabled', true);
          // $(".btnreset").removeClass("fa fa-check-square-o");
      }
    }
  }
}

$(document).ready(function(){
  $("#example1").on('change','input[name=chkbox_ids]',function(){
  // $('input:checkbox[id=chkbox_ids]').on('change', function() {
    var assignedTo = $('input:checkbox[name=chkbox_ids]:checked').map(function() {
      return this.value;
    })
    .get();  
       //Out for DEMO purposes only 
       // $('pre.out').text( JSON.stringify( assignedTo ) );
    var textbox3 = document.getElementById('quiz_reset_ids');
    textbox3.value=JSON.stringify(assignedTo);
    // textbox3.value=assignedTo;
    
    if (this.checked){
    color = Math.floor((Math.random() * 4) + 1);
    $.notify({
      icon: "ti-info",
      message: this.value+" mark to reset. \"Click Save/reset Quiz\" button to reset Quiz."
    },{
      type: "info",
      timer: 4000,
      placement: {
          from: 'top',
          align: 'center'
      }
    });
    }
  });
});

$(document).ready(function(){ 
  // $('input:checkbox[id=chkall]').on('change', function() {
   $(".toolbar").on('change','input[id=chkall]',function(){
      var assignedTo = $('input:checkbox[name=chkbox_ids]:checked').map(function() {
        return this.value;
      })
      .get();     
         //Out for DEMO purposes only 
         // $('pre.out').text( JSON.stringify( assignedTo ) );
      var textbox3 = document.getElementById('quiz_reset_ids');
      textbox3.value=JSON.stringify(assignedTo);
      // textbox3.value=assignedTo;
      if (this.checked){
        color = Math.floor((Math.random() * 4) + 1);
        $.notify({
          icon: "ti-info",
          message: "All Quiz mark to reset. \"Click Save/reset Quiz\" button to reset Quiz."
        },{
          type: 'info',
          timer: 4000,
          placement: {
              from: 'top',
              align: 'center'
          }
        });
      }
  });
});


// save data json function
$(document).ready(function() {
  function getFormDataManage(){
    fdata = {};
    fdata["quizid"]=document.getElementById("quiz_id").value;
    
    //----------------------split score and review value------------------------------------------------------------
    jsonObjscores1 = [];
    $("input[name=score_avalb__selector1]:checked").each(function() {
      var value = $(this).val();
      jsonObjscores1.push(value);
    });
   
    // console.log("jsonObjscores1--- score---"+jsonObjscores1);
    var scoreArray = jsonObjscores1[0].split(",");
    // console.log("score---"+scoreArray);
    // console.log("score---"+scoreArray[0]);
    // console.log("review---"+scoreArray[1]);
    

    //----------------------review Section------------------------------------------------------------
     fdata["review"]=scoreArray[1];

    //----------------------score Section------------------------------------------------------------
    fdata["score"]=scoreArray[0];

    //----------------------security Section------------------------------------------------------------
    var jsonObjsecurity1 ;
    $("input[name=security_level]:checked").each(function() {
      var value = $(this).val();
      jsonObjsecurity1 = value;
    });
    fdata["security"]= jsonObjsecurity1;

    //----------------------credentials Section------------------------------------------------------------
    var res ="";
    var arr = document.getElementById('arr').value;
    var arr1 = arr.split(",");
    var arr_length = document.getElementById('arr_length').value;
    
    for(var j=0; j< arr_length; j++){
      // console.log("arr--"+arr1[j]+"--");
      pwd = document.getElementById('password'+arr1[j]).value;
      takr = document.getElementById('taker'+arr1[j]).innerHTML;
       res += JSON.stringify(takr)+":"+JSON.stringify(pwd)+",";
    }

    fdata["credentials"]=JSON.parse("{"+res.slice(0, -1)+"}");

    //----------------------reset Section------------------------------------------------------------
    var resetids = document.getElementById('quiz_reset_ids').value;
    if(resetids == ""){
      fdata["reset"]=[];
    }else{
      fdata["reset"]=JSON.parse(resetids);
    }
    return fdata;
  }

  $("#btnUpdate").bind("click", function () { 
      getEvalData = getFormDataManage(); 
      document.getElementById('takers_data').value = JSON.stringify(getEvalData) ; 
      // console.log("Data111: "+JSON.stringify(getEvalData));
  }); 
});

//submit alert msg
$(function() {
  $('form#add_form').click(function(e) {
    var author= document.getElementById('author').value;
    var type= document.getElementById('type').value;
    var takers_data= document.getElementById('takers_data').value;
    var arr= document.getElementById('arr').value;
    var arr_length= document.getElementById('arr_length').value;
    var quiz_reset_ids= document.getElementById('quiz_reset_ids').value;
    var quiz_id= document.getElementById('quiz_id').value;
    var log_Id= document.getElementById('log_Id').value;
    var log_Token= document.getElementById('log_Token').value;
    e.preventDefault();
    var resetids = document.getElementById('quiz_reset_ids').value;
    swal({
        title: 'Are you sure?',
        text: "The password will changed for selected ids and for \""+resetids+"\" ids quiz will be reset.",
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
     
          $.ajax({
              type: 'post',
              data: {
                  'author': author,
                  'type': type,
                  'takers_data': takers_data,
                  'arr': arr,
                  'arr_length': arr_length,
                  'quiz_reset_ids': quiz_reset_ids,
                  'quiz_id': quiz_id,
                  'log_Id': log_Id,
                  'log_Token': log_Token
              },
              url: '/author_changePwdAndResetQuiz', 
              cache: false,
              success: function (returndata) {
                  if (returndata) {
                      // $('#bsModal3 .modal-body p').modal('show'); // Please right this in your Code
                      // console.log(returndata);
                      $('.ld').hide();
                      $('.wrapper').removeClass('ld-over-full-inverse running');
                      $('#bsModal3 .modal-body p').html(returndata);
                      $('#bsModal3').modal({backdrop: "static"});
                  } else {
                    $('.ld').hide();
                    $('.wrapper').removeClass('ld-over-full-inverse running');
                      // other code
                  }
              },
              error: function (err) {
                $('.ld').hide();
                $('.wrapper').removeClass('ld-over-full-inverse running');
                  console.error('Failed to process ajax !');
                  $('#bsModal3 .modal-body p').html('<div class="error"><i class="fa fa-warning"></i> Server is not responding. Please try again after some time</div>');
                  $('#bsModal3').modal({backdrop: "static"});
              }
          });
    });
    
    // var c = confirm("The password will changed for selected ids and for \""+resetids+"\" ids quiz will be reset.");
    // if(c){
    //     $('form#add_form').submit();
    //   }
  });
});

  $(function () {
      $('#bsModal3').on('hidden.bs.modal', function () { // do something� })
          $("#viewModalContent").html(" <p></p>");
         
      })
  });


///////// for number field checking only interger value

var correctsc = document.getElementById('correctsc');
if(correctsc!==null) //
correctsc.onkeyup = correctsc.onchange = enforceFloat;

var skipsc = document.getElementById('skipsc');
if(skipsc!==null) //
skipsc.onkeyup = skipsc.onchange = enforceFloat;

var incorrectsc = document.getElementById('incorrectsc');
if(incorrectsc!==null) //
incorrectsc.onkeyup = incorrectsc.onchange = enforceFloat;


//enforce that only a float can be inputed   
function enforceFloat() {
  var valid = /^\-?\d+\.\d*$|^\-?[\d]*$/;
  var number = /\-\d+\.\d*|\-[\d]*|[\d]+\.[\d]*|[\d]+/;
  if (!valid.test(this.value)) {
    var n = this.value.match(number);
    this.value = n ? n[0] : '';
  }
}


///// show grading matrix according to help selector
$(document).ready(function () {
  $('input[name=help_level_selector]').on('change', function() {
     alert('ddd');
      var helpAllowed;
        $("input[name=help_level_selector]:checked").each(function() {
            var value = $(this).val();
            helpAllowed = value;
                    //jsonObjhelpAllowed.push(value);
        });
        var helpSelector=parseInt(helpAllowed);

      if(helpSelector == "0"){
          $('.hintCol').hide();
          $('.expCol').hide();
          // console.log("hint and explanation hide")
      }else if(helpSelector == "1"){
          // console.log("only explanation hide")
          $('.hintCol').show();
          $('.expCol').hide();
      }else if(helpSelector == "2"){
          // console.log("show all")
          $('.hintCol').show();
          $('.expCol').show();
      }else{
          // console.log("show all")
          $('.hintCol').show();
          $('.expCol').show();
      }
  });


}); 


function editGridMatrix(idx,helpSelector){
  
    // console.log(helpSelector);
    if(helpSelector == "0"){
        $('.hintCol'+idx).hide();
        $('.expCol'+idx).hide();
        // console.log("hint and explanation hide")
    }else if(helpSelector == "1"){
        // console.log("only explanation hide")
        $('.hintCol'+idx).show();
        $('.expCol'+idx).hide();
    }else if(helpSelector == "2"){
        // console.log("all show")
        $('.hintCol'+idx).show();
        $('.expCol'+idx).show();
    }else{
        // console.log("show all")
        $('.hintCol'+idx).show();
        $('.expCol'+idx).show();
    }


}



function checkReviewHelpLevel(idx,helpSelectorReview){
  var helpAllowed;
  $("input[name=help_level_selector"+idx+"]:checked").each(function() {
      var value = $(this).val();
      helpAllowed = value;
  });
  var helpSelector=parseInt(helpAllowed);
  // console.log(helpSelector);
  // console.log(helpSelectorReview);
  var allVal={}
allVal[0]="All Values are allowed";
allVal[1]="Allowed Values are 'Help Allowed' and 'Hint and Explanation Allowed'";
allVal[2]="Only 'Hint and explanation allowed'";
  if(helpSelector <= helpSelectorReview){
    // console.log("allowed")
  }else{
      swal({
          type: 'error',
          title: 'Error',
          html: allVal[helpSelector]
      }).then((willDelete) => {
          $("#review_help_selector"+idx).val('');
          $("[name=review_help_selector"+idx+"]").val([""]);
        });
      
      // console.log("not allowed")
      
  }


}

function checkReviewHelpLevelEdit(idx,helpSelectorReview,oldVal){
  var helpAllowed;
  $("input[name=help_level_selector"+idx+"]:checked").each(function() {
      var value = $(this).val();
      helpAllowed = value;
  });
  var helpSelector=parseInt(helpAllowed);
  // console.log(helpSelector);
  // console.log(helpSelectorReview);
  // console.log(oldVal)
  var allVal={}
allVal[0]="All Values are allowed";
allVal[1]="Allowed Values are 'Help Allowed' and 'Hint and Explanation Allowed'";
allVal[2]="Only 'Hint and explanation allowed'";
  if(helpSelector <= helpSelectorReview){
    // console.log("allowed")
  }else{
      swal({
          type: 'error',
          title: 'Error',
          html: allVal[helpSelector]
      }).then((willDelete) => {
          // $("#review_help_selector"+idx).val(oldVal);
          $("[name=review_help_selector"+idx+"]").val([oldVal]);
        });
      
      // console.log("not allowed")
      
  }


}


