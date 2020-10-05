function navbarToggle(){
    $("ul.navbar-nav").toggle(300);
  }
  $(document).ready(function(){

    if($('.regClsFrm').length>0){

      $.validator.addMethod("socialEmail", function(value) {
        let domains = ['gmail.com','yahoo.com','hotmail.com','aol.com','hotmail.co.uk'];
        let arr = value.split('@');

        if($(".info_error").length>0 ){
          $(".info_error").remove();
          console.log("remove")
        }
     
        if(domains.indexOf(arr[1]) > -1){
          let html = `<label id="email-error" class="text-warning info_error"  for="email">Use email id provided by your institution. Your account is likely to get rejected if you use non-institutional email address.</label>`;
          $( "#email" ).after( html );
        }
        return true;
   });
  
  

      $(".regClsFrm").validate({
      rules: {
        name: {
         required: true
        },
        affiliation:{
         required : true
        },
        email:{
          required : true,
          email : true,
          remote:{
          url: "/authorcheckEmailID",
          type: "post"
          // dataFilter: function(data) {
          //     console.log(data);
          //     // var json = JSON.parse(data);
          //     // if(json.status === "success") {
          //     //     return '"true"';
          //     // }
          //     return "\"" + "message" + "\"";

          // }                
          },
          socialEmail : true
        },
        dept:{
         required : true
        },
        howToKnow:{
         required : true
        },
        coursesYouTeach:{
         required : true
        },
        personalPage:{
         required:true,
         url:true
        }

      },
      messages: {
        email:{
         remote:"This email id already exists"
        },
        personalPage:{
          url:"Please enter valid url with http or https."
        }
      },
      submitHandler: function(form){
       form.submit();
      }
      });
    }

    $(".regClsFrm #email").keyup(function(){
        let value = $("#email").val();
        if(value==''){
          if($(".info_error").length>0 ){
            $(".info_error").remove();
            console.log("remove")
          }
        }

        
    });

    if($('.signClsFrm').length>0){

        // $.validator.addMethod("checklower", function(value) {
        //   return /[a-z]/.test(value);
        // });
        // $.validator.addMethod("checkupper", function(value) {
        //   return /[A-Z]/.test(value);
        // });
        // $.validator.addMethod("checkdigit", function(value) {
        //   return /[0-9]/.test(value);
        // });
        // $.validator.addMethod("pwcheck", function(value) {
        //   return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[A-Z]/.test(value);
        // });

        $(".signClsFrm").submit(function(e) {
            e.preventDefault();
            //alert('dddd');
            //add ajax here

             if(!$('#regFrm').valid()){
                return;
             }
            $("#submitbutton").attr('disabled',true);
            let data = $('#regFrm').serialize();
            $.ajax({
              url: "/authorsignupByEmail",
              type:'POST',
              data: data,
              success: function(result){
              console.log(result);
                if(result.status){
                  $('#regFrm')[0].reset();
                  $.notify({
                    icon: "ti-thumb-up",
                    message: result.msg          
                  },{
                      type: 'success',
                      timer: 5000,
                      placement: {
                          from: 'top',
                          align: 'center'
                      }
                  });
                 
                  setTimeout(()=>{
                   window.location.href = "/";
                  },5000);

                }else{
                  $.notify({
                    icon: "ti-announcement",
                    message: result.msg          
                  },{
                      type: 'danger',
                      timer: 5000,
                      placement: {
                          from: 'top',
                          align: 'center'
                      }
                  });

                  $("#submitbutton").attr('disabled',false);
                }
                
              }
             
          });



        })

        $(".signClsFrm").validate({
        rules: {
          password:{
            required:true,
            minlength: 6,
            maxlength: 30            
          },
          cpassword: {
           required: true,
           equalTo : "#password"
          }  
        },
        messages: {
          password: {
            pwcheck: "Password is not strong enough",
            checklower: "Need atleast 1 lowercase alphabet",
            checkupper: "Need atleast 1 uppercase alphabet",
            checkdigit: "Need atleast 1 digit"
          }
        },
        errorPlacement: function (error, element) {
          if (element.attr("id") == "password") {
              error.insertAfter($("#password-strength-status"));
          }else{
            error.insertAfter($(element));
          }
        },
        submitHandler: function(form){
          return false;
        }
        });

        
    }
  
    
    var uri = window.location.toString();
    if (uri.indexOf("?") > 0) {
      var clean_uri = uri.substring(0, uri.indexOf("?"));
      window.history.replaceState({}, document.title, clean_uri);
    }

    var currentTime = new Date();
    var year = currentTime.getFullYear();
    $("#year").html(year);

  });




  // WRITE THE VALIDATION SCRIPT.
  function isPhoneNumber(evt) {
      var iKeyCode = (evt.which) ? evt.which : evt.keyCode
      if ( iKeyCode > 31 && (iKeyCode < 48 || iKeyCode > 57))
          return false;

      return true;
  }


  function checkPasswordStrength() {
    var number = /([0-9])/;
    var alphabets = /([a-zA-Z])/;
    var special_characters = /([~,!,@,#,$,%,^,&,*,-,.,_,+,=,?,>,<])/;
    if($('#password').val().length<6) {
      $('#password-strength-status').removeClass();
      $('#password-strength-status').addClass('weak-password');
      $('#password-strength-status').html("Weak");
    } else {  	
    if($('#password').val().match(number) && $('#password').val().match(alphabets) && $('#password').val().match(special_characters)) {                    
      $('#password-strength-status').removeClass();
      $('#password-strength-status').addClass('strong-password');
      $('#password-strength-status').html("Strong");
    } else {
      $('#password-strength-status').removeClass();
      $('#password-strength-status').addClass('medium-password');
      $('#password-strength-status').html("Medium");
    }
   }
  }