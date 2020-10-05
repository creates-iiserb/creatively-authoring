var app = angular.module('workbookApp', ['ui.bootstrap', 'ngTagsInput', 'uiCropper', 'ngValidate','ui.carousel', 'angularUtils.directives.dirPagination']);

app.config(function ($validatorProvider) {
    $validatorProvider.setDefaults({
        errorElement: 'label',
        errorClass: 'jv-error'
    });

    $validatorProvider.addMethod("mintags", function (value, element) {
        var val = JSON.parse(value);
        var minval = parseInt($(element).attr('data-min'));
        return this.optional(element) || !(val.length < minval);
    }, "Please enter minimum 1 tags.");


    $validatorProvider.addMethod("custrequired", function (value, element) {

        return this.optional(element) || !(value == 'string:');
    }, "This field is required.");


    $validatorProvider.addMethod("custDesc", function (value, element) {
        $("#descDiv").html(value);
        var textval = $.trim($("#descDiv").text());
        // console.log(textval);
        return this.optional(element) || !(textval == '');
    }, "This field is required.");

});





app.controller('workbookController', function ($scope, $http, $timeout) {
    
    $('.ld').show();
    $('.wrapper').addClass('ld-over-full-inverse running');
    // $scope.showHTML = false;
    angular.element(document).ready(function () {
        setTimeout(()=>{
            $('.ld').hide();
            $('.wrapper').removeClass('ld-over-full-inverse running');
            $scope.showHTML = true;
            $scope.$digest();
        },2000)
       });

    $scope.myImage = '';
    $scope.myCroppedImage = '';

    var handleFileSelect = function (evt) {
        var file = evt.currentTarget.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function ($scope) {
                $scope.myImage = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);


    function getBase64(file) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
              var reader = new FileReader();
              reader.onloadend = function() {
                resolve(reader.result);
              }
              reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', file);
            xhr.responseType = 'blob';
            xhr.send();
        });
        }
    

     $scope.getImgBase64=   function(img){
        getBase64('author_public/images/subjectLogo/'+img).then((data) => {
             $scope.$apply(function ($scope) {
                $scope.myImage = data;
            });
        });
    }


    $scope.myImageProfile = '';
    $scope.myCroppedImageProfile = '';

    var handleFileSelect = function (evt) {
        var file = evt.currentTarget.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function ($scope) {
                $scope.myImageProfile = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#fileInputProfile')).on('change', handleFileSelect);


    $scope.utcToLocal=function(input){		
		var d = new Date(input);
		var time = d.toString().split(" ")[4];
		var getDate = d.getDate();
		var getMonth = d.getMonth() + 1;
		var getFullYear = d.getFullYear();
		if(getMonth < 10)
		getMonth = "0"+getMonth;
		if(getDate < 10)
		getDate = "0"+getDate;
		var startDate = getFullYear+"-"+getMonth+"-"+getDate;
		var updatedAt =  startDate.substring(0, 10) + " " + time;		
		return updatedAt;
	}
    
    
    var charCount = document.getElementById("charCount");
    var maxCharCount = document.getElementById("wbdescr").maxLength;
    // console.log(maxCharCount)
    // charLimitdocument.getElementById("charLimit").style.visibility= "visible";
    CKEDITOR.instances.wbdescr.on("key", function (event)
    {
        charCount.innerHTML = "Character Remaining: "+(maxCharCount - CKEDITOR.instances.wbdescr.getData().length) ;
    });

    var charCountFeature = document.getElementById("charCountFeature");
    var maxCharCountFeat = document.getElementById("wbPriceFeature").maxLength;
    // console.log(maxCharCount)
    // charLimitdocument.getElementById("charLimit").style.visibility= "visible";
    CKEDITOR.instances.wbPriceFeature.on("key", function (event)
    {
        charCountFeature.innerHTML = "Character Remaining: "+(maxCharCountFeat - CKEDITOR.instances.wbPriceFeature.getData().length) ;
    });

    


    //validation function
    $scope.validationOptions = {
        ignore: [],
        debug: false,
        rules: {
            wbname: {
                required: true,
            },
            wbdescr: {
                required: true,
                custDesc: true
            },
            email: {
                required: true,
                email: true
            },
            country: {
                required: true
            },
            language: {
                required: true
            },
            mysub: {
                required: true
            },
            relevance: {
                required: true
            },
            level: {
                required: true,
                custrequired: true
            },
            // pubName: {
            //      required: true
            // },
            // pubOrgnanization: {
            //     required: true
            // },
            pcurrency: {
                required: true
            },
            pPrice: {
                required: true,
                number: true
            },
            pPeriod: {
                required: true,
                digits: true
            },
            pDiscount: {
                required: true,
                number: true
            }
        },
        //     messages: {
        //         wsTitle:{                                  
        //          remote : "This worksheet name already exist."
        //         }

        // },
        errorPlacement: function (error, element) {
            if (element.attr("id") == "wbdescr") {
                var parentid = "#" + element.attr("id") + "Div";
                $(parentid).append(error);

            } else {
                error.insertAfter($(element));
            }
        }
    };

    $scope.validationBetaUsers = {
        ignore: [],
        debug: false,
        rules: {
            mybeta: {
                required: true,
                mintags: true
            }
        }
    };

    $scope.$watch('wb.betaUsers', function (newV, oldV) {
        if (newV != oldV) {
            if (newV.length > 0) {
                $("#mybeta").val(JSON.stringify(newV));
                //   console.log(1)
                $("#mybeta").siblings("label.jv-error:contains('This field is required.')").remove();
                if (newV.length >= 1)
                    $("#mybeta").siblings("label.jv-error:contains('Please enter minimum one beta users.')").remove();
            }
            else
                $("#mybeta").val('');
        }
    }, true);

    $scope.$watch('wb.category.subject', function (newV, oldV) {
        if (newV != oldV) {
            if (newV.length > 0) {
                $("#mysub").val(JSON.stringify(newV));
                $("#mysub").siblings("label.jv-error:contains('This field is required.')").remove();
                // if(newV.length>=3)
                // $("#mysub").siblings("label.jv-error:contains('Please enter minimum three tags.')").remove();
            }
            else
                $("#mysub").val('');
        }
    }, true);

    


    $scope.$watch('wb.category.level', function (newV, oldV) {
        if (newV != oldV) {
            if (newV != '') {
                $("#level").siblings("label.jv-error").remove();
            }

        }
    }, true);

    $scope.$watch('wb.category.relevance', function (newV, oldV) {
        if (newV != oldV) {
            if (newV != '') {
                $("#relevance").siblings("label.jv-error").remove();
            }

        }
    }, true);

    $scope.$watch('wb.category.country', function (newV, oldV) {
        if (newV != oldV) {
            if (newV != '') {
                $("#country").siblings("label.jv-error").remove();
            }

        }
    }, true);

    $scope.$watch('wb.dev.pricing.currency', function (newV, oldV) {
        if (newV != oldV) {
            if (newV != '') {
                $("#pcurrency").siblings("label.jv-error").remove();
            }

        }
    }, true);

    $scope.$watch('wb.category.language', function (newV, oldV) {
        if (newV != oldV) {
            if (newV != '') {
                $("#language").siblings("label.jv-error").remove();
            }

        }
    }, true);


    // $scope.showgallary = function(){
    //     $("#imgfrmGallaryDiv").show();
    //     // $("#uploadImgDiv").hide();
    // }

    // $scope.uploadImg = function(){
    //     // $("#uploadImgDiv").show();
    //     $("#imgfrmGallaryDiv").hide();
    // }

    //-----------------------get workbook----------------------------------------
    $scope.wbEditFunc = function (id) {
// alert(1)
        // var wbdata = document.getElementById('wbdata').innerHTML.trim();
        // var gblData = document.getElementById('workbookGbl').innerHTML.trim();
        // var basketCount = document.getElementById('basketCount').innerHTML.trim();

        // console.log("wbdata");
        $http.post("/author_getWorkbookData", { 'id': id }).then(function (callback) {
            if (callback.data.status==="success") {
                var data1 = callback.data;
                var countries = data1.countries;
                // $scope.country = countries;
                var currency = data1.currency;
                var language = data1.language;
                var basketCount = data1.basketCount;
                $scope.basket = basketCount;
                var gblData = data1.workbookGbl;

                var ratingData = data1.ratingData;
                $scope.ratingData = ratingData;

                var imgArry = data1.imgArry;
                $scope.imgArry = imgArry;
                // $scope.relevance = gblData.relevance;
                // $scope.level = gblData.level;
// console.log($scope.country);
                var wbdata = data1.data;
                var wbdta = wbdata;
                $scope.wb = wbdta;

                $("#mybeta").val(JSON.stringify($scope.wb.betaUsers));
                // console.log($scope.wb.dev);
                CKEDITOR.instances['wbdescr'].setData($scope.wb.dev.description);

                CKEDITOR.instances['wbPriceFeature'].setData($scope.wb.dev.pricing.pFeature);

                $scope.level = gblData.level.map(function (val) {
                    var obj = new Object;
                    obj.id = val;
                    obj.val = val;
                    return obj;
                });
                $scope.level.unshift({ id: "", val: "Select Level" });

                $scope.relevance = gblData.relevance.map(function (val) {
                    var obj = new Object;
                    obj.id = val;
                    obj.val = val;
                    return obj;
                });
                // $scope.relevance.unshift({ id: "", val: "Select Relevance" });

                $scope.country = countries.map(function (val) {
                    var obj = new Object;
                    obj.id = val;
                    obj.val = val;
                    return obj;
                });

                $scope.wb.dev.pricing.currency = "INR";
                // $scope.country.unshift({ id: "", val: "Select Country" });

                $scope.currency = currency.map(function (val) {
                    var obj = new Object; 
                    obj.id = val;
                    obj.val = val;
                    return obj;
                });
                // $scope.currency.unshift({ id: "", val: "Select Currency" });

                $scope.language = language.map(function (val) {
                    var obj = new Object;
                    obj.id = val;
                    obj.val = val;
                    return obj;
                });
                // $scope.language.unshift({ id: "", val: "Select Language" });

                $scope.showHTML = true;

            } else if (callback.data.status === "authorError") {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Workbook not found'
                }).then(function () {
                    window.location = "/author_workbook_dash";
                });
            }else{
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Error: Please Contact Administrator !!'
                });
            }

            setTimeout(()=>{
                $('.ld').hide();
                $('.wrapper').removeClass('ld-over-full-inverse running');
                $("#mainPanel").show();
            },500);
        },function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }

    $scope.openReviewDetails=function(id,ratingDta){
        // console.log(id)
        $http.post("/author_getWbReviewDetails", {'wbId':id }).then(function (callback) {
            if (callback.data.status === "success") {
                
                $("#reviewDetailsMdl").modal('show');
                $scope.mdlData = {};
                $scope.mdlData.reviewDta=callback.data.reviewDta;
                $scope.mdlData.rateDta=ratingDta;

                

            } else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        }, function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
        
        
       
       
    }


    $scope.checkBoxpubName=function(input){
        var checkBoxpubName = document.getElementById("pubNameCheck");
        if (checkBoxpubName.checked == true){
            document.getElementById("pubName").required=true;
        } else {
            $scope.wb.publisher.name = "";
            document.getElementById("pubName").required=false;
        }
    }

    $scope.checkBoxpubOrg=function(input){
        var checkBoxpubOrg = document.getElementById("pubOrgCheck");
        if (checkBoxpubOrg.checked == true){
            document.getElementById("pubOrgnanization").required=true;
        } else {
            $scope.wb.publisher.organization = "";
            document.getElementById("pubOrgnanization").required=false;
        }
    }

    $scope.checkBoxpubDesg=function(input){
        var checkBoxpubDesg = document.getElementById("pubDesgCheck");
        if (checkBoxpubDesg.checked == true){
            document.getElementById("pubDesg").required=true;
        } else {
            $scope.wb.publisher.designation = "";
            document.getElementById("pubDesg").required=false;
        }
    }

    $scope.checkBoxAbtPub=function(input){
        var checkBoxAbtPub = document.getElementById("pubAbtPubCheck");
        if (checkBoxAbtPub.checked == true){
            document.getElementById("pubAbout").required=true;
        } else {
            $scope.wb.publisher.aboutPublisher = "";
            document.getElementById("pubAbout").required=false;
        }
    }

    //-----------------------update workbook----------------------------------------
    $scope.updateWB = function (frmWb) {
        //    console.log($scope.wb) 
        CKEDITOR.instances.wbdescr.updateElement();

        CKEDITOR.instances.wbPriceFeature.updateElement();

        if (frmWb.validate()) {
            var subject = $scope.wb.category.subject.map(function (val) {
                return val.text.toLowerCase();;
            });


            // var country = $scope.wb.category.country.map(function (val) {
            //     return val.text;
            // });

            // var country = [];
            // jsonObjcon = [];
            // $("#country option:selected").each(function () {
            //     var value = $(this).val();
            //     jsonObjcon.push(value);
            // });
            // if (jsonObjcon.length > 0) {
            //     country = jsonObjcon;
            // }
            // console.log(country)

            var description = CKEDITOR.instances['wbdescr'].getData();

            var pFeature = CKEDITOR.instances['wbPriceFeature'].getData();

            description = description.replace(/\n/g, '');
            // description = description.replace(/\t/g,'');
            $scope.wb.dev.description = description;
           

            pFeature = pFeature.replace(/\n/g, '');
            $scope.wb.dev.pricing.pFeature = pFeature;

            $scope.wb.title = $scope.wb.title.replace(/\s\s+/g, ' ').trim();

            var logoBase64 = document.getElementById('logo').value;
            $scope.wb.dev.logo = logoBase64;

            var period = $scope.wb.dev.pricing.period;

            if(!$scope.wb.meta){
                $scope.wb.meta={}
            }
        //    if(!$scope.wb.dev.pricing.pubProfile){
        //     $scope.wb.dev.pricing.pubProfile={}
        //     }

            if($scope.wb.publisher.areaOfExp){
                var areaOfExp = $scope.wb.publisher.areaOfExp.map(function (val) {
                return val.text.toLowerCase();;
            });
            }
            

            // console.log(areaOfExp );

            // console.log(period);
            // console.log("name---"+$scope.wb.publisher.name +"===desg==="+$scope.wb.publisher.designation )

            if (period < 30 || period > 366) {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Subscription Period should be from 30 to 366 days.'
                })
            }else if($scope.wb.publisher.name=='' && $scope.wb.publisher.designation==''){
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Both publisher name and publisher designation cannpt be blank. Please fill atleast one field'
                })
            }else {

                //console.log("kjfskjdfhskjdfh====="+JSON.stringify($scope.wb.publisher))
                 $http.post("/author_updateWorkbookData", { 'data': $scope.wb, 'subject': subject, 'areaOfExp':areaOfExp }).then(function (callback) {
                     if (callback.data.status === "success") {
                         swal({
                             type: 'success',
                             title: 'Success',
                             html: 'Workbook Updated successfully'
                         }).then(function () {
                             $scope.wb._rev = callback.data.rev;
                             $scope.wb.dev.lastUpdate = callback.data.lastUpdate;
                            // console.log($scope.wb.dev.lastUpdate)
                             // location.reload();
                         });
                     } else if (callback.data.status === "Unauthorized") {
                         swal({
                             type: 'error',
                             title: 'Error',
                             html: 'You are authorized to update workbook that is authored by you.'
                         });
                     } else if (callback.data.status === "already") {
                         swal({
                             type: 'error',
                             title: 'Error',
                             html: 'Workbook Name Already exists.'
                         });
                     } else {
                         swal({
                           type: 'error',
                             title: 'Error',
                             html: callback.data.msg
                         });
                     }
                 }, function (error) {
                     swal({
                         type: 'error',
                         title: 'Error',
                         html: 'Something Went Wrong. Please Contact Administrator !!'
                     });
                 });
            }
        } else {

            swal({
                type: 'error',
                title: 'Error',
                html: 'All compulsory fields are required.'
            });
            return;
        }
    }

    //-----------------------delete workbook----------------------------------------
    $scope.deleteWB = function () {

        var subject = $scope.wb.category.subject.map(function (val) {
            return val.text;
        });

        // var country = $scope.wb.category.country.map(function (val) {
        //     return val.text;
        // });

        $scope.wb.dev.description = $scope.wb.dev.description.replace(/\n/g, '');

        $http.post("/author_deleteWorkbookData", { 'data': $scope.wb, 'subject': subject }).then(function (callback) {
            if (callback.data.status === "success") {
                swal({
                    type: 'success',
                    title: 'Success',
                    html: 'Workbook deleted successfully'
                }).then(function () {
                    location.reload();
                });
            } else if (callback.data.status === "Unauthorized") {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'You are authorized to delete workbook that is authored by you.'
                });
            } else {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: callback.data.msg
                });
            }
        }, function (error) {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Something Went Wrong. Please Contact Administrator !!'
            });
        });
    }

    //-----------------------save logo of workbook----------------------------------------
    $scope.saveLogo = function (wbId) {
        var profilePhotoBase64 = $scope.myCroppedImage;
        // console.log("------------------------------");
        // console.log(profilePhotoBase64);
        document.getElementById('logo').value = profilePhotoBase64;
        $('#CameraMdl').modal('hide');

        if (profilePhotoBase64 != "") {
            $http.post("/author_saveLogoWB", { 'wbId': wbId, 'logo': profilePhotoBase64 }).then(function (callback) {
                if (callback.data.status === "success") {
                    // swal({
                    //     type: 'success',
                    //     title: 'Success',
                    //     html: 'Logo Updated successfully'
                    // }).then(function () {
                    //     location.reload();
                    // });
                    //location.reload();
                    $scope.wb.dev.logo = profilePhotoBase64;

                    $scope.wb._rev = callback.data.rev;

                } else if (callback.data.status === "Unauthorized") {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'You are authorized to update workbook that is authored by you.'
                    });
                } else {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: callback.data.msg
                    });
                }
            }, function (error) {
                swal({
                    type: 'error',
                    title: 'Error',
                    html: 'Something Went Wrong. Please Contact Administrator !!'
                });
            });
        } else {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Select some image'
            });
        }
    }

     //-----------------------save profile img of workbook----------------------------------------
     $scope.saveProfileLogo = function (wbId) {
        var profilePhotoBase64 = $scope.myCroppedImageProfile;
        // console.log("------------------------------");
        // console.log(profilePhotoBase64);
        
        $('#profileCameraMdl').modal('hide');

        if (profilePhotoBase64 != "") {
            $scope.wb.publisher.photoURL =profilePhotoBase64;
            // document.getElementById('profileImgBase64').value = ;
        } else {
            swal({
                type: 'error',
                title: 'Error',
                html: 'Select some image'
            });
        }
    }

    //-----------------------publish beta version for workbook----------------------------------------
    $scope.wbBetaVersion = function (beta_wb, frmWb) {
        // console.log($scope.wb)
        CKEDITOR.instances.wbdescr.updateElement();
        CKEDITOR.instances.wbPriceFeature.updateElement();
        CKEDITOR.instances.id_commentsSt.updateElement();
        if (frmWb.validate()) {
            if (beta_wb.validate()) {
                var subject = $scope.wb.category.subject.map(function (val) {
                    return val.text;
                });

                if($scope.wb.publisher.areaOfExp){
                    var areaOfExp = $scope.wb.publisher.areaOfExp.map(function (val) {
                    return val.text.toLowerCase();;
                });
                }

                var betaUsers = $scope.wb.betaUsers.map(function (val) {
                    return val.text;
                });
                // console.log("betaUsers--"+betaUsers);

                $scope.wb.title = $scope.wb.title.replace(/\s\s+/g, ' ').trim();

                $scope.wb.dev.description = $scope.wb.dev.description.replace(/\n/g, '');
                $scope.wb.dev.description = $scope.wb.dev.description.replace(/\t/g, '');

                var logoBase64 = document.getElementById('logo').value;
                $scope.wb.dev.logo = logoBase64;

               var updateRequired =  $scope.wb.meta.updateRequired
                // console.log($scope.myCroppedImage );

                var period = $scope.wb.dev.pricing.period;

                var id_commentsSt = CKEDITOR.instances['id_commentsSt'].getData();

                id_commentsSt = id_commentsSt.replace(/\n/g, '');
                // description = description.replace(/\t/g,'');
                $scope.wb.meta.updateMsg = id_commentsSt;

                if (period < 30 || period > 366) {
                    swal({
                        type: 'error',
                        title: 'Error',
                        html: 'Subscription Period can be between 30 to 366 days.'
                    })
                } else {
                    // if(betaUsers != "" || betaUsers != undefined){
                    // console.log(betaUsers.length);
                    if (betaUsers.length > 5) {
                        swal({
                            title: 'Error',
                            text: 'Beta Users cannot be greater than 5',
                            type: 'error',
                            confirmButtonClass: "btn btn-info btn-fill",
                            buttonsStyling: false
                        });
                        return;
                    } else {
                        var email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        var eArr = new Array();

                        betaUsers.forEach(function (itm) {
                            if (itm.match(RegExp(email))) {
                                // console.log("matched  " + itm);
                            }
                            else {
                                eArr.push(itm);
                                // console.log("not matched  " + eArr);
                            }
                        })

                        if (eArr.length > 0) {
                            swal({
                                type: 'error',
                                title: 'Error',
                                html: '[' + eArr + '] is not a valid email Ids for beta users'
                            })
                        } else {
                            $("#twoToneButton").attr("disabled", true);
                            $http.post("/author_betaVersionWorkbookData", { 'data': $scope.wb, 'subject': subject,'areaOfExp':areaOfExp, 'betaUsers': betaUsers,'updateRequired':updateRequired, 'id':$scope.wb._id }).then(function (callback) {
                                if (callback.data.status === "success") {
                                    swal({
                                        type: 'success',
                                        title: 'Success',
                                        html: callback.data.msg
                                    }).then(function () {
                                        location.reload();
                                    });
                                } else if (callback.data.status === "Unauthorized") {
                                    swal({
                                        type: 'error',
                                        title: 'Error',
                                        html: 'You are authorized to update workbook that is authored by you.'
                                    });
                                } else if (callback.data.status === "beta limit exceed") {
                                    swal({
                                        type: 'error',
                                        title: 'Error',
                                        html: 'You cannot publish more than 10 beta versions for the workbook.Delete Beta versions to publish more versions'
                                    });
                                }else if (callback.data.status === "Invalid Data") {
                                    swal({
                                        type: 'error',
                                        title: 'Error',
                                        // html: "["+callback.data.unauthSheet+'] worksheets contain some unauthorized elements.'
                                        html: callback.data.unauthSheet.length + ' worksheets contain some unauthorized elements in it. Kindly resolve them before beta publishing.'
                                    });
                                } else if (callback.data.status === "Valid Data") {
                                    swal({
                                        type: 'success',
                                        title: 'success',
                                        html: 'successful data.'
                                    }).then(function () {
                                        location.reload();
                                    });
                                }else if (callback.data.status === "No Publish Sheets") {
                                    swal({
                                        type: 'error',
                                        title: 'Error',
                                        html: callback.data.msg
                                    });
                                }else {
                                    swal({
                                        type: 'error',
                                        title: 'Error',
                                        html: callback.data.msg
                                    });
                                }
                            }, function (error) {
                                swal({
                                    type: 'error',
                                    title: 'Error',
                                    html: 'Something Went Wrong. Please Contact Administrator !!'
                                });
                            });
                        }
                    }
                    // }else{
                    //     swal({
                    //         title: 'Error',
                    //         text: 'Beta Users cannot be empty!',
                    //         type: 'error',
                    //         confirmButtonClass: "btn btn-info btn-fill",
                    //         buttonsStyling: false
                    //     });
                    //     return;
                    // }
                }
            }
        } else {
            swal({
                type: 'error',
                title: 'Error',
                html: 'All Workbook fields are required.'
            });
            return;
        }
    }


});
