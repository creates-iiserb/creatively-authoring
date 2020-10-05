
//basic variables for plotting
var plot= [];  //will contain  array of traces.
var id='0'; // id for particular division
var selectId='0'; // select box id
var alreadyUsed=0;

function addDiv() {  // add the division  for plot traces dynamically.
  // body...

  alreadyUsed=0;
  var division= document.getElementById('TextBoxContainerOpt');

  document.getElementById("selectChart").setAttribute("name",selectId);


  var iDiv = document.createElement('div');
  iDiv.id = "data"+selectId;
  iDiv.className = "data"+selectId;
  var division= document.getElementById('TextBoxContainerOpt');
  division.prepend(iDiv);


  var button = document.getElementById("selectChart");
  console.log("In");
    if(button.options[button.selectedIndex].value == "scatter"){
      LineDataBlock(selectId);

    }
    if(button.options[button.selectedIndex].value == "markers"){
      bubbleDataBlock(selectId);
    }
    if(button.options[button.selectedIndex].value == "bar"){
      BarDataBlock(selectId);
    }
    if(button.options[button.selectedIndex].value == "pie"){
      PieDataBlock(selectId);
    }
    if(button.options[button.selectedIndex].value == "continous"){
      ContinousFnBlock(selectId);
    }
    if(button.options[button.selectedIndex].value == "3d"){
      threeDBlock(selectId);
    }
    
    alreadyUsed=1;

    selectId++;


}
function LineDataBlock(idd){
  
  var iDiv = document.createElement('div');
  iDiv.id = id;
  iDiv.className = id;
  id++;
  var division= document.getElementById("data"+(idd));
  var html= ' <div class="row" style="padding-left:15px">' +
        '<label style="font-size:16px;">Marker</label><br><div class="col-sm-12 col-md-3"  >'+
              '<select id="marker'+(id-1)+'"  title="Marker" data-original-title="Marker" rel="tooltip"  class="dropdown btn btn-default selectButton" >" '+
                `
                <option value="lines">No Marker</option>
                <option value="10"> 1 </option>
                <option value="20" >2</option>
                <option value="25" >3</option>
                <option value="30" >4 </option>
                <option value="35" >5</option>
                <option value="40" >6 </option>
                <option value="45">7 </option>
                <option value="50" >8</option>
                </select>\
    \                  
        </div>\
        <div class="col-sm-12 col-md-3">\
          <div class="dropdown">\   
            `+
              '<button  class="btn btn-default dropdown-toggle selectButton" id="new-event'+(id-1)+'" onclick="MarkercolorChooser('+(id-1)+')" data-toggle="dropdown" type="button"> Color <span class="caret"></span></button>\
              <ul class="dropdown-menu" role="menu">\
                  <li>\
                  <div class="btn-group" style="width: 100%; margin-bottom: 10px;">\
                <ul class="fc-color-picker" id="Mcolor-chooser'+(id-1)+'">'+
                  `<li><a class="text-aqua" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-teal" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-yellow" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-green" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-lime" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-red" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-purple" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-fuchsia" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-maroon" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-gray" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-muted" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-navy" href="#"><i class="fa fa-square"></i></a></li>
                </ul>
              </div>
                  </li>  \
                           
              </ul>\
            \
          </div>\
        </div>\
\
        <div class="col-sm-12 col-md-2">`+
            '<select id="markerOpacity'+(id-1)+'" class="dropdown btn btn-default selectButton" >'+
 `<option value="1.0">Opactity-1.0</option>
  <option value="0.9">0.9</option>
  <option value="0.8">0.8</option>
  <option value="0.7">0.7</option>
  <option value="0.6">0.6</option>
  <option value="0.5">0.5</option>
  <option value="0.4">0.4</option>
  <option value="0.3">0.3</option>
  <option value="0.2">0.2</option>
  <option value="0.1">0.1</option>
</select>
           </div>`+
       ' <div  class="col-sm-12 col-md-3" >'+
         '<select id="fill'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option value="none">No Fill</option>
  <option value="tozeroy" >Fill To Zero Y</option>
  <option value="tonexty">Fill To Next Y</option>
 
</select>
        </div>\
    </div><br>\
\
    <div class="row" style="padding-left:15px" >\
        <label style="font-size:16px;">Line</label><br><div class="col-sm-12 col-md-3"  >`+
          '<select id="filling'+(id-1)+'" class="dropdown btn btn-default selectButton" >'+
  `<option value="noLine">No Line</option><option value="solid">Solid &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
  <option value="dash">Dash</option>
  <option value="dashdot">Dashdot</option>
  <option value="dot">Dot</option>
</select>
        </div>\
       
        <div class="col-sm-12 col-md-3">\
          <div class="dropdown">\
           `+
              '<button class="btn btn-default dropdown-toggle selectButton" id="add-new-event'+(id-1)+'" onclick="lineColorChooser('+(id-1)+')" data-toggle="dropdown" type="button"> Color <span class="caret"></span></button>\
              <ul class="dropdown-menu" role="menu">\
                  <li role="presentaion"><div class="btn-group" style="width: 100%; margin-bottom: 10px;">\
                <ul class="fc-color-picker" id="color-chooser'+(id-1)+'">'+
                  `<li><a class="text-aqua" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-teal" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-yellow" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-green" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-lime" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-red" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-purple" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-fuchsia" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-maroon" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-gray" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-muted" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-navy" href="#"><i class="fa fa-square"></i></a></li>
                </ul>
              </div></li>  \
    
              </ul>\
            \
          </div>\
        </div>\
\
        <div class="col-sm-12 col-md-2">`+
'            <select id="opacity'+(id-1)+'" class="dropdown btn btn-default selectButton">\
 <option value="1.0">Opactity-1.0</option>\
   <option value="0.9">0.9</option>\
  <option value="0.8">0.8</option>\
  <option value="0.7">0.7</option>\
  <option value="0.6">0.6</option>\
  <option value="0.5">0.5</option>\
  <option value="0.4">0.4</option>\
  <option value="0.3">0.3</option>\
  <option value="0.2">0.2</option>\
  <option value="0.1">0.1</option>\
</select>\
        </div>\
        <div class="col-sm-12 col-md-2">\
  <select id="thickness'+(id-1)+'" class="dropdown btn btn-default selectButton" >'+
  `<option value="1">Thickness-1</option>
  <option value="2">2</option>
  <option value="3" selected>3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
</select>
        </div>`+
        '<div class="col-sm-12 col-md-2" >\
      <select id="shape'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option value="linear">linear</option>
  <option value="hv">hv</option>
  <option value="vh">vh</option>
  <option value="vhv">vhv</option>
  <option value="hvh">hvh</option>
  <option value="spline">spline</option>
</select>
        </div>\
    </div>`;


division.appendChild(iDiv);
iDiv.innerHTML = '<div class="jumbotron" style="padding:15px;">\
       <div class="container-fluid">\
 <div class="row">\
 <div class="col-md-11 text-center">\
 <b style="font-size:21px;">Scatter</b>\
  </div>\
  <div  class="col-md-1">\
  <button type="button" onclick=removeDiv('+(id-1)+') class="btn btn-danger btn-sm" data-widget="remove"><i class="ti-close"></i></button>\
  </div>\
</div><br>\
  </div>\
\
<fieldset>\
  <div class="input-group">\
    <input type="hidden" id="selectChart'+(id-1)+'" value="line" >\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Title</label>\
    <input type="text" class="form-control" id="traceTitle'+(id-1)+'" placeholder="Add title of the trace" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Data</label>\
    <input type="text" class="form-control" id="dataInput'+(id-1)+'" onkeyup="validateData('+(id-1)+')" placeholder="x,y;x,y" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Label</label>\
    <input type="text" class="form-control" id="dataLabel'+(id-1)+'"  placeholder="label1;label2" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
  \
  '+html+
  '</div>\
    ';


}


function BarDataBlock(idd){
  //alert("hello");
  var iDiv = document.createElement('div');
iDiv.id = id;
iDiv.className = id;
id++;
var division= document.getElementById("data"+idd);
division.appendChild(iDiv);
var html= ' <div><div class="row">' +
       ' <div class="col-sm-12 col-md-4" style="padding-left:15px" >\
          <div class="dropdown">\
            \
              <button class="btn btn-default dropdown-toggle selectButton" data-toggle="dropdown" id="add-new-event'+(id-1)+'" onclick="lineColorChooser('+(id-1)+')" type="button"> Color <span class="caret"></span></button>\
              <ul class="dropdown-menu" role="menu">\
                  <li role="presentaion">\
                  <div class="btn-group" style="width: 100%; margin-bottom: 10px;">\
                <!--<button type="button" id="color-chooser-btn" class="btn btn-info btn-block dropdown-toggle selectButton" data-toggle="dropdown">Color <span class="caret"></span></button>-->\
                <ul class="fc-color-picker" id="color-chooser'+(id-1)+'">'+
                  `<li><a class="text-aqua" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-teal" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-yellow" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-green" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-lime" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-red" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-purple" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-fuchsia" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-maroon" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-gray" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-muted" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-navy" href="#"><i class="fa fa-square"></i></a></li>
                </ul>
              </div>
                  </li></ul>  \
            \
          </div>\
        </div>\
\
        <div class="col-sm-12 col-md-4">`+
           '<select id="opacity'+(id-1)+'" class="dropdown btn btn-default selectButton" data-style="btn-default">'+
  `<option value="1.0">Opactity-1.0</option>
    <option value="0.9">0.9</option>
  <option value="0.8">0.8</option>
  <option value="0.7">0.7</option>
  <option value="0.6">0.6</option>
  <option value="0.5">0.5</option>
  <option value="0.4">0.4</option>
  <option value="0.3">0.3</option>
  <option value="0.2">0.2</option>
  <option value="0.1">0.1</option>
</select>
     </div>`+
       ' <div  class="col-sm-12 col-md-4">'+
         '<select id="width'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option >Border-Width</option><option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
</select>
        </div>\
    </div>\
\
</div>`;
iDiv.innerHTML='<div class="jumbotron"  style="padding:15px;">\
       <div class="container-fluid">\
 <div class="row">\
 <div class="col-md-11 text-center">\
 <b style="font-size:21px;">Bar</b>\
  </div>\
  <div  class="col-md-1">\
  <button type="button" class="btn btn-danger btn-sm" onclick=removeDiv('+(id-1)+') data-widget="remove"><i class="ti-close"></i></button>\
  </div>\
</div><br/>\
  </div>\
\
<fieldset>\
  <div class="input-group">\
    <input type="hidden" id="selectChart'+(id-1)+'" value="bar" >\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Title</label>\
    <input type="text" class="form-control" id="traceTitle'+(id-1)+'" placeholder="Add title of the trace" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Data</label>\
    <input type="text" class="form-control" id="dataInput'+(id-1)+'" onkeyup="validateData('+(id-1)+')" placeholder="x,y;x,y" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>'
+html+
      '</div>';
  //iDiv.innerHTML = '<br>Data Points <input type="text" name="name" id="dataInput'+(id-1)+'"  placeholder="x,y;x,y;x,y" />\
     //   <input type="button" value="Add" id="addButton'+id+'" onclick=addBarData("dataInput'+(id-1)+'");hide("addButton'+id+'")>\
       // <input type="button" value="Edit" id="editButton'+id+'" onclick=editBarData("dataInput'+(id-1)+'",'+(id-1)+')><br><br>';

}
function bubbleDataBlock(idd){
  //alert("hello");
  var iDiv = document.createElement("div");
iDiv.id = id;
iDiv.className = id;
id++;
var division= document.getElementById("data"+idd);
division.appendChild(iDiv);
var html= ' <div><div class="row">' +
        '<div class="col-sm-12 col-md-4" style="padding-left:15px">\
          <div class="dropdown ">\
            \
              <button class="btn btn-default dropdown-toggle selectButton" data-toggle="dropdown" id="add-new-event'+(id-1)+'" onclick="lineColorChooser('+(id-1)+')" type="button"> Color <span class="caret"></span></button>\
              <ul class="dropdown-menu" role="menu">\
                  <li role="presentaion"><div class="btn-group" style="width: 100%; margin-bottom: 10px;">\
                <!--<button type="button" id="color-chooser-btn" class="btn btn-info btn-block dropdown-toggle selectButton" data-toggle="dropdown">Color <span class="caret"></span></button>-->\
                <ul class="fc-color-picker" id="color-chooser'+(id-1)+'">'+
                  `<li><a class="text-aqua" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-teal" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-yellow" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-green" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-lime" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-red" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-purple" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-fuchsia" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-maroon" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-gray" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-muted" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-navy" href="#"><i class="fa fa-square"></i></a></li>
                </ul>
              </div></li> </ul> \
                 
            \
          </div>\
        </div>\
\
        <div class="col-sm-12 col-md-4">`+
            '<select id="opacity'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option value="1.0">Opactity-1.0</option>
   <option value="0.9">0.9</option>
  <option value="0.8">0.8</option>
  <option value="0.7">0.7</option>
  <option value="0.6">0.6</option>
  <option value="0.5">0.5</option>
  <option value="0.4">0.4</option>
  <option value="0.3">0.3</option>
  <option value="0.2">0.2</option>
  <option value="0.1">0.1</option>
</select>
     </div>`+
       ' <div  class="col-sm-12 col-md-4">'+
         '<select id="symbol'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option value="circle">Circle</option>
  <option value="square">Square</option>
  <option value="diamond">Diamond</option>
  <option value="cross">Cross</option>
</select>
        </div>\
    </div>\
\
</div>`;
iDiv.innerHTML = '<div class="jumbotron" style="padding:15px;">\
       <div class="container-fluid">\
 <div class="row">\
  <div class="col-md-11 text-center">\
 <b style="font-size:21px;">Bubble</b>\
  </div>\
  <div  class="col-md-1">\
  <button type="button" class="btn btn-danger btn-sm" onclick=removeDiv('+(id-1)+')  data-widget="remove"><i class="ti-close"></i></button>\
  </div>\
</div><br/>\
  </div>\
\
  <fieldset>\
  <div class="input-group">\
    <input type="hidden" id="selectChart'+(id-1)+'" value="bubble" >\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Title</label>\
    <input type="text" class="form-control" id="traceTitle'+(id-1)+'" placeholder="Add title of the trace" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Data</label>\
    <input type="text" class="form-control" id="dataInput'+(id-1)+'" onkeyup="validateBubbleData('+(id-1)+')" placeholder="x,y,size;x,y,size" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Label</label>\
    <input type="text" class="form-control" id="dataLabel'+(id-1)+'"  placeholder="label1;label2" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
'+html+
      '</div>';
  //iDiv.innerHTML = '<br>Data Points <input type="text" name="name"  id="dataInput'+(id-1)+'"  placeholder="x,y,size;x,y,size" />\
     //   <input type="button" value="Add" id="addButton'+id+'" onclick=addBubbleData("dataInput'+(id-1)+'");hide("addButton'+id+'")>\
     //   <input type="button" value="Edit" id="editButton'+id+'" onclick=editBubbleData("dataInput'+(id-1)+'",'+(id-1)+')><br><br>';

}


function PieDataBlock(idd){
  //alert("hello");
  var iDiv = document.createElement("div");
iDiv.id = id;
iDiv.className = id;
id++;
var division= document.getElementById("data"+idd);
division.appendChild(iDiv);

iDiv.innerHTML = '<div class="jumbotron" style="padding:15px;">\
       <div class="container-fluid">\
 <div class="row">\
 <div class="col-md-11 text-center">\
 <b style="font-size:21px;">Pie</b>\
  </div>\
  <div  class="col-md-1">\
  <button type="button" class="btn btn-danger btn-sm" onclick=removeDiv('+(id-1)+')  data-widget="remove"><i class="ti-close"></i></button>\
  </div>\
</div><br>\
  </div>\
\
<fieldset>\
  <div class="input-group">\
    <input type="hidden" id="selectChart'+(id-1)+'" value="pie" >\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Title</label>\
    <input type="text" class="form-control" id="traceTitle'+(id-1)+'" placeholder="Add title of the trace" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Data</label>\
    <input type="text" class="form-control" id="dataInput'+(id-1)+'" placeholder="x1;x2;x3" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Domain-X</label>\
    <input type="text" class="form-control" id="domainX'+(id-1)+'" placeholder="0,0.5 ->values will be between 0-1" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Domain-Y</label>\
    <input type="text" class="form-control" id="domainY'+(id-1)+'" placeholder="0,0.5 ->values will be between 0-1" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
\
<fieldset>\
  <div class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Label</label>\
    <input type="text" class="form-control" id="dataLabel'+(id-1)+'"  placeholder="label1;label2" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
'+
      '</div>';
  //iDiv.innerHTML = '<br>Data Points <input type="text" name="name"  id="dataInput'+(id-1)+'"  placeholder="x,y,size;x,y,size" />\
     //   <input type="button" value="Add" id="addButton'+id+'" onclick=addBubbleData("dataInput'+(id-1)+'");hide("addButton'+id+'")>\
     //   <input type="button" value="Edit" id="editButton'+id+'" onclick=editBubbleData("dataInput'+(id-1)+'",'+(id-1)+')><br><br>';

}

function ContinousFnBlock(idd){
  //alert("hello");
  var iDiv = document.createElement('div');
iDiv.id = id;
iDiv.className = id;
id++;
var division= document.getElementById("data"+idd);
division.appendChild(iDiv);
var html= ' <div><div class="row">' +
       '<div class="col-sm-12 col-md-4" style="padding-left:15px"><select id="filling'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option value="solid">Solid &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
  <option value="dash">Dash</option>
  <option value="dashdot">Dashdot</option>
  <option value="dot">Dot</option>
</select></div>`+
' <div class="col-sm-12 col-md-4">\
          <div class="dropdown">\
            \
              <button class="btn btn-default dropdown-toggle selectButton" data-toggle="dropdown" id="add-new-event'+(id-1)+'" onclick="lineColorChooser('+(id-1)+')" type="button"> Color <span class="caret"></span></button>\
              <ul class="dropdown-menu" role="menu">\
                  <li role="presentaion">\
                  <div class="btn-group" style="width: 100%; margin-bottom: 10px;">\
                <!--<button type="button" id="color-chooser-btn" class="btn btn-info btn-block dropdown-toggle selectButton" data-toggle="dropdown">Color <span class="caret"></span></button>-->\
                <ul class="fc-color-picker" id="color-chooser'+(id-1)+'">'+
                  `<li><a class="text-aqua" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-teal" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-yellow" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-green" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-lime" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-red" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-purple" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-fuchsia" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-maroon" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-gray" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-muted" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-navy" href="#"><i class="fa fa-square"></i></a></li>
                </ul>
              </div>
                  </li> </ul> \
            \
          </div>\
        </div>\
\
        <div class="col-sm-12 col-md-4">`+
           '<select id="opacity'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option value="1.0">Opactity-1.0</option>
  <option value="0.9">Opactity-0.9</option>
  <option value="0.8">Opactity-0.8</option>
  <option value="0.7">Opactity-0.7</option>
  <option value="0.6">Opactity-0.6</option>
  <option value="0.5">Opactity-0.5</option>
  <option value="0.4">Opactity-0.4</option>
  <option value="0.3">Opactity-0.3</option>
  <option value="0.2">Opactity-0.2</option>
  <option value="0.1">Opactity-0.1</option>
</select>
     </div>`+
       ' <div  class="col-sm-12 col-md-4">'+
         '<select id="width'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option value="1">Thickness-1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
</select>
        </div>`+
        ' <div  class="col-sm-12 col-md-4" >'+
         '<select id="fill'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
  `<option value="none">No Fill</option>
  <option value="tozeroy" >Fill To Zero Y</option>
  <option value="tonexty">Fill To Next Y</option>
 
</select>
        </div>
    </div>\
    <div class="form-group ">

    <b class="functionsWarning">Warning: Some functions containing divergences or infinities may not plot properly. Use your own discretion. You may try manual sampling with large number of points.</b>
    </div>
\
</div>`;
iDiv.innerHTML='<div class="jumbotron" style="padding:15px;">\
       <div class="container-fluid">\
 <div class="row">\
  <div class="col-md-11 text-center">\
 <b style="font-size:21px;">Continous Function (Beta)</b>\
  </div>\
  <div  class="col-md-1">\
  <button type="button" class="btn btn-danger btn-sm" onclick=removeDiv('+(id-1)+') data-widget="remove"><i class="ti-close"></i></button>\
  </div>\
</div><br>\
  </div>\
\
<fieldset>\
  <div class="input-group">\
    <input type="hidden" id="selectChart'+(id-1)+'" value="continous" >\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Title</label>\
    <input type="text" class="form-control" id="traceTitle'+(id-1)+'" placeholder="Add title of the trace" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Function</label>\
    <input type="text" class="form-control" id="dataInput'+(id-1)+'" placeholder="function" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Range of X</label>\
    <input type="text" class="form-control" id="dataRange'+(id-1)+'" placeholder="min,max" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
\
'+html+
      '<div class="row"><div class="pull-left"><div class="row"><div class="col-sm-12"><div class="col-sm-6">\
  <fieldset>\
    <div class="input-group ">\
     <div class="checkbox" >\
        <input type="checkbox" id="manualCheck'+(id-1)+'" onclick="manualSampling('+(id-1)+', $(this));"  value="" class="form-control" ><label for="manualCheck'+(id-1)+'"><b>Manual Sampling</b></label>\
      </div>\
    </div>\
  </fieldset>\
</div></div></div></div>\
<div class="pull-right"><div class="row"><div class="col-sm-12"><div class="col-sm-6">\
  <fieldset>\
    <div class="input-group">\
      <span id="spanDesc'+(id-1)+'" style="display:none" class="input-group-addon" id="sizing-addon1"></span>\
      <input type="hidden" class="form-control" id="dataPoints'+(id-1)+'" placeholder="number of sample points" aria-describedby="sizing-addon1">\
    </div>\
  </fieldset>\
</div></div></div></div>\
      </div>';
  //iDiv.innerHTML = '<br>Data Points <input type="text" name="name" id="dataInput'+(id-1)+'"  placeholder="x,y;x,y;x,y" />\
     //   <input type="button" value="Add" id="addButton'+id+'" onclick=addBarData("dataInput'+(id-1)+'");hide("addButton'+id+'")>\
       // <input type="button" value="Edit" id="editButton'+id+'" onclick=editBarData("dataInput'+(id-1)+'",'+(id-1)+')><br><br>';

}

//3d block\
function threeDBlock(idd){
  //alert("hello");
  var iDiv = document.createElement('div');
iDiv.id = id;
iDiv.className = id;
id++;
var division= document.getElementById("data"+idd);
division.appendChild(iDiv);
var html= ' <div class="row" style="padding-left:15px">' +
        '<label style="font-size:16px;">Line</label><br><div class="col-sm-12 col-md-4"  >'+
              '<select id="marker'+(id-1)+'" class="dropdown btn btn-default selectButton"> '+
                `
                <option value="lines">No Marker</option>
                <option value="10"> 1 </option>
                <option value="20" >2</option>
                <option value="25" >3</option>
                <option value="30" >4 </option>
                <option value="35" >5</option>
                <option value="40" >6 </option>
                <option value="45">7 </option>
                <option value="50" >8</option>
                </select>\
    \                  
        </div>\
        <div class="col-sm-12 col-md-4">\
          <div class="dropdown">\   
            `+
              '<button class="btn btn-default dropdown-toggle selectButton" id="new-event'+(id-1)+'" onclick="MarkercolorChooser('+(id-1)+')" data-toggle="dropdown" type="button"> Color <span class="caret"></span></button>\
              <ul class="dropdown-menu" role="menu">\
                  <li>\
                  <div class="btn-group" style="width: 100%; margin-bottom: 10px;">\
                <ul class="fc-color-picker" id="Mcolor-chooser'+(id-1)+'">'+
                  `<li><a class="text-aqua" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-teal" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-yellow" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-green" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-lime" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-red" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-purple" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-fuchsia" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-maroon" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-gray" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-muted" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-navy" href="#"><i class="fa fa-square"></i></a></li>
                </ul>
              </div>
                  </li>  \
                           
              </ul>\
            \
          </div>\
        </div>\
\
        <div class="col-sm-12 col-md-4">`+
            '<select id="markerOpacity'+(id-1)+'" class="dropdown btn btn-default selectButton">'+
 `<option value="1.0">Opactity-1.0</option>
  <option value="0.9">0.9</option>
  <option value="0.8">0.8</option>
  <option value="0.7">0.7</option>
  <option value="0.6">0.6</option>
  <option value="0.5">0.5</option>
  <option value="0.4">0.4</option>
  <option value="0.3">0.3</option>
  <option value="0.2">0.2</option>
  <option value="0.1">0.1</option>
</select>
           </div>
    </div><br>\
    <div class="row" style="padding-left:15px">` +
       ' <label style="font-size:16px;">Marker</label><br><div class="col-sm-12 col-md-3" >\
       <div class="dropdown " >\
            <div>\
              <select id="3D'+(id-1)+'" class="dropdown btn btn-default selectButton"> \
                \
                <option value="scatter3D">3D Scatter</option>\
                <option value="mesh3D">3D Mesh</option>\
       </select>\
                  \
            </div>\
          </div>\
          </div>\
\
        <div class="col-sm-12 col-md-3">\
          <div class="dropdown">\
            '+
              '<button class="btn btn-default dropdown-toggle selectButton" id="add-new-event'+(id-1)+'" onclick="lineColorChooser('+(id-1)+')" data-toggle="dropdown" type="button"> Color <span class="caret"></span></button>\
              <ul class="dropdown-menu" role="menu">\
                  <li role="presentaion"><div class="btn-group" style="width: 100%; margin-bottom: 10px;">\
                <ul class="fc-color-picker" id="color-chooser'+(id-1)+'">'+
                  `<li><a class="text-aqua" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-blue" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-teal" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-yellow" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-light-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-orange" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-green" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-lime" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-red" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-purple" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-fuchsia" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-maroon" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-gray" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-muted" href="#"><i class="fa fa-square"></i></a></li>
                  <li><a class="text-navy" href="#"><i class="fa fa-square"></i></a></li>
                </ul>
              </div></li>  \
    
              </ul>\
            \
          </div>\
        </div>\
\
        <div class="col-sm-12 col-md-3">`+
'            <select id="opacity'+(id-1)+'" class="dropdown btn btn-default selectButton">\
 <option value="1.0">Opactity-1.0</option>\
   <option value="0.9">0.9</option>\
  <option value="0.8">0.8</option>\
  <option value="0.7">0.7</option>\
  <option value="0.6">0.6</option>\
  <option value="0.5">0.5</option>\
  <option value="0.4">0.4</option>\
  <option value="0.3">0.3</option>\
  <option value="0.2">0.2</option>\
  <option value="0.1">0.1</option>\
</select>\
        </div>\
        <div class="col-sm-12 col-md-3">\
  <select id="thickness'+(id-1)+'" class="dropdown btn btn-default selectButton" >'+
  `<option value="1">Thickness-1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
</select>
        </div>
</div>`;
iDiv.innerHTML='<div class="jumbotron" style="padding:15px;">\
       <div class="container-fluid">\
 <div class="row">\
  <div class="col-md-11 text-center">\
 <b style="font-size:21px;">3-D</b>\
  </div>\
  <div  class="col-md-1">\
  <button type="button" class="btn btn-danger btn-sm" onclick=removeDiv('+(id-1)+') data-widget="remove"><i class="ti-close"></i></button>\
  </div>\
</div><br>\
  </div>\
\
<fieldset>\
  <div class="input-group">\
    <input type="hidden" id="selectChart'+(id-1)+'" value="3d" >\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Title</label>\
    <input type="text" class="form-control" id="traceTitle'+(id-1)+'" placeholder="Add title of the trace" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
<fieldset>\
  <div id="dataInputValidation'+(id-1)+'" class="input-group">\
    <label class="input-group-addon" style="font-weight:bold;" id="sizing-addon1">Data</label>\
    <input type="text" class="form-control" id="dataInput'+(id-1)+'" onkeyup="validateBubbleData('+(id-1)+')" placeholder="x,y,z;x,y,z" aria-describedby="sizing-addon1">\
  </div>\
</fieldset>\
\
  '+html+
      '</div>';
  //iDiv.innerHTML = '<br>Data Points <input type="text" name="name" id="dataInput'+(id-1)+'"  placeholder="x,y;x,y;x,y" />\
     //   <input type="button" value="Add" id="addButton'+id+'" onclick=addBarData("dataInput'+(id-1)+'");hide("addButton'+id+'")>\
       // <input type="button" value="Edit" id="editButton'+id+'" onclick=editBarData("dataInput'+(id-1)+'",'+(id-1)+')><br><br>';

}


//function for manual sampling
function manualSampling(id, t) {
    if (t.is(':checked')) {
      //$(e).find('input').attr('disabled', true);
      document.getElementById("spanDesc"+id).style.display= '';
      var y = document.getElementById("dataPoints"+id);
      y.type= "text";
    
    } else {
      //$(e).find('input').removeAttr('disabled');
      document.getElementById("spanDesc"+id).style.display= 'none';
      var y = document.getElementById("dataPoints"+id);
      y.type= "hidden";
    }
}

//retrieving color from the traces
function lineColorChooser(id){
  var currColor = "#3c8dbc"; //Red by default
    //Color chooser button
    //var colorChooser = $("#color-chooser-btn");
    $("#color-chooser"+id+" > li > a").click(function (e) {
      e.preventDefault();
      //Save color
      currColor = $(this).css("color");
      //Add color effect to button
      $('#add-new-event'+id).css({"background-color": currColor, "border-color": currColor});
    });
    $("#add-new-event"+id).click(function (e) {
      e.preventDefault();
      //Get value and make sure it is not null
     
 });
}
function colorChooser(){
  var currColor = "#3c8dbc"; //Red by default

    //Color chooser button
    var colorChooser = $("#color-chooser");
    $("#color-chooser > li > a").click(function (e) {
      e.preventDefault();
      //Save color
      currColor = $(this).css("color");

      //Add color effect to button
      $('#add-new-event').css({"background-color": currColor, "border-color": currColor});
    });
    $("#add-new-event").click(function (e) {
      e.preventDefault();
      
 });
}
//retrieving color from the traces
function MarkercolorChooser(id){
  var currColor = "#3c8dbc"; //Red by default
    //Color chooser button
   // var colorChooser = $("#Mcolor-chooser"+id);
    $("#Mcolor-chooser"+id+" > li > a").click(function (e) {
      e.preventDefault();
      //Save color
      currColor = $(this).css("color");
      //Add color effect to button
      $('#new-event'+id).css({"background-color": currColor, "border-color": currColor});
    });
    $("#new-event"+id).click(function (e) {
      e.preventDefault();
      //Get value and make sure it is not null
      var val = $("#new-event"+id).val();
      if (val.length == 0) {
        return;
      }
 });
}


//plot 2 code starts
function hide(id){
  document.getElementById(id).disabled = true;
}

function unhide(id){
  document.getElementById(id).disabled = true;
}

function removeSemicolan(data){
  return data.split(";");
}


function addLineData(id){
  plotX=[];
    plotY=[];
    plotSize=[]; 
  plotObj={};

  //alert(id);
  var data=document.getElementById("dataInput"+id).value;

  //parse the data
  var dataparse=removeSemicolan(data);
  console.log(dataparse);
  for (var i = 0; i < dataparse.length; i++) {
     var temp=dataparse[i];

    //alert(temp);
    var subData=temp.split(",");
    //insert x,y values
    plotX.push(subData[0]);
    
      plotY.push(subData[1]);

  }
  plotObj["x"] = plotX;
   plotObj["y"] = plotY;
   plotObj["mode"]="scatter";
   console.log("traceTitle"+id);
   plotObj["name"]=document.getElementById("traceTitle"+id).value;
  plot.push(plotObj);


}

function addBarData(id){
  plotX=[];
 plotY=[];
// plotSize=[];
 
plotObj={};

  //alert(id);
  var data=document.getElementById(id).value;

  //parse the data
  var dataparse=removeSemicolan(data);
  console.log(dataparse);
  for (var i = 0; i < dataparse.length; i++) {
    var temp=dataparse[i];

    //alert(temp);
    var subData=temp.split(",");
    //insert x,y values
    plotX.push(subData[0]);
    
      plotY.push(subData[1]);
  }
  plotObj["x"] = plotX;
   plotObj["y"] = plotY;
   plotObj["type"]="bar";
  plot.push(plotObj);


}


function addBubbleData(id1){
  //alert(id1);
  plotX=[];
 plotY=[];
 plotSize=[];
 
plotObj={};

  var data1=document.getElementById(id1).value;

  //parse the data
  var dataparse=removeSemicolan(data1);
  console.log(dataparse);
  for (var i = 0; i < dataparse.length; i++) {
    var temp=dataparse[i];

    //alert(temp);
    var subData=temp.split(",");
    //insert x,y values
    plotX.push(subData[0]);
    
      plotY.push(subData[1]);
      plotSize.push(subData[2]);

  }
  marker={};
  marker["size"]=plotSize;
  plotObj["x"] = plotX;
   plotObj["y"] = plotY;
   plotObj["mode"]="markers";
   plotObj["marker"]=marker;
   //plotObj["type"]= "scatter";
    //plotObj["type"]= document.getElementById("type").value ;
    
  plot.push(plotObj);


}


//retrieving layout options
function layout(){
  var layout={};
   var xaxis={};
   var yaxis={};
  if(!document.getElementById("chartTitle").value.length <1 ){
    layout["title"]=document.getElementById("chartTitle").value;
}
if(!document.getElementById("Xaxis").value.length <1 ){
  

      xaxis["title"]=document.getElementById("Xaxis").value;
      
}
if(!document.getElementById("Yyaxis").value.length <1 ){
   

      yaxis["title"]=document.getElementById("Yyaxis").value;
      layout["yaxis"]=yaxis;
}
// if(!document.getElementById("aspectRatio").value.length <1 ){
//     layout["frameAspectRatio"]=document.getElementById("aspectRatio").value;
// }
  //hover mode layout setting.
        var hovermode = $('#hover').find(":selected").val();
        if(hovermode=="false"){
              layout["hovermode"]=false;
        }else{
              layout["hovermode"]=hovermode;
        }
        
        var legend = $('#legend').find(":selected").val();
        if(legend=="false"){
            layout["showlegend"]=false;
        }else{
            if(legend=="true"){
                  layout["showlegend"]=true;
            }else{
                  layout["showlegend"]=true;
                  legndOrientation={};
                  legndOrientation["orientation"]=legend;
                  layout["legend"]=legndOrientation;
            }
            
        }

         var bg1 = $("#add-new-event").css("background-color");
         layout["framecolor"]=bg1;
        if(bg1.indexOf('a') == -1){
        bg1 = bg1.replace(')', ','+1.0+' )').replace('rgb', 'rgba');
        }
        var bg2 = $("#add-new-event").css("background-color");
        if(bg2.indexOf('a') == -1){
        bg2 = bg2.replace(')', ','+0.6+' )').replace('rgb', 'rgba');
        }
        if($("#frame").is(':checked')){
          xaxis["mirror"]=true;
          yaxis["mirror"]=true;

          xaxis["linecolor"]= bg1;
          xaxis["linewidth"]= 1.5;
          yaxis["linecolor"]= bg1;
          yaxis["linewidth"]= 1.5;

        }else{
          xaxis["mirror"]=false;
          yaxis["mirror"]=false;
        }
    

        if($("#gridlinesX").is(':checked')) {
          xaxis["showgrid"]=true;
          xaxis["gridcolor"]=bg2;
          xaxis["gridwidth"]= 1;
         
        }else{
          xaxis["showgrid"]=false;
         
        }
        if($("#gridlinesY").is(':checked')) {
          yaxis["showgrid"]=true;
          yaxis["gridcolor"]=bg2;
          yaxis["gridwidth"]= 1;
        }else{
          yaxis["showgrid"]=false;
        }
  

       if($("#zerolinesX").is(':checked')) {
          xaxis["zeroline"]=true;
          xaxis["zerolinecolor"]= bg1;
          xaxis["zerolinewidth"]= 1.5;
          
        }else{
          xaxis["zeroline"]=false;
        }

          if($("#zerolinesY").is(':checked')) {
            yaxis["zeroline"]=true;
              yaxis["zerolinecolor"]= bg1;
              yaxis["zerolinewidth"]= 1.5;
          }else{
          yaxis["zeroline"]=false;
        }

        if($("#xx").is(':checked')) {
          xaxis["visible"]=true;
        }else{
          xaxis["visible"]=false;
         
        }
        if($("#yy").is(':checked')) {
          yaxis["visible"]=true;
        }else{
          yaxis["visible"]=false;
        }

    
layout["xaxis"]=xaxis;
layout["yaxis"]=yaxis;
console.log(JSON.stringify(layout));
return layout;
}

function removeDiv(id){
  $( "div" ).remove( "#data"+id );
  $( "select" ).remove( "#selectChart"+id );
}

//fn to plot advanced chart
function advncdLayout(){
  if(document.getElementById("layout").value.length <=1 ){
 var layout = {
  title:'Line and Scatter Plot'
};
return layout;
}
if(document.getElementById("layout").value.length > 1){
  var layout11 = layout_adv.getValue();
  console.log("advance layout----"+ layout11);
  var layout = JSON.parse(layout11);
  return layout;
  }
}

function plotAdvancedChart(){

var jsonObjH = plotdata_adv.getValue();
//console.log("advance----"+ jsonObjH);
  var plotData = JSON.parse(jsonObjH);
    var data = plotData;
    // Plotly.newPlot('myDiv', data ,advncdLayout());
    (function() {
      var d3 = Plotly.d3;
      var WIDTH_IN_PERCENT_OF_PARENT = 100,
          HEIGHT_IN_PERCENT_OF_PARENT = 100;
      
      var gd3 = d3.select("#myDiv")
          .style({
            width: WIDTH_IN_PERCENT_OF_PARENT + '%'
            // height: HEIGHT_IN_PERCENT_OF_PARENT + '%'
          });

      var nodes_to_resize = gd3[0]; //not sure why but the goods are within a nested array
      window.onresize = function() {
        for (var i = 0; i < nodes_to_resize.length; i++) {
          Plotly.Plots.resize(nodes_to_resize[i]);
        }
      };
    })();

    Plotly.newPlot('myDiv', data ,advncdLayout(),{displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud','hoverCompareCartesian']});
}
//function to plot the chart
function plotChart() {
  plot=[]; //main data array.
  
  for (var i = 0; i < id; i++) { 
    if($("#data" + i).length != 0){ //check that data block exist of not.
        plotX=[]; // Xarray
        plotY=[];  //Yarray
        plotObj={}; //particular trace object
        plotSize=[]; // size array
        plotZ=[];
        console.log("id"+i);
    
        var sel = document.getElementById("selectChart"+i);
        var sv = sel.value;
        console.log("selectChart"+sv);
  
        
         if(sv=="pie"){//if it is pie chart parse only x values.
          //parse the data
          var data=document.getElementById("dataInput"+i).value;
          plotX=removeSemicolan(data);
          plotObj["text"]=document.getElementById("traceTitle"+(i)).value;
          var label=document.getElementById("dataLabel"+i).value;
          var subLabel=label.split(";");//split the label
          var domainX=document.getElementById("domainX"+i).value;
          var domainY=document.getElementById("domainY"+i).value;
          domain={};
          domain["x"]=domainX.split(",");
          domain["y"]=domainY.split(",");
          plotObj["domain"]=domain;

          plotObj["labels"]=subLabel;
          plotObj["values"]=plotX;
          plotObj["type"]='pie';

         } 
          else if(sv!="continous"){ // if it is not continous type. Then parse X , Y values. else do sampling of continous function

          //parse the data
          var data=document.getElementById("dataInput"+i).value;
          var dataparse=removeSemicolan(data);
          //console.log(dataparse);
          for (var j = 0; j < dataparse.length; j++) {

              var temp=dataparse[j];

                //alert(temp);
              var subData=temp.split(","); //split into x,y
              //insert x,y values
              plotX.push(subData[0]); //x values
            
              plotY.push(subData[1]); // y values

              

              if(subData[2]!=null) // if there is size field also in data.
                if(sv=="3d"){
                     plotZ.push(subData[2]); 
                      var selected = $('#3D'+i).find(":selected").val();
                      if(selected=="scatter3D"){
                           plotObj["type"]='scatter3d';
                      }else
                        plotObj["type"]='mesh3d';
                }else{
                  plotSize.push(subData[2]);  
                }
                

            }
          }else{ //for continous function

                  var result=continousFunction(i); // return the discrete value of continous fn.
                  plotX=result.X;
                  plotY=result.Y;
                  var line={}
                  line["shape"]="spline";
      
                    // 0 - 1.3 
      
                  //line["simplify"]=false;
                  //plotObj["line"]=line;

                    //console.log("the color s"+$("#add-new-event"+i).css("color"));
                    var e5 = document.getElementById("opacity"+i);
                    var opacity = e5.options[e5.selectedIndex].value;
                   
                    
                    // to change rgb value to rgba value.
                    var bg = $("#add-new-event"+i).css("background-color");
                     line["framecolor"]=bg;
                    if(bg.indexOf('a') == -1){
                    bg = bg.replace(')', ','+opacity+' )').replace('rgb', 'rgba');
                    }
                    line["color"]=bg;
                    line["smoothing"]=opacity;

                     var e = document.getElementById("width"+i);
                 
                     var width = e.options[e.selectedIndex].value;
                     line["width"]=width;  
                     var e1 = document.getElementById("filling"+i);
                      var filling = e1.options[e1.selectedIndex].value;
                      if(filling=="noLine" && markerTag == "lines"){
                       plotObj["mode"]="none";
                      }else if(filling=="noLine"){plotObj["mode"]="markers";}
                      else
                      line["dash"]=filling;
                      var fill=document.getElementById("fill"+i).value;
                      plotObj["fill"]=fill;


                     plotObj["mode"]="lines";
                     plotObj["line"]=line;
                     var fn=document.getElementById("dataInput"+i).value;
                    var range=document.getElementById("dataRange"+i).value;
                    plotObj["function"]=fn;
                    plotObj["range"]=range;
                    plotObj["type"]="continous";
                    plotObj["x"] = plotX;
                    plotObj["y"] = plotY;
          }



     if(sv=="line"){ // for the scatter type plot.
          
          var marker={}; // marker object
          line={}; //line object
          var label=document.getElementById("dataLabel"+i).value;
          var subLabel=label.split(";");//split the label
          plotObj["text"]=subLabel;
          plotObj["type"]="scatter";
          
          var m1=document.getElementById("marker"+i);
          var markerTag = m1.options[m1.selectedIndex].value;


          var mm=document.getElementById("thickness"+i);
          var lineThickness = mm.options[mm.selectedIndex].value;
          
          if(markerTag=="lines"){
              plotObj["mode"]=markerTag;//no markers , only line
              line["width"]=lineThickness;
              }else{
              plotObj["mode"]="lines+markers";//marker+lines
              line["width"]=lineThickness;
          }
          var e5 = document.getElementById("opacity"+i);
          var opacity = e5.options[e5.selectedIndex].value;
          console.log("the color s"+$("#add-new-event"+i).css("color"));  
          
          // to change rgb value top rgba value.
          var bg = $("#add-new-event"+i).css("background-color");
          line["framecolor"]=bg;

          if(bg.indexOf('a') == -1){
          bg = bg.replace(')', ','+opacity+' )').replace('rgb', 'rgba');
          }

          line["color"]=bg;
          //marker width
          var e = document.getElementById("marker"+i);
          var width = e.options[e.selectedIndex].value;
          marker["size"]=width;
          var e1 = document.getElementById("filling"+i);
          var filling = e1.options[e1.selectedIndex].value;
          if(filling=="noLine" && markerTag == "lines"){
          plotObj["mode"]="none";
          }else if(filling=="noLine"){plotObj["mode"]="markers";}
          else
          line["dash"]=filling;

          var e6 = document.getElementById("markerOpacity"+i);
          var opacity = e6.options[e6.selectedIndex].value;
          //console.log("the color s"+$("#add-new-event"+i).css("color"));  

          var e2 = document.getElementById("shape"+i);
          var shape = e2.options[e2.selectedIndex].value;
          console.log("shape"+shape);
          line["shape"]=shape;
          line["smoothing"]=opacity;
              plotObj["line"]=line;

          var fill=document.getElementById("fill"+i).value;
          plotObj["fill"]=fill;
      //marker property here

          
          
          // to change rgb value top rgba value.
          var bg1 = $("#new-event"+i).css("background-color");
          marker["framecolor"]=bg1;
          if(bg1.indexOf('a') == -1){
          bg1 = bg1.replace(')', ','+opacity+' )').replace('rgb', 'rgba');
          }

          marker["color"]=bg1;
          marker["smoothing"]=opacity;
          plotObj["marker"]=marker;
          plotObj["x"] = plotX;
          plotObj["y"] = plotY;


        }
  if(sv=="bar"){
        //console.log("Bar")
        plotObj["type"]="bar";

         marker={};
        console.log("the color s"+$("#add-new-event"+i).css("color"));
        var e5 = document.getElementById("opacity"+i);
        var opacity = e5.options[e5.selectedIndex].value;
       // console.log("the color s"+$("#add-new-event"+i).css("color"));  
        
        // to change rgb value top rgba value.
        var bg = $("#add-new-event"+i).css("background-color");
        marker["framecolor"]=bg;
        if(bg.indexOf('a') == -1){
        bg = bg.replace(')', ','+opacity+' )').replace('rgb', 'rgba');
        }
        marker["color"]=bg;
        var line={};
        var e = document.getElementById("width"+i);
     
        var width = e.options[e.selectedIndex].value;
        line["width"]=width;
        var bg1 = $("#add-new-event"+i).css("background-color");
        if(bg1.indexOf('a') == -1){
        bg1 = bg1.replace(')', ','+1+' )').replace('rgb', 'rgba');
        }
        line["color"]=bg1;
        marker["line"]=line;
        marker["smoothing"]=opacity;
        plotObj["marker"]=marker;
        plotObj["x"] = plotX;
  plotObj["y"] = plotY;
       // plotObj["line"]=line;
  }
   if(sv=="bubble"){
        plotObj["mode"]="markers";
        //console.log("I m here");
        marker={};
        if(!plotSize.length<1){ //if plotsize is not empty.
              //make an object
          marker["size"]=plotSize;  
          }
        var label=document.getElementById("dataLabel"+i).value;
        var subLabel=label.split(";");
        plotObj["text"]=subLabel;
        var e5 = document.getElementById("opacity"+i);
        var opacity = e5.options[e5.selectedIndex].value;
        //console.log("the color s"+$("#add-new-event"+i).css("color"));  
            
            // to change rgb value top rgba value.
        var bg = $("#add-new-event"+i).css("background-color");
        marker["framecolor"]=bg;
        if(bg.indexOf('a') == -1){
            bg = bg.replace(')', ','+opacity+' )').replace('rgb', 'rgba');
            }

        marker["color"]=bg;
        marker["smoothing"]=opacity;
        var e2 = document.getElementById("symbol"+i);
        var shape = e2.options[e2.selectedIndex].value;
       // console.log("shape"+shape);
        marker["symbol"]=shape;

        plotObj["marker"]=marker;
        plotObj["x"] = plotX;
  plotObj["y"] = plotY;
   }
  
  
  if(sv=='3d'){
 
    plotObj["z"] = plotZ;

       var marker={}; // marker object
          line={}; //line object
          
          var m1=document.getElementById("marker"+i);
          var markerTag = m1.options[m1.selectedIndex].value;


          var mm=document.getElementById("thickness"+i);
          var lineThickness = mm.options[mm.selectedIndex].value;
          
          if(markerTag=="lines"){
              plotObj["mode"]=markerTag;//no markers , only line
              line["width"]=lineThickness;
              }else{
              plotObj["mode"]="lines+markers";//marker+lines
              line["width"]=lineThickness;
          }
          var e5 = document.getElementById("opacity"+i);
          var opacity = e5.options[e5.selectedIndex].value;
          console.log("the color s"+$("#add-new-event"+i).css("color"));  
          
          // to change rgb value top rgba value.
          var bg = $("#add-new-event"+i).css("background-color");
          line["framecolor"]=bg;
          if(bg.indexOf('a') == -1){
          bg = bg.replace(')', ','+opacity+' )').replace('rgb', 'rgba');
          }

          line["color"]=bg;
          line["smoothing"]=opacity;
          //marker width
          var e = document.getElementById("marker"+i);
          var width = e.options[e.selectedIndex].value;
          marker["size"]=width;
          
          marker["line"]=line;

    
      //marker property here

          var e6 = document.getElementById("markerOpacity"+i);
          var opacity = e6.options[e6.selectedIndex].value;
          //console.log("the color s"+$("#add-new-event"+i).css("color"));  
          
          // to change rgb value top rgba value.
          var bg1 = $("#new-event"+i).css("background-color");
           marker["framecolor"]=bg1;
          if(bg1.indexOf('a') == -1){
          bg1 = bg1.replace(')', ','+opacity+' )').replace('rgb', 'rgba');
          }

          marker["color"]=bg1;
          marker["smoothing"]=opacity;
          plotObj["marker"]=marker;
          plotObj["x"] = plotX;
          plotObj["y"] = plotY;

  }

  

   //plotObj["mode"]="scatter";
   //console.log("traceTitle"+(i-1));
  plotObj["name"]=document.getElementById("traceTitle"+(i)).value;
  plot.push(plotObj);

    
  }
}

    var plotData = plot;//JSON.parse(document.getElementById("plot-data").value);
    //document.getElementById("demo").innerHTML = document.getElementById("plot-data").value;
    var data = plotData;

//var layout = JSON.parse(document.getElementById("layout").value);
//  var plotJson={};
//  plotJson["plotdata"]=data;
//  plotJson["layout"]=layout();
//  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plotJson));
// var dlAnchorElem = document.getElementById('downloadAnchorElem');
// dlAnchorElem.setAttribute("href",     dataStr     );
// dlAnchorElem.setAttribute("download", "PlotJson.json");
// dlAnchorElem.click();

// var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout()));
// var dlAnchorElem = document.getElementById('adownloadAnchorElem');
// dlAnchorElem.setAttribute("href",     dataStr     );
// dlAnchorElem.setAttribute("download", "layout.json");
// dlAnchorElem.click();

// var aspectratio = document.getElementById("aspectRatio").value;


    // MAKE THE PLOTS RESPONSIVE
    (function() {
      var d3 = Plotly.d3;
      var WIDTH_IN_PERCENT_OF_PARENT = 100,
          HEIGHT_IN_PERCENT_OF_PARENT = 100;
      
      var gd3 = d3.select("#myDiv")
          .style({
            width: WIDTH_IN_PERCENT_OF_PARENT + '%'
            // height: HEIGHT_IN_PERCENT_OF_PARENT + '%'
          });

      var nodes_to_resize = gd3[0]; //not sure why but the goods are within a nested array
      window.onresize = function() {
        for (var i = 0; i < nodes_to_resize.length; i++) {
          Plotly.Plots.resize(nodes_to_resize[i]);
        }
      };
    })();


    Plotly.newPlot('myDiv', data ,layout(), {displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud','hoverCompareCartesian']});


// dataobj=metadata();
dataobj=layout();
var dataobj_plot ={};
dataobj_plot=data;
// console.log("dataobj---"+ JSON.stringify(dataobj));
document.getElementById("layout_update").value = JSON.stringify(dataobj);
document.getElementById("plotdata_update").value = JSON.stringify(dataobj_plot);

}

function plotDataTab(){


  document.getElementById("plotdataTab").value=JSON.stringify(plot, null, 4);
  document.getElementById("layoutdataTab").value=JSON.stringify(layout(), null, 4);

  // document.getElementById("plotdata").value=JSON.stringify(plot, undefined, 4);

}

function getJsondata(file){
  var jsondata;

 $(document).ready(function () {
    $.getJSON( file,function (data) {
        //alert(data.Name);
        console.log(data);
        return data;
    });
});


}

function addJsonDiv(type,id) {  // add the division dynamically for loading json-data into it.
  // body...
  


alreadyUsed=0;
var division= document.getElementById('TextBoxContainerOpt');

document.getElementById("selectChart").setAttribute("name",id);


var iDiv = document.createElement('div');
iDiv.id = "data"+id;
iDiv.className = "data"+id;
var division= document.getElementById('TextBoxContainerOpt');
division.appendChild(iDiv);



  if(type == "scatter"){
    LineDataBlock(id);

  }
  if(type == "markers"){
    bubbleDataBlock(id);
  }
  if(type == "bar"){
    BarDataBlock(id);
  }
  if(type == "continous"){
    ContinousFnBlock(id);
  }
  if(type == "3d"){
    threeDBlock(id);
  }
   if(type == "pie"){
    PieDataBlock(id);
  }
  //selectId++;
  //this.disabled=true;
  alreadyUsed=1;

  selectId++;


}

function loadPlotData(){
    $.getJSON( "plotJson.json",function (data) {
        //alert(data.Name);
       // console.log(data);
       //load layouts.
         document.getElementById('chartTitle').value=data.layout.title;
    document.getElementById('Xaxis').value=data.layout.xaxis.title;
    $('#gridlinesX').prop('checked', data.layout.xaxis.showgrid);
  $('#zerolinesX').prop('checked', data.layout.xaxis.zeroline);
    document.getElementById('Yyaxis').value=data.layout.yaxis.title;
    $('#gridlinesY').prop('checked', data.layout.xaxis.showgrid);
  $('#zerolinesY').prop('checked', data.layout.xaxis.zeroline);
    document.getElementById('hover').value=data.layout.hovermode;
    $('#add-new-event').css({"background-color": data.layout.xaxis.linecolor, "border-color": data.layout.xaxis.linecolor});
   
    if(data.layout.showlegend==false ){
      document.getElementById('legend').value="false";
    }else{
      if(data.layout.legend.orientation=="v" || data.layout.legend.orientation=="h")
      document.getElementById('legend').value=data.layout.legend.orientation;
      else
       document.getElementById('legend').value="true"; 
    }
    if(data.layout.xaxis.mirror==true){
    $('#frame').prop('checked', true);
        }else{
          $('#frame').prop('checked', false);
        }


    //loat plot data
        for (var i=0;i<data.plotdata.length;i++) {
           // console.log(i);  
        if(data.plotdata[i].type=="scatter"){
          console.log("scatter");
          addJsonDiv("scatter",i);
          //now add all the value.
          document.getElementById('traceTitle'+i).value=data.plotdata[i].name;
          var str="";
          var xarr=data.plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+data.plotdata[i].x[j];
            str=str+',';
            str=str+data.plotdata[i].y[j];
            str=str+';';
          }
          document.getElementById('dataInput'+i).value=str;
          document.getElementById('dataLabel'+i).value=data.plotdata[i].text;
          $('#add-new-event'+i).css({"background-color": data.plotdata[i].line.color, "border-color": data.plotdata[i].line.color});
          $('#new-event'+i).css({"background-color": data.plotdata[i].marker.color, "border-color": data.plotdata[i].marker.color});
          document.getElementById('marker'+i).value=data.plotdata[i].marker.size;
          document.getElementById('shape'+i).value=data.plotdata[i].line.shape;
          document.getElementById('filling'+i).value=data.plotdata[i].line.dash;
           document.getElementById('thickness'+i).value=data.plotdata[i].line.width;

        }
        if(data.plotdata[i].type=="bar"){
            console.log("bar");
          addJsonDiv("bar",i);
          //now add all the value.
          document.getElementById('traceTitle'+i).value=data.plotdata[i].name;
          var str="";
          var xarr=data.plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+data.plotdata[i].x[j];
            str=str+',';
            str=str+data.plotdata[i].y[j];
            str=str+';';
          }
          document.getElementById('dataInput'+i).value=str;
          //document.getElementById('dataLabel'+i).value=data[i].text;
          $('#add-new-event'+i).css({"background-color": data.plotdata[i].marker.line.color, "border-color": data.plotdata[i].marker.line.color});
          document.getElementById('width'+i).value=data.plotdata[i].marker.line.width;
        }
        
             if(data.plotdata[i].type=="pie"){
            console.log("pie");
          addJsonDiv("pie",i);
          //now add all the value.
          document.getElementById('traceTitle'+i).value=data.plotdata[i].name;
          var str="";
          var xarr=data.plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+data.plotdata[i].x[j];
      
            str=str+';';
          }
          document.getElementById('dataInput'+i).value=str;
          

          document.getElementById('dataLabel'+i).value=data.plotdata[i].labels;
          var domX="";
           for(var j=0;j<data.plotdata[i].domain.x.length;j++){
            domX=domX+data.plotdata[i].domain.x[j];
      
            domX=domX+';';
          }
          document.getElementById('domainX'+i).value=domX;
          var domY="";
           for(var j=0;j<data.plotdata[i].domain.y.length;j++){
            domY=domY+data.plotdata[i].domain.y[j];
      
            domY=domY+';';
          }
          document.getElementById('domainY'+i).value=domY;
         

        }

        if(data.plotdata[i].type=="continous"){//for continous function
          addJsonDiv("continous",i);
           document.getElementById('traceTitle'+i).value=data.plotdata[i].name;
           document.getElementById("dataInput"+i).value=data.plotdata[i].function;
           document.getElementById("dataRange"+i).value=data.plotdata[i].range;
            document.getElementById('width'+i).value=data.plotdata[i].line.width;
           //add colors.
           $('#add-new-event'+i).css({"background-color": data.plotdata[i].line.color, "border-color": data.plotdata[i].line.color});

        }
        if(data.plotdata[i].mode=="markers"){
              console.log("markers");
          addJsonDiv("markers",i);
          //now add all the value.
          document.getElementById('traceTitle'+i).value=data.plotdata[i].name;
          var str="";
          var xarr=data.plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+data.plotdata[i].x[j];
            str=str+',';
            str=str+data.plotdata[i].y[j];
            str=str+',';
            str=str+data.plotdata[i].marker.size[j];
            str=str+';';
          }

        document.getElementById('dataInput'+i).value=str;
          document.getElementById('dataLabel'+i).value=data.plotdata[i].text;
          $('#add-new-event'+i).css({"background-color": data.plotdata[i].marker.color, "border-color": data.plotdata[i].marker.color});
          document.getElementById('symbol'+i).value=data.plotdata[i].marker.symbol;
          console.log("symbol"+document.getElementById('symbol'+i).value);

        }

        if(data.plotdata[i].type=="scatter3d"){
           addJsonDiv("3d",i);
           document.getElementById('traceTitle'+i).value=data.plotdata[i].name;
          var str="";
          var xarr=data.plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+data.plotdata[i].x[j];
            str=str+',';
            str=str+data.plotdata[i].y[j];
            str=str+',';
            str=str+data.plotdata[i].z[j];
            str=str+';';
          }
           document.getElementById('dataInput'+i).value=str;
        
          $('#add-new-event'+i).css({"background-color": data.plotdata[i].marker.line.color, "border-color": data.plotdata[i].marker.line.color});
          $('#new-event'+i).css({"background-color": data.plotdata[i].marker.color, "border-color": data.plotdata[i].marker.color});
          document.getElementById('marker'+i).value=data.plotdata[i].marker.size;
          document.getElementById('thickness'+i).value=data.plotdata[i].marker.line.width;
        }
      }
  });
}

function loadPlotDatachart(){
 var p = document.getElementById('pdata').value;
var plotdata =JSON.parse(p);
 // console.log("pdata--"+plotdata);
 //  console.log("pdata length--"+plotdata.length);

    //loat plot data
        for (var i=0;i<plotdata.length;i++) {
           // console.log(i);  
           // console.log(plotdata[i].type);  
        if(plotdata[i].type=="scatter"){
          console.log("scatter");
          addJsonDiv("scatter",i);
          //now add all the value.
          document.getElementById('traceTitle'+i).value=plotdata[i].name;
          var str="";
          var xarr=plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+plotdata[i].x[j];
            str=str+',';
            str=str+plotdata[i].y[j];
            str=str+';';
          }
          document.getElementById('dataInput'+i).value=str.slice(0, -1);

          var domX="";
           for(var j=0;j<plotdata[i].text.length;j++){
            domX=domX+plotdata[i].text[j];
      
            domX=domX+';';
          }
          document.getElementById('dataLabel'+i).value=domX.slice(0, -1);
          $('#add-new-event'+i).css({"background-color": plotdata[i].line.framecolor, "border-color": plotdata[i].line.framecolor});
          $('#new-event'+i).css({"background-color": plotdata[i].marker.framecolor, "border-color": plotdata[i].marker.framecolor});
          document.getElementById('marker'+i).value=plotdata[i].marker.size;
          document.getElementById('shape'+i).value=plotdata[i].line.shape;
          document.getElementById('filling'+i).value=plotdata[i].line.dash;
          document.getElementById('thickness'+i).value=plotdata[i].line.width;
          document.getElementById('fill'+i).value=plotdata[i].fill;
          document.getElementById('opacity'+i).value=plotdata[i].line.smoothing;
          document.getElementById('markerOpacity'+i).value=plotdata[i].marker.smoothing;
        }

        if(plotdata[i].type=="bar"){
            console.log("bar");
          addJsonDiv("bar",i);
          //now add all the value.
          document.getElementById('traceTitle'+i).value=plotdata[i].name;
          var str="";
          var xarr=plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+plotdata[i].x[j];
            str=str+',';
            str=str+plotdata[i].y[j];
            str=str+';';
          }
          document.getElementById('dataInput'+i).value=str.slice(0, -1);
          //document.getElementById('dataLabel'+i).value=data[i].text;
          $('#add-new-event'+i).css({"background-color": plotdata[i].marker.framecolor, "border-color": plotdata[i].marker.framecolor});
          document.getElementById('width'+i).value=plotdata[i].marker.line.width;
          document.getElementById('opacity'+i).value=plotdata[i].marker.smoothing;
        }
        
        if(plotdata[i].type=="pie"){
            console.log("pie");
          addJsonDiv("pie",i);
          //now add all the value.
          document.getElementById('traceTitle'+i).value=plotdata[i].name;
          var str="";
          var xarr=plotdata[i].values;
          for(var j=0;j<xarr.length;j++){
            str=str+plotdata[i].values[j];
      
            str=str+';';
          }
          document.getElementById('dataInput'+i).value=str.slice(0, -1);
          
           var str1="";
           for(var j=0;j<plotdata[i].labels.length;j++){
            str1=str1+plotdata[i].labels[j];
      
            str1=str1+';';
          }
          document.getElementById('dataLabel'+i).value=str1.slice(0, -1);

          var domX="";
           for(var j=0;j<plotdata[i].domain.x.length;j++){
            domX=domX+plotdata[i].domain.x[j];
      
            domX=domX+',';
          }
          document.getElementById('domainX'+i).value=domX.slice(0, -1);

          var domY="";
           for(var j=0;j<plotdata[i].domain.y.length;j++){
            domY=domY+plotdata[i].domain.y[j];
      
            domY=domY+',';
          }
          document.getElementById('domainY'+i).value=domY.slice(0, -1);
         

        }

        if(plotdata[i].type=="continous"){//for continous function
          addJsonDiv("continous",i);
           document.getElementById('traceTitle'+i).value=plotdata[i].name;
           document.getElementById("dataInput"+i).value=plotdata[i].function;
           document.getElementById("dataRange"+i).value=plotdata[i].range;
            document.getElementById('width'+i).value=plotdata[i].line.width;
            document.getElementById('opacity'+i).value=plotdata[i].line.smoothing;
            document.getElementById('fill'+i).value=plotdata[i].fill;
           //add colors.

           $('#add-new-event'+i).css({"background-color": plotdata[i].line.framecolor, "border-color": plotdata[i].line.framecolor});

        }
        if(plotdata[i].mode=="markers"){
              console.log("markers");
          addJsonDiv("markers",i);
          //now add all the value.
          document.getElementById('traceTitle'+i).value=plotdata[i].name;
          var str="";
          var xarr=plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+plotdata[i].x[j];
            str=str+',';
            str=str+plotdata[i].y[j];
            str=str+',';
            str=str+plotdata[i].marker.size[j];
            str=str+';';
          }
          document.getElementById('dataInput'+i).value=str.slice(0, -1);

          var domX="";
           for(var j=0;j<plotdata[i].text.length;j++){
            domX=domX+plotdata[i].text[j];
      
            domX=domX+';';
          }
          document.getElementById('dataLabel'+i).value=domX.slice(0, -1);
          // document.getElementById('dataLabel'+i).value=plotdata[i].text;
          $('#add-new-event'+i).css({"background-color": plotdata[i].marker.framecolor, "border-color": plotdata[i].marker.framecolor});
          document.getElementById('symbol'+i).value=plotdata[i].marker.symbol;
          document.getElementById('opacity'+i).value=plotdata[i].marker.smoothing;
          console.log("symbol"+document.getElementById('symbol'+i).value);

        }

        if(plotdata[i].type=="scatter3d"){
           addJsonDiv("3d",i);
           document.getElementById('traceTitle'+i).value=plotdata[i].name;
          var str="";
          var xarr=plotdata[i].x;
          for(var j=0;j<xarr.length;j++){
            str=str+plotdata[i].x[j];
            str=str+',';
            str=str+plotdata[i].y[j];
            str=str+',';
            str=str+plotdata[i].z[j];
            str=str+';';
          }
           document.getElementById('dataInput'+i).value=str.slice(0, -1);
        
          $('#add-new-event'+i).css({"background-color": plotdata[i].marker.line.framecolor, "border-color": plotdata[i].marker.line.framecolor});
          $('#new-event'+i).css({"background-color": plotdata[i].marker.framecolor, "border-color": plotdata[i].marker.framecolor});
          document.getElementById('marker'+i).value=plotdata[i].marker.size;
          document.getElementById('thickness'+i).value=plotdata[i].marker.line.width;
          document.getElementById('markerOpacity'+i).value=plotdata[i].marker.smoothing;
          document.getElementById('opacity'+i).value=plotdata[i].marker.line.smoothing;
        }
      }

}

function validateData(id){
 // var regex=/^[0-9]{1,2}([,.][0-9]{1,2})?$/;
 var string= document.getElementById("dataInput"+id).value;
 var flag=false;
 //console.log("the input string is "+string);
 var string=string.split(';');
 for(var i=0;i<string.length;i++){
    var pairs=string[i].split(',');
    console.log(" split" + pairs);

    if (!isNaN(pairs[0]) && !isNaN(pairs[1]) && pairs.length == 2)  {
      flag=true;
    }else
    flag=false;

 }
 if(flag)
document.getElementById("dataInputValidation"+id).className = "form-group has-success input-group input-group-lg";
else
document.getElementById("dataInputValidation"+id).className = "form-group has-error input-group input-group-lg";
 console.log(flag);
}

function validateBubbleData(id){
 // var regex=/^[0-9]{1,2}([,.][0-9]{1,2})?$/;
 var string= document.getElementById("dataInput"+id).value;
 var flag=false;
 //console.log("the input string is "+string);
 var string=string.split(';');
 for(var i=0;i<string.length;i++){
    var pairs=string[i].split(',');
    console.log(" split" + pairs);

    if (!isNaN(pairs[0]) && !isNaN(pairs[1]) && !isNaN(pairs[2]) && pairs.length == 3)  {
      flag=true;
    }else
    flag=false;

 }
 if(flag)
document.getElementById("dataInputValidation"+id).className = "form-group has-success input-group input-group-lg";
else
document.getElementById("dataInputValidation"+id).className = "form-group has-error input-group input-group-lg";
 console.log(flag);
}

function slope(first,second,X,fn){
  var scope = {
          x:1
        }

        scope.x=X[first];
        var first1=math.eval(fn,scope);
        scope.x=X[second];
        var second1=math.eval(fn,scope) ;
         var derv= (first1-second1) / (X[first]-X[second]);

 if(derv== Infinity){
        derv=9999999;
      }
       if(derv== -Infinity){
        derv=-9999999;
      }

 return derv;
}

function continousFunction(id){
  var fn=document.getElementById("dataInput"+id).value;
  var range=document.getElementById("dataRange"+id).value;
 

//  var derivative=math.derivative(fn, 'x').toString();
 //manual derivative -> (y2-y1)/(x2-x1)


  var defaultPoint= 200;// min 200 points as default
  var points=200;
  if(document.getElementById('manualCheck'+id).checked) { //if manual checked is on thn take the sample points
    points=document.getElementById("dataPoints"+id).value; //get num of sample points.
    }else{
    points=200;
    }

  
  if(defaultPoint>=points){
    points=defaultPoint;
  }
  if(points > 1000){ //upperbund
    points=999;
  }
  var Range1=range.split(',');
  var min=parseInt(Range1[0]);//get minimum range.
  var max=parseInt(Range1[1]);// get max range
  //console.log("Max"+max);
  var mod=(max-min)/points; 
   // console.log("Mod"+mod);
  var pts =(max-min)/mod;//no . of points
   // console.log("points"+pts);
    var x=min;
    var X=[];
   
    
    for ( var i=0;i<pts;i++){
      X.push(parseFloat(x.toFixed(2))); //add sample points.
      x=x+mod;
    } // add points to X array

    //Now calculate derivative points.
    var flag=0;
   // var range1=0;
   // var range2=0;
   
    var stop=false;
   

    var scope = {
          x:1
        }

  //stoping condition and upperbound on Number of points        
    while(stop!=true && X.length <= 1000){ 
    stop=true;
     var list=[];
    var obj={};
    var freq=0;
    var sign="-1";
     var range1=0;
    var range2=0;
  //  console.log("stop"+stop);
    console.log("X ->"+X.length);


    for(var i=0;i<X.length;i++){
    
      //var username1 = prompt("What is your name?");
     // scope.x=X[i];
     if(i< (X.length-1)){
      var derv=slope(i+1,i,X,fn);
    
        
      }else{
        var derv=slope(i,i-1,X,fn);
        
      }

     

     // var derv=math.eval(derivative,scope);//derivative value
        /*
       if(derv>15)
          console.log("derivative"+ derv+ "nd point "+ X[i]);
        if(derv< -15)
          console.log("derivative"+ derv+ "nd point "+ X[i]);
        */
    
        if(sign=="-1"){//starting first time.
          if(derv<0){
            sign="-";//assign the signs
            range1=i; //slect first point of the range1
          }else{
            sign="+";
            range1=i;
          }

        }else{//continous
            var temp="";
            if(derv<0){//choosing the symbol
            temp="-";
          }else{
            temp="+";
          }
          if(temp==sign){ //if sign are same, increment
            freq++;
             if( i == (X.length-1)){ //if it is last point of X array
            //if sign are same thn add new object.
            range2=i;
              obj["range1"]=range1;//it is index
              obj["range2"]=range2;//it is index
              obj["sign"]=sign;
              obj["freq"]=freq;
              list.push(obj);
             // console.log("last- element");

          }

          } else{//store the object in list.
            range2=i-1;
              obj["range1"]=range1;//it is index
              obj["range2"]=range2;//it is index
              obj["sign"]=sign;
              obj["freq"]=freq;
              list.push(obj);
              //Now reset all the value.
             range1=i-1;
              freq=0;
              obj={};
              if(derv<0){//choosing the symbol
            sign="-";
          }else{
            sign="+";
          }
          }

        }

    }//for loop end list created

    //Now check for inconsistency.
    console.log("list length1"  + list.length);
    for(var i=0;i<list.length;i++){
      if(list[i].freq<5){
        //add some more points.
       // console.log("Adding some more points")
        stop=false;
        //addPoints(range1,range2);
              var min=X[list[i].range1];
              var max=X[list[i].range2];
              if(max==min && max!=0){//adding psuedo points if max == min. thn no n
                min=X[list[i].range1 -1] ;
              }
              if(max==min && max==0){
                min=X[list[i].range1 +1] ;
              }
              //console.log("Max"+max+"Min" + min);
             var mod=(max-min)/10; //add 10 points

            //console.log("Mod"+mod);
              var pts =(max-min)/mod;//no . of points
             // console.log("points*added"+pts);
              var xx=min+mod;
              for ( var k=0;k<pts;k++){
                //  xx=parseFloat(xx.toFixed(2));
                  X.push(parseFloat(xx.toFixed(2))); //add sample points.
                  xx=xx+mod;
                      }

              //add point ends
      }
    } // check for inconsistency end

   //filter out duplicates from array.
/*var X = X.filter(function(elem, index, self) {
    return index == self.indexOf(elem);
});
*/

  }//while stops here

  // check slope difference, if there is high jump , add more points.
  for(var i=1;i<X.length-2;i++){

//finding slope of slope. -> slope2-slope1/ 2 -1 
  var slopeDerv=(slope(i+2,i+1,X,fn) - slope(i+1,i,X,fn));


    if(Math.abs(slopeDerv)> 1000000 ){//add more points.
      //will add uniform points between  i-2,i+3
   // console.log("difff"+slopeDerv+" nd points are "+X[i]+","+X[i+1]);
            if((i-2)>=0 && (i+3)<X.length){
                 var min=X[i-2];
              var max=X[i+3];
            }else{
               var min=X[i];
              var max=X[i]+1;
            }
           
              //console.log("Max"+max+"Min" + min);
             var mod=(max-min)/10; //add 10 points

            //console.log("Mod"+mod);
              var pts =(max-min)/mod;//no . of points
             console.log("points*added"+pts);
              var xx=min+mod;
              for ( var k=0;k<pts;k++){
                  X.push(parseFloat(xx.toFixed(2))); //add sample points.
                  xx=xx+mod;
                      }

    }
  
  }

  //unitl now.............
   //Sort the X array again.
    X.sort(function(a, b){return a-b});

  console.log("X-length == >"+X.length)
var result1=calculateY(X,id);
  return result1;  
}

function calculateY(x,idd){
var fn=document.getElementById("dataInput"+idd).value;
var result={};
 var Y=[];
 var X=x;

  for ( var i=0;i<X.length;i++){
         //push X into array.
        var scope = {
          x:1
        }
        scope.x=X[i];

        var y=math.eval(fn,scope);
        Y.push(y);
//console.log(X[i]+","+y);

    
    }

    result["X"]=X;
    result["Y"]=Y;

    return result;
}
/*

<div id="cp2" class="input-group colorpicker-component">\
    <input type="text" value="#00AABB" class="form-control"  />\
    <span class="input-group-addon"><i></i></span>\
</div>\
<div class="row">\
  <div class="input-group input-group-lg">\
  <span class="input-group-addon" id="sizing-addon1"> Width :</span>\
 <input type="text" value=" " class="slider form-control" data-slider-min="0" data-slider-max="200" data-slider-step="5" data-slider-value="50" data-slider-orientation="horizontal" data-slider-selection="before" data-slider-tooltip="show" data-slider-id="blue">\
</div>\
  </div>\ 

*/


//don't delete this comment.
/*
 var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
var dlAnchorElem = document.getElementById('downloadAnchorElem');
dlAnchorElem.setAttribute("href",     dataStr     );
dlAnchorElem.setAttribute("download", "scene.json");
dlAnchorElem.click();

var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout()));
var dlAnchorElem = document.getElementById('adownloadAnchorElem');
dlAnchorElem.setAttribute("href",     dataStr     );
dlAnchorElem.setAttribute("download", "layout.json");
dlAnchorElem.click();
*/

// to do -> warning msg.
