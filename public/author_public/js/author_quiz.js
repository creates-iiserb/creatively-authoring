/////////////////////////////////------------------------------- quiz new ----------------------------------------////////////////////////////////////
//rm below
function countSectionTemplate(){
    var newparent = $(".headSec");
    var orderchilds = newparent.find('.countSection');
    var indexnumber = 1;
        orderchilds.each(function(i,val){
        $(this).html("Section " +indexnumber);
        indexnumber++;
    });
}

//rm below
function countSectionDyn(){
    var newparent = $(".headSec");
    var orderchilds = newparent.find('.countSection');
    var indexnumber = 1;
        orderchilds.each(function(i,val){
            console.log(indexnumber)
        $(this).html("Section " +indexnumber);
        indexnumber++;
    });
}


function countSection(){
    var newparent = $(".headSec");
    var orderchilds = newparent.find('.countSection');
    var indexnumber = 2;
        orderchilds.each(function(i,val){
        $(this).html("Section " +indexnumber);
        indexnumber++;
    });
}



$(document).ready(function(){
    demo.initWizard();
    demo.initSectionWizard();

    $('#start_date').daterangepicker({timePicker: true, timePickerIncrement: 05, format: 'DD MMM YYYY HH:mm'});
    

    $('#playlist_name').on('change', function() {
        var str = document.getElementById('playlist_name').value;
        // alert("queIds"+queIds);
        var res = str.split(" - ");
        var queIds = res[0];
        var playlistName = res[1];
        var playlistId = res[res.length-1];
        // var queLen = queIds.split(",");
        // console.log("id_question length"+queLen.length);

        // if(queLen.length<=6){
        //     document.getElementById('number').value = queLen.length;
        // }else{
        //     document.getElementById('number').value = 6;
        // }
        
        // document.getElementById('id_question').value = queIds;
        $('#maxquesId').html("");
        document.getElementById('playlist_name_hidden').value = playlistName;


        var authorname= document.getElementById('authorname').value;
        

        var user_dataAuth = new Object;
        user_dataAuth.name = playlistName;
        user_dataAuth.author = authorname;
        user_dataAuth.playlistId = playlistId;

        $.post("/author_playlistAuthCheck", user_dataAuth, function (data) {
            if (data.status == 'success') {
                // console.log("success")
                // console.log(data.msg)
                $('#authError').html("");
                $('#playlist_name').removeClass('error');
                $("#section_name").removeAttr('disabled');
                $("#nextBtn").removeAttr('disabled');
                $("#backBtn").removeAttr('disabled');
                get_SectionName();
            }
            else if (data.status == 'error') {
                // console.log("error")
                // console.log(data.msg)
                $('#playlist_name').addClass('error');
                $('#authError').html("<small><b>Their are some unauthorized items in this playlist ("+playlistName+"). You are authorized to keep content that is authored by you or collaborator in playlist or if it is a public content.</b></small>");
                $("#section_name").attr('disabled', 'disabled');
                document.getElementById('number').value = '';
                $("#nextBtn").attr('disabled', 'disabled');
                $("#backBtn").attr('disabled', 'disabled');
            }
        });
    });
});


var email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var emailcheck = false;
var usercheck = false;

$(document).ready(function(){
     // add new option card 
     var counterDyn = 6;
     $("body").on('click', '#btnAddsectionDyn', function () {
      //  alert('author_quiz.js');
        var maxVal = 5;
        var playlistdata=$(this).attr('data-playlist');
        var collb1=$(this).attr('data-collb1');
        var collb2=$(this).attr('data-collb2');

        var currVal = $("#allSectionsDyn > [id^='sectdiv']").length;
        
        if (currVal < maxVal) {
            $("#allSectionsDyn").append(newSection(counterDyn,playlistdata,collb1,collb2));
            countSection(); // countSectionDyn(); --
            counterDyn++;
        } else {
            swal("Only " + maxVal + " sections are allowed !");
        }
    });
    // to delete a  question
    $("body").on("click", "#deleteSection", function () {
        // counter--;
        $(this).closest("[id^='sectdiv']").remove();   
        $("#nextBtn").removeAttr('disabled');
        $("#backBtn").removeAttr('disabled');     
        countSection();  //countSectionDyn --
    });
});






//get section name acc to playlist name
function get_SectionName() {
    var plname = document.getElementById('playlist_name').value;
    var res = plname.split(" - ");
    var queIds = res[0];
    var playlistName = res[1];
    var playlistId = res[res.length-1];
    if (plname != '') {
        var user_data2 = new Object;
        user_data2.name = playlistName;
        user_data2.playlistId = playlistId;

        $.post("/author_getSectionsList", user_data2, function (data) {
            if (data.status == 'success') {
                $("#section_name").html("<option value=''> Select </option>");
                $('#section_name').show();
                console.log(data.sectionName);
                // console.log(data.sectionCon);
                $("#sectionCon").val(JSON.stringify(data.sectionCon));
                var secQuesLen = new Array();
                for(var i=0;i<data.sectionName.length;i++){
                    $('#section_name').append('<option value="'+data.sectionName[i]+'">'+data.sectionName[i]+'</option>');
                }
            }
            else if (data.status == 'error') {
                $('#section_name').hide();
                swal({
                    type: 'error',
                    title: 'Error',
                    html: data.msg
                });
            }
        });
    } else {
        $('#section_name').hide();
        swal({
            type: 'error',
            title: 'Error',
            html: 'Please select playlist name !!'
        });
    }
}

$(document).ready(function(){
    $('#section_name').on('change', function() {
        var sectionName = document.getElementById('section_name').value;
        // console.log(sectionName)
    
        var secCon = JSON.parse(document.getElementById('sectionCon').value);

        // console.log(document.getElementById('sectionCon').value);



        var queLen = secCon[sectionName];
        // console.log(queLen);
        // console.log("id_question length"+queLen.length);

        if(queLen == undefined){
            document.getElementById('number').value = '';
            document.getElementById('id_question').value = '';
            $('#number').addClass('error');
            $("#nextBtn").attr('disabled', 'disabled');
            $("#backBtn").attr('disabled', 'disabled');
            $('#maxquesId').html("<small><b>This Section is empty, Minimum 1 questions is required in section</b></small>");
        }else{
           if(queLen.length<=50){
            document.getElementById('number').value = queLen.length;
            $('#maxquesId').html("");
            $("#nextBtn").removeAttr('disabled');
            $("#backBtn").removeAttr('disabled');
            $('#number').removeClass('error');
        }else{
            document.getElementById('number').value = queLen.length;
            $('#number').addClass('error');
            $('#maxquesId').html("<small><b>Maximum 50 questions are allowed in one section</b></small>");
        } 

        document.getElementById('id_question').value = queLen;
        }
                
        document.getElementById('section_name_hidden').value = sectionName;
    });
});

function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    //if (charCode > 31 && (charCode < 48 || charCode > 57))
    if (charCode < 48 || charCode > 57)
        return false;
        return true;
}

function validationCheck(){   
    var tags_ary  = new Array();
    var arr = document.getElementById('tags').value; // tags
    tags_ary  = arr.split(",");
    var tags_ary_length = tags_ary.length;
    if(tags_ary_length<3){
      // alert("Minimum 3 tags required !!!");
      swal(
      'Error...',
      'Minimum 3 tags required !!',
      'error'
      );
      return false;
    }

    // var id_students=document.getElementById('id_students').value ; // Quiz Takers
    // var txtFileUpload=document.getElementById('txtFileUpload').value ; // Quiz Takers
    // var loadTblData=document.getElementById('loadTblData').value ; // Quiz Takers
    // // console.log("fddf======"+txtFileUpload+"---------------"+id_students);
    // if(id_students== "" ){
    //     if(txtFileUpload==""){
    //         // alert("Quiz Takers field is required !!!");
    //         if(loadTblData==""){
    //             swal(
    //             'Error...',
    //             'Quiz Takers field is required !!',
    //             'error'
    //             );
    //             // document.getElementById('id_instruction').focus();
    //             return false;
    //         }
    //     }
    // }
   

    var id_instruction = quiz_intr.getValue(); //Instruction
    if(id_instruction== ""){
      // alert("Instruction field is required !!!");
      swal(
      'Error...',
      'Instruction field is required !!',
      'error'
      );
      // document.getElementById('id_instruction').focus();
      return false;
    }
    return true;
}


function randomString(len, an){
	an = an&&an.toLowerCase();
	var str="", i=0, min=an=="a"?10:0, max=an=="n"?10:62;
	for(;i++<len;){
	  var r = Math.random()*(max-min)+min <<0;
	  str += String.fromCharCode(r+=r>9?r<36?55:61:48);
	}
	return str;
}

var allowedExtensions = {
'.csv' : 1,
'.CSV' : 1,
};
    
function checkExtension(filename)
{
  var match = /\..+$/;
  var ext = filename.match(match);
  if (allowedExtensions[ext])
  {
    var size = document.getElementById('takersFile').files[0].size;
    document.getElementById("id_students").disabled=true;
    if(size <= 512000){ // 100kb= 102400 bytes; 500kb=512000 bytes

      return true;
    }
    else{
      swal(
      'Error...',
      'Only upto 500 kb file can be uploaded !!',
      'error'
    );
      document.getElementById("takersFile").value="";
      document.getElementById("id_students").disabled=false;
    }
  }
  else
  {
    swal(
      'Error...',
      'Invalid File Extension, file must be in CSV format.',
      'error'
    );
    //will clear the file input box.
    //location.reload();
    document.getElementById("takersFile").value="";
    document.getElementById("id_students").disabled=false;
    return false;
  }
}

$(document).ready(function() {

    function getFormData(){
    fdata = {};

    fdata["author"] = document.getElementById("author").value;

    var allTags = document.getElementById("tags").value;
    var tagArray = allTags.split(",");
    fdata["tags"]= tagArray;

    fdata["title"] = document.getElementById("title").value;

    fdata["description"] = document.getElementById("desc").value; 


    var SecData = {};


//----------------------Instruction Section------------------------------------------------------------
    SecData["instruction"] =  quiz_intr.getValue();

    SecData["playlist"] = document.getElementById("playlist_name_hidden").value;

    SecData["sectionName"] = document.getElementById("section_name_hidden").value;
//----------------------Question ID Section------------------------------------------------------------
    var allPool = document.getElementById("id_question").value;
    var poolArr = allPool.split(",");
    SecData["pool"]= poolArr;     

            // fdata["pool"] = JSON.parse(poolArr);
            // jsonStringQid += jsonObjQid+"]";
            // var  newString= poolArr.split(',').join('","');
//----------------------------------Number Section---------------------------------------------------------
    SecData["choose"] = parseInt(document.getElementById("number").value); 

    SecData["arrangement"] = $("#order option:selected" ).val();
 //-----------------------------------Score Scheme-------------------------------------------    
            var jsonStringCorSc="";
            jsonObjCorSc = [];
            $("input[id=correctsc]").each(function() {
                var value = $(this).val();
                if(value){
                  jsonObjCorSc.push(value);
                }else{
                  jsonObjCorSc.push("0");
                }
                // jsonObjCorSc.push(value);
            });
            jsonObjInCorSc = [];
            $("input[id=incorrectsc]").each(function() {
                var value = $(this).val();
                if(value){
                  jsonObjInCorSc.push(value);
                }else{
                  jsonObjInCorSc.push("0");
                }
                // jsonObjInCorSc.push(value);
            });

            jsonObjSkCorSc = [];
            $("input[id=skipsc]").each(function() {
                var value = $(this).val();
                if(value){
                  jsonObjSkCorSc.push(value);
                }else{
                  jsonObjSkCorSc.push("0");
                }
                // jsonObjSkCorSc.push(value);
            });

            var helpAllowed = $("#help_level_selector option:selected" ).val();
            fdata["helpAllowed"] = parseInt(helpAllowed);

            var helpAtReview = $("#help_level_selectorReview option:selected" ).val();
            fdata["helpAtReview"] = parseInt(helpAtReview);

            ////////////start grid//////////////
                if(fdata["helpAllowed"]==2){
                jsonStringCorSc +="[ ["+ jsonObjCorSc+"],["+jsonObjSkCorSc+"],["+jsonObjInCorSc + "]]";

                }else
                if(fdata["helpAllowed"]==1){
                jsonStringCorSc +="[ ["+ jsonObjCorSc[0]+","+jsonObjCorSc[1]+","+'0'+"],["+jsonObjSkCorSc[0]+","+jsonObjSkCorSc[1]+","+'0'+"],["+jsonObjInCorSc[0]+","+jsonObjInCorSc[1]+","+'0' + "]]";

                }else
                if(fdata["helpAllowed"]==0){
                jsonStringCorSc +="[ ["+ jsonObjCorSc[0]+","+'0'+","+'0'+"],["+jsonObjSkCorSc[0]+","+'0'+","+'0'+"],["+jsonObjInCorSc[0]+","+'0'+","+'0' + "]]";
                }
            ////////////////end of grid//////////

            SecData["gradingMatrix"] =  JSON.parse(jsonStringCorSc);


            var SecDataArr =[];
            SecDataArr.push(SecData);
            fdata["sections"]= SecDataArr; 


 //----------------------Student ID Section------------------------------------------------------------csvJson
            // var allStu = document.getElementById("id_students").value;
            // var new_str = allStu.replace(" ","","g");
            // var new_str = allStu.replace(/\s+/g, "");
           
            // var stuArr = new_str.split(",");
            
            var takdata ={};

            var csvJsonData = $("#csvJson").val();
            var arryJsonData = $("#arryJson").val();

            if(document.getElementById("txtFileUpload").value==""){
                takdata["userData"]= JSON.parse(arryJsonData);  
            }else{
                takdata["userData"]= JSON.parse(csvJsonData); 
            }
            
//----------------------send email Section------------------------------------------------------------
            var sentEmail = '';
            $("input[name=sndEmailAllow]:checked").each(function() {
                var value = $(this).val();  
                sentEmail = value;
            });

            var sentEmailArry = '';
            $("input[name=sndEmailAllowArry]:checked").each(function() {
                var value = $(this).val();  
                sentEmailArry = value;
            });



            if(document.getElementById("txtFileUpload").value==""){

                if(sentEmailArry == "yes"){
                    takdata["sendEmail"] = true;
                }else{
                    takdata["sendEmail"] = false;
                } 
                // fdata["sendEmail"] =  sentEmailArry;
            }else{

                if(sentEmail=="yes"){
                    takdata["sendEmail"] = true;
                }else{
                    takdata["sendEmail"] = false;
                }
            }

//----------------------email col Section------------------------------------------------------------
            if(document.getElementById("txtFileUpload").value==""){
                if(sentEmailArry=="yes"){
                    takdata["emailCol"]= "A"; 
                }else{
                    takdata["emailCol"]= ""; 
                }
            }else{
                takdata["emailCol"] = $("#selectEmailCol option:selected" ).attr('data-col');
            }

//----------------------username col Section------------------------------------------------------------
            if(document.getElementById("txtFileUpload").value==""){
                takdata["userCol"]= "A";
            }else{
                takdata["userCol"] = $("#selectuserIdCol option:selected" ).attr('data-col');
            }


            // console.log(takdata);


            fdata["takers"]= takdata; 

 //----------------------duration  Section------------------------------------------------------------

            var d = document.getElementById("duration").value;
            if(d != "" ){
                fdata["duration"] = parseInt(document.getElementById("duration").value);
            }

            fdata["period"] =  document.getElementById("start_date").value; 

//----------------------timezone Section------------------------------------------------------------

            var d = new Date();
            var n = d.getTimezoneOffset();
            var timezone = n / -60;
            fdata["zone"] =  timezone;   

            
            

            /*var scores;
            $("input[name=score_avalb__selector]:checked").each(function() {
                var value = $(this).val();
                scores = value;
            });
            fdata["score"] =  scores;*/

           /* var review;
            $("input[name=review_selector]:checked").each(function() {
                var value = $(this).val();
                review = value;
            });
            fdata["review"] = review;*/

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
            
            var security;
            $("input[name=security_level]:checked").each(function() {
                var value = $(this).val();  
                security = value;
            });
            fdata["security"] =  security;

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

            return fdata;
        }
        
        $("#btnGetEval").bind("click", function () {
            alert("simple quiz");
            if(validationCheck()) {
                qdata = getFormData();
                console.log(JSON.stringify(qdata,null,2));                
                document.getElementById("data").value = JSON.stringify(qdata);

                var data= document.getElementById('data').value;
                var type= document.getElementById('type').value;
                var authorname= document.getElementById('authorname').value;
                var playlist_name_hidden= document.getElementById('playlist_name_hidden').value;
                var section_name_hidden= document.getElementById('section_name_hidden').value;
                var log_Id= document.getElementById('log_Id').value;
                var log_Token= document.getElementById('log_Token').value;
                $('.ld').show();
                $('.wrapper').addClass('ld-over-full-inverse running');
                
                 $.ajax({
                     type: 'post',
                     data: {
                         'data': data,
                         'type': type,
                         'authorname': authorname,
                         'playlist_name_hidden': playlist_name_hidden,
                         'section_name_hidden': section_name_hidden,
                         'log_Id': log_Id,
                         'log_Token': log_Token
                     },
                     url: '/author_postquestion',
                     cache: false,
                     success: function (returndata) {
                         if (returndata) {
                             $('.ld').hide();
                             $('.wrapper').removeClass('ld-over-full-inverse running');
                             // $('#bsModal3 .modal-body p').modal('show'); // Please right this in your Code
                             // console.log(returndata);
                             MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                             $('#bsModal3 .modal-body p').html(returndata);
                             $('#bsModal3').modal('show');
                         } else {
                             $('.ld').hide();
                             $('.wrapper').removeClass('ld-over-full-inverse running');
                             // other code
                         }
                     },
                     error: function () {
                         $('.ld').hide();
                         $('.wrapper').removeClass('ld-over-full-inverse running');
                         console.error('Failed to process ajax !');
                     }
              });
            }else{
                // alert(1)
            }
        });
    });

    $(function(){
        if($('#wizardForm').length>0)
        {
            $('#wizardForm input').on('keyup keypress', function(e) {
                var keyCode = e.keyCode || e.which;
                if (keyCode === 13) { 
                e.preventDefault();
                return false;
                }
            });

        }
        
        if($('#secWizardForm').length>0)
        {
        $('#secWizardForm input').on('keyup keypress', function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) { 
            e.preventDefault();
            return false;
            }
        });
       }
    });

// ----------------------------------------btntoggle (activate json)----------------------------------------
$(document).ready(function() {
    $("#btnToggle").bind("click", function () {

      var quizid="{\"quizid\"\ : ";
      jsonObjAuth = document.getElementById("quiz_id").value;
      quizid += JSON.stringify(jsonObjAuth);
      ////console.log("Object New "+jsonStringQ);

      document.getElementById("data").value = quizid+"}";
      // console.log(quizid+quizobj+"}");
    });
  })

//---------------------------------------- quiz time conversions in local time----------------------------------------
$(document).ready(function() {
    if($('#begin_time_utc').length>0)
    {
        var begin_time_utc = document.getElementById('begin_time_utc').value;
        var begindate1 = new Date(begin_time_utc);
        // var bt1 = begindate1.toString().split(" ");
        // var part1 = [bt1[0],bt1[1],bt1[2],bt1[3],bt1[4]]; 
        if($('#beginTime').length>0)           
        document.getElementById('beginTime').innerHTML = begindate1.toString().split("G")[0];

    }
    
  });

  $(document).ready(function() {
    if($('#end_time_utc').length>0)
    {
    var end_time_utc = document.getElementById('end_time_utc').value;
    var endTime1 = new Date(end_time_utc);
    // console.log(endTime1);
    if($('#endTime').length>0) 
    document.getElementById('endTime').innerHTML = endTime1.toString().split("G")[0];
    }
  });

  $(document).ready(function() {
    if($('#createdOn_utc').length>0)
    {
    var createdOn_utc = document.getElementById('createdOn_utc').value;
    var createdOn1 = new Date(createdOn_utc);
    // console.log(createdOn1);
    if($('#createdOn').length>0)
    document.getElementById('createdOn').innerHTML = createdOn1.toString().split("G")[0];
    }
  });

  $(document).ready(function() {
    if($('#validUpto_utc').length>0)
    {
    var validUpto_utc = document.getElementById('validUpto_utc').value;
    var validUpto1 = new Date(validUpto_utc);
    // console.log(validUpto1);
    if($('#validUpto').length>0)
     document.getElementById('validUpto').innerHTML = validUpto1.toString().split("G")[0];
      if($('#validDatewarning').length>0){
          document.getElementById('validDatewarning').innerHTML = validUpto1.toString().split("G")[0];
      }
    }

  });


  // ----------------------------------------to delete a quiz ----------------------------------------
  $("#delQuiz").click(function(event){
      var qid= document.getElementById('quizidhidden').value;
    event.preventDefault();
    swal({
        title: 'Are you sure?',
        text: "The quiz will be deleted permanently",
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes, delete it!',
        buttonsStyling: false,
        allowOutsideClick: false
    }).then(function() {
        // console.log('orgid='+orgid+' and pie = '+pipe);
        window.location.href='/author_delQuiz?id='+qid;
    }).catch(function(){
        console.log("Aborted clone req");
    });
});


// ----------------------------------------quiz item to inherit , checkboxes----------------------------------------
function checkAll(ele) {
    var checkboxes = document.getElementsByTagName('input');
    if (ele.checked) {
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
            checkboxes[i].checked = true;
        }
      }
    } else {
      for (var i = 0; i < checkboxes.length; i++) {
        console.log(i)
        if (checkboxes[i].type == 'checkbox') {
            checkboxes[i].checked = false;
        }
      }
    }
  }

  //----------------------------------------to enable disable next button----------------------------------------
  $(document).ready(function(){
    $(':checkbox[name=chkbox_ids]').on('change', function() {
        var assignedTo = $(':checkbox[name=chkbox_ids]:checked').map(function() {
          return this.value;
        })
        .get();     
        var textbox3 = document.getElementById('items');
        textbox3.value=assignedTo;
        if(textbox3.value != ""){
          document.getElementById('create_quiz').disabled = false; //remove disabled attribute from button
        }
        else if(textbox3.value == ""){
            document.getElementById('create_quiz').disabled = true; //remove disabled attribute from button
        }
    });
  });

  $(document).ready(function(){
    $(':checkbox[id=chkall]').on('change', function() {
        var assignedTo = $(':checkbox[name=chkbox_ids]:checked').map(function() {
          return this.value;
        })
        .get();     
        var textbox3 = document.getElementById('items');
        textbox3.value=assignedTo;
        if(textbox3.value != ""){
          document.getElementById('create_quiz').disabled = false; //remove disabled attribute from button
        }
        else if(textbox3.value == ""){
            document.getElementById('create_quiz').disabled = true; //remove disabled attribute from button
        }
    });
  });
  
//---------------------------------------- convert time in local time (quiz itens to inherit)----------------------------------------
  $(document).ready(function() {
    if($('#begin_time_utc').length>0 || $('#end_time_utc').length>0)
    {

        var begin_time_utc = document.getElementById('begin_time_utc').value;
        var end_time_utc = document.getElementById('end_time_utc').value;
        var begindate1 = new Date(begin_time_utc);
        var enddate1 = new Date(end_time_utc);
        // console.log(begindate1);
        if($('#quizValidity').length>0)
        document.getElementById('quizValidity').innerHTML = begindate1+" - "+enddate1;
    }
  });

////--------------------------------------- error msg in quiz dsshboard-------------------------------------------------------------
$(document).ready(function() {
    if (window.location.search.indexOf('status=summaryerror') > -1) {
        $('#error_generate_summary').slideUp();
        $('#error_generate_summary').slideDown();
        $('#error_download_password').slideUp();
        $('#error_summary').slideUp();
        $('#error_server').slideUp();
        function success_1(){
          $('#error_generate_summary').slideUp();
        }
        setTimeout(success_1, 5000);
    } else {
        // alert('track not here');
    }
});

////--------------------------------------- error validity over quiz dsshboard-------------------------------------------------------------

$(document).ready(function() {
    if (window.location.search.indexOf('status=validtyOver') > -1) {
        $('#error_validity_summary').slideUp();
        $('#error_validity_summary').slideDown();
        $('#error_download_password').slideUp();
        $('#error_summary').slideUp();
        $('#error_server').slideUp();
        function success_1(){
          $('#error_validity_summary').slideUp();
        }
        setTimeout(success_1, 10000);
    } else {
        // alert('track not here');
    }
});

// examdberror
$(document).ready(function() {
    if (window.location.search.indexOf('status=examdberror') > -1) {
        $.notify({
            icon: "",
            message: "<b> Error - </b> There was some error creating this quiz. Kindly contact administrator !!!"
        }, {
                type: "danger",
                timer: 2000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });
    } else {
        // alert('track not here');
    }
});

$(document).ready(function() {
    if (window.location.search.indexOf('status=dwnloaderror') > -1) {
        $('#error_download_password').slideUp();
        $('#error_download_password').slideDown();
        $('#error_generate_summary').slideUp();
        $('#error_summary').slideUp();
        $('#error_server').slideUp();
        function success_2(){
          $('#error_download_password').slideUp();
        }
        setTimeout(success_2, 4000);
    } else {
        // alert('track not here');
    }
  });

  $(document).ready(function() {
    if (window.location.search.indexOf('status=error') > -1) {
        $('#error_summary').slideUp();
        $('#error_summary').slideDown();
        $('#error_generate_summary').slideUp();
        $('#error_download_password').slideUp();
        $('#error_server').slideUp();
        function success_3(){
          $('#error_summary').slideUp();
        }
        setTimeout(success_3, 4000);
    } else {
        // alert('track not here');
    }
  });

  $(document).ready(function() {
    if (window.location.search.indexOf('status=serverror') > -1) {
        $('#error_server').slideUp();
        $('#error_server').slideDown();
        $('#error_generate_summary').slideUp();
        $('#error_download_password').slideUp();
        $('#error_summary').slideUp();
        function success_3(){
          $('#error_server').slideUp();
        }
        setTimeout(success_3, 4000);
    } else {
        // alert('track not here');
    }
  });

  $(document).ready(function() {
        if (window.location.search.indexOf('msg=timeout') > -1) {
          $.notify({
            icon: "",
            message: "<b> Error - </b> Limit of characters exceeded in instruction field !!!"
          },{
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

/////////////////////////////////------------------------------- new quiz template ----------------------------------------////////////////////////////////////
function getSections() {
    var sectnArry = [];

    $("[id^=sectdiv_old]").each(function () {
        var SecData = {};
        
        SecData["title"] = document.getElementById("sectitle").value; 
       
        SecData["instruction"] =  sec_inst.getValue();/////////////////sec_inst.getValue()
    
        SecData["playlist"] = document.getElementById("playlist_name_hidden").value;
    
        SecData["sectionName"] = document.getElementById("section_name_hidden").value;
//----------------------Question ID Section------------------------------------------------------------
        var allPool = document.getElementById("id_question").value;
        var poolArr = allPool.split(",");
        SecData["pool"]= poolArr; 
//----------------------------------Number Section---------------------------------------------------------
        SecData["choose"] = parseInt(document.getElementById("number").value); 
            
        SecData["arrangement"] = $("#order  option:selected" ).val();
//-----------------------------------Score Scheme-------------------------------------------    
        var jsonStringCorSc="";
        jsonObjCorSc = [];
        $("input[id=correctsc]").each(function() {
            var value = $(this).val();
            if(value){
            jsonObjCorSc.push(value);
            }else{
            jsonObjCorSc.push("0");
            }
            // jsonObjCorSc.push(value);
        });
        jsonObjInCorSc = [];
        $("input[id=incorrectsc]").each(function() {
            var value = $(this).val();
            if(value){
            jsonObjInCorSc.push(value);
            }else{
            jsonObjInCorSc.push("0");
            }
            // jsonObjInCorSc.push(value);
        });

        jsonObjSkCorSc = [];
        $("input[id=skipsc]").each(function() {
            var value = $(this).val();
            if(value){
            jsonObjSkCorSc.push(value);
            }else{
            jsonObjSkCorSc.push("0");
            }
            // jsonObjSkCorSc.push(value);
        });

        //partial grading
        SecData["partialGrading"] =   $('#partialGrade').prop('checked');
        
        SecData["helpAllowed"] = parseInt($("#help_level_selector option:selected" ).val());

        SecData["helpAtReview"] = parseInt($("#help_level_selectorReview option:selected" ).val());

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
    $("[id^=sectdiv_new]").each(function () {
        // secObj = {};
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        // secObj['IsAnswer'] = $("#option_type_new-" + c_id).val();

        var SecData = {};

        SecData["title"] = document.getElementById("sectitle" + c_id).value;

        SecData["instruction"] =  document.getElementById("sec_inst" + c_id).value;/////////////////sec_inst.getValue()
    
        SecData["playlist"] = document.getElementById("playlist_name_hidden" + c_id).value;
    
        SecData["sectionName"] = document.getElementById("section_name_hidden" + c_id).value;
//----------------------Question ID Section------------------------------------------------------------
        var allPool = document.getElementById("id_question" + c_id).value;
        var poolArr = allPool.split(",");
        SecData["pool"]= poolArr; 
//----------------------------------Number Section---------------------------------------------------------
        SecData["choose"] = parseInt(document.getElementById("number" + c_id).value); 
            
        SecData["arrangement"] = $("#order"+ c_id+"  option:selected" ).val();
//-----------------------------------Score Scheme-------------------------------------------    
        var jsonStringCorSc="";
        jsonObjCorSc = [];
        $("input[id=correctsc"+ c_id+"]").each(function() {
            var value = $(this).val();
            if(value){
            jsonObjCorSc.push(value);
            }else{
            jsonObjCorSc.push("0");
            }
            // jsonObjCorSc.push(value);
        });
        jsonObjInCorSc = [];
        $("input[id=incorrectsc"+ c_id+"]").each(function() {
            var value = $(this).val();
            if(value){
            jsonObjInCorSc.push(value);
            }else{
            jsonObjInCorSc.push("0");
            }
            // jsonObjInCorSc.push(value);
        });

        jsonObjSkCorSc = [];
        $("input[id=skipsc"+ c_id+"]").each(function() {
            var value = $(this).val();
            if(value){
            jsonObjSkCorSc.push(value);
            }else{
            jsonObjSkCorSc.push("0");
            }
            // jsonObjSkCorSc.push(value);
        });

       //partial grading
       SecData["partialGrading"] =   $('#partialGrade'+c_id).prop('checked');

        SecData["helpAllowed"] = parseInt($("#help_level_selector"+ c_id+" option:selected" ).val());

        SecData["helpAtReview"] = parseInt($("#help_level_selectorReview"+ c_id+" option:selected" ).val());
        
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
    });
        return sectnArry;
}


$(document).ready(function() {
    // function getFormDataNewTemp(){
    //     fdata = {};

    //     fdata["author"] = document.getElementById("author").value;

    //     var allTags = document.getElementById("tags").value;
    //     var tagArray = allTags.split(",");
    //     fdata["tags"]= tagArray;
        
    //     fdata["title"] = document.getElementById("title").value;

    //     fdata["description"] = document.getElementById("desc").value; 

    //     fdata["instruction"] = quiz_intr.getValue();

    //     // var SecData = {};

    //     // SecData["instruction"] =  quiz_intr.getValue();
        
    //     // SecData["playlist"] = document.getElementById("playlist_name_hidden").value;

    //     // // SecData["sectionName"] = document.getElementById("section_name_hidden").value;

    //     // var allPool = document.getElementById("id_question").value;
    //     // var poolArr = allPool.split(",");
    //     // SecData["pool"]= poolArr;     

    //     // SecData["choose"] = parseInt(document.getElementById("number").value); 

    //     // SecData["arrangement"] = $("#order option:selected" ).val();

    //     // grading matrix
    //     // var jsonStringCorSc="";
    //     // jsonObjCorSc = [];
    //     // $("input[id=correctsc]").each(function() {
    //     //     var value = $(this).val();
    //     //     //jsonObjCorSc.push(JSON.stringify(value));
    //     //     // jsonObjCorSc.push(value);
    //     //     if(value){
    //     //         jsonObjCorSc.push(value);
    //     //     }else{
    //     //         jsonObjCorSc.push("0");
    //     //     }
    //     // });
            
    //     // jsonObjInCorSc = [];
    //     // $("input[id=incorrectsc]").each(function() {
    //     //     var value = $(this).val();
    //     //         //jsonObjInCorSc.push(JSON.stringify(value));
    //     //     // jsonObjInCorSc.push(value);
    //     //     if(value){
    //     //         jsonObjInCorSc.push(value);
    //     //     }else{
    //     //         jsonObjInCorSc.push("0");
    //     //     }
    //     // });
           
    //     // jsonObjSkCorSc = [];
    //     // $("input[id=skipsc]").each(function() {
    //     //     var value = $(this).val();
    //     //         //jsonObjSkCorSc.push(JSON.stringify(value));
    //     //     // jsonObjSkCorSc.push(value);
    //     //     if(value){
    //     //         jsonObjSkCorSc.push(value);
    //     //     }else{
    //     //         jsonObjSkCorSc.push("0");
    //     //     }
    //     // });
            

    //     // jsonStringCorSc +="[ ["+ jsonObjCorSc+"],["+jsonObjSkCorSc+"],["+jsonObjInCorSc + "]]";
    //     // SecData["gradingMatrix"] =  JSON.parse(jsonStringCorSc);


    //     // var SecDataArr =[];
    //     //     SecDataArr.push(SecData);
    //     //     fdata["sections"]= SecDataArr;

    //         fdata["sections"]= getSections(); 

    //    //----------------------Student ID Section-------------csvJson--------------
    //     // var allStu = document.getElementById("id_students").value;
    //     // var stuArr = allStu.split(",");
    //     // fdata["takers"]= stuArr;  

    //     var takdata ={};

    //     var csvJsonData = $("#csvJson").val();
    //     var arryJsonData = $("#arryJson").val();

    //     if(document.getElementById("txtFileUpload").value==""){
    //         if(document.getElementById("loadTblData").value=="true"){
    //             takdata["userData"]= JSON.parse(csvJsonData); 
    //         }else{
    //             takdata["userData"]= JSON.parse(arryJsonData); 
    //         }
    //     }else{
    //         takdata["userData"]= JSON.parse(csvJsonData); 
    //     }

    //    //----------------------send email Section------------------------------------------------------------
    //     var sentEmail = '';
    //     $("input[name=sndEmailAllow]:checked").each(function() {
    //         var value = $(this).val();  
    //         sentEmail = value;
    //     });

    //     var sentEmailArry = '';
    //     $("input[name=sndEmailAllowArry]:checked").each(function() {
    //         var value = $(this).val();  
    //         sentEmailArry = value;
    //     });



    //     if(document.getElementById("txtFileUpload").value==""){

    //         if(sentEmailArry == "yes"){
    //             takdata["sendEmail"] = true;
    //         }else{
    //             takdata["sendEmail"] = false;
    //         } 
    //         // fdata["sendEmail"] =  sentEmailArry;
    //     }else{

    //         if(sentEmail=="yes"){
    //             takdata["sendEmail"] = true;
    //         }else{
    //             takdata["sendEmail"] = false;
    //         }
    //     }

    //    //----------------------email col Section------------------------------------------------------------
    //     if(document.getElementById("txtFileUpload").value==""){
    //         if(sentEmailArry=="yes"){
    //             takdata["emailCol"]= "A"; 
    //         }else{
    //             takdata["emailCol"]= ""; 
    //         }
    //     }else{
    //         takdata["emailCol"] = $("#selectEmailCol option:selected" ).attr('data-col');
    //     }

    //    //----------------------username col Section------------------------------------------------------------
    //     if(document.getElementById("txtFileUpload").value==""){
    //         takdata["userCol"]= "A";
    //     }else{
    //         takdata["userCol"] = $("#selectuserIdCol option:selected" ).attr('data-col');
    //     }


    //     // console.log(takdata);


    //     fdata["takers"]= takdata; 
            
    //    // ---------------------------------duration----------------------------------------
    //     var d = document.getElementById("duration").value;
    //     if(d != "" ){
    //         fdata["duration"] = parseInt(document.getElementById("duration").value);
    //     }

    //     fdata["period"] =  document.getElementById("start_date").value; 

    //   //----------------------timezone Section------------------------------------------------------------
    //     var d = new Date();
    //     var n = d.getTimezoneOffset();
    //     var timezone = n / -60;
    //     fdata["zone"] =  timezone;   

    //     // var helpAllowed;
    //     //         //jsonObjhelpAllowed = [];
    //     // $("input[name=help_level_selector]:checked").each(function() {
    //     //     var value = $(this).val();
    //     //     helpAllowed = value;
    //     //             //jsonObjhelpAllowed.push(value);
    //     // }); 
    //     // fdata["helpAllowed"] = parseInt(helpAllowed);

    //     jsonObjscores1 = [];
    //     $("input[name=score_avalb__selector1]:checked").each(function() {
    //       var value = $(this).val();
    //       jsonObjscores1.push(value);
    //     });
    //     // console.log("jsonObjscores1--- score---"+jsonObjscores1);
    //     var scoreArray = jsonObjscores1[0].split(",");
        
    //     //----------------------review Section------------------------------------------------------------
    //     fdata["review"]=scoreArray[1];

    //     //----------------------score Section------------------------------------------------------------
    //     fdata["score"]=scoreArray[0];

    //     var security;
    //             //jsonObjsecurity = [];
    //     $("input[name=security_level]:checked").each(function() {
    //         var value = $(this).val();     //jsonObjsecurity.push(JSON.stringify(value));
    //         security = value;
    //     });
    //     fdata["security"] =  security;

    //     var loginTime;
    //             //jsonObjloginTime = [];
    //     $("input[name=duration_interpretation]:checked").each(function() {
    //         var value = $(this).val();
    //         loginTime = value;
            
    //     });
    //     fdata["loginTime"] = loginTime;

    //     var calculator;
    //     $("input[name=calculator]:checked").each(function() {
    //         var value = $(this).val();  
    //         calculator = value;
    //     });
    //     fdata["calculator"] =  calculator;
    //         return fdata;
    // }


    function getFormDataNewTemp(){
        fdata = {};

        fdata["author"] = document.getElementById("author").value;

        var allTags = document.getElementById("tags").value;
        var tagArray = allTags.split(",");
        fdata["tags"]= tagArray;
        
        fdata["title"] = document.getElementById("title").value;

        fdata["description"] = document.getElementById("desc").value; 

        var SecData = {};

        SecData["instruction"] =  quiz_intr.getValue();
        
        SecData["playlist"] = document.getElementById("playlist_name_hidden").value;

        // SecData["sectionName"] = document.getElementById("section_name_hidden").value;

        var allPool = document.getElementById("id_question").value;
        var poolArr = allPool.split(",");
        SecData["pool"]= poolArr;     

        SecData["choose"] = parseInt(document.getElementById("number").value); 

        SecData["arrangement"] = $("#order option:selected" ).val();

        // grading matrix
        var jsonStringCorSc="";
        jsonObjCorSc = [];
        $("input[id=correctsc]").each(function() {
            var value = $(this).val();
            //jsonObjCorSc.push(JSON.stringify(value));
            // jsonObjCorSc.push(value);
            if(value){
                jsonObjCorSc.push(value);
            }else{
                jsonObjCorSc.push("0");
            }
        });
            
        jsonObjInCorSc = [];
        $("input[id=incorrectsc]").each(function() {
            var value = $(this).val();
                //jsonObjInCorSc.push(JSON.stringify(value));
            // jsonObjInCorSc.push(value);
            if(value){
                jsonObjInCorSc.push(value);
            }else{
                jsonObjInCorSc.push("0");
            }
        });
           
        jsonObjSkCorSc = [];
        $("input[id=skipsc]").each(function() {
            var value = $(this).val();
                //jsonObjSkCorSc.push(JSON.stringify(value));
            // jsonObjSkCorSc.push(value);
            if(value){
                jsonObjSkCorSc.push(value);
            }else{
                jsonObjSkCorSc.push("0");
            }
        });

        var helpAllowed = $("#help_level_selector option:selected" ).val()
        fdata["helpAllowed"] = parseInt(helpAllowed);

        var helpAtReview = $("#help_level_selectorReview option:selected" ).val()
        fdata["helpAtReview"] = parseInt(helpAtReview);

        ////////////start grid//////////////
        if(fdata["helpAllowed"]==2){
            jsonStringCorSc +="[ ["+ jsonObjCorSc+"],["+jsonObjSkCorSc+"],["+jsonObjInCorSc + "]]";
            }else
            if(fdata["helpAllowed"]==1){
            jsonStringCorSc +="[ ["+ jsonObjCorSc[0]+","+jsonObjCorSc[1]+","+'0'+"],["+jsonObjSkCorSc[0]+","+jsonObjSkCorSc[1]+","+'0'+"],["+jsonObjInCorSc[0]+","+jsonObjInCorSc[1]+","+'0' + "]]";
            }else
            if(fdata["helpAllowed"]==0){
            jsonStringCorSc +="[ ["+ jsonObjCorSc[0]+","+'0'+","+'0'+"],["+jsonObjSkCorSc[0]+","+'0'+","+'0'+"],["+jsonObjInCorSc[0]+","+'0'+","+'0' + "]]";
            }
        ////////////////end of grid//////////
              
        SecData["gradingMatrix"] =  JSON.parse(jsonStringCorSc);


        var SecDataArr =[];
            SecDataArr.push(SecData);
            fdata["sections"]= SecDataArr;

 //----------------------Student ID Section-------------csvJson--------------
        // var allStu = document.getElementById("id_students").value;
        // var stuArr = allStu.split(",");
        // fdata["takers"]= stuArr;  

        var takdata ={};

        var csvJsonData = $("#csvJson").val();
        var arryJsonData = $("#arryJson").val();

        if(document.getElementById("txtFileUpload").value==""){
            if(document.getElementById("loadTblData").value=="true"){
                takdata["userData"]= JSON.parse(csvJsonData); 
            }else{
                takdata["userData"]= JSON.parse(arryJsonData); 
            }
        }else{
            takdata["userData"]= JSON.parse(csvJsonData); 
        }

//----------------------send email Section------------------------------------------------------------
        var sentEmail = '';
        $("input[name=sndEmailAllow]:checked").each(function() {
            var value = $(this).val();  
            sentEmail = value;
        });

        var sentEmailArry = '';
        $("input[name=sndEmailAllowArry]:checked").each(function() {
            var value = $(this).val();  
            sentEmailArry = value;
        });



        if(document.getElementById("txtFileUpload").value==""){

            if(sentEmailArry == "yes"){
                takdata["sendEmail"] = true;
            }else{
                takdata["sendEmail"] = false;
            } 
            // fdata["sendEmail"] =  sentEmailArry;
        }else{

            if(sentEmail=="yes"){
                takdata["sendEmail"] = true;
            }else{
                takdata["sendEmail"] = false;
            }
        }

//----------------------email col Section------------------------------------------------------------
        if(document.getElementById("txtFileUpload").value==""){
            if(sentEmailArry=="yes"){
                takdata["emailCol"]= "A"; 
            }else{
                takdata["emailCol"]= ""; 
            }
        }else{
            takdata["emailCol"] = $("#selectEmailCol option:selected" ).attr('data-col');
        }

//----------------------username col Section------------------------------------------------------------
        if(document.getElementById("txtFileUpload").value==""){
            takdata["userCol"]= "A";
        }else{
            takdata["userCol"] = $("#selectuserIdCol option:selected" ).attr('data-col');
        }


        // console.log(takdata);


        fdata["takers"]= takdata; 
            
// ---------------------------------duration----------------------------------------
        var d = document.getElementById("duration").value;
        if(d != "" ){
            fdata["duration"] = parseInt(document.getElementById("duration").value);
        }

        fdata["period"] =  document.getElementById("start_date").value; 

//----------------------timezone Section------------------------------------------------------------
        var d = new Date();
        var n = d.getTimezoneOffset();
        var timezone = n / -60;
        fdata["zone"] =  timezone;

        jsonObjscores1 = [];
        $("input[name=score_avalb__selector1]:checked").each(function() {
          var value = $(this).val();
          jsonObjscores1.push(value);
        });
        // console.log("jsonObjscores1--- score---"+jsonObjscores1);
        var scoreArray = jsonObjscores1[0].split(",");
        
        //----------------------review Section------------------------------------------------------------
        fdata["review"]=scoreArray[1];

        //----------------------score Section------------------------------------------------------------
        fdata["score"]=scoreArray[0];

        var security;
                //jsonObjsecurity = [];
        $("input[name=security_level]:checked").each(function() {
            var value = $(this).val();     //jsonObjsecurity.push(JSON.stringify(value));
            security = value;
        });
        fdata["security"] =  security;

        var loginTime;
                //jsonObjloginTime = [];
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

        return fdata;

    }



    $("#btnGetEvalNewTemp").bind("click", function () {
        alert("simple quiz temp")
       if(validationCheck()) {
            qdata = getFormDataNewTemp();
            console.log("Data submitted: "+JSON.stringify(qdata,null,2));
            document.getElementById("data").value = JSON.stringify(qdata);

            var data= document.getElementById('data').value;
            var type= document.getElementById('type').value;
            var authorname= document.getElementById('authorname').value;
            var items= document.getElementById('items').value;
            var log_Id= document.getElementById('log_Id').value;
            var log_Token= document.getElementById('log_Token').value;
            $('.ld').show();
            $('.wrapper').addClass('ld-over-full-inverse running');
            $.ajax({
                type: 'post',
                data: {
                    'data': data,
                    'type': type,
                    'authorname': authorname,
                    'items': items,
                    'log_Id': log_Id,
                    'log_Token': log_Token
                },
                url: '/author_postquestion',
                cache: false,
                success: function (returndata) {
                    if (returndata) {
                        $('.ld').hide();
                        $('.wrapper').removeClass('ld-over-full-inverse running');
                        // $('#bsModal3 .modal-body p').modal('show'); // Please right this in your Code
                        // console.log(returndata);
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                        $('#bsModal3 .modal-body p').html(returndata);
                        $('#bsModal3').modal('show');
                    } else {
                        // other code
                        $('.ld').hide();
                        $('.wrapper').removeClass('ld-over-full-inverse running');
                    }
                },
                error: function () {
                    $('.ld').hide();
                    $('.wrapper').removeClass('ld-over-full-inverse running');
                    console.error('Failed to process ajax !');
                }
            });
            }else{
            //    alert(1)
            }
    });

    // rm below 
    // $("#btnGetEvalNewTemp").bind("click", function () {
    //     if(validationCheck()) {
    //         qdata = getFormDataNewTemp();
    //         console.log("Data submitted: "+JSON.stringify(qdata));
    //         document.getElementById("data").value = JSON.stringify(qdata);

    //         var data= document.getElementById('data').value;
    //         var type= document.getElementById('type').value;
    //         var authorname= document.getElementById('authorname').value;
    //         var items= document.getElementById('items').value;
    //         var log_Id= document.getElementById('log_Id').value;
    //         var log_Token= document.getElementById('log_Token').value;

    //         var errArry =[];
    //         qdata.sections.forEach(function(itm,index) {
    //             if(itm.title=="" ||itm.playlist=="" ||itm.sectionName==""){
    //                 errArry.push(index);
    //             }else{

    //             }
    //         });
    //         // console.log(errArry+"==========="+errArry.length);
    //         if(errArry.length>0){
    //             swal(
    //                 'Error...',
    //                 'All sections fields are required !!',
    //                 'error'
    //                 );
    //         }else{
    //             // $('.ld').show();
    //             // $('.wrapper').addClass('ld-over-full-inverse running');
    //             // $.ajax({
    //             //     type: 'post',
    //             //     data: {
    //             //         'data': data,
    //             //         'type': type,
    //             //         'authorname': authorname,
    //             //         'items': items,
    //             //         'log_Id': log_Id,
    //             //         'log_Token': log_Token
    //             //     },
    //             //     url: '/author_postquestion',
    //             //     cache: false,
    //             //     success: function (returndata) {
    //             //         if (returndata) {
    //             //             $('.ld').hide();
    //             //             $('.wrapper').removeClass('ld-over-full-inverse running');
    //             //             // $('#bsModal3 .modal-body p').modal('show'); // Please right this in your Code
    //             //             // console.log(returndata);
    //             //             MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    //             //             $('#bsModal3 .modal-body p').html(returndata);
    //             //             $('#bsModal3').modal('show');
    //             //         } else {
    //             //             // other code
    //             //             $('.ld').hide();
    //             //             $('.wrapper').removeClass('ld-over-full-inverse running');
    //             //         }
    //             //     },
    //             //     error: function () {
    //             //         $('.ld').hide();
    //             //         $('.wrapper').removeClass('ld-over-full-inverse running');
    //             //         console.error('Failed to process ajax !');
    //             //     }
    //             // });
    //         }
    //     }else{
    //         //    alert(1)
    //     }
    // });








});

///////////////////////-------------for only number value------------------//////////////////////

if($('#number').length>0)
{   var number = document.getElementById('number');
    number.onkeyup = number.onchange = enforceFloat;    
}


if($('#correctsc').length>0)
{
var correctsc = document.getElementById('correctsc');
correctsc.onkeyup = correctsc.onchange = enforceFloat;
}

if($('#skipsc').length>0)
{
var skipsc = document.getElementById('skipsc');
skipsc.onkeyup = skipsc.onchange = enforceFloat;
}

if($('#incorrectsc').length>0)
{
var incorrectsc = document.getElementById('incorrectsc');
incorrectsc.onkeyup = incorrectsc.onchange = enforceFloat;
}


//enforce that only a float can be inputed   
function enforceFloat() {
  var valid = /^\-?\d+\.\d*$|^\-?[\d]*$/;
  var number = /\-\d+\.\d*|\-[\d]*|[\d]+\.[\d]*|[\d]+/;
  if (!valid.test(this.value)) {
    var n = this.value.match(number);
    this.value = n ? n[0] : '';
  }
}



// ----------------------------------------to ckeck upload size and img formate (FOR FILE UPLOAD VALIDATION )----------------------------------------
var allowedExtensions = {
    '.csv' : 1
    };

   
// function for email
function myRadioyes1() {
    $(".deposit").show();
    $("#invalid_emails").show();
    $("#invalid_e").show();
    $("#invalid_emails").text('');
    $("#invalid_e").text('');
    if(checkTableData()==true){
        $("#nextBtn").attr('disabled', 'disabled');
        $("#backBtn").attr('disabled', 'disabled');
    }else{
        $("#nextBtn").removeAttr('disabled');
        $("#backBtn").removeAttr('disabled');
    }
    emailcheck = false;
}

function myRadiono1() {
    $('#selectEmailCol').val('');
    $(".deposit").hide();
    $("#invalid_emails").hide();
    $("#invalid_e").hide();
    if(checkTableData()==true){
        $("#nextBtn").attr('disabled', 'disabled');
        $("#backBtn").attr('disabled', 'disabled');
    }else{
        $("#nextBtn").removeAttr('disabled');
        $("#backBtn").removeAttr('disabled');
    }
    emailcheck = true;
    // enableNext()
}



function enableNext(){
    console.log(emailcheck+"---------"+usercheck);
    if(usercheck ==true && emailcheck==true){
        $("#nextBtn").removeAttr('disabled');
        $("#backBtn").removeAttr('disabled');
    }else{
        $("#nextBtn").attr('disabled', 'disabled');
        $("#backBtn").attr('disabled', 'disabled');
    }
}

///// show grading matrix according to help selector
$(document).ready(function () {
    $('#help_level_selector').on('change', function() {
        var helpSelector=parseInt($("#help_level_selector option:selected" ).val());
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


///// check help at review a/c to help level selector
$(document).ready(function () {
    $('#help_level_selectorReview').on('change', function() {
        var helpSelector=parseInt($("#help_level_selector option:selected" ).val());
        var helpSelectorReview=parseInt($("#help_level_selectorReview option:selected" ).val());
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
                $("#help_level_selectorReview").val("");
              });
            
            // console.log("not allowed")
            
        }
    });
});



//------------------------------------------------------------ quiz template sectioned list------------------------------------------------------------------
$(document).ready(function(){
    var counter = 2;
     // add new option card 
     $("body").on('click', '#btnAddsection', function () {    
       // alert('author_quiz.js');
        var maxVal = 5;
        var playlistdata=$(this).attr('data-playlist');
        var collb1=$(this).attr('data-collb1');
        var collb2=$(this).attr('data-collb2');

        var currVal = $("#allSections > [id^='sectdiv']").length;
        
        if (currVal < maxVal) {
            $("#allSections").append(newSection(counter,playlistdata,collb1,collb2));            
            countSection();  // countSectionTemplate
            counter++;
        } else {
            swal("Only " + maxVal + " sections are allowed !");
        }
    });
    // to delete a  question
    $("body").on("click", "#deleteSection", function () {
        // counter--;
      //  alert('author_quiz.js');
        $(this).closest("[id^='sectdiv']").remove();
        $("#nextBtn").removeAttr('disabled');
        $("#backBtn").removeAttr('disabled');
        countSection();  //countSectionTemplate --
    });
});






//get playlist data
function getPlayListDta(idx){
    var str = document.getElementById('playlist_name'+idx).value;
    // alert("queIds"+queIds);
    var res = str.split(" - ");
    var queIds = res[0];
    var playlistName = res[1];
    var playlistId = res[res.length-1];   
    $('#maxquesId'+idx).html("");
    document.getElementById('playlist_name_hidden'+idx).value = playlistName;
    var authorname= document.getElementById('authorname').value;

    var user_dataAuth = new Object;
    user_dataAuth.name = playlistName;
    user_dataAuth.author = authorname;
    user_dataAuth.playlistId = playlistId;
    
    // console.log(authorname)
    $.post("/author_playlistAuthCheck", user_dataAuth, function (data) {
        if (data.status == 'success') {
            // console.log("success")
            // console.log(data.msg)
            $('#authError'+idx).html("");
            $('#playlist_name'+idx).removeClass('error');
            $("#section_name"+idx).removeAttr('disabled');
            $("#nextBtn").removeAttr('disabled');
            $("#backBtn").removeAttr('disabled');
            get_SectionNameNew(idx);
        }
        else if (data.status == 'error') {
            // console.log("error")
            // console.log(data.msg)
            $('#playlist_name'+idx).addClass('error');
            $('#authError'+idx).html("<small><b>Their are some unauthorized items in this playlist ("+playlistName+"). You are authorized to keep content that is authored by you or collaborator in playlist or if it is a public content.</b></small>");
            $("#section_name"+idx).attr('disabled', 'disabled');
            document.getElementById('number'+idx).value = '';
            $("#nextBtn").attr('disabled', 'disabled');
            $("#backBtn").attr('disabled', 'disabled');
        }
    });
} 

//get section name acc to playlist name
function get_SectionNameNew(idx) {
    var plname = document.getElementById('playlist_name'+idx).value;
    var res = plname.split(" - ");
    var queIds = res[0];
    var playlistName = res[1];
    var playlistId = res[res.length-1];
    if (plname != '') {
        var user_data2 = new Object;
        user_data2.name = playlistName;
        user_data2.playlistId = playlistId;

        $.post("/author_getSectionsList", user_data2, function (data) {
            if (data.status == 'success') {
                $("#section_name"+idx).html("<option value=''> Select </option>");
                $('#section_name'+idx).show();
                // console.log(data.sectionName);
                // console.log(data.sectionCon);
                $("#sectionCon"+idx).val(JSON.stringify(data.sectionCon));
                var secQuesLen = new Array();
                for(var i=0;i<data.sectionName.length;i++){
                    $('#section_name'+idx).append('<option value="'+data.sectionName[i]+'">'+data.sectionName[i]+'</option>');
                }
            }
            else if (data.status == 'error') {
                $('#section_name'+idx).hide();
                swal({
                    type: 'error',
                    title: 'Error',
                    html: data.msg
                });
            }
        });
    } else {
        $('#section_name'+idx).hide();
        swal({
            type: 'error',
            title: 'Error',
            html: 'Please select playlist name !!'
        });
    }
}

function getSectionDta(idx){
    var sectionName = document.getElementById('section_name'+idx).value;
    // console.log(sectionName)
    var secCon = JSON.parse(document.getElementById('sectionCon'+idx).value);
    // console.log(document.getElementById('sectionCon').value);
    var queLen = secCon[sectionName];
    // console.log(queLen);
    // console.log("id_question length"+queLen.length);
    if(queLen == undefined){
        document.getElementById('number'+idx).value = '';
        document.getElementById('id_question'+idx).value = '';
        $('#number'+idx).addClass('error');
        $("#nextBtn").attr('disabled', 'disabled');
        $("#backBtn").attr('disabled', 'disabled');
        $('#maxquesId'+idx).html("<small><b>This Section is empty, Minimum 1 questions is required in section</b></small>");
    }else{
       if(queLen.length<=50){
        document.getElementById('number'+idx).value = queLen.length;
        $('#maxquesId'+idx).html("");
        $("#nextBtn").removeAttr('disabled');
        $("#backBtn").removeAttr('disabled');
        $('#number'+idx).removeClass('error');
    }else{
        document.getElementById('number'+idx).value = queLen.length;
        $('#number'+idx).addClass('error');
        $('#maxquesId'+idx).html("<small><b>Maximum 50 questions are allowed in one section</b></small>");
    } 
    document.getElementById('id_question'+idx).value = queLen;
    }
    document.getElementById('section_name_hidden'+idx).value = sectionName;
}

// for sections dyNAMIC
function newSection(idx,playlistdata,collb1,collb2) {
    
    // console.log(JSON.parse(playlistdata));
    playlistdata=JSON.parse(playlistdata);
    collb1=JSON.parse(collb1);
    collb2 = JSON.parse(collb2);
    
    
    var PLdta ="";
    for(var i=0; i<playlistdata.length;i++){
        var playlist1 = playlistdata[i];
        var content = playlist1[0];
        var ques = new Array();
        for(var k=0; k<content.length;k++){
        ques.push(content[k].item);
        }
        
        PLdta+='<option value="'+ques+' - '+playlist1[1]+' - '+playlist1[2]+'" > '+playlist1[1]+ '</option>' ;
    }
    for(var i=0; i<collb1.length;i++){
        var strcollb1 = collb1[i];
    
        var content1 = strcollb1[0];
        var ques1 = new Array();
        for(var k=0; k<content1.length;k++){
        ques1.push(content1[k].item);
        }
    
    
        PLdta+='<option value="'+ques1+' - '+strcollb1[1]+' - '+strcollb1[2]+'" > '+strcollb1[1]+ '</option>' ;
        // <option value="<%-ques1%> - <%-strcollb1[1]%>"><%-strcollb1[1]%></option>
    }  
    
    for(var i=0; i<collb2.length;i++){
        var strcollb2 = collb2[i];
    
        var content2 = strcollb2[0];
        var ques2 = new Array();
        for(var k=0; k<content2.length;k++){
        ques2.push(content2[k].item);
        }
    
        PLdta+='<option value="'+ques2+' - '+strcollb2[1]+' - '+strcollb2[2]+'" > '+strcollb2[1]+ '</option>' ;
     }   
        // <option value="<%-ques2%> - <%-strcollb2[1]%>"><%-strcollb2[1]%></option>
    
    var newTemp = '<div class="row" id="sectdiv_new-'+idx+'">\
    <div id="acordeon"  class="col-md-12">\
        <div class="panel-group" id="accordion">\
            <div class="panel panel-border panel-default white">\
                <a data-toggle="collapse" href="#section'+idx+'" class="" aria-expanded="true">\
                    <div class="panel-heading white">\
                    <h4 class="panel-title headSec"><button type="button" rel="tooltip" class="btn btn-danger btn-icon btn-simple " style="font-size:1em;" data-original-title="Delete" id="deleteSection"><i class="ti-trash"></i></button>\
                    <span class="countSection">Section</span><i class="ti-angle-down"></i>\
                    </h4>\
                    \
                    </div>\
                </a>\
                <div id="section'+idx+'" class="panel-collapse collapse in" aria-expanded="true">\
                    <div class="panel-body">\
                        <fieldset>\
                            <div class="col-md-10 col-md-offset-1">\
                                <div class="form-group">\
                                    <label class="control-label" style="font-size:15px;">Section Title\
                                        <star><b>*</b></star>\
                                    </label>\
                                    <input type="text" class="form-control " id="sectitle'+idx+'" name="sectitle'+idx+'" required>\
                                </div>\
                            </div>\
                        </fieldset>\
                        <fieldset>\
                            <div class="col-md-10 col-md-offset-1">\
                                <div class="form-group">\
                                    <label class="control-label" style="font-size:15px;">Section Instruction\
                                    </label>\
                                    <textarea class="form-control" rows="5" id="sec_inst'+idx+'"></textarea>\
                                </div>\
                            </div>\
                        </fieldset>\
                        <fieldset>\
                            <div class="col-md-5 col-md-offset-1">\
                                <div class="form-group">\
                                    <label class="control-label" style="font-size:15px;">Playlist Name\
                                        <star><b>*</b></star>\
                                    </label>\
                                    <select class="form-control valid" data-style="btn-default" id="playlist_name'+idx+'" name="playlist_name'+idx+'" onchange="javascript:getPlayListDta('+idx+')" required>\
                                        <option value="">--select--</option>'+PLdta+'</select>\
                                    <span id="authError'+idx+'" class="text-danger"></span>\
                                    <input type="hidden" id="playlist_name_hidden'+idx+'" name="playlist_name_hidden'+idx+'" value="">\
                                </div>\
                            </div>\
                            <div class="col-md-5">\
                                <div class="form-group">\
                                    <label class="control-label" style="font-size:15px;">Section Name\
                                        <star><b>*</b></star>\
                                    </label>\
                                    <select class="form-control valid" data-style="btn-default" id="section_name'+idx+'" name="section_name'+idx+'" style="display:none;" onchange="javascript:getSectionDta('+idx+')" required></select>\
                                    <input type="hidden" id="sectionCon'+idx+'" name="sectionCon'+idx+'" value=""/>\
                                    <input type="hidden" id="section_name_hidden'+idx+'" name="section_name_hidden'+idx+'" value="">\
                                </div>\
                            </div>\
                        </fieldset>\
                        <fieldset>\
                            <div class="col-md-10 col-md-offset-1">\
                                <div class="form-group">\
                                    <input type="hidden" class="form-control" id="id_question'+idx+'" value="" disabled>\
                                </div>\
                            </div>\
                        </fieldset>\
                        <fieldset>\
                            <div class="col-md-5 col-md-offset-1">\
                                <div class="form-group">\
                                    <label class="control-label" style="font-size:15px;">Items in Quiz\
                                        <star><b>*</b></star>\
                                    </label>\
                                    <input type="number" class="form-control" id="number'+idx+'" min="1" max="50" value="" required>\
                                    <span id="maxquesId'+idx+'" class="text-danger"></span>\
                                </div>\
                            </div>\
                            <div class="col-md-5">\
                                <div class="form-group">\
                                    <label class="control-label" style="font-size:15px;">Arrangement\
                                        <star><b>*</b></star>\
                                    </label>\
                                    <select name="order'+idx+'" id="order'+idx+'" class="form-control valid" data-style="btn-default" required>\
                                        <option value="ordered">Ordered</option>\
                                        <option value="random">Random</option>\
                                    </select>\
                                </div>\
                            </div>\
                        </fieldset>\
                        <fieldset>\
                            <div class="col-md-10 col-md-offset-1">\
                                <div class="form-group">\
                                    <label style="font-size:15px;">Help Level Selector\
                                        <star><b>*</b></star>\
                                    </label>\
                                    <select name="help_level_selector'+idx+'" id="help_level_selector'+idx+'" class="form-control valid" data-style="btn-default" onchange="javascript:helpSelectGM('+idx+')" required>\
                                        <option value="2">Hint and Explanation Allowed</option>\
                                        <option value="1">Hint Allowed</option>\
                                        <option value="0">No Help Allowed</option>\
                                    </select>\
                                </div>\
                            </div>\
                        </fieldset>\
                        <fieldset>\
                            <div class="col-md-10 col-md-offset-1">\
                                <div class="form-group">\
                                    <label class="control-label" style="font-size:16px;">Grading Matrix\
                                        <star><b>*</b></star>\
                                    </label>\
                                </div>\
                            </div>\
                            <div class="col-md-10 col-md-offset-1">\
                                <div class="form-group">\
                                    <div class="">\
                                        <div class="">\
                                            <div class="table-responsive">\
                                                <table class="table table-center table-responsive" style="border:#ededed  1px solid;border-radius:5px;">\
                                                    <thead>\
                                                        <tr>\
                                                            <th></th>\
                                                            <th>No help used</th>\
                                                            <th class="hintCol'+idx+'">Hint used</th>\
                                                            <th class="expCol'+idx+'">Explanation used</th>\
                                                        </tr>\
                                                    </thead>\
                                                    <tbody>\
                                                        <tr>\
                                                            <td><b>Correct Score</b></td>\
                                                            <td>\
                                                                <input type="number" id="correctsc'+idx+'" value="4" class="form-control" min="-1000" max="1000" style="background-color:rgba(161, 234, 194, 0.4);">\
                                                            </td>\
                                                            <td class="hintCol'+idx+'">\
                                                                <input type="number" id="correctsc'+idx+'" value="4" class="form-control" min="-1000" max="1000" style="background-color:rgba(241, 209, 142, 0.4);">\
                                                            </td>\
                                                            <td class="expCol'+idx+'">\
                                                                <input type="number" id="correctsc'+idx+'" value="4" class="form-control" min="-1000" max="1000" style="background-color:rgba(170, 216, 228, 0.4);">\
                                                            </td>\
                                                        </tr>\
                                                        <tr>\
                                                            <td><b>Skip Score</b></td>\
                                                            <td>\
                                                                <input type="number" id="skipsc'+idx+'" value="0" min="-1000" max="1000" class="form-control" style="background-color:rgba(161, 234, 194, 0.4);">\
                                                            </td>\
                                                            <td class="hintCol'+idx+'">\
                                                                <input type="number" id="skipsc'+idx+'" value="0" min="-1000" max="1000" class="form-control" style="background-color:rgba(241, 209, 142, 0.4);">\
                                                            </td>\
                                                            <td class="expCol'+idx+'">\
                                                                <input type="number" id="skipsc'+idx+'" value="0" min="-1000" max="1000" class="form-control" style="background-color:rgba(170, 216, 228, 0.4);">\
                                                            </td>\
                                                        </tr>\
                                                        <tr>\
                                                            <td><b>Incorrect Score</b></td>\
                                                            <td>\
                                                                <input type="number" id="incorrectsc'+idx+'" value="-1" min="-1000" max="1000" class="form-control" style="background-color:rgba(161, 234, 194, 0.4);">\
                                                            </td>\
                                                            <td class="hintCol'+idx+'">\
                                                                <input type="number" id="incorrectsc'+idx+'" value="-1" min="-1000" max="1000" class="form-control" style="background-color:rgba(241, 209, 142, 0.4);">\
                                                            </td>\
                                                            <td class="expCol'+idx+'">\
                                                                <input type="number" id="incorrectsc'+idx+'" value="-1" min="-1000" max="1000" class="form-control" style="background-color:rgba(170, 216, 228, 0.4);">\
                                                            </td>\
                                                        </tr>\
                                                    </tbody>\
                                                </table>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </fieldset>\
                        <fieldset>\
                            <div class="col-md-10 col-md-offset-1">\
                                <div class="form-group">\
                                    <label style="font-size:15px;">Help Selector At Review\
                                        <star><b>*</b></star>\
                                    </label>\
                                    <select name="help_level_selectorReview'+idx+'" id="help_level_selectorReview'+idx+'" class="form-control valid" data-style="btn-default"  onchange="javascript:helpSelectReview('+idx+')" required>\
                                        <option value="">Select</option>\
                                        <option value="2">Hint and Explanation Allowed</option>\
                                        <option value="1">Hint Allowed</option>\
                                        <option value="0">No Help Allowed</option>\
                                    </select>\
                                </div>\
                            </div>\
                        </fieldset>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>\
    </div>';
        return newTemp;
}

    // show grading matrix according to help selector
function helpSelectGM(idx){
    var helpSelector=parseInt($("#help_level_selector"+idx+" option:selected" ).val());
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


///// check help at review a/c to help level selector
function helpSelectReview(idx){
    var helpSelector=parseInt($("#help_level_selector"+idx+" option:selected" ).val());
    var helpSelectorReview=parseInt($("#help_level_selectorReview"+idx+" option:selected" ).val());
    // console.log(helpSelector);
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
            $("#help_level_selectorReview"+idx).val('');
          });
        
        // console.log("not allowed")
        
    }
}

