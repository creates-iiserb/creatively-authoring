 CodeMirror.defineMode("demo", function(config) {

  return CodeMirror.multiplexingMode(
        CodeMirror.getMode(config, "text/html"),
        {
          open: String.fromCharCode(92)+"(", close: String.fromCharCode(92)+")",
          mode: CodeMirror.getMode(config, "stex"),
          delimStyle: "delimit"
        },
        {
          open: String.fromCharCode(92)+"[", close: String.fromCharCode(92)+"]",
          mode: CodeMirror.getMode(config, "stex"),
          delimStyle: "delimit"
        },
        {
          open: "`[[", close: "`]]",
          mode: CodeMirror.getMode(config, "mingo"),
          delimStyle: "delimit"
        },
        {
          open: "`[", close: "`]",
          mode: CodeMirror.getMode(config, "mingo"),
          delimStyle: "delimit"
        },
        
        {
          open: "`{", close: "`}",
          mode: CodeMirror.getMode(config, "graphicmod"),
          delimStyle: "delimit"
        }


        // .. more multiplexed styles can follow here
  );
});


if($('#id_commentsT').length>0)
{
  var question=CodeMirror.fromTextArea(document.getElementById("id_commentsT"), {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });

}

if($('#id_commentsHint').length>0)
{
var hint=CodeMirror.fromTextArea(document.getElementById("id_commentsHint"), {
  mode: "demo",
  lineNumbers: false,
  lineWrapping: true,
  matchBrackets:true,
  autoCloseBrackets:true,
  autoRefresh:true,
  viewportMargin:5
});
}

if($('#id_commentsExpl').length>0)
{

  var explain=CodeMirror.fromTextArea(document.getElementById("id_commentsExpl"), {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });

}

if($('#id_subAns').length>0)
{
  var subAns=CodeMirror.fromTextArea(document.getElementById("id_subAns"), {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });

}

if($('#conInst').length>0)
{

  var header=CodeMirror.fromTextArea(document.getElementById("conInst"), {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });

}

function qsa(sel) {
    return Array.apply(null, document.querySelectorAll(sel));
}

// var options= [];
// var count =0;
// qsa("#id_commentsO").forEach(function (editorEl) {
//   options[count] =CodeMirror.fromTextArea(editorEl, {
//      mode: "demo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true
//   });
//   // options.push(aa.getValue());
//   count++;
// });

// var items_stat= [];
// var count_val1 =0;
// qsa("#items_stat").forEach(function (editorEl) {
//   items_stat[count_val1] = CodeMirror.fromTextArea(editorEl, {
//     mode: "demo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true,
//     viewportMargin: 4
//   });
//   // options.push(aa.getValue());
//   count_val1++;
// });

var option_value_old= [];
var count_stat_old1 =0;
qsa("#option_value_old").forEach(function (editorEl) {
  option_value_old[count_stat_old1] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  count_stat_old1++;
});



// editors for Item in arrange type question
var items_stat_old= [];
var count_stat_old =0;
qsa("#item_stmt_old").forEach(function (editorEl) {
  items_stat_old[count_stat_old] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  // options.push(aa.getValue());
  count_stat_old++;
});

var items_val_old= [];
var count_val_old =0;
qsa("#item_value_old").forEach(function (editorEl) {
  items_val_old[count_val_old] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  // options.push(aa.getValue());
  count_val_old++;
});


// // store the item statements that are already present in he
// var items_stat_current= [];
// var temp =0;
// qsa("[id^='item_stmt_old-']").forEach(function (editorEl) {
//   items_stat_current[temp] =CodeMirror.fromTextArea(editorEl, {
//     mode: "demo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true,
//     viewportMargin: 4
//   });
//   // options.push(aa.getValue());
//   temp++;
// });

//alert("1 val = "+items_stat_current[0].getValue());



// editors for parameter which is present in all types of question 
// var param_name_old= [];
// var pcount_name_old =0;
// qsa("#param_name_old").forEach(function (editorEl) {
//   param_name_old[pcount_name_old] = CodeMirror.fromTextArea(editorEl, {
//     mode: "demo",
//     lineNumbers: false,
//     lineWrapping: true,
//     matchBrackets:true,
//     autoCloseBrackets:true,
//     autoRefresh:true,
//     viewportMargin: 4
//   });
//   // options.push(aa.getValue());
//   pcount_name_old++;
// });

var sec_value_old= [];
var seccount_value_old =0;
qsa("#sec_value_old").forEach(function (editorEl) {
  sec_value_old[seccount_value_old] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  // options.push(aa.getValue());
  seccount_value_old++;
});

var sec_value_old_front= [];
var seccount_value_oldfront =0;
qsa("#sec_value_old_front").forEach(function (editorEl) {
  sec_value_old_front[seccount_value_oldfront] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  // options.push(aa.getValue());
  seccount_value_oldfront++;
});

var sec_value_old_back= [];
var seccount_value_oldback =0;
qsa("#sec_value_old_back").forEach(function (editorEl) {
  sec_value_old_back[seccount_value_oldback] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  // options.push(aa.getValue());
  seccount_value_oldback++;
});


var param_value_old= [];
var pcount_value_old =0;
qsa("#param_value_old").forEach(function (editorEl) {
  param_value_old[pcount_value_old] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  // options.push(aa.getValue());
  pcount_value_old++;
});


var answer_value_old= [];
var answer_value_old1 =0;
qsa("#answer_value_old").forEach(function (editorEl) {
  answer_value_old[answer_value_old1] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  // options.push(aa.getValue());
  answer_value_old1++;
});



var defi_value_old= [];
var cdefi_value_old =0;
qsa("#defi_value_old").forEach(function (editorEl) {
  defi_value_old[cdefi_value_old] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true,
    viewportMargin: 4
  });
  // options.push(aa.getValue());
  cdefi_value_old++;
});

if($('#id_commentsSt').length>0)
{
var statement=CodeMirror.fromTextArea(document.getElementById("id_commentsSt"), {
  mode: "demo",
  lineNumbers: false,
  lineWrapping: true,
  matchBrackets:true,
  autoCloseBrackets:true,
  autoRefresh:true
});
}


if($('#id_commentsSg').length>0)
{
var suggestion=CodeMirror.fromTextArea(document.getElementById("id_commentsSg"), {
  mode: "demo",
  lineNumbers: false,
  lineWrapping: true,
  matchBrackets:true,
  autoCloseBrackets:true,
  autoRefresh:true
});
}










