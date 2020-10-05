// ----------------------------------------to add new playlist(playlist dash) ----------------------------------------
 $(document).ready(function() {
    if (window.location.search.indexOf('msg=error_msg') > -1) {
        $('#error_db').slideUp();
      $('#error_db').slideDown();
      function success_1(){
        $('#error_db').slideUp();
      }
      setTimeout(success_1, 5000);
    } else {
        // alert('track not here');
    }
});

 $(document).ready(function() {
    if (window.location.search.indexOf('msg=check_msg') > -1) {
        $('#pl_nameexits').slideUp();
      $('#pl_nameexits').slideDown();
      function success_2(){
        $('#pl_nameexits').slideUp();
      }
      setTimeout(success_2, 5000);
    } else {
        // alert('track not here');
    }
});
$(document).ready(function() {
    if (window.location.search.indexOf('msg=unauth') > -1) {
         $.notify({
            icon: "",
            message: "<b> Error - </b>You are not authorized to remove item from Playlist.!!!"
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

$(document).ready(function() {
    if (window.location.search.indexOf('msg=nameBlank') > -1) {
        $('#pl_nameblank').slideUp();
      $('#pl_nameblank').slideDown();
      function success_2(){
        $('#pl_nameblank').slideUp();
      }
      setTimeout(success_2, 5000);
    } else {
        // alert('track not here');
    }
});

$(document).ready(function() {
    if (window.location.search.indexOf('msg=itemAdded') > -1) {
        $('#pl_itemAdded').slideUp();
      $('#pl_itemAdded').slideDown();
      function success_2(){
        $('#pl_itemAdded').slideUp();
      }
      setTimeout(success_2, 5000);
    } else {
        // alert('track not here');
    }
});

 // ----------------------------------------to delete playlist ----------------------------------------
$(function(){ 
 	$("#playlist_delete").click(function(event){
	 	var short= document.getElementById('short').value;
	 	var id= document.getElementById('id').value;
	 	var rev= document.getElementById('rev').value;

		event.preventDefault();
		swal({
		    title: 'Are you sure?',
		    text: "The Playlist will be deleted permanently",
		    type: 'warning',
		    showCancelButton: true,
		    confirmButtonClass: 'btn btn-success btn-fill',
		    cancelButtonClass: 'btn btn-danger btn-fill',
		    confirmButtonText: 'Yes, delete it!',
		    buttonsStyling: false,
        allowOutsideClick: false
		}).then(function() {
		    // console.log('orgid='+orgid+' and pie = '+pipe);
		    // window.location.href='/author_removePlaylist';
		    $.ajax({
                type: "POST",
                data: {
                    'short': short,
                    'id': id,
                    'rev': rev
                },
                url: '/author_removePlaylist',
                success: function (data) {
	                swal({
	                    type: 'success',
	                    title: 'Playlist Deleted!'
	                }).then(function () {
	                    window.location.href='/author_playlist_dash';
	                });
                },
                error: function (data) {
                    swal("Cancelled", "Error: Please Contact Administrator ", " error ");
                }
            });
		}).catch(function(){
		    console.log("Aborted clone req");
		});
	});
});

 // ----------------------------------------to change playlist name ----------------------------------------
// $(document).ready(function(){
// 	$('#playlist_name').keypress(function (e) {
// 		var regex = new RegExp("^[a-zA-Z0-9@_.]+$");
//         // var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
//         var str = $('#playlist_name').val();
// 		if (regex.test(str)) {
// 		  return true;
// 		}
// 		e.preventDefault();
// 		return false;
// 	});
// });

// $(document).ready(function(){
// 	$('#playlist_name').on('keyup', function() {
// 	      var textbox3 = document.getElementById("playlist_name").value;
// 	      if(textbox3 != ""){
// 	        document.getElementById("update_name").disabled=false; //remove disabled attribute from button
// 	      }
// 	      else if(textbox3 == ""){
// 	        document.getElementById("update_name").disabled=true; //remove disabled attribute from button
// 	      }
// 	});
// });




    $(document).ready(function(){
    	$('#update_name').on('click', function() {
            var str = $('#playlist_name').val();
    	      if(str != ""){
    	      }
    	      else {
    	        swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Field cannot be empty !!'
                });
    	      }
    	});
    });

 // ----------------------------------------to show error/success notify ----------------------------------------
 $(document).ready(function() {
    if (window.location.search.indexOf('body=true') > -1) {
        $.notify({
          icon: "",
          message: "<b> Success - </b> Playlist Updated Successfully !!!"
        },{
          type: "success",
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

 $(document).ready(function() {
    if (window.location.search.indexOf('msg=nameerror') > -1) {
       $.notify({
          icon: "",
          message: "<b> Error - </b> Playlist name already exit. Please choose another name for playlist !!!"
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

// make json of section table
let orderPlaylist = (idString,secName,dataCont)=>{
    var Contentarry =[];
    var SecJson ={};
    let pl =JSON.parse(dataCont);
    // let arrString = idString.split(",");
    let arrString = idString;
    console.log(idString)
    if(arrString.length >0){
        arrString.forEach((item1,nindex)=>{
            let findfn = (itm)=>{ return itm.item==item1};
            let cindex = pl.findIndex(findfn);
            if(cindex > -1){
                // let tmp1 = pl[cindex];
                // pl[cindex] =  pl[nindex];
                // pl[nindex] = tmp1;
                console.log(cindex);
                Contentarry.push(pl[cindex]);
            }
            else{
                console.log("id not found");
            }
        })
        // document.getElementById('takers_data').value = JSON.stringify(pl);
        // console.log(Contentarry);
        SecJson["secName"]=secName;
        SecJson["content"]=Contentarry;
        console.log("1--"+JSON.stringify(SecJson))
        return SecJson;
        
    }else{
        SecJson["secName"]=secName;
        SecJson["content"]=[];
        console.log("2--"+JSON.stringify(SecJson))
        return SecJson;
    }
}

 // ----------------------------------------to arrange items json ----------------------------------------
 $(document).ready(function() {
    $("#arrange_ids").click(function(e) {
// ---------------old method--------------------------

   /* var res ="";
    var arr_length = document.getElementById('length').value;
    // for(var j=1; j<= rowCount; j++){
    for(var j=0,i=1; j< arr_length; j++,i++){
      items = document.getElementById('itm'+i).value;
      weight = document.getElementById('weight'+i).value;
      // prop = document.getElementById('itemProp'+i).value;
    //   var itemProp;
	   //  $("input[name=itemProp"+i+"]:checked").each(function() {
	   //      var value = $(this).val();  
	   //      itemProp = value;
	   //  });
	   // prop = itemProp;
      res += "{\"item\":"+JSON.stringify(items)+",\"weight\":"+weight+"},"
       // res += "{\"item\":"+JSON.stringify(items)+",\"weight\":"+weight+",\"property\":"+JSON.stringify(prop)+"},"
    }
    console.log("old list-----"+"["+res.slice(0, -1)+"]");
    document.getElementById('takers_data').value = "["+res.slice(0, -1)+"]"*/;

// ---------------new method--------------------------

    // IdList = document.getElementById('IdList').value;
    // console.log("IdList--"+IdList);

    // var list_ary  = new Array();
    // list_ary  = IdList.split(",");
    // console.log("IdList length--"+list_ary.length);

    // var itmRes ="";
    // for(var k=0;k<list_ary.length;k++){
    //   itmRes+= "{\"item\":"+JSON.stringify(list_ary[k])+",\"weight\":5},"
    // }
    // console.log("newOrder---"+"["+itmRes.slice(0, -1)+"]");
    // document.getElementById('takers_data').value = "["+itmRes.slice(0, -1)+"]";


// -------------------latest method-------------

        // let IdList = document.getElementById('IdList').value;
       
        var unauthDataArr = document.getElementById('unauthDataArr').value;

        var secLength = document.getElementById('secLength').value;
        console.log(secLength);

    if(unauthDataArr!=''){
        e.preventDefault();
        $.notify({
            icon: "",
            message: "<b> Error - </b>Their are some unauthorized items in your playlist.  You are authorized to keep content that is authored by you or collaborator in playlist or if it is a public content."
          },{
            type: "danger",
            timer: 4000,
            placement: {
                from: 'top',
                align: 'center'
            }
          }); 
          
    }else{

        if(secLength==5){
            // let IdList  = $("#Section0").sortable("toArray");
            let IdList1 = $("#Section0").sortable("toArray");
            let IdList2 = $("#Section1").sortable("toArray");
            let IdList3 = $("#Section2").sortable("toArray");
            let IdList4 = $("#Section3").sortable("toArray");
            let IdList5 = $("#Section4").sortable("toArray");

            let dtcon = $("#dataContent").val();

            // console.log( $("#s1").text());
            
            // orderPlaylist(IdList);
            // var dt = orderPlaylist(IdList, "Unsectioned List",dtcon);
            var dt1 = orderPlaylist(IdList1, $("#s1").text(),dtcon);
            var dt2 = orderPlaylist(IdList2, $("#s2").text(),dtcon);
            var dt3 = orderPlaylist(IdList3, $("#s3").text(),dtcon);
            var dt4 = orderPlaylist(IdList4, $("#s4").text(),dtcon);
            var dt5 = orderPlaylist(IdList5, $("#s5").text(),dtcon);

            console.log(JSON.stringify(dt1));

            var finalJson = new Array();
            finalJson.push(dt1,dt2,dt3,dt4,dt5);
            console.log(JSON.stringify(finalJson));
            document.getElementById('takers_data').value = JSON.stringify(finalJson);
        }else{
            let IdList  = $("#Section0").sortable("toArray");
            let IdList1 = $("#Section1").sortable("toArray");
            let IdList2 = $("#Section2").sortable("toArray");
            let IdList3 = $("#Section3").sortable("toArray");
            let IdList4 = $("#Section4").sortable("toArray");
            let IdList5 = $("#Section5").sortable("toArray");

            let dtcon = $("#dataContent").val();

            // console.log( $("#s1").text());
            
            // orderPlaylist(IdList);
            var dt = orderPlaylist(IdList, "Unsectioned List",dtcon);
            var dt1 = orderPlaylist(IdList1, $("#s1").text(),dtcon);
            var dt2 = orderPlaylist(IdList2, $("#s2").text(),dtcon);
            var dt3 = orderPlaylist(IdList3, $("#s3").text(),dtcon);
            var dt4 = orderPlaylist(IdList4, $("#s4").text(),dtcon);
            var dt5 = orderPlaylist(IdList5, $("#s5").text(),dtcon);

            // console.log(JSON.stringify(dt1));

            var finalJson = new Array();
            finalJson.push(dt,dt1,dt2,dt3,dt4,dt5);
            console.log(JSON.stringify(finalJson));
            document.getElementById('takers_data').value = JSON.stringify(finalJson);
        }
        
    }

    });
});

// ----------------------------------------to swap items json ----------------------------------------
var toId=-1;
var fromId= -1;
var toVal= -1;
var fromVal=-1;


var wtoId=-1;
var wfromId= -1;
var wtoVal= -1;
var wfromVal=-1;

var flag= false;

function swap(id,weight){
  if(flag){
    //swap values if flag = true 3/1/3-j/4/6
    fromId = id; //4
    fromVal = document.getElementById(id).innerHTML; //0000j
    document.getElementById(toId).innerHTML = fromVal;//0000j
    document.getElementById(fromId).innerHTML = toVal;//00003
    document.getElementById('dragbox'+id).className = "col-lg-2 col-sm-4 quizbox primary-box"; // it will remove selected class col-lg-2 col-sm-4 quizbox primary-box

    wfromId = weight; //4
    wfromVal = document.getElementById(weight).value; //6

   
    document.getElementById(wtoId).value = wfromVal; //6
    document.getElementById(wfromId).value = wtoVal; //3
    // document.getElementById(wtoId).className = ""; // it will remove selected class

    // reset data to initial value
    toId=-1;
    fromId= -1;
    toVal= -1;
    fromVal=-1;

    wtoId=-1;
    wfromId= -1;
    wtoVal= -1;
    wfromVal=-1;

    flag = false;
    show_swap();
  }
  else if(!flag){
    //if not true(i.e. first click)-- set flag true, add class selected to <td>
    toId = id;
    document.getElementById('dragbox'+id).className = "col-lg-2 col-sm-4 quizbox primary-box";//col-lg-2 col-sm-4 selected
    toVal = document.getElementById(id).innerHTML;

    wtoId = weight;
    // document.getElementById(wtoId).className = "selected";
    wtoVal = document.getElementById(weight).value;

    flag = true;

  }
} 

function show_swap(){
  var temp   = [];
  var length = document.getElementById('length').value;
   // alert(length);
  for (var k = 1; k <= length ; k++) {
    temp.push(document.getElementById(k).innerHTML);
  }
  document.getElementById('ques_ids2').value= temp;
  document.getElementById('arrange_ids').disabled = false;
}


// -------------------------------------- show/hide weight from cart  --------------------------------
$('#weightChk').change(function(){
	// $("#weightdiv").prop("disabled", !$(this).is(':checked'));
	if($(this).is(":checked")){
        $('[id^="weightdiv"]').css('display', 'block'); 
    }else{
        $('[id^="weightdiv"]').css('display', 'none'); 
    }
});

// ----------------------------------------to add sections  ----------------------------------------
var counter = 1; 
//add a new parameter
    $("body").on('click','#add_section',function(){
        //allParams is the div that holds all the parameter divs
       var maxVal =5;
        var currVal = $("#allcart > [id^='dragSec']").length;
        if(currVal < maxVal){
             $("#allcart").prepend(newSect(counter));
			counter++;
        }else{
            swal("Only "+maxVal+" sections are allowed !");
        }

   //          $("#allcart").prepend(newSect(counter));
			// counter++;
        // $("#allParams").append(newParam(counter));
        // counter++;
    });

// to add new parameter
function newSect(idNo){
    // var newTemplate = "<div class='col-lg -12 ' id='paramdiv_new-"+idNo+"' ><div class='card inputcard1' ><div class='card-content'><h6>Name</h6><div><input type='text' name='param_name_new-"+idNo+"' class='form-control' id='param_name_new-"+idNo+"'></div><br><h6>Value</h6><textarea  name='param_value_new' rows=6 class='form-control' id='param_value_new-"+idNo+"'></textarea></div><div class='card-footer'><hr><div class='footer-title'><span class='text-muted'>&nbsp;</span></div> <div class='pull-right'><button type='button' rel='tooltip' title='' class='btn btn-danger btn-lg' data-original-title='Delete' id='deleteParam'><i class='ti-trash'></i></button></div> </div></div> </div>";
    
// var newTemplate = "<ul id='sortable"+idNo+"' class='connectedSortable'></ul>";
    var newTemplate = "<div class='col-lg-2 col-sm-4 quizboxSec danger-box' id='dragSec"+idNo+"'>\
  <div class='card-footer'>\
    <div class='footer-title'>\
    <a class='btn btn-info  btn-icon btn-sm' onclick=\"swap('"+idNo+"','weight"+idNo+"')\"><i class='ti-move'></i></a>\
    </div>\
    <div class='pull-right'>\
    <a class='btn btn-danger btn-icon btn-sm' id='delSec'><i class='ti-close'></i></a>\
    </div>\
  </div>\
  <hr class='small'>\
  <div class='text-center'>\
  <h4 class='text-center text-danger'  id='sec"+idNo+"' >Section "+idNo+"</h4>\
    <label style='font-size:17px'>Title:</label>\
    <b style='font-size:17px'>Title</b>\
    <input type='hidden' name='secdata' id='secdata''value=''>\
  </div>\
  <hr>\
  <div class='card-footer'>\
  <div class='footer-title'>Set Properties</div>\
  <div class='pull-right'>\
  <button type='button' class='btn btn-success btn-icon btn-sm' data-toggle='modal' data-target='#addSecProp'><i class='ti-settings'></i></button>\
</div>\
</div>\
</div>";

    return newTemplate;
} 

// to delelte existing parameter 
   /* $("body").on("click", "#delSec", function () {
        $(this).closest("[id^='dragSec']").remove();
    });*/
//---------------------------------------- section property JSON ----------------------------------------
    // fdata["question"] = question.getValue();
	$("body").on('click',"#addNewSection",function () { 

      var randID = function(){
        var text = "";
        var length = 3;
         var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
         for(var i = 0; i < length; i++) {
             text += possible.charAt(Math.floor(Math.random() * possible.length));
         }
        var randomId = text;
        return randomId;
      }
      var randomId = randID();

      var newSecData = {};
      newSecData["item"]="S"+randomId;
      newSecData["title"]=document.getElementById("sec_title").value;
	    newSecData["instruction"]=document.getElementById("sec_inst").value;
	    newSecData["choose"] = parseInt(document.getElementById("sec_queNo").value); 
	    newSecData["arrangement"] = $("#sec_order option:selected" ).val();
	    var jsonStringCorSc="";
            jsonObjCorSc = [];
            $("input[id=correctsc]").each(function() {
                var value = $(this).val();
                jsonObjCorSc.push(value);
            });
            jsonObjInCorSc = [];
            $("input[id=incorrectsc]").each(function() {
                var value = $(this).val();
                jsonObjInCorSc.push(value);
            });

            jsonObjSkCorSc = [];
            $("input[id=skipsc]").each(function() {
                var value = $(this).val();
                jsonObjSkCorSc.push(value);
            });
            jsonStringCorSc +="[ ["+ jsonObjCorSc+"],["+jsonObjSkCorSc+"],["+jsonObjInCorSc + "]]";
            newSecData["gradingMatrix"] =  JSON.parse(jsonStringCorSc);

            // console.log("Section Json---"+JSON.stringify(newSecData) );
            document.getElementById("secdata").value = JSON.stringify(newSecData) ; // add in sec data hidden field  generated dynamically

            if(document.getElementById("quesSecData").value != ""){
               var resData = new Array();
              // console.log("quesSecData old-----"+document.getElementById("quesSecData").value);
              var old_secData = JSON.parse(document.getElementById("quesSecData").value);
              resData.push(old_secData);

              var new_secData = newSecData;
              resData.push(new_secData);
            //  console.log("resData-----"+JSON.stringify(resData));
             
              //concat 2 json
            }else{
            //   console.log("quesSecData new-----"+JSON.stringify(newSecData));
              document.getElementById("quesSecData").value = JSON.stringify(newSecData) ;
            }
       		
          // document.getElementById("quesSecData").value = JSON.stringify(newSecData) ;
    });


// -------------------------------------- show/hide sectional playlist  --------------------------------
$('#SecPlaylist').change(function(){
  // $("#weightdiv").prop("disabled", !$(this).is(':checked'));
  if($(this).is(":checked")){
        $('[id="secListDiv"]').css('display', 'block'); 
        $('[id=allcart]').css('display', 'none'); 
    }else{
        $('[id="secListDiv"],[id=allcart]').css('display', 'none'); 
        $('[id=allcart]').css('display', 'block'); 
    }
});

// -------------------------------------- ajax for collaborators --------------------------------

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

 //validation for email
 function validate2() {
    $("#result").text("");
    var email = $("#collbName").val();
    if (validateEmail(email)) {
       //check the email register in our db or nor
        $.post("/author_check_allowed_email",{"email":email}, function(data)
           {
              if(data == "email allowed"){
                    $('#alert2').remove();
                    $( "#result2" ).append("<label class='control-label text-success' id='alert2' for='inputSuccess' style='float:right;'><i class='fa fa-check'></i>ok</label>");
                    $("#addCollbBtn").prop('disabled', false);
                } 
                else if(data == "email_not_allow"){
                    $('#alert2').remove();
                    $("#addCollbBtn").prop('disabled', true);
                    $( "#result2" ).append("<label class='control-label text-danger' id='alert2' for='inputSuccess' style='float:right;'><i class='fa fa-ban'></i>Email not found</label>");
                }else if(data == "email_not_active"){
                    $('#alert2').remove();
                    $("#addCollbBtn").prop('disabled', true);
                    $( "#result2" ).append("<label class='control-label text-danger' id='alert2' for='inputSuccess' style='float:right;'><i class='fa fa-ban'></i>Inactive account</label>");
                }else{
                    $('#alert2').remove();
                    $("#addCollbBtn").prop('disabled', true);
                }
          });
    } else {
        $('#alert2').remove();
        $( "#result2" ).append("<label class='control-label text-danger' id='alert2' for='inputSuccess' style='float:right;'><i class='fa fa-ban'></i> Invaild Email Id</label>");
        // $("#name").slideUp( "slow" );
        $("#addCollbBtn").prop('disabled', true);
    }
    return false;
  }

$(function () {
    // to add a concept
    $("#addCollbBtn").on('click', function () {
        var author = document.getElementById('author').value;
        var id = document.getElementById('token').value;
        var collbName = document.getElementById('collbName').value;
        console.log(collbName);
        $.ajax({
            type: "POST",
            data: {
                'author': author,
                'token': id,
                'collbName': collbName
            },
            url: '/author_addCollab',
            success: function (data) {
                if (data.status == "success") {
                    swal({
                        type: 'success',
                        title: 'Collaborator Added!'
                    }).then(function () {
                        location.reload();
                    });
                } else {
                    // swal("Cancelled", "Error:"+data.msg, " error ");
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: data.msg
                    });
                }
            },
            error: function (data) {
                // swal("Cancelled", "Error: Please Contact Administrator ", " error ");
                swal({
                    type: 'error',
                    title: 'Cancelled',
                    html: 'Error: Please Contact Administrator '
                });
            }
        });
    });
});

// to delete a collab from playlist
$("body").on("click", "#delCollb", function () {
    var playlistId = document.getElementById('playlistId').value;
    var author = document.getElementById('author').value;
    var val = $(this).val();
    swal({
        title: 'Are you sure?',
        text: "Collaborator will permenently delete from playlist!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes, delete it!',
        buttonsStyling: false,
        allowOutsideClick: false
    }).then(function () {
        $.ajax({
            type: "POST",
            data: {
                'playlistId': playlistId,
                'author': author,
                'collab': val
            },
            url: '/author_delete_collab',
            success: function (data) {
                if (data.status == "success") {
                    swal({
                        type: 'success',
                        title: 'Collaborator Deleted!'
                    }).then(function () {
                        location.reload();
                    });
                } else {
                    // swal("Cancelled", "Error:"+data.msg, " error ");
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: data.msg
                    });
                }
            },
            error: function (data) {
                swal({
                    type: 'error',
                    title: 'Cancelled',
                    html: 'Error: Please Contact Administrator '
                });
            }
        });

    }).catch(function () {
        console.log("Aborted delete req");
    });
});



/// to check weather all the questions in playlist is from authorized user  and public
//  $(document).ready(function(){  

//     var quesArry = $("quesArry").val();
//     console.log(quesArry);
//     console.log($("playlist_name").val());

//     // var user_data2 = new Object;
//     // user_data2.name = playlistName;

//     // $.post("/author_getSectionsList", user_data2, function (data) {
//     //     if (data.status == 'success') {
//     //         $("#section_name").html("<option value=''> Select </option>");
//     //         $('#section_name').show();
//     //         // console.log(data.sectionName);
//     //         console.log(data.sectionCon);
//     //         $("#sectionCon").val(JSON.stringify(data.sectionCon));
//     //         var secQuesLen = new Array();
//     //         for(var i=0;i<data.sectionName.length;i++){
//     //             $('#section_name').append('<option value="'+data.sectionName[i]+'">'+data.sectionName[i]+'</option>');
//     //         }
//     //     }
//     //     else if (data.status == 'error') {
//     //         $('#section_name').hide();
//     //         swal({
//     //             type: 'error',
//     //             title: 'Error',
//     //             html: data.msg
//     //         });
//     //     }
//     // });
//  })



 // delete question confirmation 
 $("#clearAllFromPlaylist").click(function () {
    //onclick="" class="btn btn-outline  pull-left"
    var author = document.getElementById('author').value;
    var playlistId = document.getElementById('playlist_Id').value;
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes, remove it!',
        buttonsStyling: false,
        allowOutsideClick: false
    }).then(function () {
        // $('form#authfrm2').submit();
        $.ajax({
            type: 'post',
            data: {
                'author': author,
                'playlistId':playlistId
            },
            url: '/author_emptyPlaylist', 
            cache: false,
            success: function (data) {
                if (data.status == "success") {
                    swal({
                        type: 'success',
                        title: 'Item Removed!',
                        html: data.msg
                    }).then(function () {
                        window.location.href='/author_getPlaylistData?id='+playlistId;
                    });
                } else {
                    // swal("Cancelled", "Error:"+data.msg, " error ");
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: data.msg
                    });
                }
            },
            error: function () {
                swal("Cancelled", "Error: Please Contact Administrator ", " error ");
            }
        });

    }).catch(function () {
        console.log("Aborted delete req");
    });
});