// init bootsrap tables
var $table2 = $('#concepts-tbl');
$().ready(function () {
    $table2.bootstrapTable({
        toolbar: ".toolbar1",
        clickToSelect: true,
        showRefresh: false,
        search: true,
        showToggle: false,
        showColumns: false,
        pagination: true,
        searchAlign: 'right',
        strictSearch: false,
        pageSize: 5,
        //   clickToSelect: false,
        pageList: [5, 10, 25, 50, 100],
        sortName: "concepts",
        sortOrder: "asc",

        formatShowingRows: function (pageFrom, pageTo, totalRows) {
            //do nothing here, we don't want to show the text "showing x of y from..."
            //return "showing "+pageFrom+" to "+pageTo+" of " + totalRows +" entries <br/>";
        },
        formatRecordsPerPage: function (pageNumber) {
            return "  " + pageNumber + " rows visible";
        },
        icons: {
            refresh: 'fa fa-refresh',
            toggle: 'fa fa-th-list',
            columns: 'fa fa-columns',
            detailOpen: 'fa fa-plus-circle',
            detailClose: 'ti-close'
        }
    });
});




var $table1 = $('#skills-tbl');
$().ready(function () {
    $table1.bootstrapTable({
        toolbar: ".toolbar",
        clickToSelect: true,
        showRefresh: false,
        search: true,
        showToggle: false,
        showColumns: false,
        pagination: true,
        searchAlign: 'right',
        strictSearch: false,
        pageSize: 5,
        //   clickToSelect: false,
        pageList: [5, 10, 25, 50, 100],
        sortName: "skills",
        sortOrder: "asc",

        formatShowingRows: function (pageFrom, pageTo, totalRows) {
            //do nothing here, we don't want to show the text "showing x of y from..."
            //return "showing "+pageFrom+" to "+pageTo+" of " + totalRows +" entries <br/>";
        },
        formatRecordsPerPage: function (pageNumber) {
            return "  " + pageNumber + " rows visible";
        },
        icons: {
            refresh: 'fa fa-refresh',
            toggle: 'fa fa-th-list',
            columns: 'fa fa-columns',
            detailOpen: 'fa fa-plus-circle',
            detailClose: 'ti-close'
        }
    });
});



$(function () {
    // to add a concept
    $("#addConcept").on('click', function () {
        var userId = document.getElementById('short').value;
        var token = document.getElementById('token').value;

        swal({
            title: 'Add a new concept',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Add concept',
            showLoaderOnConfirm: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    if (value) {
                        resolve()
                    } else {
                        reject('You need to write something!')
                    }
                })
            },
            allowOutsideClick: false
        }).then(function (name) {
            $.ajax({
                type: "POST",
                data: {
                    'userId': userId,
                    'token': token,
                    'concepts': name
                },
                url: '/author_save_concept',
                success: function (data) {
                    if (data.status == "success") {
                        swal({
                            type: 'success',
                            title: 'New Concept Added!'
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
                    swal("Cancelled", "Error: Please Contact Administrator ", " error ");
                }
            });
        })
    });

    // to delete a concept
    $("body").on("click", "#delConcept", function () {
        var userId = document.getElementById('short').value;
        var token = document.getElementById('token').value;
        var val = $(this).val();
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
            $.ajax({
                type: "POST",
                data: {
                    'userId': userId,
                    'token': token,
                    'concepts': val
                },
                url: '/author_delete_concept',
                success: function (data) {
                    if (data.status == "success") {
                        swal({
                            type: 'success',
                            title: 'Concept Deleted!'
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
                    swal("Cancelled", "Error: Please Contact Administrator ", " error ");
                }
            });

        }).catch(function () {
            console.log("Aborted delete req");
        });
    });

    // to add a skills
    $("#addSkills").on('click', function () {
        var userId = document.getElementById('short').value;
        var token = document.getElementById('token').value;

        swal({
            title: 'Add a new skill',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Add skill',
            showLoaderOnConfirm: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    if (value) {
                        resolve()
                    } else {
                        reject('You need to write something!')
                    }
                })
            },
            allowOutsideClick: false
        }).then(function (name) {
            $.ajax({
                type: "POST",
                data: {
                    'userId': userId,
                    'token': token,
                    'skills': name
                },
                url: '/author_save_skill',
                success: function (data) {
                    if (data.status == "success") {
                        swal({
                            type: 'success',
                            title: 'New Skill Added!'
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
                    swal("Cancelled", "Error: Please Contact Administrator ", " error ");
                }
            });
        })
    });

    // to delete a skills
    $("body").on("click", "#delSkills", function () {
        var userId = document.getElementById('short').value;
        var token = document.getElementById('token').value;
        var val = $(this).val();
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
            $.ajax({
                type: "POST",
                data: {
                    'userId': userId,
                    'token': token,
                    'skills': val
                },
                url: '/author_delete_skill',
                success: function (data) {
                    if (data.status == "success") {
                        swal({
                            type: 'success',
                            title: 'Skill Deleted!'
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
                    swal("Cancelled", "Error: Please Contact Administrator ", " error ");
                }
            });

        }).catch(function () {
            console.log("Aborted delete req");
        });
    });

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

     // to add a new graders
    $("#addGradesBtn").on('click', function () {
        var userId = document.getElementById('short').value;
        var token = document.getElementById('token').value;
        var gradeEmail = document.getElementById('gradeEmail').value;
        var gradeNickname = document.getElementById('gradeNickname').value;

        if(gradeNickname=='' || gradeEmail==''){
            swal({
                type: 'error',
                title: 'Error',
                html: 'Field cannot be empty!!'
            });
        }else{
            if (validateEmail(gradeEmail)) {
                
                $.ajax({
                    type: "POST",
                    data: {
                        'userId': userId,
                        'token': token,
                        'gradeEmail': gradeEmail,
                        'gradeNickname':gradeNickname
                    },
                    url: '/author_save_graders',
                    success: function (data) {
                        if (data.status == "success") {
                            swal({
                                type: 'success',
                                title: 'New Grader Added!'
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
                        swal("Cancelled", "Error: Please Contact Administrator ", " error ");
                    }
                });
            }else{
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Invalid Email Address'
                });
            }
        }
    });

     // to delete a graders
     $("body").on("click", "#delGraders", function () {
        var userId = document.getElementById('short').value;
        var token = document.getElementById('token').value;
        var val = $(this).val();
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
            $.ajax({
                type: "POST",
                data: {
                    'userId': userId,
                    'token': token,
                    'graders': val
                },
                url: '/author_delete_graders',
                success: function (data) {
                    if (data.status == "success") {
                        swal({
                            type: 'success',
                            title: 'Grader Deleted!'
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
                    swal("Cancelled", "Error: Please Contact Administrator ", " error ");
                }
            });

        }).catch(function () {
            console.log("Aborted delete req");
        });
    });
});


//--------------------------- for email validations and save-----------------------------
// to validate email
function validateEmail(mail) {
    // https://www.w3schools.com/js/tryit.asp?filename=tryjs_form_validate_email
    var x = mail;
    var atpos = x.indexOf("@");
    var dotpos = x.lastIndexOf(".");
    if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= x.length) {
        // alert("Not a valid e-mail address");
        return false;
    } else {
        return true;
    }
}
// used on key press
function checkEmail() {
    var text = $(this).val();
    //console.log(text);
    if (validateEmail(text)) {
        //console.log(0);
        $("#confirmEmail").show();
        $(this).removeClass('error');
    } else {
        //console.log(1);
        $("#confirmEmail").hide();
        $(this).addClass('error');
    }
}
function confirmEmail() {
    var text = $(this).val();
    var aemail = $("#altEmail").val();
    if (validateEmail(text)) {
        //console.log(0);
        if (text == aemail) {
            //matched
            $("#emailSave").show();
            $(this).removeClass('error');

        } else {
            $(this).addClass('error');
            $("#emailSave").hide();
        }

    } else {
        //console.log(1);
        $("#emailSave").hide();
        $(this).addClass('error');
    }
}
$(function () {

    $("#altEmail").keydown(checkEmail);
    $("#altEmail").keyup(checkEmail);
    $("#confirmEmailinput").keydown(confirmEmail);
    $("#confirmEmailinput").keyup(confirmEmail);

});

//save the aleter email in server
function save_alteremail() {
    var alter1 = $("#altEmail").val();
    var alter2 = $("#confirmEmailinput").val();
    if (alter1 == alter2) {
        var user_Id = document.getElementById('short').value;
        var token = document.getElementById('token').value;
        var user_data2 = new Object;
        user_data2.userId = user_Id;
        user_data2.token = token;
        user_data2.email = alter2;
        $.post("/author_alterEmail", user_data2, function (data) {
            if (data.status == 'success') {
                swal({
                    type: 'success',
                    title: 'Email Updated !!'
                }).then(function () {
                    location.reload();
                });
            }
            else if (data.status == 'error') {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: data.msg
                });
            }
        });
    } else {
        swal({
            type: 'error',
            title: 'Error',
            html: 'Email Not matched !!'
        });
    }
}

//---------------------------------- update full name--------------------------------------------------
function save_full_name() {
    var user_Id = document.getElementById('short').value;
    var token = document.getElementById('token').value;
    var save_first_name = document.getElementById("value_firstname").value;
    // var save_middle_name = document.getElementById("value_middlename").value;
    // var save_last_name = document.getElementById("value_lastname").value;
    // var name_prefix = document.getElementById("name_prefix").value;

    if (save_first_name.trim() != '') {
        var user_data = new Object;
        user_data.userId = user_Id;
        user_data.token = token;
        user_data.full_name = save_first_name.trim();
        $.post("/author_set_full_name", user_data, function (data) {
            if (data.status == 'success') {
                swal({
                    type: 'success',
                    title: 'Fullname updated !!'
                }).then(function () {
                    location.reload();
                });
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
    else {
        swal({
            type: 'error',
            title: 'Error',
            html: 'Full Name is required !!'
        });
    }
}

//----------------------------------change password-----------------------------------------------------
//save the password to server
function save_password_fun() {
    var pass1 = $("#password").val();
    var pass2 = $("#password2").val();
    if (pass1 == pass2) {
        var user_Id = document.getElementById('short').value;
        var token = document.getElementById('token').value;
        var user_data3 = new Object;
        user_data3.userId = user_Id;
        user_data3.token = token;
        user_data3.password = pass1;
        user_data3.password2 = pass2;

        $.post("/author_save_password", user_data3, function (data) {
            if (data.status == 'success') {
                swal({
                    type: 'success',
                    title: 'Password Changed !!'
                }).then(function () {
                    location.reload();
                });
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
    else {
        swal({
            type: 'error',
            title: 'Error',
            html: 'Password Mismatch !!'
        });
    }
}
$("#changePwdForm").validate();
$("#changeEmail").validate();


//--------------------------------------------------- to change password ---------------------------------------------------
// to acticvate pwd meter
jQuery(function ($) { $('#password').pwstrength(); });

//validation for password is right or nor
function validate3() {
    setTimeout(function () {
        $("#result").text("");
        var email = $("#pass_strength").val();
        var str = $("#pass_strength").text();
        if (str == "Ok" || str == "Strong" || str == "Very Strong") {
            $("#confirmPwd").show();
        }
        else {
            $("#confirmPwd").hide();
            $("#pwdsavebtn").hide();
        }
    }, 300);
}

//check the password is match or nor
function confirmPwd() {
    var text = $(this).val();
    var aemail = $("#password").val();
    //console.log(0);
    if (text == aemail) {
        //matched
        $("#pwdsavebtn").show();
        $(this).removeClass('error');

    } else {
        $(this).addClass('error');
        $("#pwdsavebtn").hide();
    }
}

$(function () {
    $("#password2").keydown(confirmPwd);
    $("#password2").keyup(confirmPwd);
});	


//---------------------------------- update language--------------------------------------------------
function save_language() {
    var user_Id = document.getElementById('short').value;
    var token = document.getElementById('token').value;
    var language = document.getElementById("language").value;
  
    var user_data = new Object;
    user_data.userId = user_Id;
    user_data.token = token;
    user_data.language = language;
    $.post("/author_set_language", user_data, function (data) {
        if (data.status == 'success') {
            swal({
                type: 'success',
                title: 'Language updated !!'
            }).then(function () {
                location.reload();
            });
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



