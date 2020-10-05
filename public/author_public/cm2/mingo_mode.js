 function qsa_mingo(sel) {
  // console.log("qsa--"+sel);
    return Array.apply(null, document.querySelectorAll(sel));

}

// var answers_name= [];
// var count_ansname =0;
// qsa_mingo("#id_ansname").forEach(function (editorEl) {
//   answers_name[count_ansname] =CodeMirror.fromTextArea(editorEl, {
//      mode: "mingo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true
//   });
//   // options.push(aa.getValue());
//   count_ansname++;
// }); 

// var answers_value= [];
// var count_ansval =0;
// qsa_mingo("#id_ansvalue").forEach(function (editorEl) {
//   answers_value[count_ansval] =CodeMirror.fromTextArea(editorEl, {
//      mode: "mingo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true
//   });
//   // options.push(aa.getValue());
//   count_ansval++;
// });


var answer_value= [];
var count_val2 =0;
qsa_mingo("#answer_value").forEach(function (editorEl) {
  answer_value[count_val2] =CodeMirror.fromTextArea(editorEl, {
     mode: "mingo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });
  // options.push(aa.getValue());
  count_val2++;
});

// var answer_value1= [];
// var count_val21 = 0;
// qsa_mingo("#option_value_old").forEach(function (editorEl) {
//   answer_value1[count_val21] =CodeMirror.fromTextArea(editorEl, {
//      mode: "mingo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true
//   });
//   // options.push(aa.getValue());
//   count_val21++;
// });

var items_value= [];
var count_val =0;
qsa_mingo("#item_value").forEach(function (editorEl) {
  items_value[count_val] =CodeMirror.fromTextArea(editorEl, {
     mode: "mingo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });
  // options.push(aa.getValue());
  count_val++;
});

var items_stmt= [];
var count_val1 =0;
qsa_mingo("#item_stmt").forEach(function (editorEl) {
  items_stmt[count_val1] =CodeMirror.fromTextArea(editorEl, {
     mode: "mingo",
     value: "function myScript(){return 100;}\n",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });
  // options.push(aa.getValue());
  count_val1++;
});
// var para_name= [];
// var count_pname =0;
// qsa_mingo("#paraname").forEach(function (editorEl) {
//   para_name[count_pname] =CodeMirror.fromTextArea(editorEl, {
//     mode: "mingo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true
//   });
//   count_pname++;
// });

var para_value= [];
var count_pvalue=0;
qsa_mingo("#paravalue").forEach(function (editorEl) {
  para_value[count_pvalue] =CodeMirror.fromTextArea(editorEl, {
    mode: "mingo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });

  count_pvalue++; 

});



// var def_name= [];
// var count_defname=0;
// qsa_mingo("#defname").forEach(function (editorEl) {
//   def_name[count_defname] =CodeMirror.fromTextArea(editorEl, {
//     mode: "mingo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true
//   });
//   count_defname++;
// });

var def_value= [];
var count_defvalue=0;
qsa_mingo("#defvalue").forEach(function (editorEl) {
  def_value[count_defvalue] =CodeMirror.fromTextArea(editorEl, {
    mode: "mingo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });
  count_defvalue++;
});




// var def_value=CodeMirror.fromTextArea(document.getElementById("defvalue"), {
//   mode: "mingo",
//   lineNumbers: false,
//   lineWrapping: true,
//   matchBrackets:true,
//   autoCloseBrackets:true,
//   autoRefresh:true
// });

