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
            $("#allSections").append(newLiveSection(counter,playlistdata,collb1,collb2));
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

    var d = new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // var today = new Date();

    var newOpen = new Date(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours()+2,d.getMinutes()+30);

    var ss = newOpen.getSeconds();
    var mm = newOpen.getMinutes();
    var hh = newOpen.getHours();
    var dd = newOpen.getDate();
    var mon = newOpen.getMonth();
    var yy = newOpen.getFullYear();
    if (dd < 10) { dd = '0' + dd }
    if (hh < 10) { hh = '0' + hh }
    if (mm < 10) { mm = '0' + mm }
    if (ss < 10) { ss = '0' + ss }

    document.getElementById("begin_time").value = dd +" "+ months[mon] +" "+ yy +" "+ hh +":"+ mm;
    console.log(document.getElementById("begin_time").value);

   
    var newEnd = new Date(d.getFullYear(),d.getMonth()+5,d.getDate(),d.getHours(),d.getMinutes());

    var ss = newEnd.getSeconds();
    var mm = newEnd.getMinutes();
    var hh = newEnd.getHours();
    var dd = newEnd.getDate();
    var mon = newEnd.getMonth();
    var yy = newEnd.getFullYear();
    if (dd < 10) { dd = '0' + dd }
    if (hh < 10) { hh = '0' + hh }
    if (mm < 10) { mm = '0' + mm }
    if (ss < 10) { ss = '0' + ss }

    document.getElementById("end_time").value = dd +" "+ months[mon] +" "+ yy +" "+ hh +":"+ mm;   
    console.log(document.getElementById("end_time").value);
    
    // var Deadline = document.getElementById("end_time").value; (date.getMonth() < 9 ? '0': '')    
}); 


function newLiveSection(idx,playlistdata,collb1,collb2) { 
    
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
                                    <span id="maxquesId'+idx+'" class="text-danger"></span>\
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
                        <input type="number" style="display:none" class="form-control" id="number'+idx+'" min="1" max="50" value="" required>\
                                    <select style="display:none;" name="order'+idx+'" id="order'+idx+'" class="form-control valid" data-style="btn-default" required>\
                                        <option value="ordered">Ordered</option>\
                                        <option value="random">Random</option>\
                                    </select>\
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
                                    <select name="help_level_selectorReview'+idx+'" id="help_level_selectorReview'+idx+'" class="form-control valid" data-style="btn-default" onchange="javascript:helpSelectReview('+idx+')" required>\
                                        <option value="">Select</option>\
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
                                <div class="checkbox">\
                                <input id="partialGrade'+idx+'" name="partialGrade'+idx+'" type="checkbox">\
                                <label for="partialGrade'+idx+'">\
                                    Allow partial grading in Fill-in questions. Partially correct answers will be counted as incorrect but will be awarded prorated score based on fraction of answer correct and incorrect.\
                                </label>\
                            </div>\
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

let prTbl = $('#takerTblDyn').editTable({
    data: [['']],
    tableClass: 'inputtable',
    jsonData: false,
    first_row: false, 
    headerCols: [
        'A',
        'B',
        'C'
    ],
    maxRows: 500,
    tableClass: 'inputtable custom',
    
});


$("#sndEmailAllow").change(function () {
    var semail=$('#sndEmailAllow').prop('checked');
    if(semail==true){
        $(".deposit").show();
        showTakersError();
        emailcheck = false;
    }else{
        $('#selectEmailCol').val('');
        $(".deposit").hide();
        showTakersError();
        emailcheck = true;
    }
    showTakersError();
});

$(document).ready(function () {
    $("#nextBtn").on('click', nextPage)

    $("#backBtn").on('click', backPage)
});
var currentPage=1;

function nextPage(){
    currentPage++;
    if(currentPage==3){
        showTakersError();
    }
}

function backPage(){
    currentPage--;
    if(currentPage==3){
        showTakersError();
    }
}

function removeDuplicates(data) {
    return data.filter((value,index)=> data.indexOf(value)===index);
}

function checkTableData(){
    var errFlag=false;
    
    var sentEmailSel = $('#sndEmailAllow').prop('checked');
    // $("input[name=sndEmailAllow]:checked").each(function() {
    //     var value = $(this).val();  
    //     sentEmailSel = value;
    // });
    
    var emailColSel = $("#selectEmailCol option:selected" ).attr('data-col');
    
    var userColSel = $("#selectuserIdCol option:selected" ).attr('data-col');

    var sel = $("#selectEmailCol").val();
    var emailArr = new Array();

    var user = $("#selectuserIdCol").val();
    var userArr = new Array();

    var usernameRegex = /^[a-z0-9@_.-]+$/i;

    prTbl.getData().forEach((itm) => {
        emailArr.push(itm[sel]);
        userArr.push(itm[user]);
    });
    
    var eArr = new Array();

    if(sel==''){        
        eArr.length==0; 
       var duplicates1 = "";
    }
    else{
        
        var errMatch = new Array();
        for (i = 0; i < emailArr.length; i++) {
            if (emailArr[i].match(RegExp(email))) {
                errMatch.push(emailArr[i]);   
                // console.log("matched  " + emailArr[i]);
            }
            else {
                eArr.push(emailArr[i]);   
                // console.log("not matched  " + eArr);
            }
        }
        var duplicates1 = errMatch.reduce(function (acc, el, i, arr) {
            if (arr.indexOf(el) !== i && acc.indexOf(el) < 0)
            acc.push(el);
            return acc;
        },
        []);
    }

    // console.log(eArr.length)
    // console.log(duplicates1)
    
    var u_regex_arr = new Array();
    if(user==''){        
        u_regex_arr.length==0; 
       var duplicates = "";
    }
    else{
        for (i = 0; i < userArr.length; i++) {
            if (userArr[i].match(RegExp(email))) {
                //do something
                // console.log("matched  " + userArr[i]);
            }   
            else{
                if (userArr[i].match(RegExp(usernameRegex))) {
                    //do something
                    // console.log("matched  " + userArr[i]);
                }   
                else{
                    // console.log("not matched  " + u_regex_arr);
                    u_regex_arr.push(userArr[i]);
                }
            }
        }
    }
    // for unique name validation
    var duplicates = userArr.reduce(function (acc, el, i, arr) {
        if (arr.indexOf(el) !== i && acc.indexOf(el) < 0)
        acc.push(el);
        return acc;
    },
    []);

    let ar = prTbl.getData();
    let checkBlank = checkAllBlank(ar);

    

    indexCol ={'0':'A','1':'B','2':"C"}
    let blankCell=[];
    ar.map(dta=>{
        let obj = {}
        
        dta.map((itm,index)=>{
            if(!checkBlank[index]){
            // include only if the whole col is blank
            let val = itm
            // console.log(!itm.trim())
            if(!itm.trim()){
                val="";
                // $('').
                // input[type="text"]
                blankCell.push(indexCol[index]);
            }
            obj[indexCol[index]] = val
        }
        })
    })
    
    let emptyCell=removeDuplicates(blankCell);
    

    var errArry=[];
    // console.log(ar)

    ////////////////////////checks////////////////////////////////////////
    if(ar[0][0]=="" && ar[0][1]=="" && ar[0][2]==""){
        errArry.push("No participants added")
        errFlag=true;
    }
    // else if(sentEmailSel==true){
    //     errArry.push("Send email field is not selected")
    //     // $("#editTableError").html("<b>Send email field is not selected</b>");
    //     errFlag=true;
    // }
    else if(sentEmailSel==true  && emailColSel==''){
        errArry.push("Email column  is not selected")
        // $("#editTableError").html("<b>Identify Email column field is not selected</b>");
        errFlag=true;
    }else if(userColSel==''){
        errArry.push("Username column is not selected")
        // $("#editTableError").html("<b>Identify Username column field is not selected</b>");
        errFlag=true;
    }else{
        // console.log("hiii")
        if(checkBlank["0"]==true){
            errArry.push('Column A cannot be blank')
            // $("#editTableError").html('<b>Column "A" cannot be blank in Participants tab!!</b>');
            errFlag=true;
        }else if(checkBlank["0"]==false && checkBlank["1"]==true && checkBlank["2"]==false){
            errArry.push('Column B cannot be blank if Column A and Column C are filled.')
            // $("#editTableError").html('<b>Column "B" cannot be blank. Either empty column "C" or add data in column "B" in  Participants tab</b>');
            errFlag=true;
        }
        else{
            // console.log("hi 222")
            if(blankCell.length>0){
                errArry.push("There are some blank cells in Column(s): "+ emptyCell.toString().replace(/,/g, ", "))
                // $("#editTableError").html("<b>Their are some partially blank cells in column</b>");
                errFlag=true;
            }else{
                if(u_regex_arr.length==0 ){
                    //////check user name
                    if (duplicates != "") { 
                        errArry.push("Duplicate value found : <span style='word-break: break-all;'>" +  duplicates.toString().replace(/,/g, ", ") + "</span>")
                        // $("#editTableError").html("<b>Duplicate value found : </b> <span style='color:black'>" + duplicates + "</span>");
                        errFlag=true;
                    }
                    else {
                        if(eArr.length==0){
                            ///////email column check
                            if (duplicates1 != "") { 
                                errArry.push("Duplicate value found : <span style='word-break: break-all;'>" + "   " + duplicates1.toString().replace(/,/g, ", ") + "... </span>")
                                // $("#editTableError").html("<b>Duplicate value found : </b><span style='color:black'>" + "   " + duplicates1.slice(0, 5) + "... </span>");
                                errFlag=true;
                            }else{
                                // $("#editTableError").html('');
                                errArry=[];
                                errFlag=false;
                            }
                        }else if(eArr.length>0){
                            // console.log("hii")
                            errArry.push("Some email Ids are not valid in the selected email column: <span style='word-break: break-all;'>" + "   " + eArr.toString().replace(/,/g, ", ") + "... </span>")
                            // $("#editTableError").html("<b>These email Ids are not valid : </b><span style='color:black'>" + "   " + eArr.slice(0, 5) + "... </span>");
                            errFlag=true;
                        }else{
                            // $('#editTableError').html('');
                            errArry=[];
                            errFlag=false;  
                        }
                    }
                }else{
                    errArry.push("Invalid or Blank Username* : <span style='word-break: break-all;'>" + "   " + u_regex_arr.toString().replace(/,/g, ", ") + "... </span><br/>* Usernames can be either valid Email Id or unique alphanumeric words contains only  (@ _ . -)  special characters.")
                    // $("#editTableError").html("<b>Invalid or Blank Username* : </b><span style='color:black'>" + "   " + u_regex_arr.slice(0, 5) + "... </span><br/><b>* Usernames can be either valid Email Id or unique alphanumeric words contains only  (@ _ . -)  special characters.</b>");
                    errFlag=true;
                }
            }
        }
    }
    var errJSON={};
    errJSON["errFlag"]=errFlag;
    errJSON["errArry"]=errArry;
    return errJSON;
}

function showTakersError(){

    if(checkTableData().errFlag==true){
        $("#editTableError").empty();
        var arr = checkTableData().errArry;
        // $('ul').empty()
        for(var i=0;i<arr.length;i++){
            $("#editTableError").append('<li>'+arr[i]+'</li>');
        }
        $("#tableErrDiv").show();
        $("#nextBtn").attr('disabled', 'disabled');
        $("#backBtn").attr('disabled', 'disabled');
    }else{
        $("#tableErrDiv").hide();
        $("#nextBtn").removeAttr('disabled');
        $("#backBtn").removeAttr('disabled');
    }
}

$(document).ready(function () {

    if($("#aa").length>0){
        document.getElementById('aa').addEventListener('click',function(){
            document.getElementById('btnTakerFromCsv').click();
        });        
     }
     prTbl.loadData([['']]);

// Reset table data
$('#resetTbl').click(function (event) {

    event.preventDefault();
    swal({
        title: 'Are you sure?',
        text: "You want to reset table",
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes, reset it!',
        buttonsStyling: false,
        allowOutsideClick: false
    }).then(function() {
        prTbl.reset();
        emailcheck = true;
        usercheck = true;
        $(".deposit").hide();
        $('#invalid_emails').text('');
        $('#invalid_e').text('');
        $('#username1').text('');
        $("#u_validate").text('');
        // $('#myRadioyes').prop('checked',false);
        // $('#myRadiono').prop('checked',false);
        $('#sndEmailAllow').prop('checked',false);
        $('#selectuserIdCol').val('');     
        $('#selectEmailCol').val('');
        $("[id^=btnquizid]").removeAttr('disabled');
        $("#tblRowCount").html("Total: 1 Participants");
        showTakersError();
        // enableNext();
        return false;
    }).catch(function(){
        console.log("Aborted clone req");
    });

});

    // Method that checks that the browser supports the HTML5 File API
    function browserSupportFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            isCompatible = true;
        }
        return isCompatible;
    }

    $("#btnTakerFromCsv").change(function(evt){
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
                var size = document.getElementById('btnTakerFromCsv').files[0].size;
                //document.getElementById("id_students").disabled=true;
                if(!size > 512000){
                    swal(
                    'Error...',
                    'Only upto 500 kb file can be uploaded !!',
                    'error'
                    );
                    document.getElementById("btnTakerFromCsv").value="";
                    //document.getElementById("id_students").disabled=false;
                    return false;

                }
            }
            else{
                swal(
                'Error...',
                'Invalid File Extension, file must be in CSV format.',
                'error'
                );
                //will clear the file input box.
                //location.reload();
                document.getElementById("btnTakerFromCsv").value="";
                //document.getElementById("id_students").disabled=false;
                return false;
            }
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
                            // items2.push("<td><span id='span_remove' class='text-danger table-remove fa fa-times'></span></td>");
                            data1.push(items2);
                        }) 


                    }else {
                        // alert(1)
                       
                        data.forEach(items2 =>{
                             var newdt = [];
                            // items2='sjhf';
                            // console.log(data[0].length)
                            // items2.splice(dataLen);
                            // items2.push("<td><span id='span_remove' class='text-danger table-remove fa fa-times'></span></td>");
                            data1.push(items2);
                        })

                        headData.splice(dataLen);
                    }
                    headData.push({title:""});
                }

   
                // console.log(data1);

                data1.forEach((i,nm)=>{
                    i.forEach((j,ind)=>{
                    if(j==''){
                        data1[nm][ind] = ""//BLANK
                    }
                  })
                })

                
                if (data1 && data1.length > 0) {  
                    let newDataLen = data1.length-1;
                   
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

                        
                        
                        /////////
                        let oldTdta = prTbl.getData();
                        
                        // console.log(oldTdta.length)
                        var dataLen1 = oldTdta[0].length;
                        var data2 = [];
                        if(dataLen1>3){
                            
                            oldTdta.forEach(items2 =>{
                                items2.splice(3);
                                data2.push(items2);
                            }) 
                            
                            
                        }else {
                            // alert(1)
                            
                            oldTdta.forEach(items2 =>{
                                var newdt = [];
                                data2.push(items2);
                            })
                            
                            headData.splice(dataLen1);
                        }
                        headData.push({title:""});
                        //////////
                    //    data2.push(data1)
                    // console.log(data2)
                    if(data2[0][0]=="" && data2[0][1]=="" && data2[0][2]==""){
                        // console.log(1)
                        data2.splice(0,1);
                    }
                    // console.log(data2)

                    data1.forEach(itm3 =>{
                        data2.push(itm3);
                    })
                        
                        // console.log(data2)
                        // console.log(data1.length);
                        // console.log(data2.length);
                       
        
                        if(newDataLen<=500){
                            
                             prTbl.loadData(data2); 
                             $("#tblRowCount").html("Total: "+data2.length+" Participants");
                             showTakersError();
                            
                        }else if(newDataLen>500){
                            setTimeout(()=>{
                                $.notify({
                                    icon: "",
                                    message: "<b> Error - </b> Maximum limit of takers is 500.Please upload csv file again."
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
                            let oldTdta1 = prTbl.getData();
                            var dataLen2 = oldTdta1[0].length;
                            var data3 = [];
                            if(dataLen2>3){
                                oldTdta1.forEach(items2 =>{
                                    items2.splice(3);
                                    data3.push(items2);
                                }) 
                            }else {
                                
                                oldTdta1.forEach(items2 =>{
                                    var newdt = [];
                                    data3.push(items2);
                                })
                                
                                headData.splice(dataLen2);
                            }
                            headData.push({title:""});
                            if(data3[0][0]=="" && data3[0][1]=="" && data3[0][2]==""){
                                // console.log(1)
                                data3.splice(0,1);
                            }
                   
                            data1.forEach(itm3 =>{
                                data3.push(itm3);
                            })
                    
                            if(data1.length<=500){
                                prTbl.loadData(data3); 
                                $("#tblRowCount").html("Total: "+data3.length+" Participants");
                                showTakersError();
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
                document.getElementById("btnTakerFromCsv").value="";
            };
    });
}); 

$(document).ready(function () {
    // to change select option for email
    $("#selectEmailCol").change(function () {
        showTakersError();
    });


    //select option for name    
    $("#selectuserIdCol").change(function () {
        showTakersError();
    });
});

let checkAllBlank = (data) => {
    let blanks = {}
    data.map(itm => {
      itm.map((rec, index) => {
          if(!blanks[index]){ blanks[index]=0}
        if (!rec.trim()) {blanks[index]++}
      })
    })
    let colBlank = {}
    Object.keys(blanks).map((col,index)=>{
        if(!colBlank[index]){
          colBlank[index] = false
      }
      if(blanks[col]==data.length){
          colBlank[index] = true
      }
    })
      return colBlank
  }

  
function tblToJson(){
    let ar = prTbl.getData();
      
      let checkBlank = checkAllBlank(ar)
      let data = []
    //   console.log(checkBlank)
      if(checkBlank["0"]==true){
        // error
        swal(
            'Error...',
            'Column "A" cannot be blank in Participants tab!!',
            'error'
            );
        return false;
      }else if(checkBlank["0"]==false && checkBlank["1"]==true && checkBlank["2"]==false){
          //error
          swal(
            'Error...',
            'Column "B" cannot be blank. Either empty column "C" or add data in column "B" in Participants tab',
            'error'
            );
            return false;
      }else{
          indexCol ={'0':'A','1':'B','2':"C"}
      
        ar.map(dta=>{
            let obj = {}
            dta.map((itm,index)=>{
                if(!checkBlank[index]){
                // include only if the whole col is blank
                let val = itm
                if(!itm.trim()){
                    val="BLANK"
                }
                obj[indexCol[index]] = val
            }
            })
            data.push(obj)
        })
        return data;
      }
      
      
    //   console.log(data)
}

//get takers from another quiz
function getTakerList(quizId,author,idx){
    
    $("#btnquizid"+idx).attr('disabled', 'disabled');
    var user_data2 = new Object;
        user_data2.authorname = author;
        user_data2.quizId = quizId;
        // console.log(author+"----"+quizId);
        $.post("/author_getquizTakerList", user_data2, function (data) {
            if (data.status == 'success') {
                let oldTdta = prTbl.getData();
                        
                // console.log(oldTdta.length)
                var dataLen1 = oldTdta[0].length;
                var data2 = [];
                if(dataLen1>3){
                    
                    oldTdta.forEach(items2 =>{
                        items2.splice(3);
                        data2.push(items2);
                    }) 
                    
                    
                }else {
                    // alert(1)
                    
                    oldTdta.forEach(items2 =>{
                        var newdt = [];
                        data2.push(items2);
                    })
                    
                    
                }

                if(data2[0][0]=="" && data2[0][1]=="" && data2[0][2]==""){
                    // console.log(1)
                    data2.splice(0,1);
                }

              

                var takDta = data.takerdata;
                takDta.forEach(itm3 =>{
                     data2.push(itm3);
                })
                let newDataLen = data2.length-1;

                if(newDataLen<=500){
                    // $("#export-btn").show();
                    // $("#hide_email_row").show();
                    // $("#hide_user_row").show();
                    // $("#aa").css("display", "none");
                     prTbl.loadData(data2); 
                     $("#tblRowCount").html("Total: "+data2.length+" Participants");
                     showTakersError();

                     $('#takerListMdl').modal('hide');
                    
                }else if(newDataLen>500){
                    setTimeout(()=>{
                        $.notify({
                            icon: "",
                            message: "<b> Error - </b> Maximum limit of takers is 500.Please upload csv file again."
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
                    $('#takerListMdl').modal('hide');
                }



                // takerdata
            }
            else if (data.status == 'error') {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: data.msg
                });
            }
        });
}    

$(document).ready(function () {

    function getLiveFormData() {
        fdata = {};
        fdata["quizType"] = "live"
        fdata["author"] = document.getElementById("author").value;

        var allTags = document.getElementById("tags").value;
        var tagArray = allTags.split(",");
        fdata["tags"] = tagArray;

        fdata["title"] = document.getElementById("title").value;

        fdata["description"] = document.getElementById("desc").value;
        fdata["authorName"] = document.getElementById("authorName").value;
        fdata["authorEmail"] = document.getElementById("quizEmail").value;
        fdata["quizLang"] = document.getElementById("quizLang").value; 

        fdata["instruction"] = quiz_intr.getValue();
        // var SecDataArr =[];
        // SecDataArr.push(SecData);
        fdata["sections"] = getSections();

        //----------------------Student ID Section------------------------------------------------------------csvJson
        // var allStu = document.getElementById("id_students").value;
        // var new_str = allStu.replace(" ","","g");
        // var new_str = allStu.replace(/\s+/g, "");

        // var stuArr = new_str.split(",");

        var takdata = {};

        // var csvJsonData = $("#csvJson").val();
        // var arryJsonData = $("#arryJson").val();

        // if (document.getElementById("txtFileUpload").value == "") {
        //     takdata["userData"] = JSON.parse(arryJsonData);
        // } else {
        //     takdata["userData"] = JSON.parse(csvJsonData);
        // }

        var csvJsonData = tblToJson();
            // console.log(csvJsonData)
            if(csvJsonData==false){
                return false
            }else{
                takdata["userData"]= csvJsonData; 
            }

        //----------------------send email Section------------------------------------------------------------
        // var sentEmail = '';
        // $("input[name=sndEmailAllow]:checked").each(function () {
        //     var value = $(this).val();
        //     sentEmail = value;
        // });
        // if(sentEmail=="yes"){
        //     takdata["sendEmail"] = true;
        // }else{
        //     takdata["sendEmail"] = false;
        // }
        takdata["sendEmail"] = $('#sndEmailAllow').prop('checked');

        //----------------------email col Section------------------------------------------------------------
        takdata["emailCol"] = $("#selectEmailCol option:selected").attr('data-col');

        //----------------------username col Section------------------------------------------------------------
        takdata["userCol"] = $("#selectuserIdCol option:selected").attr('data-col');

        // console.log(takdata);


        fdata["takers"] = takdata;

        //----------------------duration  Section------------------------------------------------------------

        var d = document.getElementById("duration").value;
        if (d != "") {
            fdata["duration"] = parseInt(document.getElementById("duration").value);
        }

        var begin_time = document.getElementById("begin_time").value;
        var end_time = document.getElementById("end_time").value;
// 04 Sep 2019 00:00 - 04 Sep 2019 23:59
        // fdata["period"] = document.getElementById("start_date").value;
        fdata["period"] = begin_time +" - "+ end_time;

        //----------------------timezone Section------------------------------------------------------------

        var d = new Date();
        var n = d.getTimezoneOffset();
        var timezone = n / -60;
        fdata["zone"] = timezone;



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
        $("input[name=score_avalb__selector1]:checked").each(function () {
            var value = $(this).val();
            jsonObjscores1.push(value);
        });
        // console.log("jsonObjscores1--- score---"+jsonObjscores1);
        var scoreArray = jsonObjscores1[0].split(",");
        // console.log("score---"+scoreArray);
        // console.log("score---"+scoreArray[0]);
        // console.log("review---"+scoreArray[1]);

        //----------------------review Section------------------------------------------------------------
        fdata["review"] = scoreArray[1];

        //----------------------score Section------------------------------------------------------------
        fdata["score"] = scoreArray[0];

        var security;
        $("input[name=security_level]:checked").each(function () {
            var value = $(this).val();
            security = value;
        });
        fdata["security"] = security;

        var loginTime;
        $("input[name=duration_interpretation]:checked").each(function () {
            var value = $(this).val();
            loginTime = value;
        });
        fdata["loginTime"] = loginTime;

        var calculator;
        $("input[name=calculator]:checked").each(function () {
            var value = $(this).val();
            calculator = value;
        });
        fdata["calculator"] = calculator;

       
        fdata["allowFC"] =   !$('#logoutFC').prop('checked');
        fdata["allowStats"] =   $('#allowStats').prop('checked');

        return fdata;
    }

    $("#btnGetLiveEval").bind("click", function () {
        if(validationCheck()) {
            qdata = getLiveFormData();
            console.log(JSON.stringify(qdata,null,2));
           
            document.getElementById("livedata").value = JSON.stringify(qdata);
            var data= document.getElementById('livedata').value;
            var type= document.getElementById('type').value;
            var authorname= document.getElementById('authorname').value;
            // var playlist_name_hidden= document.getElementById('playlist_name_hidden').value;
            // var section_name_hidden= document.getElementById('section_name_hidden').value;
            var errArry =[];
            var allSection = [];
            var allPlaylist = [];
            qdata.sections.forEach(function(itm,index) {
                if(itm.title.trim()=="" || itm.playlist=="" ||itm.sectionName.trim()=="" ||itm.choose==""){
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
            }else  if(checkSec){
                swal(
                    'Error...',
                    checkSecMsg,
                    'error'
                    );
            }if(checkTableData().errFlag==true){
                var errList = checkTableData().errArry;
                swal(
                    'Error...',
                    'Their are some errors in participants tab',
                    'error'
                    );
            } else{

                // return;
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