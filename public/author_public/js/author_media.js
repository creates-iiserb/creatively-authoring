/////////////////////////////////------------------------------- image upload ----------------------------------------////////////////////////////////////

 // ----------------------------------------to delete image ----------------------------------------
 $(function(){ 
	$("#img_delete").click(function(event){
		var metaid= document.getElementById('metaid').value;
		var revno= document.getElementById('revno').value;
		event.preventDefault();
		swal({
				title: 'Are you sure?',
				text: "The image will be deleted permanently",
				type: 'warning',
				showCancelButton: true,
				confirmButtonClass: 'btn btn-success btn-fill',
				cancelButtonClass: 'btn btn-danger btn-fill',
				confirmButtonText: 'Yes, delete it!',
				buttonsStyling: false,
				allowOutsideClick: false
		}).then(function() {
				// console.log('orgid='+orgid+' and pie = '+pipe);
				window.location.href='/author_removeImage?metaid='+metaid+'&rev='+revno;
		}).catch(function(){
				console.log("Aborted clone req");
		});
	});
});

// ----------------------------------------to ckeck upload size and img formate (FOR FILE UPLOAD VALIDATION )----------------------------------------
var allowedExtensions = {
'.jpg' : 1,
'.JPG' : 1,
'.jpeg' : 1,
'.JPEG' : 1,
'.png' : 1,
'.PNG' : 1,
'.svg' : 1,
'.gif' : 1,
'.bmp' : 1
};
		
function checkExtension(filename)
{
	
	var match = /\..+$/;
	var ext = filename.match(match);
	if (allowedExtensions[ext])
	{
		var size = document.getElementById('filename').files[0].size;
		if(size <= 614400){ // 100kb= 102400 bytes; 500kb=512000 bytes, 600kb=614400 bytes
			return true;
		}
		else{
			swal(
			'Error...',
			'Only upto 500 kb file can be uploaded !!',
			'error'
		);
			document.getElementById("filename").value="";
		}
	}
	else
	{
		swal(
			'Error...',
			'Invalid File Extension, file must be in image format.',
			'error'
		);
		//will clear the file input box.
		//location.reload();
		document.getElementById("filename").value="";
		return false;
	}
}

// ----------------------------------------minimum 3 tag required  ------------------------------------
function check_tag(){
	var tags_ary  = new Array();
	var arr = document.getElementById('tags').value;
	tags_ary  = arr.split(",");
	var tags_ary_length = tags_ary.length;
	if(tags_ary_length<3){
		swal(
			'Error...',
			'Minimum 3 tags required !!',
			'error'
			);
		return false;
	}
}

// ----------------------------------------to generate base64 and ctype ------------------------------------
var handleFileSelect = function(evt) {
	var files = evt.target.files;
	var file = files[0];
	if (files && file) {
		var reader = new FileReader();
		reader.onload = function(readerEvt) {
			var binaryString = readerEvt.target.result;
			document.getElementById("base64textarea").value = btoa(binaryString);
			//  console.log("base64textarea----"+btoa(binaryString));
		};
		reader.readAsBinaryString(file);
	}
};
if (window.File && window.FileReader && window.FileList && window.Blob) {
	// document.getElementById('filename').addEventListener('change', handleFileSelect, false);
	var fileUp = document.getElementById('filename');
	if(fileUp){
		fileUp.addEventListener('change', handleFileSelect, false);
	}
	
} else {
	// alert('The File APIs are not fully supported in this browser.');
	swal(
			'Error...',
			'The File APIs are not fully supported in this browser. !!',
			'error'
			);
}

$('#filename').on("change", function() {
	var files = $("#filename")[0].files[0];
	var temp = "";
	temp += "<br>Filename: " + files.name;
	temp += "<br>Type: " + files.type;
	temp += "<br>Size: " + files.size + " bytes";
	document.getElementById("ctype").value =files.type;
	// console.log("ctype----"+files.type);
	// $('#out').html(temp);
});


//----------------------------------------------- alert on successfully update-----------------------------------------------
$(document).ready(function() {
		if (window.location.search.indexOf('body=true') > -1) {
				$.notify({
					icon: "",
					message: "<b> Success - </b> Media Updated Successfully !!!"
				},{
					type: "success",
					timer: 4000,
					placement: {
							from: 'top',
							align: 'center'
					}
				});
		} else  if(window.location.search.indexOf('msg=dberror') > -1) {
			$.notify({
				icon: "",
				message: "<b> Error - </b>Some error occured. Please contact administrator !!!"
			},{
				type: "danger",
				timer: 4000,
				placement: {
						from: 'top',
						align: 'center'
				}
			});
		}else if(window.location.search.indexOf('msg=tagerror') > -1) {
			$.notify({
				icon: "",
				message: "<b> Warning - </b>Minimum 3 tags required !!!"
			},{
				type: "warning",
				timer: 4000,
				placement: {
						from: 'top',
						align: 'center'
				}
			});
		}else{

		}
});

/////////////////////////////////------------------------------- yt video upload ----------------------------------------////////////////////////////////////

 // ----------------------------------------to delete video ----------------------------------------


 // ----------------------------------------to display/play video ----------------------------------------
function display(){
		var id=document.getElementById("vid").value;
		var src="https://www.youtube.com/embed/"+id+"?autoplay=1&rel=0&iv_load_policy=3&showinfo=0&modestbranding=1";
		document.getElementById("ytplayer").src=src;
		document.getElementById("ytdisplay").style.display = "block";
}

/////////////////////////////////------------------------------- adv chart upload ----------------------------------------////////////////////////////////////
// ----------------------------------------validationCheck(for adv chart)----------------------------------------
function validationCheck(){
		var plotdata= plotdata_adv.getValue();
		var layout= layout_adv.getValue();

		if(plotdata == "" || layout == "" ) {
		// alert('Please fill all required field'); 
		swal(
			'Error...',
			'Please fill all required field !!',
			'error'
			); 
		document.getElementById('plot-data').focus();
		document.getElementById('layout').focus();
		return false;
		}

		var tags_ary  = new Array();
		var arr = document.getElementById('tags1').value;
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
}

/////////////////////////////////------------------------------- plot chart upload ----------------------------------------////////////////////////////////////
// ----------------------------------------validationCheck(for adv chart)----------------------------------------
function validationCheckplot(){
	var tags_ary  = new Array();
	var arr = document.getElementById('tags1').value;
	tags_ary  = arr.split(",");
	var tags_ary_length = tags_ary.length;
	if(tags_ary_length<3){
		swal(
		'Error...',
		'Minimum 3 tags required !!',
		'error'
		);
		return false;
	}
}


/////////////////////////////////------------------------------- pdf document upload ----------------------------------------////////////////////////////////////
// ----------------------------------------to ckeck upload size and pdf formate (FOR FILE UPLOAD VALIDATION )----------------------------------------


// ----------------------------------------to generate base64 and ctype ------------------------------------