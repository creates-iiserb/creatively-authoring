
if($('#layout').length>0)
{
var layout_adv = CodeMirror.fromTextArea(document.getElementById("layout"), {
  mode: "application/ld+json",
  lineNumbers: false,
  lineWrapping: true,
  matchBrackets:true,
  autoRefresh:true
});

}

if($('#plot-data').length>0)
{

var plotdata_adv = CodeMirror.fromTextArea(document.getElementById("plot-data"), {
  mode: "application/ld+json",
  lineNumbers: false,
  lineWrapping: true,
  matchBrackets:true,
  autoRefresh:true
});

}


