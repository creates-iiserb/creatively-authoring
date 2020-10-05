
$(document).ready(function(){
    var counter = 2;
     // add new option card 
     $("body").on('click', '#btnAddsectionDiv', function () {
        //alert('author_SectionQuiz.js');
        var maxVal = 5;
        var playlistdata=$(this).attr('data-playlist');
        var collb1=$(this).attr('data-collb1');
        var collb2=$(this).attr('data-collb2');

        var currVal = $("#allSections > [id^='sectdiv']").length;
        if (currVal < maxVal) {
            $("#allSections").append(newSection(counter,playlistdata,collb1,collb2));
            countSection();
            counter++;
        } else {
            swal("Only " + maxVal + " sections are allowed !");
        }
    });
    // to delete a  question
    $("body").on("click", "#deleteCrtSection", function () {
        // counter--;
        $(this).closest("[id^='sectdiv']").remove();
        //alert('author_SectionQuiz.js');
        countSection();
    });
}); 
    




    // var count_sec =1; 
    // var count =2
    // $("#btnAddsection").bind("click", function (e) {
    //     var div = $("<div />");
    //     div.html(GetDynamicTextBoxOptDiv(count,count_sec));
    //     $("#TextBoxContainerOpt1").append(div);
    //     count_sec++; 
    //     count++; 
    //     document.getElementById('count_sec').value = count_sec;
    // }); 

    // var c= document.getElementById('count_sec').value;
    // $("body").on("click", "#removeS", function () {
    //     var c= document.getElementById('count_sec').value;
    //     // console.log("count--"+c);
    //     $(this).closest("div").remove();
    //     c--;
    //     console.log("del--"+c);
    //     document.getElementById('count_sec').value = c;
        
    // });

    // function GetDynamicTextBoxOptDiv(value,count) {
    //     return '<br/><div style="border:1px solid #e6e7e8;padding:10px;"><table class="table" style="background-color:#3c8dbc;border-radius:10px;color:#ffffff;"><tr><td><h3>Section '+value+'</h3></td><td class="text-right"><button class="btn btn-default" id="removeS"  style="background-color:#3c8dbc;color:#ffffff;"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td></tr></table><div class="form-group"><label style="font-size:15px;">Section Title</label><b style="color:#cc0000;"> * (Required)&nbsp;</b><span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" data-placement="right"  title="<%-tooltip.tooltipD04%>" style="color:#218FC6;font-size:1.3em;"></span><input type="text" class="form-control" id="sectionName'+count+'" name="sectionName'+count+'" required></div><div class="form-group"><label style="font-size:15px;">Instruction</label><b style="color:#cc0000;"> * (Required)&nbsp;</b><span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" data-placement="right"  title="<%-tooltip.tooltipD04%>" style="color:#218FC6;font-size:1.3em;"></span><textarea class="form-control" rows="3" id="id_instruction'+count+'" required></textarea></div><div class="form-group"><label style="font-size:15px;">Playlist Name</label><b style="color:#cc0000;"> * (Required)&nbsp;</b><span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" data-placement="right"  title="<%-tooltip.tooltipD05%>" style="color:#218FC6;font-size:1.3em;"></span><select class="form-control" id="playlist_name'+count+'" name="playlist_name'+count+'" required><option value="">--select--</option><%for(var i=0; i<playlistdata.length;i++){var playlist1 = playlistdata[i]; var content = Object.keys(playlist1[0]);%><option value="<%-content%> - <%-playlist1[1]%>"><%-playlist1[1]%></option><%}%></select> </div><div class="form-group"><label style="font-size:15px;">Question Ids</label><span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" data-placement="right"  title="<%-tooltip.tooltipD06%>" style="color:#218FC6;font-size:1.3em;"></span><input type="text" class="form-control" id="id_question'+count+'" value=""  disabled></div><div class="form-group"><table class="table table-bordered text-center"><tr><td width="18%"><label>Number of Question in the Quiz</label><b style="color:#cc0000;"> * (Required)&nbsp;</b><span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" data-placement="right"  title="<%-tooltip.tooltipD07%>" style="color:#218FC6;font-size:1.3em;"></span></td><td width="30%"><input type="number" class="form-control" id="number'+count+'" min="1" max="43800" value="1" onkeypress="return isNumberKey(event)" required></td><td width="15%" align="center"><label>Arrangement</label><b style="color:#cc0000;"> * (Required)&nbsp;</b><span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" data-placement="right"  title="<%-tooltip.tooltipD08%>" style="color:#218FC6;font-size:1.3em;"></span></td><td><select name="order" id="order'+count+'" class="form-control" required><option value="ordered">Ordered</option><option value="random">Random</option></select></td></tr></table>  </div><div class="form-group"><label style="font-size:15px;">Grading Matrix</label><b style="color:#cc0000;"> * (Required)&nbsp;</b><span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" data-placement="right"  title="<%-tooltip.tooltipD09%>" style="color:#218FC6;font-size:1.3em;"></span><table class="table table-bordered text-center"><tr><th></th><th>No help</th><th>Hint used</th><th>Explanation used</th></tr><tr><td><b>Correct Score</b></td><td ><input  id="correctsc'+count+'" type="number" value="4"></td><td align="center"><input  type="number" id="correctsc'+count+'" value="4"></td><td ><input type="number" id="correctsc'+count+'" value="4" ></td></tr><tr><td><b>Skip Score</td><td><input type="number" id="skipsc'+count+'" value="0"></td><td><input type="number" id="skipsc'+count+'" value="0"></td><td><input type="number" id="skipsc'+count+'" value="0"></td></tr><tr><td ><b>Incorrect Score</b></td><td><input type="number" id="incorrectsc'+count+'" value="-1"></td><td><input type="number" id="incorrectsc'+count+'" value="-1"></td><td><input type="number" id="incorrectsc'+count+'" value="-1"></td></tr></table><input type="hidden" id="playlist_name_hidden'+count+'" name="playlist_name_hidden'+count+'" value=""></div></div>'; 
    // }


//-------------------------------------displaying GM a/c to help selector----------------------------------------------------------------
$(document).ready(function(){

    function uniqueArray(orginalArr){        
            var arr = [];
            for(var i = 0; i < orginalArr.length; i++) {
                if(!arr.includes(orginalArr[i])) {
                    arr.push(orginalArr[i]);
                }
            }
            return arr;         
    }

    function getSectnFormData(){
            fdata = {};
            fdata["quizType"] = "sectioned"
            fdata["author"] = document.getElementById("author").value;
        
            var allTags = document.getElementById("tags").value;
            var tagArray = allTags.split(",");
            fdata["tags"]= tagArray;
        
            fdata["title"] = document.getElementById("title").value;
        
            fdata["description"] = document.getElementById("desc").value; 
            fdata["authorName"] = document.getElementById("authorName").value; 
            fdata["authorEmail"] = document.getElementById("quizEmail").value; 
            fdata["quizLang"] = document.getElementById("quizLang").value; 
            
            fdata["instruction"] =  quiz_intr.getValue();
                    // var SecDataArr =[];
                    // SecDataArr.push(SecData);
            fdata["sections"]= getSections(); 
        
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
                   
                   
                    fdata["allowFC"] =   !$('#logoutFC').prop('checked');
        
                    return fdata;
    }

    $("#btnGetSectnEval").bind("click", function () {
        if(validationCheck()) {
            qdata = getSectnFormData();
            console.log(JSON.stringify(qdata,null,2));
           
            document.getElementById("secdata").value = JSON.stringify(qdata);
            var data= document.getElementById('secdata').value;
            var type= document.getElementById('type').value;
            var authorname= document.getElementById('authorname').value;
            // var playlist_name_hidden= document.getElementById('playlist_name_hidden').value;
            // var section_name_hidden= document.getElementById('section_name_hidden').value;
            var errArry =[];
            var allSection = [];
            var allPlaylist = [];
            qdata.sections.forEach(function(itm,index) {
                if(itm.title.trim()=="" || itm.playlist=="" ||itm.sectionName.trim()==""){
                   alert(index);
                    errArry.push(index);
                }else{
                    allSection.push(itm.sectionName);
                    allPlaylist.push(itm.playlist);
                }
            });

           

            var checkSec = false;
            var checkSecMsg = ''; 
            var plyArr = [];
            for(var i = 0; i < allPlaylist.length; i++) {
                if(!plyArr.includes(allPlaylist[i])) {
                    plyArr.push(allPlaylist[i]);
                }else{
                    var ply = allPlaylist[i];
                    var sec = allSection[i];
                    for(var j=0;j<i;j++)
                    {
                        
                        if(plyArr[j]==ply && allSection[j]==sec)
                        {
                            checkSec = true;
                            checkSecMsg = 'You are using <b>'+sec+'</b> with playlist <b>'+ply+'</b> more than once';
                            
                        }
                    }
                }
            }

            

           
            // console.log(errArry+"==========="+errArry.length);
            if(errArry.length>0){
                swal(
                    'Error...',
                    'All sections fields are required !!',
                    'error'
                    );
            }else  
            if(checkSec){
                swal(
                    'Error...',
                    checkSecMsg,
                    'error'
                    );
            }                                 
            else{

                //return;
                $('.ld').show();
                $('.wrapper').addClass('ld-over-full-inverse running');
                $.ajax({
                    type: 'post',
                    data: {
                        'data': data,
                        'type': type,
                        'authorname': authorname
                    },
                    url: '/author_verifyNewSecQuiz',
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
            }
        }else{
            // alert(1)
        }
    });
});
 

