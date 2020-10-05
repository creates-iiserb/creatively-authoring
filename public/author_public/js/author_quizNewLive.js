$(document).ready(function(){
    demo.initWizard();
    demo.initSectionWizard();

    $('#start_date').daterangepicker({timePicker: true, timePickerIncrement: 05, format: 'DD MMM YYYY HH:mm'});
    
    $('#playlist_name').on('change', function() {
        var str = document.getElementById('playlist_name').value;
        var res = str.split(" - ");
        var queIds = res[0];
        var playlistName = res[1];
        var playlistId = res[res.length-1];
        $('#maxquesId').html("");
        document.getElementById('playlist_name_hidden').value = playlistName;
        var authorname= document.getElementById('authorname').value;
        var user_dataAuth = new Object;
        user_dataAuth.name = playlistName;
        user_dataAuth.author = authorname;
        user_dataAuth.playlistId = playlistId;

        $("#nextBtn").attr('disabled', 'disabled');
        $("#backBtn").attr('disabled', 'disabled');

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
                // console.log(data.sectionName);
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

var allowedExtensions = {
    '.csv' : 1,
    '.CSV' : 1,
    };


    $(function(){
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
    
        var id_students=document.getElementById('id_students').value ; // Quiz Takers
        var txtFileUpload=document.getElementById('txtFileUpload').value ; // Quiz Takers
        var loadTblData=document.getElementById('loadTblData').value ; // Quiz Takers
        // console.log("fddf======"+txtFileUpload+"---------------"+id_students);
        if(id_students== "" ){
            if(txtFileUpload==""){
                // alert("Quiz Takers field is required !!!");
                if(loadTblData==""){
                    swal(
                    'Error...',
                    'Quiz Takers field is required !!',
                    'error'
                    );
                    // document.getElementById('id_instruction').focus();
                    return false;
                }
            }
        }
       
    
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


    function countSection(){
        var newparent = $(".headSec");
        var orderchilds = newparent.find('.countSection');
        var indexnumber = 2;
            orderchilds.each(function(i,val){
            $(this).html("Section " +indexnumber);
            indexnumber++;
        });
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

$(document).ready(function () {

    if($("#aa").length>0){
       document.getElementById('aa').addEventListener('click',function(){
           document.getElementById('txtFileUpload').click();
       });        
    }

   
   document.getElementsByTagName("table")[2].className += " redClass";
   
   //to delete a row
   $('body').on("click", '#span_remove', function () {        
       e.row($(this).parents('tr')).remove().draw(false);

       $('#myRadioyes').prop('checked',false);
       $('#myRadiono').prop('checked',false);
       $('#selectuserIdCol').val('');     
       $('#selectEmailCol').val('');
       $(".deposit").hide();
       $('#invalid_emails').text('');
       $('#invalid_e').text('');
       $('#username1').text('');
       $("#u_validate").text('');
       emailcheck = false;
       usercheck = false;
   });
     

   // The event listener for the file upload
   // if($('#txtFileUpload').length>0)
   // {
   //     document.getElementById('txtFileUpload').addEventListener('change', upload, false);
   // }

 
   // Method that checks that the browser supports the HTML5 File API
   function browserSupportFileUpload() {
       var isCompatible = false;
       if (window.File && window.FileReader && window.FileList && window.Blob) {
           isCompatible = true;
       }
       return isCompatible;
   }

   $("#txtFileUpload").change(function(evt){
       if (!browserSupportFileUpload()) {
           swal(
               'Error...',
               'The File APIs are not fully supported in this browser !',
               'error'
           );
       } else {

           var match = /\..+$/;
           var filename = evt.target.value;
           var ext = filename.match(match);
           if (allowedExtensions[ext])
           {
               var size = document.getElementById('txtFileUpload').files[0].size;
               //document.getElementById("id_students").disabled=true;
               if(!size > 512000){
                   swal(
                   'Error...',
                   'Only upto 500 kb file can be uploaded !!',
                   'error'
                   );
                   document.getElementById("txtFileUpload").value="";
                   //document.getElementById("id_students").disabled=false;
                   return false;

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
               document.getElementById("txtFileUpload").value="";
               //document.getElementById("id_students").disabled=false;
               return false;
           }


           var data = null;
           var file = evt.target.files[0];
           var reader = new FileReader();
           reader.readAsText(file);
           reader.onload = function (event) {
               var csvData = event.target.result;
               data = $.csv.toArrays(csvData);
               var headData =[
                   { title: "A" },
                   { title: "B" },
                   { title: "C" }
               ];

               
               
                var data1 = [];
               // console.log(data[0].length);

               if(data.length==0){
                   swal(
                       'Error...',
                       'No data to import!',
                       'error'
                   );
               }else{
                   var dataLen = data[0].length;
                   if(dataLen>3){
                      
                       data.forEach(items2 =>{
                           // var newdt = [];
                           // items2='sjhf';
                           items2.splice(3);
                           items2.push("<td><span id='span_remove' class='text-danger table-remove fa fa-times'></span></td>");
                           data1.push(items2);
                       }) 


                   }else {
                       // alert(1)
                      
                       data.forEach(items2 =>{
                            var newdt = [];
                           // items2='sjhf';
                           // console.log(data[0].length)
                           // items2.splice(dataLen);
                           items2.push("<td><span id='span_remove' class='text-danger table-remove fa fa-times'></span></td>");
                           data1.push(items2);
                       })

                       headData.splice(dataLen);
                   }
                   headData.push({title:""});
               }

  
               console.log(headData);

               data1.forEach((i,nm)=>{
                   i.forEach((j,ind)=>{
                   if(j==''){
                       data1[nm][ind] = "BLANK"
                   }
                 })
               })

               
               if (data1 && data1.length > 0) {  
                   let newDataLen = data1.length-1;
                   $('#id_students').tagsinput('removeAll');
                   $('#myRadioyes').prop('checked',false);
                   $('#myRadiono').prop('checked',false);
                   $('#arrYes').prop('checked',false);
                   $('#arrNo').prop('checked',false);
                   $('#selectuserIdCol').val('');     
                   $('#selectEmailCol').val('');
                   $(".deposit").hide();
                   $('#tbl').removeAttr('style');   
                   $('#export').html('');
                   $('#invalid_emails').text('');
                   $('#invalid_e').text('');
                   $('#username1').text('');
                   $("#u_validate").text('');
                   $('#fileUploadDiv').hide();
                   $('#btnClrTbl').show();
                   $("#nextBtn").removeAttr('disabled');
                   $("#backBtn").removeAttr('disabled');
                   $('#tblArry').DataTable().destroy();
                   // $('#tbl').DataTable().destroy();
                   $('#tblArry tbody').html("");
                   $('#tblArry').hide();
                   emailcheck = false;
                   usercheck = false;
                   
                   swal({
                       title: '',
                       text: 'Does your file consist a header row?',
                       type: 'warning',
                       showCancelButton: true,
                       confirmButtonText: 'Yes, it contains',
                       cancelButtonText: 'No',
                       confirmButtonClass: "btn btn-success btn-fill",
                       cancelButtonClass: "btn btn-danger btn-fill",
                       buttonsStyling: false
                   }).then((head) => {
                       swal({
                           title: 'Header row was removed!',
                           text: '',
                           type: 'success',
                           confirmButtonClass: "btn btn-success btn-fill",
                           buttonsStyling: false
                       });
                       // console.log(data1);
                       data1.splice(0, 1);
                       console.log(data1.length);
                       e = $('#tbl').DataTable({
                       destroy: true,
                       data: data1,
                       columns: headData,
                       responsive: false,
                       paging:false
                       });
       
                       if(newDataLen<=500){
                           $("#export-btn").show();
                           $("#hide_email_row").show();
                           $("#hide_user_row").show();
                           $("#aa").css("display", "none");
                       }else
                       if(newDataLen>500){
                           setTimeout(()=>{
                               $.notify({
                                   icon: "",
                                   message: "<b> Error - </b> Maximum limit of students is 500.Please upload csv file again."
                               },{
                                       type: "danger",
                                       timer: 6000,
                                       placement: {
                                           from: 'top',
                                           align: 'center'
                                       }
                               });
       
   
                           },2000);
                           
                           $("#nextBtn").attr('disabled', 'disabled');
                           $("#backBtn").attr('disabled','disabled');
                           
                       }
                       
                       
                       // $("#uploadName").text(uploadfilename);
                       
                   }, function(dismiss) {
                       // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
                       if (dismiss === 'cancel') {
                         e = $('#tbl').DataTable({
                           destroy: true,
                           data: data1,
                           columns: headData,
                           responsive: false,
                           paging:false
                           });
                   
                           if(data1.length<=500){
                               $("#export-btn").show();
                               $("#hide_email_row").show();
                               $("#hide_user_row").show();
                               $("#aa").css("display", "none");
                               // $("#uploadName").text(uploadfilename);
                           }
                       }
                   })
                       
                   
                   


               }else {
                   swal(
                       'Error...',
                       'No data to import!',
                       'error'
                   );
               }
           };
           reader.onerror = function () {
               swal(
                   'Error...',
                   'Unable to read ' + file.fileName,
                   'error'
               );
               document.getElementById("txtFileUpload").value="";

           };
       }

   });


   
   // function upload(evt) {
       
   //     if (!browserSupportFileUpload()) {
   //         swal(
   //             'Error...',
   //             'The File APIs are not fully supported in this browser !',
   //             'error'
   //         );
   //     } else {

   //         var match = /\..+$/;
   //         var filename = evt.target.value;
   //         var ext = filename.match(match);
   //         if (allowedExtensions[ext])
   //         {
   //             var size = document.getElementById('txtFileUpload').files[0].size;
   //             document.getElementById("id_students").disabled=true;
   //             if(!size > 512000){
   //                 swal(
   //                 'Error...',
   //                 'Only upto 500 kb file can be uploaded !!',
   //                 'error'
   //                 );
   //                 document.getElementById("txtFileUpload").value="";
   //                 //document.getElementById("id_students").disabled=false;
   //                 return false;

   //             }
   //         }
   //         else
   //         {
   //             swal(
   //             'Error...',
   //             'Invalid File Extension, file must be in CSV format.',
   //             'error'
   //             );
   //             //will clear the file input box.
   //             //location.reload();
   //             document.getElementById("txtFileUpload").value="";
   //             //document.getElementById("id_students").disabled=false;
   //             return false;
   //         }


   //         var data = null;
   //         var file = evt.target.files[0];
   //         var reader = new FileReader();
   //         reader.readAsText(file);
   //         reader.onload = function (event) {
   //             var csvData = event.target.result;
   //             data = $.csv.toArrays(csvData);
   //             var headData =[
   //                 { title: "A" },
   //                 { title: "B" },
   //                 { title: "C" }
   //             ];

               
               
   //              var data1 = [];
   //             // console.log(data[0].length);

   //             if(data.length==0){
   //                 swal(
   //                     'Error...',
   //                     'No data to import!',
   //                     'error'
   //                 );
   //             }else{
   //                 var dataLen = data[0].length;
   //                 if(dataLen>3){
                      
   //                     data.forEach(items2 =>{
   //                         // var newdt = [];
   //                         // items2='sjhf';
   //                         items2.splice(3);
   //                         items2.push("<td><span id='span_remove' class='text-danger table-remove fa fa-times'></span></td>");
   //                         data1.push(items2);
   //                     }) 


   //                 }else {
   //                     // alert(1)
                      
   //                     data.forEach(items2 =>{
   //                          var newdt = [];
   //                         // items2='sjhf';
   //                         // console.log(data[0].length)
   //                         // items2.splice(dataLen);
   //                         items2.push("<td><span id='span_remove' class='text-danger table-remove fa fa-times'></span></td>");
   //                         data1.push(items2);
   //                     })

   //                     headData.splice(dataLen);
   //                 }
   //                 headData.push({title:""});
   //             }

  
   //             console.log(headData);

   //             data1.forEach((i,nm)=>{
   //                 i.forEach((j,ind)=>{
   //                 if(j==''){
   //                     data1[nm][ind] = "BLANK"
   //                 }
   //               })
   //             })

               
   //             if (data1 && data1.length > 0) {  
   //                 let newDataLen = data1.length-1;
   //                 $('#id_students').tagsinput('removeAll');
   //                 $('#myRadioyes').prop('checked',false);
   //                 $('#myRadiono').prop('checked',false);
   //                 $('#arrYes').prop('checked',false);
   //                 $('#arrNo').prop('checked',false);
   //                 $('#selectuserIdCol').val('');     
   //                 $('#selectEmailCol').val('');
   //                 $(".deposit").hide();
   //                 $('#tbl').removeAttr('style');   
   //                 $('#export').html('');
   //                 $('#invalid_emails').text('');
   //                 $('#invalid_e').text('');
   //                 $('#username1').text('');
   //                 $("#u_validate").text('');
   //                 $('#fileUploadDiv').hide();
   //                 $('#btnClrTbl').show();
   //                 $("#nextBtn").removeAttr('disabled');
   //                 $("#backBtn").removeAttr('disabled');
   //                 $('#tblArry').DataTable().destroy();
   //                 // $('#tbl').DataTable().destroy();
   //                 $('#tblArry tbody').html("");
   //                 $('#tblArry').hide();
   //                 emailcheck = false;
   //                 usercheck = false;
                   
   //                 swal({
   //                     title: '',
   //                     text: 'Does your file consist a header row?',
   //                     type: 'warning',
   //                     showCancelButton: true,
   //                     confirmButtonText: 'Yes, it contains',
   //                     cancelButtonText: 'No',
   //                     confirmButtonClass: "btn btn-success btn-fill",
   //                     cancelButtonClass: "btn btn-danger btn-fill",
   //                     buttonsStyling: false
   //                 }).then((head) => {
   //                     swal({
   //                         title: 'Header row was removed!',
   //                         text: '',
   //                         type: 'success',
   //                         confirmButtonClass: "btn btn-success btn-fill",
   //                         buttonsStyling: false
   //                     });
   //                     // console.log(data1);
   //                     data1.splice(0, 1);
   //                     console.log(data1.length);
   //                     e = $('#tbl').DataTable({
   //                     destroy: true,
   //                     data: data1,
   //                     columns: headData,
   //                     responsive: false,
   //                     paging:false
   //                     });
       
   //                     if(newDataLen<=500){
   //                         $("#export-btn").show();
   //                         $("#hide_email_row").show();
   //                         $("#hide_user_row").show();
   //                         $("#aa").css("display", "none");
   //                     }else
   //                     if(newDataLen>500){
   //                         setTimeout(()=>{
   //                             $.notify({
   //                                 icon: "",
   //                                 message: "<b> Error - </b> Maximum limit of students is 500.Please upload csv file again."
   //                             },{
   //                                     type: "danger",
   //                                     timer: 6000,
   //                                     placement: {
   //                                         from: 'top',
   //                                         align: 'center'
   //                                     }
   //                             });
       
   
   //                         },2000);
                           
   //                         $("#nextBtn").attr('disabled', 'disabled');
   //                         $("#backBtn").attr('disabled','disabled');
                           
   //                     }
                       
                       
   //                     // $("#uploadName").text(uploadfilename);
                       
   //                 }, function(dismiss) {
   //                     // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
   //                     if (dismiss === 'cancel') {
   //                       e = $('#tbl').DataTable({
   //                         destroy: true,
   //                         data: data1,
   //                         columns: headData,
   //                         responsive: false,
   //                         paging:false
   //                         });
                   
   //                         if(data1.length<=500){
   //                             $("#export-btn").show();
   //                             $("#hide_email_row").show();
   //                             $("#hide_user_row").show();
   //                             $("#aa").css("display", "none");
   //                             // $("#uploadName").text(uploadfilename);
   //                         }
   //                     }
   //                 })
                       
                   
                   


   //             }else {
   //                 swal(
   //                     'Error...',
   //                     'No data to import!',
   //                     'error'
   //                 );
   //             }
   //         };
   //         reader.onerror = function () {
   //             swal(
   //                 'Error...',
   //                 'Unable to read ' + file.fileName,
   //                 'error'
   //             );
   //             document.getElementById("txtFileUpload").value="";

   //         };
   //     }
   // }

  
}); 

// function for email
function myRadioyes1() {
    $(".deposit").show();
    $("#invalid_emails").show();
    $("#invalid_e").show();
    $("#invalid_emails").text('');
    $("#invalid_e").text('');
    emailcheck = false;
}

function myRadiono1() {
    $('#selectEmailCol').val('');
    $(".deposit").hide();
    $("#invalid_emails").hide();
    $("#invalid_e").hide();
    
    emailcheck = true;
    enableNext()
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

$(document).ready(function () {
    // to change select option for email
    $("#selectEmailCol").change(function () {
        var sel = $("#selectEmailCol").val();
        // console.log(sel);
        var emailArr = new Array();
        if(sel==''){        
        $("#invalid_emails").html('');
        }
        else{
            // $('.redClass tbody tr').each(function () {
            //     var arrVal = $(this).find("td:nth-child(" + sel + ")").html();
            //     emailArr.push(arrVal);
            // });
            emailArr= $('#tbl').DataTable().column(sel).data();

        }

        
        var eArr = new Array();
        // console.log(emailArr.length);
        for (i = 0; i < emailArr.length; i++) {
            if (emailArr[i].match(RegExp(email))) {
                // console.log("matched  " + emailArr[i]);
            }
            else {
                eArr.push(emailArr[i]);   
                // console.log("not matched  " + eArr);
            }
        }
        if(eArr==""){
            $("#invalid_emails").text("");
            $("#invalid_emails").removeClass("text-danger");
            $("#invalid_emails").addClass("text-success");
            emailcheck = true;
            enableNext()
            // $("#nextBtn").removeAttr('disabled');
        }else if(eArr!=""){
                $("#invalid_emails").html("<b>These email Ids are not valid : </b><span style='color:black'>" + "   " + eArr.slice(0, 5) + "... </span>");
                $("#invalid_emails").removeClass("text-success");
                $("#invalid_emails").addClass("text-danger");
                emailcheck = false;
                enableNext()
                // $("#nextBtn").attr('disabled', 'disabled');
        }else{}
        
        //  console.log(emailArr);
        //  console.log("not matched  " + eArr);
        if (emailArr.length > 0) {
            $("#invalid_e").hide();
        }
        else {
            $("#invalid_e").show();
        }
    });

   


    //select option for name    
    $("#selectuserIdCol").change(function () {
        var user = $("#selectuserIdCol").val();
        console.log(user);
        var userArr = new Array();
        
            // $('#tbl tbody tr').each(function () {
            //     var arrVal2 = $(this).find("td:nth-child(" + user + ")").html();
            //     userArr.push(arrVal2);
            // });

            userArr= $('#tbl').DataTable().column(user).data();
       
        // console.log(userArr);

        //validation for user name
        var usernameRegex = /^[a-z0-9@_.-]+$/i;
        //  var userEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var u_regex_arr = new Array();
        for (i = 0; i < userArr.length; i++) {
            if (userArr[i].match(RegExp(email))) {
                //do something
            }   
            else{
                if (userArr[i].match(RegExp(usernameRegex))) {
                    //do something
                }   
                else{
                    u_regex_arr.push(userArr[i]);
                }
            }
        }

        if(u_regex_arr==null || u_regex_arr=='' ){
            $("#u_validate").text("");
            $("#u_validate").removeClass("text-danger");
            $("#u_validate").addClass("text-success");
            // $("#nextBtn").removeAttr('disabled');
        
            // for unique name validation
                    var duplicates = userArr.reduce(function (acc, el, i, arr) {
                        if (arr.indexOf(el) !== i && acc.indexOf(el) < 0)
                        acc.push(el);
                        return acc;
                    },
                    []);
                    // console.log("duplicates" + duplicates); 
                    if (duplicates != "") { 
                        $("#username1").html("<b>Duplicates : </b> <span style='color:black'>" + duplicates + '</span>');
                        $("#username1").addClass("text-danger");
                        usercheck = false;
                        enableNext()
                        // $("#nextBtn").attr('disabled', 'disabled');
                    
                    }
                    else {
                        $("#username1").addClass("text-success");
                        $("#username1").text("");
                        usercheck = true;
                        enableNext()
                        // $("#nextBtn").removeAttr('disabled');
                    }
        }else{
            $("#u_validate").html("<b>Invalid Username* : </b><span style='color:black'>" + "   " + u_regex_arr.slice(0, 5) + "... </span><br/><b>* Usernames can be either valid Email Id or contains only (@ _ . -) special characters.</b>");
            $("#u_validate").removeClass("text-success");
            $("#u_validate").addClass("text-danger");    
            usercheck = false;
            enableNext()
            // $("#nextBtn").attr('disabled', 'disabled');
        }

        
    });




});

// export to json .DataTable().column(user).data()

var $TABLE = $('#tbl');
var $BTN = $('#selectuserIdCol');
var $EXPORT = $('#csvJson');

// Get the headers (add special header logic here)
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.change(function () {
    var Jdata = arrtoJSON();
    $EXPORT.val(JSON.stringify(Jdata));
    console.log(JSON.stringify(Jdata))
});

function arrtoJSON() {
    var $rows = $TABLE.find('tr:not(:hidden)');
    var headers = [];
    var data = [];

    // Get the headers (add special header logic here)
    $($rows.shift()).find('th:not(:empty)').each(function () {
        headers.push($(this).text());
    });

    // Turn all existing rows into a loopable array
    $rows.each(function () {
        var $td = $(this).find('td');
        var h = {};

        // Use the headers from earlier to name our hash keys
        headers.forEach(function (header, i) {
        h[header] = $td.eq(i).text();
        });

        data.push(h);
    });
  
    if (data.length > 0) {
        // console.log("------")
        // console.log(typeof data);
        return data;
        // do stuff
    }
    else {        
        $EXPORT.val("");
    }      
}
