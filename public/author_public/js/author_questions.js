//form validation//
function validateQuestionContent(){
    var reg =/\b(0|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-4][0-9]{3}|5000)\b/;
    var allTags = document.getElementById("id_commentsTg").value;
    var tagArray = allTags.split(",");
console.log(reg.test($("#subLimit").val()))

        if (tagArray.length < 3 ) {
            swal(
                'Error...',
                'Minimum 3 tags required  !!',
                'error'
            );
             return false;
            
        }
        // else if(reg.test($("#subLimit").val()) ==false){
        //     swal(
        //         'Error...',
        //         'Only value from 10-5000 is allowed in limit field',
        //         'error'
        //     );
        //      return false;
        // }
        else{
        return true; 
        }
    
}
// $(function(){
$('#id_keyword').tagsinput({
    maxTags: 10
});


$('#selectChoice').on('change', function () {

    var selectChoice;
    $("select[id=selectChoice]").each(function () {
        var value = $(this).val();
        selectChoice = value;
    });


// console.log(selectChoice)
    if(selectChoice=="TextAndDraw"){
        $('#limitDiv').show();
        $('#drawDiv').show();
    }else if(selectChoice=="textAns"){
        $('#limitDiv').show();
        $('#drawDiv').hide();
    }else if(selectChoice=="draw"){
        $('#limitDiv').hide();
        $('#drawDiv').show();
        
    }else{
        $('#limitDiv').hide();
        $('#drawDiv').hide();
    }
    
  });


            


$("#subLimit").focusout(function(){
    var reg1 =/\b([1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-4][0-9]{3}|5000)\b/;
    //console.log($("#subLimit").val())
    //console.log(reg.test($("#subLimit").val()))
    if(reg1.test($("#subLimit").val()) ==true){
        $('#limitErr').html("");
    }else{
        $('#limitErr').html("<small><b>Enter value between 10-5000</b></small");
    }
    
  });


// functionality for all types of questions 
// note that the names of div's used here must match the div where it is being used.
// common functions 

function newSections(idNo,type,value){
    console.log("data"+ JSON.stringify(value))
    if(!value && !value.data){
        value.data="";
    }
    var newTemplate = " ";
    if(type!='Flash Card'){
         newTemplate =  "</div><div class='col-lg-12' id='sectiondiv_new-"+idNo+"'>\
         <div class='card inputcard2'>\
             <div class='card-content'>\
                 <div class='row'>\
                         <div class='col-sm-12 text-right'>\
                             <button type='button' rel='tooltip' title='' class='btn btn-danger' data-original-title='Delete' id='deleteSection'>\
                                 <i class='ti-trash'></i></button>\
                             </div>\
                         </div>\
                         <hr style='padding:0px;margin-top:5px;'><br/>\
                         <div class='row'>\
                             <div class='col-sm-12'>\
                             <textarea name='section_value_new' rows=6 class='form-control' id='section_value_new-"+idNo+"'>"+value.data+"</textarea>\
                         </div>\
                     </div>\
                 </div>\
             </div>\
         </div></div>";
    
    }else{
        if(!value || !value.back){
            value.back="";
        } 
        newTemplate =  "<div class='col-lg-12' id='sectiondiv_new-"+idNo+"'>\
         <div class='card inputcard2'>\
             <div class='card-content'>\
                 <div class='row'>\
                         <div class='col-sm-12 text-right'>\
                             <button type='button' rel='tooltip' title='' class='btn btn-danger' data-original-title='Delete' id='deleteSection'>\
                                 <i class='ti-trash'></i></button>\
                             </div>\
                         </div>\
                         <hr style='padding:0px;margin-top:5px;'><br/>\
                         <div class='row'>\
                             <div class='col-sm-6'>\
                             <h6>Front</h6>\
                             <textarea name='section_value_new' rows=6 class='form-control' id='section_value_new-"+idNo+"-front'>"+value.data+"</textarea>\
                         </div>\
                         <div class='col-sm-6'>\
                         <h6>back</h6>\
                         <textarea name='section_value_new' rows=6 class='form-control' id='section_value_new-"+idNo+"-back'>"+value.back+"</textarea>\
                     </div>\
                     </div>\
                 </div>\
             </div>\
         </div></div></div>";
    }
    return newTemplate;
}



function getSections(type){
    var defiA=[];  
    if(type=="Flash Card"){
        $("[id^=sectiondiv_old]").each(function(){
            var name =  $(this).attr('id');
            var id  = name.split('-');
            var c_id = id[1];
            // defiA.push(sec_value_old[c_id].getValue());
            defiA.push(sec_value_old_front[c_id].getValue());
            defiA.push(sec_value_old_back[c_id].getValue());
        });
        $("[id^=sectiondiv_new]").each(function(){
            var name =  $(this).attr('id');
            var id  = name.split('-');
            var c_id = id[1];
            defiA.push($("#section_value_new-"+c_id+"-front").val());
            defiA.push($("#section_value_new-"+c_id+"-back").val());
        });
    }else{
        $("[id^=sectiondiv_old]").each(function(){
        var name =  $(this).attr('id');
        var id  = name.split('-');
        var c_id = id[1];
        defiA.push(sec_value_old[c_id].getValue());    
    });
    $("[id^=sectiondiv_new]").each(function(){
        var name =  $(this).attr('id');
        var id  = name.split('-');
        var c_id = id[1];
        defiA.push($("#section_value_new-"+c_id).val());
    });
    }
    console.log(defiA);
    return defiA;
}



// for mcq type question , options 
function newOption(idNo) {
    let a = ``;
    var newTemplate = `
<div class='col-lg -12' id='optiondiv_new-${idNo}'>
    <div class='card inputcard2'>
        <div class='card-content'>
            <div class='row'>
                <div class='col-sm-6'>
                    <span class='text-danger'>
                        <i class='ti-close' style='font-size: xx-large;color:#EB5E28;'></i>
                        <input type='hidden' name='isAnswer' value='false' id='option_type_new-${idNo}'>
                    </span>
                </div>
                <div class='col-sm-6 text-right'>
                    <button type='button' rel='tooltip' title='' class='btn btn-danger' data-original-title='Delete' id='deleteOption'>
                        <i class='ti-trash'></i>
                    </button>
                </div>
            </div>
            <hr style='padding:0px;margin-top:5px;'>
            <br>
            <div class='row'>
                <div class='col-sm-12'>
                    <textarea name='option_value_new' rows=6 class='form-control' id='option_value_new-${idNo}'></textarea>
                </div>
            </div>
        </div>
    </div>
</div>`;
    return newTemplate;
}

// to get data from list of options
function getOption() {
    var defiA = [];
    $("[id^=optiondiv_old]").each(function () {
        defiTO = {}; // temporary object
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        defiTO['IsAnswer'] = $("#option_type_old-" + c_id).val();
        defiTO['statement'] = option_value_old[c_id].getValue();
        defiA.push(defiTO);
    });
    $("[id^=optiondiv_new]").each(function () {
        defiTO = {};
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        defiTO['IsAnswer'] = $("#option_type_new-" + c_id).val();
        defiTO['statement'] = $("#option_value_new-" + c_id).val();
        defiA.push(defiTO);
    });
    return defiA;
}

// for fill in type question , answers
function newAnswer(idNo) {
    var newTemplate = `   
<div class='col-lg -12' id='answerdiv_new-${idNo}'>
    <div class='card inputcard1'>
        <div class='card-content'>
            <h6>Blank name</h6>
            <div>
                <input type='text' name='answer_name_new-${idNo}' class='form-control' id='answer_name_new-${idNo}'>
            </div>
            <br>
            <h6>Value</h6>
            <textarea  name='answer_value_new' rows=6 class='form-control' id='answer_value_new-${idNo}'> </textarea>
        </div>
        <div class='card-footer'>
            <hr>
            <div class='footer-title'>
                <span class='text-muted'>&nbsp;</span>
            </div>
        <div class='pull-right'>
            <button type='button' rel='tooltip' title='' class='btn btn-danger' data-original-title='Delete' id='deleteAnswer'><i class='ti-trash'></i></button>
        </div> 
    </div>
</div>`;
    return newTemplate;
}

function getAnswer() {
    var defiA = [];
    $("[id^=answerdiv_old]").each(function () {
        defiTO = {}; // temporary object
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        defiTO['name'] = $("#answer_name_old-" + c_id).val();
        console.log(defiTO['name']);
        defiTO['value'] = answer_value_old[c_id].getValue();
        defiA.push(defiTO);
    });
    $("[id^=answerdiv_new]").each(function () {
        defiTO = {};
        var name = $(this).attr('id');
        // console.log("n="+name);
        var id = name.split('-');
        var c_id = id[1];
        defiTO['name'] = $("#answer_name_new-" + c_id).val();
        defiTO['value'] = $("#answer_value_new-" + c_id).val();
        defiA.push(defiTO);
    });
    return defiA;
}

// to add new definitions in all types of question
function newDefi(idNo) {
    var newTemplate = "<div class='col-lg-12 ' id='defidiv_new-" + idNo + "' ><div class='card inputcard1' ><div class='card-content'><h6>Name</h6><div><input type='text' name='defi_name_new-" + idNo + "' class='form-control' id='defi_name_new-" + idNo + "'></div><br><h6>Value</h6><textarea  name='defi_value_new' rows=6 class='form-control' id='defi_value_new-" + idNo + "'></textarea></div><div class='card-footer'><hr><div class='footer-title'><span class='text-muted'>&nbsp;</span></div> <div class='pull-right'><button type='button' rel='tooltip' title='' class='btn btn-danger' data-original-title='Delete' id='deleteDefi'><i class='ti-trash'></i></button></div> </div></div> </div>";
    return newTemplate;
    // returns a div of definiion-value pair with unique id 
}
// to get data from list of definitons
function getDefis() {
    var defiA = [];
    // 1st fectch data from old def div, which may be modified
    $("[id^=defidiv_old]").each(function () {
        defiTO = {}; // temporary object
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        defiTO['def'] = $("#defi_name_old-" + c_id).val();
        defiTO['value'] = defi_value_old[c_id].getValue();
        //console.log(defiTO['def']+" , "+defiTO['value']);
        defiA.push(defiTO);
    });
    // then get data from the new def dive added by the user dynamically
    $("[id^=defidiv_new]").each(function () {
        defiTO = {};
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        defiTO['def'] = $("#defi_name_new-" + c_id).val();
        defiTO['value'] = $("#defi_value_new-" + c_id).val();
        defiA.push(defiTO);
        //console.log(defiTO['def']+" , "+defiTO['value']);   
    });
    return defiA;
}


// to add new parameter
function newParam(idNo) {
    var newTemplate = `
        <div class='col-lg-12 ' id='paramdiv_new-${idNo}'>
            <div class='card inputcard1'>
                <div class='card-content'>
                    <h6>Name</h6>
                    <div>
                        <input type='text' name='param_name_new-${idNo}' class='form-control closeBracket' id='param_name_new-${idNo}'>
                    </div>
                    <br>
                    <h6>Value</h6>
                    <textarea  name='param_value_new' rows=6 class='form-control closeBracket' id='param_value_new-${idNo}'></textarea>
                </div>
                <div class='card-footer'>
                    <hr>
                    <div class='footer-title'>
                        <span class='text-danger'></span>
                    </div> 
                    <div class='pull-right'>
                        <button type='button' rel='tooltip' title='' class='btn btn-info' data-paraType='new' data-paraId='${idNo}' data-original-title='Open group parameter editor' id='editGrpParam'>
                            <i class='ti-pencil'></i>
                        </button>
                        <button type='button' rel='tooltip' title='' class='btn btn-danger' data-original-title='Delete' id='deleteParam'>
                            <i class='ti-trash'></i>
                        </button>
                    </div> 
                </div>
            </div>
        </div>`;
    return newTemplate;
}

let prTbl = $('#parmTbl').editTable({
    data: [[''], ['']],
    tableClass: 'inputtable',
    jsonData: false,
    headerCols: false,
    maxRows: 20,
    tableClass: 'inputtable custom',
});

//https://js-algorithms.tutorialhorizon.com/2015/11/16/justify-if-a-string-consists-of-valid-parentheses/
function isBalanced(str) {
    // given a string checks if it is balanced or not i.e. whether all brackets opened are closed or not 
    let openingBrackets = ['[', '{', '(']
    let closingBrackets = [']', '}', ')']
    if (str.length == 1) {
        // str is just a single character but not a bracket => string is already balanced
        if (openingBrackets.includes(str) == false && closingBrackets.includes(str) == false) {
            return true;
        } else {
            return false;
        }
    }
    let matchOpenBracket, ch;
    let stack = []
    let bkts = '{}[]()';
    for (let i = 0; i < str.length; i++) {
        ch = str[i]
        if (bkts.indexOf(ch) > -1) {
            if (closingBrackets.indexOf(ch) > -1) {
                // closing bracket found
                matchOpenBracket = openingBrackets[closingBrackets.indexOf(ch)]
                if (stack.length == 0 || (stack.pop() != matchOpenBracket)) {
                    return false
                }
            } else {
                stack.push(ch)
            }
        }
    }
    return (stack.length == 0)
};

let getSubArray = (start, end, str) => {
    // optns = {columns:12, colValue:"something"}
    let res = str.trim();
    if (res.startsWith(start) && res.endsWith(end)) {
        res = str.replace(start, "");
        res = res.substring(0, res.length - end.length)
        let ret = getArray(res);
        return ret;
    } else {
        let er = ` Syntax error in "${str}" .Must begin with "${start}" and end with "${end}".`
        throw new Error(er);
    }
    return [];
}

// let nameCheck = (nam)=>{

// }

function bktClosesAt(str, pos) {
    // given the string , positon of opening bracket in the string, returns the index of the matching closing bracket 
    let openbkts = '{[(';
    let closebkts = ')]}';
    if (openbkts.indexOf(str[pos]) > -1) {
        // opening bracket at given position
        let depth = 1;
        for (let i = pos + 1; i < str.length; i++) {
            if (openbkts.indexOf(str[i]) > -1) {
                // open bracket found
                depth++; // nested opening bracket found, increment the depth
            } else if (closebkts.indexOf(str[i]) > -1) {
                // close bracket found
                if (--depth == 0) {
                    // retrun i if the depth is 1 , since initial depth is 1
                    return i;
                }
            }
        }
        return -1;    // No matching closing parenthesis
    } else {
        console.error("No bracket at index " + pos)
    }
}

let getArray = (str) => {
    // given a string , splits it anrd returns an array of elements 
    // ignores nested brackets
    let openbkts = '{[(';
    let closebkts = ')]}';
    let bktFlag = false;
    let cms = [];
    let arr = [];
    if (isBalanced(str)) {
        for (let i = 0; i < str.length; i++) {
            // finding the first bracket
            if (openbkts.indexOf(str[i]) > -1) {
                // an opening bracket
                let close = bktClosesAt(str, i);
                bktFlag = true;
                i = close;
            } else if (bktFlag) {
                // found the closing bracket
                bktFlag = false;
                if (str[i] == ',') {
                    cms.push(i);
                }
            } else {
                if (str[i] == ',') {
                    cms.push(i);
                }
            }
        }
        for (let i = 0; i <= cms.length; i++) {
            let start, end;
            if (i == 0) {
                start = 0;
                end = cms[i];
            } else {
                start = cms[i - 1] + 1;
                end = cms[i];
            }
            let a = str.substring(start, end);
            a = a.trim();
            arr.push(a);
        }
    } else {
        throw new Error(`The string "${str}" is not balanced.`)
        //console.log("the string is not balanced")
    }
    return arr;
}

$(function () {
    // to reinitialize on modal close
    $("#editParmMdl").on('hidden.bs.modal', function () {
        prTbl.loadData([[''], ['']]);
        $("#parmTblErr").html(" ");
        $("#selectedParam").attr('data-paraType', '');
        $("#selectedParam").attr('data-paraId', '');
    });

    // https://stackoverflow.com/a/21165585
    (function () {
        function insertInto(str, input) {
            var val = input.value, s = input.selectionStart, e = input.selectionEnd;
            input.value = val.slice(0, e) + str + val.slice(e);
            if (e == s) input.selectionStart += str.length - 1;
            input.selectionEnd = e + str.length - 1;
        }
        var closures = { 40: ')', 91: ']', 123: '}' };
        $('body').on('keypress', '.closeBracket', function (e) {
            if (e = closures[e.which]) insertInto(e, this);
        })
        //$(".closeBracket").keypress();
    })();

    // to dislay table
    $('body').on('click', '#editGrpParam', function () {
        let type = $(this).attr('data-paraType');
        let did = $(this).attr('data-paraId');
        $("#selectedParam").attr('data-paraType', type);
        $("#selectedParam").attr('data-paraId', did);
        let nam, val;
        if (type == 'new') {
            nam = $("#param_name_new-" + did).val();
            val = $("#param_value_new-" + did).val();
        } else if (type = 'old') {
            nam = $("#param_name_old-" + did).val();
            val = param_value_old[did].getValue();
        }

        nam = nam.trim();
        val = val.trim();

        if (nam.startsWith('grp[')) {  // to check if the 'value' is empty of not
            if (isBalanced(val)) {
                try {
                    let namAr = getSubArray('grp[', ']', nam);
                    let iptStr = val
                    iptStr = iptStr.trim();
                    let level1 = getSubArray('list[', ']', iptStr);
                    let level2 = [namAr];
                    level1.forEach((item) => {
                        let subArr = getSubArray('grp[', ']', item);
                        level2.push(subArr);
                    })
                    let cols = level2[0].length;
                    //console.log(cols);
                    let equalCols = []
                    level2.forEach((item) => {
                        //console.log(item.length);
                        let a = [];
                        if (item.length == cols) {
                            a = item;
                        } else if (item.length < cols) {
                            //console.log("add blank columns")
                            a = item;
                            for (let j = item.length; j < cols; j++) {
                                a.push("");
                            }
                        } else if (item.length > cols) {
                            for (let k = 0; k < cols; k++) {
                                a.push(item[k]);
                            }
                        }
                        equalCols.push(a);
                    })
                    //console.log(level2);
                    prTbl.loadData(equalCols);
                    $('#editParmMdl').modal('show');
                } catch (err) {
                    console.error(err);
                    // alert(err.message);
                    $.notify(err.message);
                    if (val == "") {
                        let one = [''];
                        let two = ['']
                        // there are no parameters
                        // open modal to add new paramaters
                        prTbl.loadData([one, two]);
                        $('#editParmMdl').modal('show');
                    }
                }
            } else {
                $.notify({
                    icon: "",
                    message: "Unable to open parameter editor.The brackets inside the value field are not balanced i.e all the opening brackets are not closed. Check the text and try again."
                },{
                    type: "danger",
                    timer: 6000,
                    placement: {
                        from: 'top',
                        align: 'center'
                    }
                });
            }
        } else {
            // not a group parameter, open normal box
            // will work for normal parameter and if name is null
            if (nam && val) {
                if (isBalanced(nam)) {
                    if (isBalanced(val)) {
                        prTbl.loadData([[nam], [val]]);
                        $('#editParmMdl').modal('show');
                    } else {
                       $.notify({
                    icon: "",
                    message: "Unable to open parameter editor.The brackets inside the value field are not balanced i.e all the opening brackets are not closed. Check the text and try again."
                },{
                    type: "danger",
                    timer: 6000,
                    placement: {
                        from: 'top',
                        align: 'center'
                    }
                });
                    }
                } else {
                    $.notify({
                    icon: "",
                    message: "Unable to open parameter editor.The brackets inside the value field are not balanced i.e all the opening brackets are not closed. Check the text and try again."
                },{
                    type: "danger",
                    timer: 6000,
                    placement: {
                        from: 'top',
                        align: 'center'
                    }
                });
                }
            } else {
                prTbl.loadData([[''], ['']]);
                $('#editParmMdl').modal('show');
            }   
        }
    });

    // to set value
    $('#saveParm').on('click', function () {
        let nam, val;
        let type = $("#selectedParam").attr('data-paraType');
        let did = $("#selectedParam").attr('data-paraId');
        let tdta = prTbl.getData();
        try {
            if (notEmpty(tdta)) {
                let pstr = genGrpPara(tdta);
                console.log(pstr);
                //if (isBalanced(pstr.nam) && isBalanced(pstr.val)) {
                if (type == 'new') {
                    $("#param_name_new-" + did).val(pstr.nam);
                    $("#param_value_new-" + did).val(pstr.val);
                } else if (type = 'old') {
                    $("#param_name_old-" + did).val(pstr.nam);
                    param_value_old[did].setValue(pstr.val);
                }
                $('#editParmMdl').modal('hide');
                //} else {
                //    $("#parmTblErr").html("The parameter table is not valid. Make sure that all cells contain balanced strings")
                //   console.log("the table is not balanced");
                //}
            }
            // else {
            //    $("#parmTblErr").html("The parameter table is not valid. Make sure that no cell is blank")
            //    console.log("the table is not valid");
            //}
        } catch (err) {
            console.log(err);
            $("#parmTblErr").html(err.message);
        }
    })
})

function notEmpty(data) {
    for (item of data) {
        for (let i of item) {
            if (!i) {
                throw new Error(`No cell can be left blank.`);
                return false;
            } else if (isBalanced(i) == false) {
                throw new Error(`The string "${i}" is not balanced.`);
                return false;
            }
        }
    }
    return true;
}

function genGrpPara(tdta) {
    // will generate group parameter string, will check if it is a normal para or not
    // tdta = array of array of grp para from table
    let nam, val;
    let a = '';
    let dta = {};
    if (tdta.length == 2) {
        if (tdta[0].length == 1 && tdta[1].length == 1) {
            //console.log("yes, normal param");
            nam = tdta[0][0];
            val = tdta[1][0];
            dta.nam = nam;
            dta.val = val;
            return dta;
        }
    }
    nam = "grp[" + tdta[0].join(',') + "]"
    //console.log("name==" + nam);
    val = "list[";
    tdta.splice(0, 1);
    tdta.forEach((item) => {
        a += "grp[" + item.join(',') + "],";
    });
    var newStr = a.substring(0, a.length - 1);
    val += newStr;
    val += ']';
    console.log("name ==" + nam);
    console.log("value ==" + val);
    dta.nam = nam;
    dta.val = val;
    return dta;
}

// to get the data from all the parameter in the list
function getParams() {
    var paramA = []; // the array that contins all the parameter objects
    // fetching the values of parameter objects from CodeMirror    
    $("[id^=paramdiv_old]").each(function () {
        paramTO = {}; // temporary object
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        paramTO['param'] = $("#param_name_old-" + c_id).val();
        paramTO['values'] = param_value_old[c_id].getValue();
        console.log(paramTO['param'] + " , " + paramTO['values']);
        paramA.push(paramTO);
    });

    // fetching the values of newly added parameter objects
    $("[id^=paramdiv_new]").each(function () {
        paramTO = {};
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        paramTO['param'] = $("#param_name_new-" + c_id).val();
        paramTO['values'] = $("#param_value_new-" + c_id).val();
        paramA.push(paramTO);
        console.log(paramTO['param'] + " , " + paramTO['values']);
    });
    return paramA;
}

var counter = 1; // to generate incremental id's for divs

// to add new item in arrange type question, returns a new div to be inserted in the div name 'allItems'
function newItem(idNo) {
    // new div to be inserted // the items already in db have the id item_stmt_old-i, i being the number
    var newTemplate = " <div class='col-lg-12 ' id='itemdiv_new-" + idNo + "'> <div class='card inputcard' ><div class='card-content'><h6>Statement</h6><div><textarea class='form-control' rows=6 name='item_stmt_new-" + idNo + "' class='form-control' id='item_stmt_new-" + idNo + "'></textarea></div><br><h6>Value</h6><textarea rows=4 class='form-control' name='' class='form-control' id='item_value_new-" + idNo + "'></textarea></div><div class='card-footer'><hr><div class='footer-title'><span class='text-muted'></span></div><div class='pull-right'><button type='button' rel='tooltip' title='Delete' class='btn btn-danger' data-original-title='Delete' id='deleteItem'><i class='ti-trash'></i></button></div></div></div></div>";
    return newTemplate;
}
function getItems() {
    // returns an array of JSON objects with all items 
    var itemA = []; // the array that contins all the item objects
    // fetching the values of item objects from CodeMirror    
    $("[id^=itemdiv_old]").each(function () {
        itemTO = {};
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        itemTO['stmt'] = items_stat_old[c_id].getValue();
        itemTO['val'] = items_val_old[c_id].getValue();
        itemA.push(itemTO);
    });
    // fetching the values of newly added item objects
    $("[id^=itemdiv_new]").each(function () {
        itemTO = {};
        var name = $(this).attr('id');
        var id = name.split('-');
        var c_id = id[1];
        itemTO['stmt'] = $("#item_stmt_new-" + c_id).val();
        itemTO['val'] = $("#item_value_new-" + c_id).val();
        itemA.push(itemTO);

    });
    return itemA;
}


function getCommonFormData() {
    // to get data that is common to all questions including metadata,question,hint, explanation, etc...
    fdata = {};
    // var metaData = {};

    fdata["ref"] = document.getElementById("token1").value;
    fdata["author"] = document.getElementById("author1").value;
    fdata["comments"] = document.getElementById("remarks").value;
    var allTags = document.getElementById("id_commentsTg").value;
    var tagArray = allTags.split(",");
    fdata["tags"] = tagArray;

    // to get selected concepts
    jsonObjcon = [];
    $("#concepts option:selected").each(function () {
        var value = $(this).val();
        jsonObjcon.push(value);
    });
    if (jsonObjcon.length > 0) {
        fdata["concepts"] = jsonObjcon;
    }

    jsonObjskills = [];
    $("#skills option:selected").each(function () {
        var value = $(this).val();
        jsonObjskills.push(value);
    });
    // alert(jsonObjcon.length);
    if (jsonObjskills.length > 0) {
        fdata["skills"] = jsonObjskills;
    }

    // console.log("metaData-----=="+JSON.stringify(metaData));
    // fdata["meta"]=metaData;



    pars = getParams();
    if (pars.length > 0) { // to check if parameters exists or not
        fdata['parameters'] = pars;
    } else {
        fdata["parameters"] = [];
    }

    defs = getDefis();
    if (defs.length > 0) { // to check if definitions exists or not
        fdata["definitions"] = defs;
    } else {
        fdata["definitions"] = [];
    }
    // to change last updated time
    var d = new Date();
    var n = d.toUTCString();
    fdata["updatedAt"] = n;
    return fdata;
}

// document.ready for functionality that is common to all the questions
$.fn.scrollGuard = function () {
    return this
        .on('mousewheel', function (e) {
            var event = e.originalEvent;
            var d = event.wheelDelta || -event.detail;
            this.scrollTop += (d < 0 ? 1 : -1) * 30;
            e.preventDefault();
        });
};
$.fn.scrollGuard2 = function () {
    return this
        .on('wheel', function (e) {
            var $this = $(this);
            if (e.originalEvent.deltaY < 0) {
                /* scrolling up */
                return ($this.scrollTop() > 0);
            } else {
                /* scrolling down */
                return ($this.scrollTop() + $this.innerHeight() < $this[0].scrollHeight);
            }
        });
};
$(function () {
    // http://jsfiddle.net/3dxpyjoz/10/
    // https://stackoverflow.com/questions/10211203/scrolling-child-div-scrolls-the-window-how-do-i-stop-that
    // to allow scrolling inside div
    $('.canScroll').scrollGuard();
    // add new answer card
    $("body").on('click', '#addNewAnswer', function () {
        var maxVal = 20;
        var currVal = $("#allAnswer > [id^='answerdiv']").length;
        if (currVal < maxVal) {
            $("#allAnswer").append(newAnswer(counter));
            counter++;
        } else {
            swal("Only " + maxVal + " answers are allowed !");
        }
        // $("#allDefis").append(newDefi(counter));
        // counter++;
    });
    // delete a answer card
    $("body").on("click", "#deleteAnswer", function () {
        $(this).closest("[id^='answerdiv']").remove();
    });
    // add new definition card
    $("body").on('click', '#addNewDefi', function () {
        var maxVal = 20;
        var currVal = $("#allDefis > [id^='defidiv']").length;
        if (currVal < maxVal) {
            $("#allDefis").append(newDefi(counter));
            counter++;
        } else {
            swal("Only " + maxVal + " definitions are allowed !");
        }
    });
        // add new section card  info
        $("body").on('click','#addNewSec',function(){
            var maxVal =10;
            var maxFlashVal =5;
            var infosty ;
            $("select[id=conStyle]").each(function() {
            var value = $(this).val();
            infosty = value;
            });
            var currVal = $("#allSections > [id^='sectiondiv']").length;
            if(infosty == "Flash Card"){
                if(currVal < maxFlashVal){
                    $("#allSections").append(newSections(counter,infosty,{data:'',back:''}));
                    counter++;
                }else{
                    swal("Only "+maxFlashVal+" Flash Cards are allowed !");
                }
            }else{
                if(currVal < maxVal){
                    $("#allSections").append(newSections(counter,infosty,{data:""}));
                    counter++;
                }else{
                    swal("Only "+maxVal+" Sections are allowed !");
                }
            }
            
        });
    
         // to delete a  section info
         $("body").on("click", "#deleteSection", function () {
            $(this).closest("[id^='sectiondiv']").remove();
        });
    // add new option card 
    $("body").on('click', '#addNewOption', function () {
        var maxVal = 10;
        var currVal = $("#allOption > [id^='optiondiv']").length;
        if (currVal < maxVal) {
            $("#allOption").append(newOption(counter));
            counter++;
        } else {
            swal("Only " + maxVal + " Options are allowed !");
        }
    });
    // to delete a  question
    $("body").on("click", "#deleteOption", function () {
        $(this).closest("[id^='optiondiv']").remove();
    });
    // delete a definition card
    $("body").on("click", "#deleteDefi", function () {
        $(this).closest("[id^='defidiv']").remove();
    });
    //add a new parameter
    $("body").on('click', '#addNewParam', function () {
        //allParams is the div that holds all the parameter divs
        var maxVal = 20;
        var currVal = $("#allParams > [id^='paramdiv']").length;
        if (currVal < maxVal) {
            $("#allParams").append(newParam(counter));
            counter++;
        } else {
            swal("Only " + maxVal + " parameters are allowed !");
        }
        // $("#allParams").append(newParam(counter));
        // counter++;
    });
    // to delelte existing parameter 
    $("body").on("click", "#deleteParam", function () {
        $(this).closest("[id^='paramdiv']").remove();
    });


    // delete question confirmation 
    $("#deleteQue").click(function () {
        //onclick="" class="btn btn-outline  pull-left"
        var orgid = document.getElementById('orgid').value;
        var pipe = document.getElementById('pipe').value;
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            confirmButtonText: 'Yes, delete it!',
            buttonsStyling: false,
            allowOutsideClick: false
        }).then(function () {
            window.location.href = 'author_getRemToken?orgid=' + orgid + '&mode=prog&pipe=' + pipe;

        }).catch(function () {
            console.log("Aborted delete req");
        });
    });

    // cloane question confirmation
    $("#cloneQue").click(function (event) {
        event.preventDefault();
        var orgid = document.getElementById('orgid').value;
        var pipe = document.getElementById('pipe').value;
        swal({
            title: 'Are you sure?',
            text: "It will create a duplicate copy of the same question",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            confirmButtonText: 'Yes, clone it!',
            buttonsStyling: false,
            allowOutsideClick: false
        }).then(function () {
            // console.log('orgid='+orgid+' and pie = '+pipe);
            window.location.href = '/author_getTokenCopy?orgid=' + orgid + '&mode=prog&pipe=' + pipe;
        }).catch(function () {
            console.log("Aborted clone req");
        });
    });


    $("body").on('click', '#addNewItem', function () {
        var maxVal = 10;
        var currVal = $("#allItems > [id^='itemdiv']").length;
        if (currVal < maxVal) {
            $("#allItems").append(newItem(counter));
            counter++;
        } else {
            swal("Only " + maxVal + " items are allowed !");
        }
    });

    // to delete existing item 
    $("body").on("click", "#deleteItem", function () {
        $(this).closest("[id^='itemdiv']").remove();
    });

    // verify button
    $("body").on('click', "#btnGetEval", function (evt) {
        evt.preventDefault();
        // getEvalData = getFormDataArrange(); 
        // document.getElementById("data").value = JSON.stringify(getEvalData) ; 
        var type = $("#pipe").val();//document.getElementById('pipe').value;
        var newData = {};
        if (type === 'arrange') {
            newData = getFormDataArrange();
        } else if (type === 'fillIn') {
            newData = getFormDataFill();
        } else if (type === 'mcq') {
            // console.log("get data from MCQ");
            newData = getFormDataMcq();
        }else if (type==='info'){
            newData = getFormDataInfo();
        }else if (type==='sub'){
            newData = getFormDataSub();
        }

        var newDataReq1 = {};
        newDataReq1["ref"] = newData['ref'];
        newDataReq1["comments"] = newData['comments'];
        newDataReq1["tags"] = newData['tags'];
        newDataReq1["concepts"] = newData['concepts'];
        newDataReq1["skills"] = newData['skills'];
        document.getElementById("data_req1").value = JSON.stringify(newDataReq1);
        document.getElementById("data").value = JSON.stringify(newData);
        // console.log(JSON.stringify(newData))
        $('#authfrm2').submit();
    });
    // give 5        
    $("#btnGetG5").bind("click", function (evt) {
        evt.preventDefault();
        // getG5data = getFormDataArrange(); 
        // console.log("getG5data  = "+JSON.stringify(getG5data));        
        // document.getElementById("data1").value = JSON.stringify(getG5data) ;
        var type = $("#pipe").val();//document.getElementById('pipe').value;
        var newData = {};
        if (type === 'arrange') {
            newData = getFormDataArrange();
        } else if (type === 'fillIn') {
            newData = getFormDataFill();
        } else if (type === 'mcq') {
            console.log("get data from MCQ");
            newData = getFormDataMcq();
        }else if (type==='info'){
            newData = getFormDataInfo();
        }else if (type==='sub'){
            newData = getFormDataSub();
        }
        var newDataReq1 = {};
        newDataReq1["ref"] = newData['ref'];
        newDataReq1["comments"] = newData['comments'];
        newDataReq1["tags"] = newData['tags'];
        newDataReq1["concepts"] = newData['concepts'];
        newDataReq1["skills"] = newData['skills'];

        document.getElementById("data_req2").value = JSON.stringify(newDataReq1);
        document.getElementById("data1").value = JSON.stringify(newData);

        $("#authfrm3").submit();

    });

    // Commit button
    $("#btnGetCom").bind("click", function (evt) {
        evt.preventDefault();
        var valid = validateQuestionContent();
        if(!valid)
         return;
        // getComdata = getFormDataArrange();
        // console.log("getComdata: "+JSON.stringify(getComdata));
        // document.getElementById("data2").value = JSON.stringify(getComdata) ;
        var type = $("#pipe").val();//document.getElementById('pipe').value;
        var newData = {};
        if (type === 'arrange') {
            newData = getFormDataArrange();
        } else if (type === 'fillIn') {
            newData = getFormDataFill();
        } else if (type === 'mcq') {
            newData = getFormDataMcq();

        }else if (type==='info'){
            newData = getFormDataInfo();
        }else if (type==='sub'){
            newData = getFormDataSub();
        }
        var newDataReq1 = {};
        newDataReq1["ref"] = newData['ref'];
        newDataReq1["comments"] = newData['comments'];
        newDataReq1["tags"] = newData['tags'];
        newDataReq1["concepts"] = newData['concepts'];
        newDataReq1["skills"] = newData['skills'];

        document.getElementById("data_req3").value = JSON.stringify(newDataReq1);
        document.getElementById("data2").value = JSON.stringify(newData);

  

        swal({
            title: 'Are you sure?',
            text: "Commit only error free content.",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            confirmButtonText: 'Yes, commit it!',
            buttonsStyling: false,
            allowOutsideClick: false
        }).then(function () {
            $("#authfrm4").submit();
        });



        

    });
    //  update  question  same on all the pages, selects type of question based on the hidden input field named pipe on each question page
    $("#btnUpdate").bind("click", function (evt) {

        evt.preventDefault();
        var valid = validateQuestionContent();
        if(!valid)
         return;
        // var type = document.getElementById("pipe").value;
        var type = $("#pipe").val();//document.getElementById('pipe').value;
        var newData = {};
        if (type === 'arrange') {
            newData = getFormDataArrange();
        } else if (type === 'fillIn') {
            newData = getFormDataFill();
        } else if (type === 'mcq') {
            newData = getFormDataMcq();
        }else if (type==='info'){
            newData = getFormDataInfo();
        }else if (type==='sub'){
            newData = getFormDataSub();
        }
        var newDataReq = {};
        newDataReq["ref"] = newData['ref'];
        newDataReq["comments"] = newData['comments'];
        newDataReq["tags"] = newData['tags'];
        newDataReq["concepts"] = newData['concepts'];
        newDataReq["skills"] = newData['skills'];
        document.getElementById("data8").value = JSON.stringify(newData);
        document.getElementById("data_req").value = JSON.stringify(newDataReq);
        // console.log("---- Submitted data ----");
        // console.log("Question type = "+type);
        //    console.log("Data = "+JSON.stringify(newData));
        // console.log("Data request = " + JSON.stringify(newDataReq));
        // console.log(JSON.stringify(newDataReq,null,2 ));
        //console.log($("#data8").val())
        //console.log("----------------------");
       
        $('#authfrm5').submit();
    });

    



    // check minimum tags
    $(".checkTag").click(function (evt) {
        var allTags = document.getElementById("id_commentsTg").value;
        var tagArray = allTags.split(",");

        if (tagArray.length < 3) {
            swal(
                'Error...',
                'Minimum 3 tags required  !!',
                'error'
            );
            // return false;
            evt.preventDefault();
        }
    });

   

    // to display update message
    if (window.location.search.indexOf('body=success') > -1) {
        $.notify({
            icon: "",
            message: "<b> Success - </b> Updated Successfully! !!!"
        }, {
                type: "success",
                timer: 2500,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });
    } else {
        // alert('track not here');
    }
    // to display error message
    if (window.location.search.indexOf('body=serverr') > -1) {
        $.notify({
            icon: "",
            message: "Some error occured. Please try later."
        }, {
                type: "danger",
                timer: 2500,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });
    } else {
        // alert('track not here');
    }


});

// now functions that are applicable to specific pages

// arrangement type questions - 
function getFormDataArrange() {
    //  to get the form data 
    fdata = {};
    fdata = getCommonFormData(); // 1st get the data that is common to all questions
    fdata["question"] = question.getValue();
    fdata["hint"] = hint.getValue();
    fdata["explanation"] = explain.getValue();
    // to get item list
    tempObj = {};
    itemArray = [];
    fdata["items"] = getItems();
    // to get order of arrangement
    var jsonObjArrg;
    $("select[id=arrange]").each(function () {
        var value = $(this).val();
        jsonObjArrg = JSON.stringify(value);
    });
    // to get order
    fdata["order"] = JSON.parse(jsonObjArrg);
    // to get select
    var jsonObjselect_no;
    $("select[id=select_no]").each(function () {
        var value = $(this).val();
        jsonObjselect_no = JSON.stringify(value);
    });
    fdata["select"] = JSON.parse(jsonObjselect_no);
    return fdata;
}

function getFormDataFill() {
    //  to get the form data 
    fdata = {};
    fdata = getCommonFormData(); // 1st get the data that is common to all questions
    fdata["question"] = question.getValue();
    fdata["hint"] = hint.getValue();
    fdata["explanation"] = explain.getValue();
    // to get item list
    tempObj = {};
    itemArray = [];
    fdata["answers"] = getAnswer();
    fdata["statement"] = statement.getValue();
    fdata["suggestion"] = suggestion.getValue();
    return fdata;
}

function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    //if (charCode > 31 && (charCode < 48 || charCode > 57))
    if (charCode < 48 || charCode > 57)
        return false;
        return true;
}



function getFormDataSub() {
    //  to get the form data 
    fdata = {};
    fdata = getCommonFormData(); // 1st get the data that is common to all questions
    fdata["question"] = question.getValue();
    fdata["hint"] = hint.getValue();
    fdata["explanation"] = explain.getValue();
    // to get item list
    tempObj = {};
    itemArray = [];
    
    fdata["answer"] = subAns.getValue();


    var selectChoice1;
        $("select[id=selectChoice]").each(function () {
            var value = $(this).val();
            selectChoice1 = value;
        });

    if(selectChoice1=="draw"){
        fdata["limit"] =  0
    }else{
        fdata["limit"] = parseInt(document.getElementById("subLimit").value);
    }


    if(selectChoice1=="textAns"){
        fdata["allowedDrawings"] =  0
    }else{
        var jsonObjselect_draw;
        $("select[id=allowedDrawings]").each(function () {
            var value = $(this).val();
            jsonObjselect_draw = value;
        });
        fdata["allowedDrawings"] = parseInt(jsonObjselect_draw);
    }


    var allkey = document.getElementById("id_keyword").value;
    var keyArray = allkey.split(",");
    fdata["keywords"] = keyArray;
    return fdata;
}
function getFormDataMcq() {
    //  to get the form data 
    fdata = {};
    fdata = getCommonFormData(); // 1st get the data that is common to all questions
    fdata["question"] = question.getValue();
    fdata["hint"] = hint.getValue();
    fdata["explanation"] = explain.getValue();
    // to get item list
    tempObj = {};
    itemArray = [];
    fdata["options"] = getOption();
    //console.log("from mcq"+JSON.stringify(fdata))
    return fdata;
}


function getFormDataInfo(){
	//  to get the form data 
    fdata = {};
    fdata= getCommonFormData(); // 1st get the data that is common to all questions
    // to get item list

    tempObj ={};
    itemArray = [];
    // to get style content
    var jsonObjstyle ;
    $("select[id=conStyle]").each(function() {
    var value = $(this).val();
    jsonObjstyle = JSON.stringify(value);
    });
    fdata["style"] = JSON.parse(jsonObjstyle);
    fdata["header"] = header.getValue();
    fdata["sections"] = getSections(fdata["style"]); 
   
    //console.log("from mcq"+JSON.stringify(fdata))
    return fdata;
 }
// all buttons inside arrangement type question 

$('#authfrm2').submit(function () {
    //window.open('', 'formpopup', 'scrollbars=yes, width=600, height=600, top=' + top + ', left=' + left);
    this.target = 'ipreview';

});
$('#authfrm3').submit(function () {
    // window.open('', 'formpopup', 'scrollbars=yes, width=600, height=600, top=' + top + ', left=' + left);
    this.target = 'ipreview';
});


// $(document).ready(function() {
//         if (window.location.search.indexOf('msg=timeout') > -1) {
//             $.notify({
//             icon: "",
//             message: "<b> Error - </b> Limit of characters exceeded. !!!"
//           },{
//             type: "danger",
//             timer: 4000,
//             placement: {
//                 from: 'top',
//                 align: 'center'
//             }
//           });
//         } else {
//             // alert('track not here');
//         }
//     });


$(document).ready(function () {
    if (window.location.search.indexOf('msg=serverr') > -1) {
        $.notify({
            icon: "",
            message: "<b> Error - </b> Please Contact Administrator !!!"
        }, {
                type: "danger",
                timer: 4000,
                placement: {
                    from: 'top',
                    align: 'center'
                }
            });
    } else if (window.location.search.indexOf('msg=dberror') > -1) {
        $.notify({
            icon: "",
            message: "<b> Error - </b> Please Contact Administrator !!!"
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