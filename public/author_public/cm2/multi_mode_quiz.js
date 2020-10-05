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

function qsa1(sel) {
  return Array.apply(null, document.querySelectorAll(sel));
}

var secInstr= [];
var count_secInstr =0;
qsa1("#secInstr").forEach(function (editorEl) {
  secInstr[count_secInstr] = CodeMirror.fromTextArea(editorEl, {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });
  count_secInstr++;
});

if($('#id_instruction').length>0)
{
  var quiz_intr = CodeMirror.fromTextArea(document.getElementById("id_instruction"), {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });

}


if($('#sec_inst').length>0)
{
  var sec_inst = CodeMirror.fromTextArea(document.getElementById("sec_inst"), {
    mode: "demo",
    lineNumbers: false,
    lineWrapping: true,
    matchBrackets:true,
    autoCloseBrackets:true,
    autoRefresh:true
  });

}



// var plotdata = CodeMirror.fromTextArea(document.getElementById("plot-data"), {
//   mode: "demo",
//   lineNumbers: false,
//   lineWrapping: true,
//   matchBrackets:true,
//   autoCloseBrackets:true,
//   autoRefresh:true
// });

// var layout = CodeMirror.fromTextArea(document.getElementById("layout"), {
//   mode: "demo",
//   lineNumbers: false,
//   lineWrapping: true,
//   matchBrackets:true,
//   autoCloseBrackets:true,
//   autoRefresh:true
// });









